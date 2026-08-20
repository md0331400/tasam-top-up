export default function ErrorState({ message = "Something went wrong. Please try again.", retry }) {
  return (
    <div className="state-box error">
      <div className="state-icon">⚠️</div>
      <h3>Oops!</h3>
      <p>{message}</p>
      {retry && (
        <button className="btn btn-primary" onClick={retry}>
          Try Again
        </button>
      )}
    </div>
  );
}
