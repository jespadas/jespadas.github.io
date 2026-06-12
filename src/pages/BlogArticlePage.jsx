import { useEffect, useState } from 'react';

import { MarkdownContent } from '../components/MarkdownContent';
import { LANGUAGES } from '../i18n/translations';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

function formatDate(value, language, noDateLabel) {
	if (!value) {
		return noDateLabel;
	}

	return new Intl.DateTimeFormat(language, {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	}).format(new Date(value));
}

export function BlogArticlePage({ language, onBack, slug, t }) {
	const [article, setArticle] = useState(null);
	const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!isSupabaseConfigured) {
			return undefined;
		}

		let isMounted = true;

		const loadArticle = async () => {
			setIsLoading(true);
			setError('');

			const { data, error: articleError } = await supabase
				.from('articles')
				.select('id,title,slug,excerpt,content,language,published_at,created_at')
				.eq('slug', slug)
				.eq('status', 'published')
				.lte('published_at', new Date().toISOString())
				.maybeSingle();

			if (!isMounted) {
				return;
			}

			if (articleError) {
				setError(articleError.message);
				setIsLoading(false);
				return;
			}

			setArticle(data);
			setIsLoading(false);
		};

		loadArticle();

		return () => {
			isMounted = false;
		};
	}, [slug]);

	return (
		<main className='content-page blog-article-page'>
			<button className='blog-back-link' type='button' onClick={onBack}>
				{t.backToBlog}
			</button>

			{!isSupabaseConfigured ? (
				<p className='blog-empty'>{t.notConfigured}</p>
			) : null}

			{isLoading ? <p className='blog-empty'>{t.loading}</p> : null}

			{error ? <p className='blog-empty blog-empty--error'>{error}</p> : null}

			{!isLoading && !error && !article ? (
				<p className='blog-empty'>{t.empty}</p>
			) : null}

			{article ? (
				<article className='blog-article'>
					<header className='blog-article__header'>
						{(() => {
							const articleLanguage =
								LANGUAGES.find((item) => item.code === article.language) || LANGUAGES[0];

							return (
								<p className='blog-card__language'>
									{t.writtenIn} {articleLanguage.flag} {articleLanguage.label}
								</p>
							);
						})()}
						<p className='content-kicker'>{t.kicker}</p>
						<h1>{article.title}</h1>
						<time dateTime={article.published_at || article.created_at}>
							{formatDate(article.published_at || article.created_at, language, t.noDate)}
						</time>
						{article.excerpt ? <p>{article.excerpt}</p> : null}
					</header>

					<div className='blog-article__content'>
						<MarkdownContent content={article.content} />
					</div>
				</article>
			) : null}
		</main>
	);
}
