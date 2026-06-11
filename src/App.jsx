import { useState } from 'react';

import './App.css';

import { AppNavigation } from './components/AppNavigation';
import { ThemeToggle } from './components/ThemeToggle';
import { profileConfig } from './config/profile';
import { useThemeMode } from './hooks/useThemeMode';
import { BlogPage } from './pages/BlogPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { HomePage } from './pages/HomePage';

const VIEWS = {
  BLOG: 'blog',
  EXPERIENCE: 'experience',
  HOME: 'home',
};

function getActivePage(activeView) {
  if (activeView === VIEWS.EXPERIENCE) {
    return <ExperiencePage />;
  }

  if (activeView === VIEWS.BLOG) {
    return <BlogPage />;
  }

  return <HomePage />;
}

function App() {
  const [activeView, setActiveView] = useState(VIEWS.HOME);
  const {
    backgroundMode,
    backgroundStyle,
    isThemeToggleVisible,
    theme,
    toggleTheme,
  } = useThemeMode(profileConfig.background);

  return (
    <div className={theme} style={backgroundStyle}>
      <AppNavigation activeView={activeView} onNavigate={setActiveView} />
      <ThemeToggle isVisible={isThemeToggleVisible} onToggle={toggleTheme} />

      <div className={backgroundMode}>
        {getActivePage(activeView)}
      </div>
    </div>
  );
}

export default App;
