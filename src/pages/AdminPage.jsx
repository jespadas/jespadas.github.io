import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MarkdownContent } from '../components/MarkdownContent';
import { LANGUAGES } from '../i18n/translations';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { escapeMarkdownText, getSafeImageUrl, getSafeUrl } from '../utils/security';
import { createSlug } from '../utils/slug';

const EMPTY_FORM = {
	content: '',
	excerpt: '',
	language: 'es',
	published_at: '',
	slug: '',
	status: 'draft',
	title: '',
};

const BLOG_IMAGES_BUCKET = 'blog-images';
const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const LOGIN_RATE_LIMIT_KEY = 'admin-login-rate-limit';
const LOGIN_MAX_FAILED_ATTEMPTS = 5;
const LOGIN_LOCK_DURATION_MS = 15 * 60 * 1000;

function readLoginRateLimit() {
	try {
		const rawState = window.localStorage.getItem(LOGIN_RATE_LIMIT_KEY);
		const state = rawState ? JSON.parse(rawState) : null;

		if (!state || typeof state !== 'object') {
			return { attempts: 0, lockedUntil: 0 };
		}

		const lockedUntil = Number(state.lockedUntil) || 0;

		if (lockedUntil && lockedUntil <= Date.now()) {
			window.localStorage.removeItem(LOGIN_RATE_LIMIT_KEY);
			return { attempts: 0, lockedUntil: 0 };
		}

		return {
			attempts: Number(state.attempts) || 0,
			lockedUntil,
		};
	} catch {
		return { attempts: 0, lockedUntil: 0 };
	}
}

function saveLoginRateLimit(state) {
	try {
		window.localStorage.setItem(LOGIN_RATE_LIMIT_KEY, JSON.stringify(state));
	} catch {
		// Supabase rate limits still protect the endpoint if local storage is unavailable.
	}
}

function clearLoginRateLimit() {
	try {
		window.localStorage.removeItem(LOGIN_RATE_LIMIT_KEY);
	} catch {
		// Ignore storage errors; this only controls local UI friction.
	}
}

function recordFailedLoginAttempt() {
	const state = readLoginRateLimit();
	const attempts = state.attempts + 1;
	const lockedUntil =
		attempts >= LOGIN_MAX_FAILED_ATTEMPTS ? Date.now() + LOGIN_LOCK_DURATION_MS : 0;
	const nextState = { attempts, lockedUntil };
	saveLoginRateLimit(nextState);
	return nextState;
}

function getLoginLockMessage(lockedUntil) {
	const remainingSeconds = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000));
	const remainingMinutes = Math.ceil(remainingSeconds / 60);

	return `Demasiados intentos fallidos. Intenta de nuevo en ${remainingMinutes} min.`;
}

function getPublicationValue(status, publishedAt) {
	if (status !== 'published') {
		return null;
	}

	return publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
}

