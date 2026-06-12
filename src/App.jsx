import './App.css';

import { AppNavigation } from './components/AppNavigation';
import { ThemeToggle } from './components/ThemeToggle';
import { profileConfig } from './config/profile';
import { useAppRoute } from './hooks/useAppRoute';
import { useLanguage } from './hooks/useLanguage';
import { useThemeMode } from './hooks/useThemeMode';
import { AdminPage } from './pages/AdminPage';
import { BlogArticlePage } from './pages/BlogArticlePage';
import { BlogPage } from './pages/BlogPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { HomePage } from './pages/HomePage';

const VIEWS = {
  ADMIN: 'admin',
  BLOG: 'blog',
  BLOG_ARTICLE: 'blogArticle',
  EXPERIENCE: 'experience',
  HOME: 'home',
};

function getActivePage(activeView, params, navigateTo, language, t) {
  if (activeView === VIEWS.ADMIN) {
    return <AdminPage />;
  }

  if (activeView === VIEWS.BLOG_ARTICLE) {
    return (
      <BlogArticlePage
        language={language}
        slug={params.slug}
        t={t.article}
        onBack={() => navigateTo('/blog')}
      />
    );
  }

  if (activeView === VIEWS.EXPERIENCE) {
    return <ExperiencePage language={language} t={t.experience} />;
  }

  if (activeView === VIEWS.BLOG) {
    return <BlogPage language={language} onNavigate={navigateTo} t={t.blog} />;
  }

  return <HomePage t={t.home} />;
}

function App() {
  const { activeView, navigateTo, params } = useAppRoute();
  const { language, languages, setLanguage, t } = useLanguage();
  const {
    backgroundMode,
    backgroundStyle,
    isThemeToggleVisible,
    theme,
    toggleTheme,
  } = useThemeMode(profileConfig.background);

  return (
    <div className={theme} style={backgroundStyle}>
      <AppNavigation
        activeView={activeView}
        currentLanguage={language}
        languages={languages}
        onLanguageChange={setLanguage}
        onNavigate={navigateTo}
        t={t}
      />
      <ThemeToggle isVisible={isThemeToggleVisible} onToggle={toggleTheme} />

      <div className={backgroundMode}>
        {getActivePage(activeView, params, navigateTo, language, t)}
      </div>
    </div>
  );
}

export default App;
