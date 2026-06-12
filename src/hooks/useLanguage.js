import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_LANGUAGE, LANGUAGES, translations } from '../i18n/translations';

const STORAGE_KEY = 'portfolio-language';

function getInitialLanguage() {
	if (typeof window === 'undefined') {
		return DEFAULT_LANGUAGE;
	}

	const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

	if (translations[savedLanguage]) {
		return savedLanguage;
	}

	return DEFAULT_LANGUAGE;
}

export function useLanguage() {
	const [language, setLanguage] = useState(getInitialLanguage);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, language);
		document.documentElement.lang = language;
	}, [language]);

	const value = useMemo(
		() => ({
			language,
			languages: LANGUAGES,
			setLanguage,
			t: translations[language],
		}),
		[language]
	);

	return value;
}
