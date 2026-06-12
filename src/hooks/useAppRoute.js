import { useCallback, useEffect, useState } from 'react';

const ROUTES = {
	'/': 'home',
	'/admin': 'admin',
	'/blog': 'blog',
	'/experience': 'experience',
};

function getPathFromUrl() {
	const redirectedPath = new URLSearchParams(window.location.search).get('path');

	return redirectedPath || window.location.pathname;
}

function getViewFromPath(pathname) {
	if (pathname.startsWith('/blog/')) {
		return 'blogArticle';
	}

	return ROUTES[pathname] || 'home';
}

function getRouteParams(pathname) {
	if (pathname.startsWith('/blog/')) {
		return {
			slug: decodeURIComponent(pathname.replace('/blog/', '').split('/')[0]),
		};
	}

	return {};
}

export function useAppRoute() {
	const [pathname, setPathname] = useState(getPathFromUrl);
	const activeView = getViewFromPath(pathname);
	const params = getRouteParams(pathname);

	useEffect(() => {
		if (window.location.search.includes('path=')) {
			window.history.replaceState({}, '', pathname);
		}

		const handlePopState = () => setPathname(getPathFromUrl());

		window.addEventListener('popstate', handlePopState);

		return () => window.removeEventListener('popstate', handlePopState);
	}, [pathname]);

	const navigateTo = useCallback((nextPath) => {
		window.history.pushState({}, '', nextPath);
		setPathname(nextPath);

		try {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} catch {
			window.scrollTo(0, 0);
		}
	}, []);

	return {
		activeView,
		navigateTo,
		params,
		pathname,
	};
}