function getDateTimeLocalValue(value) {
	if (!value) {
		return '';
	}

	const date = new Date(value);
	const timezoneOffset = date.getTimezoneOffset() * 60000;

	return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getFormFromArticle(article) {
	if (!article) {
		return EMPTY_FORM;
	}

	return {
		content: article.content || '',
		excerpt: article.excerpt || '',
		language: article.language || 'es',
		published_at: getDateTimeLocalValue(article.published_at),
		slug: article.slug || '',
		status: article.status || 'draft',
		title: article.title || '',
	};
}

function sanitizeFileName(name) {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9.]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function Toasts({ messages, onDismiss }) {
	if (!messages.length) {
		return null;
	}

	return (
		<div className='toast-stack' role='status' aria-live='polite'>
			{messages.map((toast) => (
				<div className={`toast toast--${toast.type}`} key={toast.id}>
					<p>{toast.message}</p>
					<button type='button' onClick={() => onDismiss(toast.id)} aria-label='Cerrar mensaje'>
						x
					</button>
				</div>
			))}
		</div>
	);
}

function AdminLogin({ onLogin }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [lockedUntil, setLockedUntil] = useState(() => readLoginRateLimit().lockedUntil);
	const [error, setError] = useState(() =>
		lockedUntil > Date.now() ? getLoginLockMessage(lockedUntil) : ''
	);
	const isLocked = lockedUntil > Date.now();

	useEffect(() => {
		if (!isLocked) {
			return undefined;
		}

		const intervalId = window.setInterval(() => {
			const rateLimit = readLoginRateLimit();
			setLockedUntil(rateLimit.lockedUntil);

			if (rateLimit.lockedUntil > Date.now()) {
				setError(getLoginLockMessage(rateLimit.lockedUntil));
			} else {
				setError('');
			}
		}, 1000);

		return () => window.clearInterval(intervalId);
	}, [isLocked]);

	const handleSubmit = async (event) => {
		event.preventDefault();

		const rateLimit = readLoginRateLimit();

		if (rateLimit.lockedUntil > Date.now()) {
			setLockedUntil(rateLimit.lockedUntil);
			setError(getLoginLockMessage(rateLimit.lockedUntil));
			return;
		}

		setIsSubmitting(true);
		setError('');

		const { error: loginError } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password,
		});

		setIsSubmitting(false);

		if (loginError) {
			const nextRateLimit = recordFailedLoginAttempt();

			if (nextRateLimit.lockedUntil) {
				setLockedUntil(nextRateLimit.lockedUntil);
				setError(getLoginLockMessage(nextRateLimit.lockedUntil));
				return;
			}

			setError('No se pudo iniciar sesión. Revisa tus credenciales e inténtalo de nuevo.');
			return;
		}

		clearLoginRateLimit();
		setLockedUntil(0);
		onLogin();
	};

	return (
		<form className='admin-form admin-login' onSubmit={handleSubmit}>
			<label>
				Email
				<input
					type='email'
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					autoComplete='email'
					required
				/>
			</label>

			<label>
				Contraseña
				<input
					type='password'
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					autoComplete='current-password'
					required
				/>
			</label>

			{error ? <p className='admin-message admin-message--error'>{error}</p> : null}

			<button className='admin-button' type='submit' disabled={isSubmitting || isLocked}>
				{isSubmitting ? 'Entrando...' : isLocked ? 'Acceso pausado' : 'Entrar al CMS'}
			</button>
		</form>
	);
}

function EditorToolbar({
	mediaAssets,
	onInsertBlock,
	onInsertImage,
	onInsertImageUrl,
	onInsertLink,
	onWrapSelection,
}) {
	return (
		<div className='editor-tools' aria-label='Herramientas de edición'>
			<div className='editor-tools__buttons'>
				<button type='button' onClick={() => onInsertBlock('# Título\n\n')}>
					H1
				</button>
				<button type='button' onClick={() => onInsertBlock('## Subtítulo\n\n')}>
					H2
				</button>
				<button type='button' onClick={() => onInsertBlock('### Sección\n\n')}>
					H3
				</button>
				<button type='button' onClick={() => onWrapSelection('**', '**', 'texto en negrita')}>
					B
				</button>
				<button type='button' onClick={() => onWrapSelection('_', '_', 'texto en cursiva')}>
					I
				</button>
				<button type='button' onClick={() => onWrapSelection('`', '`', 'código')}>
					Code
				</button>
				<button type='button' onClick={() => onInsertBlock('> Cita destacada\n\n')}>
					Cita
				</button>
				<button type='button' onClick={() => onInsertBlock('- Punto importante\n- Otro punto\n')}>
					Lista -
				</button>
				<button type='button' onClick={() => onInsertBlock('1. Primer punto\n2. Segundo punto\n')}>
					Lista 1.
				</button>
				<button type='button' onClick={() => onInsertBlock('```js\nconsole.log(\"hola\");\n```\n\n')}>
					Bloque code
				</button>
				<button type='button' onClick={() => onInsertBlock('\n---\n\n')}>
					Linea
				</button>
				<button type='button' onClick={onInsertLink}>
					Link
				</button>
				<button type='button' onClick={onInsertImageUrl}>
					Imagen URL
				</button>
			</div>

			{mediaAssets.length ? (
				<div className='editor-media-strip' aria-label='Imágenes disponibles'>
					{mediaAssets.map((asset) => (
						<button
							className='editor-media-strip__item'
							key={asset.id}
							type='button'
							onClick={() => onInsertImage(asset)}
							title={`Insertar ${asset.name}`}
						>
							<img src={asset.public_url} alt={asset.alt_text || asset.name} />
						</button>
					))}
				</div>
			) : (
				<p className='editor-tools__hint'>Sube imágenes en la galería para insertarlas aquí.</p>
			)}
		</div>
	);
}

