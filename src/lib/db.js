import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizePhone } from "./phone";

// Notify admin devices via the Vercel serverless function (FCM push).
// Fire-and-forget — never blocks the order/deposit flow.
function notifyAdmin(type, id) {
  try {
    fetch("/api/notify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    }).catch(() => {});
  } catch (e) {
    /* ignore */
  }
}

/* ----------------------------- USERS ----------------------------- */

// Create/update the user profile doc after sign-up (id = auth uid)
export async function createUserDoc(uid, { name, email, phone }) {
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;
  await setDoc(ref, {
    name: name || "",
    email: email || "",
    phone: phone || "",
    role: "customer",
    walletBalance: 0,
    totalSpent: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Live subscription to the current user's profile (wallet, name, etc.)
export function subscribeUser(uid, cb) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

/* ----------------------------- PHONE UNIQUENESS ----------------------------- */

// Reserve a phone number in the phoneIndex collection. The doc id IS the
// normalized phone number, so a second create with the same phone fails at
// the Firestore level (enforced by security rules too — see firestore.rules).
// Returns "ok" | "duplicate".
export async function claimPhone(uid, phone, email) {
  const p = normalizePhone(phone);
  if (!p) return "invalid";
  try {
    await setDoc(doc(db, "phoneIndex", p), {
      uid,
      phone: p,
      email: email || "",
      createdAt: serverTimestamp(),
    });
    return "ok";
  } catch (e) {
    // Firestore create-already-exists error → the number is taken.
    if (e?.code === "permission-denied" || e?.code === "already-exists") {
      return "duplicate";
    }
    return "error";
  }
}

// Remove a phone reservation (used if a user changes their phone number).
export async function releasePhone(phone) {
  const p = normalizePhone(phone);
  if (!p) return;
  try {
    await deleteDoc(doc(db, "phoneIndex", p));
  } catch (e) {
    /* ignore */
  }
}

/* ----------------------------- PRODUCTS ----------------------------- */

// Sort by sortOrder (asc) then by name — done client-side so no
// composite index is required in Firestore.
function sortProducts(list) {
  return [...list].sort((a, b) => {
    const sa = a.sortOrder ?? 999;
    const sb = b.sortOrder ?? 999;
    if (sa !== sb) return sa - sb;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

export async function getActiveProducts() {
  const q = query(collection(db, "products"), where("isActive", "==", true));
  const snap = await getDocs(q);
  return sortProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function getProduct(id) {
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function subscribeProducts(cb, errCb) {
  const q = query(collection(db, "products"), where("isActive", "==", true));
  return onSnapshot(
    q,
    (snap) => cb(sortProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    (err) => errCb && errCb(err)
  );
}

/* ----------------------------- GAMES ----------------------------- */

// Active games only (for the customer website Home / Top Up).
export async function getActiveGames() {
  const q = query(collection(db, "games"), where("isActive", "==", true));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return [...list].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

export function subscribeGames(cb, errCb) {
  const q = query(collection(db, "games"), where("isActive", "==", true));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => errCb && errCb(err)
  );
}

export async function getGame(id) {
  const snap = await getDoc(doc(db, "games", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/* ----------------------------- ORDERS ----------------------------- */

export async function createOrder({ userId, customerName, customerEmail, customerPhone, senderNumber, gameUid, product, paymentMethod, paymentTrxId, paymentNumber }) {
  const orderId = generateOrderIdSafe();
  const data = {
    orderId,
    userId,
    customerName,
    customerEmail: customerEmail || "",
    customerPhone: customerPhone || "",
    senderNumber: senderNumber ? senderNumber.trim() : "",
    gameUid: gameUid.trim(),
    productId: product.id,
    productName: product.name,
    diamondAmount: product.diamondAmount || 0,
    game: product.game || "Free Fire",
    amount: product.price || 0,
    status: "pending",
    paymentMethod,
    paymentTrxId: paymentTrxId ? paymentTrxId.trim() : "",
    paymentNumber: paymentNumber || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "orders"), data);

  // Notify admin devices (FCM push via Vercel — works even if app is killed)
  notifyAdmin("order", ref.id);

  // Wallet payment: deduct balance atomically + log a completed purchase
  if (paymentMethod === "wallet") {
    const userRef = doc(db, "users", userId);
    await runTransaction(db, async (tx) => {
      const u = await tx.get(userRef);
      const bal = (u.data().walletBalance || 0) - (product.price || 0);
      if (bal < 0) throw new Error("Insufficient wallet balance");
      tx.update(userRef, {
        walletBalance: bal,
        totalSpent: increment(product.price || 0),
      });
    });
    await addDoc(collection(db, "transactions"), {
      userId,
      type: "purchase",
      amount: product.price || 0,
      status: "completed",
      description: `Order ${orderId} — ${product.name}`,
      orderId,
      number: customerPhone || "",
      createdAt: serverTimestamp(),
    });
  }

  return { id: ref.id, ...data };
}

// Generate order id without importing from utils to keep this module standalone
function generateOrderIdSafe() {
  const seq = String(Date.now()).slice(-6);
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `TTB-${seq}${rand}`;
}

export async function getOrder(orderId) {
  const snap = await getDoc(doc(db, "orders", orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Sort docs by createdAt descending (client-side, no composite index needed)
function sortByCreatedAtDesc(list) {
  return [...list].sort((a, b) => {
    const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds * 1000 || 0);
    const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds * 1000 || 0);
    return tb - ta;
  });
}

// Live order stream for the current user (order history)
export function subscribeUserOrders(uid, cb, errCb) {
  const q = query(collection(db, "orders"), where("userId", "==", uid), limit(200));
  return onSnapshot(
    q,
    (snap) => cb(sortByCreatedAtDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    (err) => errCb && errCb(err)
  );
}

export function subscribeOrder(orderId, cb) {
  return onSnapshot(doc(db, "orders", orderId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

/* ----------------------------- WALLET / DEPOSIT ----------------------------- */

export async function requestDeposit({ userId, amount, method, trxId, number, senderNumber, senderName }) {
  const ref = await addDoc(collection(db, "deposits"), {
    userId,
    amount: Number(amount),
    method,
    trxId: trxId ? trxId.trim() : "",
    senderNumber: senderNumber ? senderNumber.trim() : "",
    senderName: senderName ? senderName.trim() : "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  // Also log as a pending transaction
  await addDoc(collection(db, "transactions"), {
    userId,
    type: "deposit",
    amount: Number(amount),
    status: "pending",
    description: `Deposit request via ${method}`,
    number: number || "",
    createdAt: serverTimestamp(),
  });

  // Notify admin devices (FCM push via Vercel)
  notifyAdmin("deposit", ref.id);

  return ref.id;
}

export function subscribeDeposits(uid, cb, errCb) {
  const q = query(collection(db, "deposits"), where("userId", "==", uid), limit(200));
  return onSnapshot(
    q,
    (snap) => cb(sortByCreatedAtDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    (err) => errCb && errCb(err)
  );
}

export function subscribeTransactions(uid, cb, errCb) {
  const q = query(collection(db, "transactions"), where("userId", "==", uid), limit(200));
  return onSnapshot(
    q,
    (snap) => cb(sortByCreatedAtDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    (err) => errCb && errCb(err)
  );
}

/* ----------------------------- NOTIFICATIONS ----------------------------- */
//
// Scalable model with INDEPENDENT per-user read state:
//
//   notifications/{id}  → { title, message, type, targetType: "all"|"user",
//                            targetUserId, createdAt, createdBy }
//   notificationReads/{notifId}_{userId} → { notificationId, userId, read:true, readAt }
//
// A global notification is ONE document (no thousands of duplicates); each
// user's read state lives in its own notificationReads doc, so reading a
// notification never marks it read for anyone else.

export function subscribeNotifications(uid, cb) {
  const allQ = query(collection(db, "notifications"), where("targetType", "==", "all"), limit(200));
  const userQ = query(collection(db, "notifications"), where("targetUserId", "==", uid), limit(200));
  const readsQ = query(collection(db, "notificationReads"), where("userId", "==", uid), limit(500));

  const all = {};
  const own = {};
  const reads = {}; // notificationId -> true

  function emit() {
    const merged = { ...all, ...own };
    const list = Object.values(merged).map((n) => ({
      ...n,
      read: !!reads[n.id],
    }));
    cb(sortByCreatedAtDesc(list));
  }

  const unsubAll = onSnapshot(allQ, (snap) => {
    snap.docs.forEach((d) => (all[d.id] = { id: d.id, ...d.data() }));
    emit();
  });
  const unsubUser = onSnapshot(userQ, (snap) => {
    snap.docs.forEach((d) => (own[d.id] = { id: d.id, ...d.data() }));
    emit();
  });
  const unsubReads = onSnapshot(readsQ, (snap) => {
    Object.keys(reads).forEach((k) => delete reads[k]);
    snap.docs.forEach((d) => {
      const nid = d.data().notificationId;
      if (nid) reads[nid] = true;
    });
    emit();
  });

  return () => {
    unsubAll();
    unsubUser();
    unsubReads();
  };
}

// Mark one notification as read for the CURRENT user only.
export async function markNotificationRead(notificationId, uid) {
  await setDoc(doc(db, "notificationReads", `${notificationId}_${uid}`), {
    notificationId,
    userId: uid,
    read: true,
    readAt: serverTimestamp(),
  });
}

// Live count of unread notifications for the red dot (navbar bell).
export function subscribeUnreadCount(uid, cb) {
  return subscribeNotifications(uid, (list) => {
    cb(list.filter((n) => !n.read).length);
  });
}

// Admin-side: send a notification to ALL users (one document).
// NOTE: must be called with an admin-authenticated context; rules enforce this.
export async function sendNotificationToAll({ title, message, type = "announcement" }) {
  await addDoc(collection(db, "notifications"), {
    title: title || "Notice",
    message: message || "",
    type,
    targetType: "all",
    targetUserId: "",
    createdAt: serverTimestamp(),
  });
}

// Admin-side: send a notification to ONE specific user.
export async function sendNotificationToUser({ title, message, targetUserId, type = "announcement" }) {
  await addDoc(collection(db, "notifications"), {
    title: title || "Notice",
    message: message || "",
    type,
    targetType: "user",
    targetUserId: targetUserId || "",
    createdAt: serverTimestamp(),
  });
}

// Backward-compatible helpers (kept so existing callers don't break).
export async function sendAnnouncement({ title, body }) {
  await sendNotificationToAll({ title, message: body, type: "announcement" });
}

export async function notifyProductUpdate({ title, body, productId }) {
  await addDoc(collection(db, "notifications"), {
    title: title || "Product Update",
    message: body || "",
    type: "product",
    targetType: "all",
    targetUserId: "",
    productId: productId || "",
    createdAt: serverTimestamp(),
  });
}
