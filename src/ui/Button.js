export default function Button({ className, onClick, children }) {
  return (
    <button
      className={`button ${className ? className : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