function ArticleForm({ article, mediaAssets, onCancel, onNotify, onSaved }) {
	const [form, setForm] = useState(() => getFormFromArticle(article));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const textareaRef = useRef(null);
	const isEditing = Boolean(article);

	const canPublish = useMemo(
		() => form.title.trim() && form.slug.trim() && form.content.trim(),
		[form]
	);

	const updateField = (field, value) => {
		setForm((current) => {
			if (field === 'title' && current.slug === createSlug(current.title)) {
				return {
					...current,
					title: value,
					slug: createSlug(value),
				};
			}

			return {
				...current,
				[field]: field === 'slug' ? createSlug(value) : value,
			};
		});
	};

	const replaceSelection = (getText, selectionFallback = '') => {
		const textarea = textareaRef.current;

		if (!textarea) {
			updateField('content', `${form.content}${getText(selectionFallback)}`);
			return;
		}

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = form.content.slice(start, end) || selectionFallback;
		const text = getText(selectedText);
		const nextContent = `${form.content.slice(0, start)}${text}${form.content.slice(end)}`;
		updateField('content', nextContent);

		window.requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(start + text.length, start + text.length);
		});
	};

	const insertTextAtSelection = (text) => {
		replaceSelection(() => text);
	};

	const wrapSelection = (before, after, fallback) => {
		replaceSelection((selectedText) => `${before}${selectedText}${after}`, fallback);
	};

	const handleInsertLink = () => {
		const label = window.prompt('Texto del enlace');
		const url = window.prompt('URL');
		const safeUrl = getSafeUrl(url);

		if (!label || !url) {
			return;
		}

		if (!safeUrl) {
			onNotify('error', 'URL no permitida. Usa enlaces https://, http:// o mailto:.');
			return;
		}

		insertTextAtSelection(`[${escapeMarkdownText(label.trim())}](${safeUrl})`);
	};

	const handleInsertImageUrl = () => {
		const altText = window.prompt('Texto alternativo de la imagen');
		const url = window.prompt('URL de la imagen');
		const safeUrl = getSafeImageUrl(url);

		if (!url) {
			return;
		}

		if (!safeUrl) {
			onNotify('error', 'URL de imagen no permitida. Usa una URL https://.');
			return;
		}

		insertTextAtSelection(`\n\n![${escapeMarkdownText(altText?.trim() || 'Imagen')}](${safeUrl})\n\n`);
	};

	const handleInsertImage = (asset) => {
		const altText = asset.alt_text || asset.name;
		const safeUrl = getSafeImageUrl(asset.public_url);

		if (!safeUrl) {
			onNotify('error', 'La imagen seleccionada no tiene una URL segura.');
			return;
		}

		insertTextAtSelection(`\n\n![${escapeMarkdownText(altText)}](${safeUrl})\n\n`);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		setError('');
		setMessage('');

		const payload = {
			content: form.content.trim(),
			excerpt: form.excerpt.trim() || null,
			language: form.language,
			published_at: getPublicationValue(form.status, form.published_at),
			slug: form.slug.trim(),
			status: form.status,
			title: form.title.trim(),
		};

		const request = isEditing
			? supabase.from('articles').update(payload).eq('id', article.id)
			: supabase.from('articles').insert(payload);

		const { error: saveError } = await request;

		setIsSubmitting(false);

		if (saveError) {
			setError(saveError.message);
			onNotify('error', saveError.message);
			return;
		}

		setMessage(isEditing ? 'Artículo actualizado correctamente.' : 'Artículo creado correctamente.');
		onNotify('success', isEditing ? 'Artículo actualizado correctamente.' : 'Artículo creado correctamente.');
		onSaved();
	};

	return (
		<form className='admin-form article-form' onSubmit={handleSubmit}>
			<div className='admin-form__header'>
				<div>
					<p className='admin-eyebrow'>{isEditing ? 'Editar' : 'Nuevo artículo'}</p>
					<h2>{isEditing ? article.title : 'Crear artículo'}</h2>
				</div>
				<button
					className='admin-button admin-button--secondary'
					type='button'
					onClick={onCancel}
				>
					Cancelar
				</button>
			</div>

			<div className='admin-form__grid'>
				<label>
					Título
					<input
						type='text'
						value={form.title}
						onChange={(event) => updateField('title', event.target.value)}
						required
					/>
				</label>

				<label>
					Slug
					<input
						type='text'
						value={form.slug}
						onChange={(event) => updateField('slug', event.target.value)}
						placeholder='mi-articulo'
						required
					/>
				</label>
			</div>

			<label>
				Extracto
				<textarea
					value={form.excerpt}
					onChange={(event) => updateField('excerpt', event.target.value)}
					rows='3'
					maxLength='320'
				/>
			</label>

			<label>
				Contenido Markdown
				<EditorToolbar
					mediaAssets={mediaAssets}
					onInsertBlock={insertTextAtSelection}
					onInsertImage={handleInsertImage}
					onInsertImageUrl={handleInsertImageUrl}
					onInsertLink={handleInsertLink}
					onWrapSelection={wrapSelection}
				/>
				<textarea
					ref={textareaRef}
					value={form.content}
					onChange={(event) => updateField('content', event.target.value)}
					rows='12'
					required
				/>
			</label>

			<div className='admin-form__grid'>
				<label>
					Idioma del artículo
					<select
						value={form.language}
						onChange={(event) => updateField('language', event.target.value)}
					>
						{LANGUAGES.map((language) => (
							<option key={language.code} value={language.code}>
								{language.flag} {language.label}
							</option>
						))}
					</select>
				</label>

				<label>
					Estado
					<select
						value={form.status}
						onChange={(event) => updateField('status', event.target.value)}
					>
						<option value='draft'>Borrador</option>
						<option value='published'>Publicado</option>
					</select>
				</label>

				<label>
					Fecha de publicación
					<input
						type='datetime-local'
						value={form.published_at}
						onChange={(event) => updateField('published_at', event.target.value)}
					/>
				</label>
			</div>

			{error ? <p className='admin-message admin-message--error'>{error}</p> : null}
			{message ? <p className='admin-message admin-message--success'>{message}</p> : null}

			<button className='admin-button' type='submit' disabled={!canPublish || isSubmitting}>
				{isSubmitting
					? 'Guardando...'
					: isEditing
						? 'Guardar cambios'
						: 'Crear artículo'}
			</button>
		</form>
	);
}

