export default function Loader({ label = "Loading..." }) {
  return (
    <div className="state-box">
      <div className="spinner"></div>
      <p>{label}</p>
    </div>
  );
}
