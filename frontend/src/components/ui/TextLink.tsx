export function TextLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors focus:outline-none focus:underline"
    >
      {children}
    </button>
  );
}