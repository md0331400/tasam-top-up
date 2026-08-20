import { SITE } from "./config";

// Games Kinbo Free Fire Info API — account name lookup.
// Response shape:
//   { AccountInfo: { AccountName, AccountLevel, AccountRegion, ... }, ... }
function extractName(data) {
  if (!data) return null;
  const candidates = [
    data.AccountInfo?.AccountName,
    data.basicInfo?.nickname,
    data.name,
    data.nickname,
    data.account_nickname,
    data.data?.nickname,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

/**
 * Look up a Free Fire account name by UID.
 * Config comes from SITE.ffInfo (baseUrl, region, apiKey).
 * Returns { ok, name?, level?, region?, error? }
 */
export async function fetchFreeFireName(uid, settings) {
  const cfg = (settings && settings.ffInfo) || SITE.ffInfo || {};
  if (!cfg.baseUrl) {
    return { ok: false, error: "Account name lookup is not configured yet." };
  }
  if (!cfg.apiKey) {
    return {
      ok: false,
      error: "Account name lookup needs an API key. Please contact support.",
    };
  }

  let url = `${cfg.baseUrl}?uid=${encodeURIComponent(uid)}`;
  if (cfg.region) url += `&region=${encodeURIComponent(cfg.region)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-api-key": cfg.apiKey,
      },
    });

    const data = await res.json().catch(() => null);

    if (data && (data.error || data.status === "error")) {
      const msg = String(data.error || data.message || "").toLowerCase();
      if (msg.includes("limit") || msg.includes("rate")) {
        return { ok: false, error: "Too many checks right now. Please try again in a minute." };
      }
      if (msg.includes("invalid") || msg.includes("not found")) {
        return { ok: false, error: "Account not found. Please check the UID." };
      }
      return { ok: false, error: "Account not found. Please check the UID." };
    }

    const name = extractName(data);
    if (!name) {
      return { ok: false, error: "Account not found. Check the UID and try again." };
    }

    return {
      ok: true,
      name,
      level: data.AccountInfo?.AccountLevel ?? data.basicInfo?.level ?? data.level ?? null,
      region: data.AccountInfo?.AccountRegion ?? data.basicInfo?.region ?? data.region ?? null,
    };
  } catch (e) {
    return { ok: false, error: "Network error while checking account." };
  }
}