function MediaLibrary({ assets, onDelete, onInsert, onNotify, onUploaded, session }) {
	const [file, setFile] = useState(null);
	const [name, setName] = useState('');
	const [altText, setAltText] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState('');

	const handleFileChange = (event) => {
		const selectedFile = event.target.files?.[0] || null;
		setFile(selectedFile);
		setName(selectedFile ? selectedFile.name.replace(/\.[^.]+$/, '') : '');
		setAltText('');
		setError('');
	};

	const handleUpload = async (event) => {
		event.preventDefault();

		if (!file || !session?.user?.id) {
			onNotify('error', 'Selecciona una imagen antes de subirla.');
			return;
		}

		if (!IMAGE_MIME_TYPES.includes(file.type)) {
			onNotify('error', 'Formato no soportado. Usa JPG, PNG, WEBP o GIF.');
			return;
		}

		if (file.size > IMAGE_MAX_SIZE_BYTES) {
			onNotify('error', 'La imagen supera el límite de 5 MB.');
			return;
		}

		setIsUploading(true);
		setError('');
		onNotify('info', 'Subiendo imagen...');

		const cleanFileName = sanitizeFileName(file.name) || 'image';
		const storagePath = `${session.user.id}/${Date.now()}-${cleanFileName}`;
		const { error: uploadError } = await supabase.storage
			.from(BLOG_IMAGES_BUCKET)
			.upload(storagePath, file, {
				cacheControl: '31536000',
				contentType: file.type,
				upsert: false,
			});

		if (uploadError) {
			const message = `No se pudo subir a Storage: ${uploadError.message}`;
			setError(message);
			onNotify('error', message);
			setIsUploading(false);
			return;
		}

		const { data: publicUrlData } = supabase.storage
			.from(BLOG_IMAGES_BUCKET)
			.getPublicUrl(storagePath);

		const { error: insertError } = await supabase.from('media_assets').insert({
			alt_text: altText.trim(),
			created_by: session.user.id,
			mime_type: file.type,
			name: name.trim() || file.name,
			public_url: publicUrlData.publicUrl,
			size_bytes: file.size,
			storage_bucket: BLOG_IMAGES_BUCKET,
			storage_path: storagePath,
		});

		setIsUploading(false);

		if (insertError) {
			await supabase.storage.from(BLOG_IMAGES_BUCKET).remove([storagePath]);
			const message = `La imagen subió, pero no se guardó en la galería: ${insertError.message}`;
			setError(message);
			onNotify('error', message);
			return;
		}

		setFile(null);
		setName('');
		setAltText('');
		event.currentTarget.reset();
		await onUploaded();
		onNotify('success', 'Imagen subida correctamente.');
	};

	return (
		<section className='admin-section media-library' aria-label='Galería de imágenes'>
			<div className='admin-section__header'>
				<div>
					<p className='admin-eyebrow'>Media</p>
					<h2>Galería de imágenes</h2>
				</div>
			</div>

			<form className='media-upload' onSubmit={handleUpload}>
				<label>
					Imagen
					<input type='file' accept={IMAGE_MIME_TYPES.join(',')} onChange={handleFileChange} />
				</label>
				<label>
					Nombre
					<input
						type='text'
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder='Nombre interno'
					/>
				</label>
				<label>
					Texto alternativo
					<input
						type='text'
						value={altText}
						onChange={(event) => setAltText(event.target.value)}
						placeholder='Descripción para accesibilidad'
					/>
				</label>
				<button className='admin-button' type='submit' disabled={!file || isUploading}>
					{isUploading ? 'Subiendo...' : 'Subir imagen'}
				</button>
			</form>

			{error ? <p className='admin-message admin-message--error'>{error}</p> : null}

			{assets.length ? (
				<div className='media-grid'>
					{assets.map((asset) => (
						<article className='media-card' key={asset.id}>
							<img src={asset.public_url} alt={asset.alt_text || asset.name} />
							<div>
								<h3>{asset.name}</h3>
								<p>{asset.alt_text || 'Sin texto alternativo'}</p>
							</div>
							<div className='admin-actions'>
								{onInsert ? (
									<button
										className='admin-action'
										type='button'
										onClick={() => onInsert(asset)}
									>
										Insertar
									</button>
								) : null}
								<a className='admin-action' href={asset.public_url} target='_blank' rel='noreferrer'>
									Abrir
								</a>
								<button
									className='admin-action admin-action--danger'
									type='button'
									onClick={() => onDelete(asset)}
								>
									Eliminar
								</button>
							</div>
						</article>
					))}
				</div>
			) : (
				<p className='admin-empty'>Todavía no hay imágenes en la galería.</p>
			)}
		</section>
	);
}

