import { ReactTyped } from 'react-typed';

export function TypedTagline({ descriptions }) {
  if (descriptions.length === 0) {
    return null;
  }

  return (
    <div className="tagline">
      <ReactTyped
        strings={descriptions}
        typeSpeed={40}
        backSpeed={40}
        loop
        smartBackspace
      />
    </div>
  );
}
