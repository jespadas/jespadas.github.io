export function ThemeToggle({ isVisible, onToggle }) {
  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      className="change-mode"
      onClick={onToggle}
      aria-label="Cambiar tema"
    />
  );
}