function ArticlePreview({ article, onBack, onEdit }) {
	return (
		<section className='admin-preview'>
			<div className='admin-preview__header'>
				<div>
					<p className='admin-eyebrow'>Vista previa</p>
					<h2>{article.title}</h2>
					<p>{article.slug}</p>
				</div>
				<div className='admin-actions'>
					<button className='admin-button admin-button--secondary' type='button' onClick={onBack}>
						Volver
					</button>
					<button className='admin-button' type='button' onClick={onEdit}>
						Editar
					</button>
				</div>
			</div>

			{article.excerpt ? <p className='admin-preview__excerpt'>{article.excerpt}</p> : null}
			<article className='admin-preview__content'>
				<MarkdownContent content={article.content} />
			</article>
		</section>
	);
}

function ArticleList({ articles, onCreate, onDelete, onEdit, onPreview }) {
	if (articles.length === 0) {
		return (
			<section className='admin-section' aria-label='Artículos existentes'>
				<div className='admin-section__header'>
					<h2>Artículos</h2>
					<button className='admin-button' type='button' onClick={onCreate}>
						Nuevo artículo
					</button>
				</div>
				<p className='admin-empty'>Todavía no hay artículos.</p>
			</section>
		);
	}

	return (
		<section className='admin-section' aria-label='Artículos existentes'>
			<div className='admin-section__header'>
				<h2>Artículos</h2>
				<button className='admin-button' type='button' onClick={onCreate}>
					Nuevo artículo
				</button>
			</div>

			<div className='admin-articles'>
				{articles.map((article) => (
					<article className='admin-article' key={article.id}>
						<div>
							<h3>{article.title}</h3>
							<p>{article.slug}</p>
						</div>
						<span>{article.language || 'es'}</span>
						<span>{article.status}</span>
						<div className='admin-actions'>
							<button
								className='admin-action'
								type='button'
								onClick={() => onPreview(article)}
							>
								Preview
							</button>
							<button
								className='admin-action'
								type='button'
								onClick={() => onEdit(article)}
							>
								Editar
							</button>
							<button
								className='admin-action admin-action--danger'
								type='button'
								onClick={() => onDelete(article)}
							>
								Eliminar
							</button>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}

export function AdminPage() {
	const [session, setSession] = useState(null);
	const [articles, setArticles] = useState([]);
	const [mediaAssets, setMediaAssets] = useState([]);
	const [toasts, setToasts] = useState([]);
	const [mode, setMode] = useState('list');
	const [selectedArticle, setSelectedArticle] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
	const [error, setError] = useState('');

	const checkAdminAccess = useCallback(async (userId) => {
		if (!supabase || !userId) {
			setIsAdmin(false);
			return false;
		}

		setIsCheckingPermissions(true);

		const { data, error: adminError } = await supabase
			.from('blog_admins')
			.select('user_id')
			.eq('user_id', userId)
			.maybeSingle();

		setIsCheckingPermissions(false);

		if (adminError) {
			setError(adminError.message);
			addToast('error', adminError.message);
			setIsAdmin(false);
			return false;
		}

		setIsAdmin(Boolean(data));
		return Boolean(data);
	}, []);

	const loadArticles = useCallback(async () => {
		if (!supabase) {
			return;
		}

		const { data, error: articlesError } = await supabase
			.from('articles')
			.select('id,title,slug,excerpt,content,language,status,published_at,created_at')
			.order('created_at', { ascending: false });

		if (articlesError) {
			setError(articlesError.message);
			addToast('error', articlesError.message);
			return;
		}

		setArticles(data || []);
	}, []);

	const loadMediaAssets = useCallback(async () => {
		if (!supabase) {
			return;
		}

		const { data, error: mediaError } = await supabase
			.from('media_assets')
			.select('id,name,alt_text,storage_bucket,storage_path,public_url,mime_type,size_bytes,created_at')
			.order('created_at', { ascending: false });

		if (mediaError) {
			setError(mediaError.message);
			addToast('error', mediaError.message);
			return;
		}

		setMediaAssets(data || []);
	}, []);

	const resetWorkspace = () => {
		setMode('list');
		setSelectedArticle(null);
	};

	const addToast = (type, message) => {
		const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		setToasts((current) => [...current, { id, message, type }]);
		window.setTimeout(() => {
			setToasts((current) => current.filter((toast) => toast.id !== id));
		}, 5500);
	};

	const dismissToast = (id) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	};

	const handleCreate = () => {
		setSelectedArticle(null);
		setMode('create');
	};

	const handleEdit = (article) => {
		setSelectedArticle(article);
		setMode('edit');
	};

	const handlePreview = (article) => {
		setSelectedArticle(article);
		setMode('preview');
	};

	const handleSaved = async () => {
		await loadArticles();
		resetWorkspace();
	};

	const handleDelete = async (article) => {
		const confirmed = window.confirm(
			`¿Eliminar el artículo "${article.title}"? Esta acción no se puede deshacer.`
		);

		if (!confirmed) {
			return;
		}

		setError('');

		const { data: deletedArticle, error: deleteError } = await supabase
			.from('articles')
			.delete()
			.eq('id', article.id)
			.select('id')
			.maybeSingle();

		if (deleteError) {
			setError(deleteError.message);
			addToast('error', deleteError.message);
			return;
		}

		if (!deletedArticle) {
			const message =
				'Supabase no eliminó ninguna fila. Revisa que tu usuario siga autorizado como admin y que las policies RLS de articles estén actualizadas.';
			setError(message);
			addToast('error', message);
			await loadArticles();
			return;
		}

		await loadArticles();
		resetWorkspace();
		addToast('success', 'Artículo eliminado correctamente.');
	};

	const handleDeleteMediaAsset = async (asset) => {
		const confirmed = window.confirm(
			`¿Eliminar la imagen "${asset.name}"? Si ya está usada en un artículo, dejará de verse.`
		);

		if (!confirmed) {
			return;
		}

		setError('');

		const { data: deletedAsset, error: deleteError } = await supabase
			.from('media_assets')
			.delete()
			.eq('id', asset.id)
			.select('id')
			.maybeSingle();

		if (deleteError) {
			setError(deleteError.message);
			addToast('error', deleteError.message);
			return;
		}

		if (!deletedAsset) {
			const message =
				'Supabase no eliminó la imagen de la galería. Revisa las policies RLS de media_assets.';
			setError(message);
			addToast('error', message);
			await loadMediaAssets();
			return;
		}

		const { error: storageError } = await supabase.storage
			.from(asset.storage_bucket || BLOG_IMAGES_BUCKET)
			.remove([asset.storage_path]);

		if (storageError) {
			const message = `La imagen salió de la galería, pero no se pudo eliminar de Storage: ${storageError.message}`;
			setError(message);
			addToast('error', message);
			await loadMediaAssets();
			return;
		}

		await loadMediaAssets();
		addToast('success', 'Imagen eliminada correctamente.');
	};

	useEffect(() => {
		if (!isSupabaseConfigured) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;

		supabase.auth.getSession().then(({ data }) => {
			if (!isMounted) {
				return;
			}

			setSession(data.session);
			setIsLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession);
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (session) {
			checkAdminAccess(session.user.id).then((hasAccess) => {
				if (hasAccess) {
					loadArticles();
					loadMediaAssets();
				}
			});
		} else {
			setIsAdmin(false);
			setArticles([]);
			setMediaAssets([]);
		}
	}, [checkAdminAccess, loadArticles, loadMediaAssets, session]);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		setArticles([]);
		setMediaAssets([]);
		setIsAdmin(false);
		resetWorkspace();
	};

	if (!isSupabaseConfigured) {
		return (
			<main className='content-page admin-page'>
				<section className='content-hero'>
					<p className='content-kicker'>CMS</p>
					<h1>Admin</h1>
					<p>
						Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para activar
						el backoffice.
					</p>
				</section>
			</main>
		);
	}

	if (isLoading) {
		return (
			<main className='content-page admin-page'>
				<p className='admin-empty'>Cargando CMS...</p>
			</main>
		);
	}

	return (
		<main className='content-page admin-page'>
			<Toasts messages={toasts} onDismiss={dismissToast} />
			<section className='content-hero' aria-labelledby='admin-title'>
				<p className='content-kicker'>CMS privado</p>
				<h1 id='admin-title'>Admin</h1>
				<p>Gestiona artículos del blog con una sesión protegida por Supabase.</p>
			</section>

			{session ? (
				<section className='admin-panel'>
					<div className='admin-panel__header'>
						<div>
							<p className='admin-eyebrow'>Sesión activa</p>
							<h2>{session.user.email}</h2>
						</div>
						<button className='admin-button admin-button--secondary' type='button' onClick={handleLogout}>
							Salir
						</button>
					</div>

					{isCheckingPermissions ? (
						<p className='admin-empty'>Verificando permisos...</p>
					) : null}

					{!isCheckingPermissions && !isAdmin ? (
						<section className='admin-form'>
							<p className='admin-message admin-message--error'>
								Tu usuario inició sesión, pero no tiene permisos de administrador
								del blog. Agrega este email a la tabla blog_admins en Supabase.
							</p>
						</section>
					) : null}

					{isAdmin ? (
						<>
							{error ? <p className='admin-message admin-message--error'>{error}</p> : null}
							{mode === 'list' ? (
								<>
									<MediaLibrary
										assets={mediaAssets}
										onDelete={handleDeleteMediaAsset}
										onNotify={addToast}
										onUploaded={loadMediaAssets}
										session={session}
									/>
									<ArticleList
										articles={articles}
										onCreate={handleCreate}
										onDelete={handleDelete}
										onEdit={handleEdit}
										onPreview={handlePreview}
									/>
								</>
							) : null}

							{mode === 'create' || mode === 'edit' ? (
								<ArticleForm
									article={mode === 'edit' ? selectedArticle : null}
									mediaAssets={mediaAssets}
									onCancel={resetWorkspace}
									onNotify={addToast}
									onSaved={handleSaved}
								/>
							) : null}

							{mode === 'preview' && selectedArticle ? (
								<ArticlePreview
									article={selectedArticle}
									onBack={resetWorkspace}
									onEdit={() => handleEdit(selectedArticle)}
								/>
							) : null}
						</>
					) : null}
				</section>
			) : (
				<AdminLogin onLogin={loadArticles} />
			)}
		</main>
	);
}
