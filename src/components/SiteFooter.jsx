import { FaBeer, FaHeart } from 'react-icons/fa';

export function SiteFooter() {
  return (
    <footer className="footer">
      <span>
        Made with <FaHeart aria-label="love" /> and{' '}
        <FaBeer aria-label="beer" />
      </span>
    </footer>
  );
}
