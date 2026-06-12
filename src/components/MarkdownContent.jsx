import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { getSafeImageUrl, getSafeMarkdownUrl, getSafeUrl } from '../utils/security';

function normalizeMarkdown(content) {
	return String(content || '')
		.replace(/\\r\\n/g, '\n')
		.replace(/\\n/g, '\n')
		.replace(/^(\s*#{1,6})([^\s#])/gm, '$1 $2')
		.replace(/^(\s*)--\s+/gm, '$1- ')
		.replace(/^(\s*)[–—]\s+/gm, '$1- ');
}

function MarkdownLink({ href, children }) {
	const safeHref = getSafeUrl(href);
	const isExternal = safeHref?.startsWith('http://') || safeHref?.startsWith('https://');

	if (!safeHref) {
		return <>{children}</>;
	}

	return (
		<a href={safeHref} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined}>
			{children}
		</a>
	);
}

function MarkdownImage({ alt, src }) {
	const safeSrc = getSafeImageUrl(src);

	if (!safeSrc) {
		return null;
	}

	return <img src={safeSrc} alt={alt || ''} loading='lazy' />;
}

export function MarkdownContent({ content }) {
	return (
		<div className='markdown-content'>
			<ReactMarkdown
				components={{
					a: MarkdownLink,
					img: MarkdownImage,
				}}
				remarkPlugins={[remarkGfm]}
				urlTransform={getSafeMarkdownUrl}
			>
				{normalizeMarkdown(content)}
			</ReactMarkdown>
		</div>
	);
}
