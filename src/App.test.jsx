import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { translations } from './i18n/translations';
import { getSafeIconClass, getSafeImageUrl, getSafeMarkdownUrl, getSafeUrl } from './utils/security';

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('renders the configured introduction', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: translations.es.home.intro })
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Inicio' })).toBeNull();
  });

  it('protects external social links opened in new tabs', () => {
    render(<App />);

    const githubLink = screen.getByRole('link', { name: 'github' });

    expect(githubLink.getAttribute('target')).toBe('_blank');
    expect(githubLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('navigates to the professional experience page', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Experiencia' }));

    expect(
      screen.getByRole('heading', { name: 'Experiencia profesional' })
    ).toBeTruthy();
    expect(screen.getByText('Sogeti')).toBeTruthy();
    expect(screen.getByText('CEGID · Aplicación de punto de venta MFE')).toBeTruthy();
    expect(screen.getByText('PIY · Configuración y venta de aviones Airbus')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Experiencia' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Inicio' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Blog' })).toBeTruthy();
  });

  it('navigates to the blog page', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Blog' }));

    expect(await screen.findByRole('heading', { name: 'Blog' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Blog' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Inicio' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Experiencia' })).toBeTruthy();
  });

  it('shows the home button outside the landing page', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Blog' }));
    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }));

    expect(
      screen.getByRole('heading', { name: translations.es.home.intro })
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Inicio' })).toBeNull();
  });

  it('switches public copy between supported languages', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'FR' }));

    expect(
      screen.getByRole('heading', { name: translations.fr.home.intro })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Expérience' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(
      screen.getByRole('heading', { name: translations.en.home.intro })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Experience' })).toBeTruthy();
  });

  it('renders the protected admin route directly', async () => {
    window.history.replaceState({}, '', '/admin');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Admin' })).toBeTruthy();
  });

  it('renders a blog article route directly', async () => {
    window.history.replaceState({}, '', '/blog/mi-articulo');

    render(<App />);

    expect(await screen.findByText('Cargando artículo...')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Blog' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Inicio' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Experiencia' })).toBeTruthy();
  });
});

describe('security helpers', () => {
  it('rejects unsafe URLs', () => {
    expect(getSafeUrl('javascript:alert(1)')).toBeNull();
  });

  it('rejects unsafe icon class tokens', () => {
    expect(getSafeIconClass('fa-github onclick=alert(1)')).toBeNull();
  });

  it('only allows https image URLs', () => {
    expect(getSafeImageUrl('javascript:alert(1)')).toBeNull();
    expect(getSafeImageUrl('http://example.com/image.png')).toBeNull();
    expect(getSafeImageUrl('https://example.com/image.png')).toBe('https://example.com/image.png');
  });

  it('removes unsafe markdown URLs', () => {
    expect(getSafeMarkdownUrl('javascript:alert(1)', 'href')).toBe('');
    expect(getSafeMarkdownUrl('javascript:alert(1)', 'src')).toBe('');
  });
});
