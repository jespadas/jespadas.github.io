import { FaBeer, FaHeart } from 'react-icons/fa';

export function SiteFooter({ t }) {
  return (
    <footer className="footer">
      <span>
        {t.footerMade} <FaHeart aria-label="love" /> {t.footerAnd}{' '}
        <FaBeer aria-label="beer" />
      </span>
    </footer>
  );
}
