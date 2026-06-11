const BACKGROUND_MODES = {
  daylight: 'day',
  nightlight: 'night',
};

const DEFAULT_GRADIENT_COLORS = '#EE7752, #E73C7E, #23A6D5, #23D5AB';

export function getInitialTheme(background) {
  if (background.type === 'gradient') {
    return 'gradient';
  }

  if (background.type === 'image') {
    return 'full-bg-image';
  }

  return background.plainMode;
}

export function getBackgroundMode(theme) {
  return BACKGROUND_MODES[theme] || 'default';
}

export function getBackgroundStyle(background) {
  if (background.type === 'gradient') {
    return {
      background: `linear-gradient(-45deg, ${
        background.gradientColors || DEFAULT_GRADIENT_COLORS
      })`,
      backgroundSize: '400% 400%',
    };
  }

  if (background.type === 'image' && background.imageUrl) {
    return {
      backgroundImage: `url(${background.imageUrl})`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  return {};
}

export function canToggleTheme(background) {
  return background.type === 'plain';
}

export function getNextTheme(theme) {
  return theme === 'nightlight' ? 'daylight' : 'nightlight';
}
