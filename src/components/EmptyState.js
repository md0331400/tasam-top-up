export default function EmptyState({ icon = "📭", title, message, children }) {
  return (
    <div className="state-box">
      <div className="state-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}
