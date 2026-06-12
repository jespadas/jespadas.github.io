import { useEffect, useState } from 'react';

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

function BlogArticleCard({ article, language, onRead, t }) {
	const articleLanguage = LANGUAGES.find((item) => item.code === article.language) || LANGUAGES[0];

	return (
		<article className='blog-card'>
			<div className='blog-card__meta'>
				<time dateTime={article.published_at || article.created_at}>
					{formatDate(article.published_at || article.created_at, language, t.noDate)}
				</time>
			</div>

			<h2>{article.title}</h2>
			<p className='blog-card__language'>
				{t.writtenIn} {articleLanguage.flag} {articleLanguage.label}
			</p>

			{article.excerpt ? <p>{article.excerpt}</p> : null}

			<button className='blog-card__link' type='button' onClick={onRead}>
				{t.readArticle}
			</button>
		</article>
	);
}

export function BlogPage({ language, onNavigate, t }) {
	const [articles, setArticles] = useState([]);
	const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!isSupabaseConfigured) {
			return undefined;
		}

		let isMounted = true;

		const loadPublishedArticles = async () => {
			const { data, error: articlesError } = await supabase
				.from('articles')
				.select('id,title,slug,excerpt,language,published_at,created_at')
				.eq('status', 'published')
				.lte('published_at', new Date().toISOString())
				.order('published_at', { ascending: false });

			if (!isMounted) {
				return;
			}

			if (articlesError) {
				setError(articlesError.message);
				setIsLoading(false);
				return;
			}

			setArticles(data || []);
			setIsLoading(false);
		};

		loadPublishedArticles();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<main className='content-page blog-page'>
			<section className='content-hero' aria-labelledby='blog-title'>
				<p className='content-kicker'>{t.kicker}</p>
				<h1 id='blog-title'>{t.title}</h1>
				<p>{t.description}</p>
			</section>

			<section className='blog-list' aria-label={t.listLabel}>
				{!isSupabaseConfigured ? (
					<p className='blog-empty'>{t.notConfigured}</p>
				) : null}

				{isLoading ? <p className='blog-empty'>{t.loading}</p> : null}

				{error ? <p className='blog-empty blog-empty--error'>{error}</p> : null}

				{!isLoading && !error && articles.length === 0 ? (
					<p className='blog-empty'>{t.empty}</p>
				) : null}

				{articles.map((article) => (
					<BlogArticleCard
						article={article}
						key={article.id}
						language={language}
						onRead={() => onNavigate(`/blog/${article.slug}`)}
						t={t}
					/>
				))}
			</section>
		</main>
	);
}
