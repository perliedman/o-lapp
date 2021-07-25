export default function Button({ className, onClick, children }) {
  return (
    <button
      className={`border border-sky-600 rounded-md p-2 ${
        className ? className : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
