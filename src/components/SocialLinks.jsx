import { getAccessibleIconLabel, isExternalUrl } from '../utils/security';

export function SocialLinks({ links }) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav className="icons-social" aria-label="Redes sociales">
      {links.map((link) => {
        const opensNewTab = isExternalUrl(link.url);

        return (
          <a
            key={`${link.iconClass}-${link.url}`}
            target={opensNewTab ? '_blank' : undefined}
            rel={opensNewTab ? 'noopener noreferrer' : undefined}
            href={link.url}
            aria-label={getAccessibleIconLabel(link.iconClass)}
          >
            <i className={link.iconClass} aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}
