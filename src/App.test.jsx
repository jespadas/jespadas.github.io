import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';
import { profileConfig } from './config/profile';
import { getSafeIconClass, getSafeUrl } from './utils/security';

describe('App', () => {
  it('renders the configured introduction', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: profileConfig.intro })
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

  it('navigates to the blog page', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Blog' }));

    expect(screen.getByRole('heading', { name: 'Blog' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Blog' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Inicio' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Experiencia' })).toBeTruthy();
  });

  it('shows the home button outside the landing page', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Blog' }));
    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }));

    expect(
      screen.getByRole('heading', { name: profileConfig.intro })
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Inicio' })).toBeNull();
  });
});

describe('security helpers', () => {
  it('rejects unsafe URLs', () => {
    expect(getSafeUrl('javascript:alert(1)')).toBeNull();
  });

  it('rejects unsafe icon class tokens', () => {
    expect(getSafeIconClass('fa-github onclick=alert(1)')).toBeNull();
  });
});
