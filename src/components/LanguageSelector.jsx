export function LanguageSelector({ currentLanguage, languages, onChange, label }) {
	return (
		<div className='language-switcher' aria-label={label}>
			{languages.map((language) => (
				<button
					aria-pressed={currentLanguage === language.code}
					className={
						currentLanguage === language.code
							? 'language-switcher__button language-switcher__button--active'
							: 'language-switcher__button'
					}
					key={language.code}
					onClick={() => onChange(language.code)}
					title={language.label}
					type='button'
				>
					<span aria-hidden='true'>{language.flag}</span>
					<span className='language-switcher__code'>{language.code.toUpperCase()}</span>
				</button>
			))}
		</div>
	);
}
