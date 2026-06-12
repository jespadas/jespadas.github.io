import { useEffect, useState } from 'react';

import { LanguageSelector } from './LanguageSelector';

const NAV_ITEMS = [
	{ id: 'home', labelKey: 'home', path: '/' },
	{ id: 'experience', labelKey: 'experience', path: '/experience' },
	{ id: 'blog', labelKey: 'blog', path: '/blog' },
];

export function AppNavigation({
	activeView,
	currentLanguage,
	languages,
	onLanguageChange,
	onNavigate,
	t,
}) {
	const [hasScrolled, setHasScrolled] = useState(false);
	const normalizedView = activeView === 'blogArticle' ? 'blog' : activeView;
	const navItems = NAV_ITEMS.filter((item) => item.id !== normalizedView);

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
			aria-label={t.nav.label}
		>
			<div className='app-nav__links'>
				{navItems.map((item) => (
					<button
						key={item.id}
						type='button'
						className='app-nav__link'
						onClick={() => onNavigate(item.path)}
					>
						{t.nav[item.labelKey]}
					</button>
				))}
			</div>
			<LanguageSelector
				currentLanguage={currentLanguage}
				label={t.language.label}
				languages={languages}
				onChange={onLanguageChange}
			/>
		</nav>
	);
}
