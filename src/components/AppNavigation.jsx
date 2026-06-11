import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Inicio' },
  { id: 'experience', label: 'Experiencia' },
  { id: 'blog', label: 'Blog' },
];

export function AppNavigation({ activeView, onNavigate }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const navItems = NAV_ITEMS.filter((item) => item.id !== activeView);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={hasScrolled ? 'app-nav app-nav--scrolled' : 'app-nav'}
      aria-label="Navegación principal"
    >
      <div className="app-nav__links">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="app-nav__link"
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
