import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider, useToast } from './components/ui/Toast';
import LoginPage from './pages/LoginPage';
import Sidebar, { PageKey } from './components/Sidebar';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import AllCustomersPage from './pages/AllCustomersPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import { STR } from './constants/strings';

const isElectron = (() => {
  try { return typeof window !== 'undefined' && !!(window as any).process?.versions?.electron; }
  catch { return false; }
})();

const Shell: React.FC = () => {
  const { currentUser, logout, settings, updateSettings } = useApp();
  const toast = useToast();
  const [page, setPage] = useState<PageKey>('home');
  const [collapsed, setCollapsed] = useState<boolean>(settings.sidebar_collapsed);

  if (!currentUser) return <LoginPage />;

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    updateSettings({ sidebar_collapsed: next });
  };

  const handleLogout = () => {
    if (confirm(STR.auth.logoutConfirm)) {
      logout();
      toast.show('خارج شدید.', 'info');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-surface-bg">
      {!isElectron && (
        <WebDemoBanner />
      )}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          current={page}
          onNavigate={setPage}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <TopBar username={currentUser.username} />
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            {page === 'home' && <HomePage onNavigate={setPage} />}
            {page === 'create' && <CreatePage />}
            {page === 'all' && <AllCustomersPage />}
            {page === 'about' && <AboutPage />}
            {page === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  );
};

const WebDemoBanner: React.FC = () => (
  <div className="bg-gradient-to-l from-amber-400 to-orange-500 text-white text-sm px-4 py-2 flex items-center justify-between gap-3 shadow">
    <div className="flex items-center gap-2">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l10 18H2L12 2z" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/><circle cx="12" cy="16.5" r=".8" fill="currentColor"/></svg>
      <span>پیش‌نمایش آنلاین — اطلاعات روی مرورگر ذخیره می‌شود. برای استفادهٔ آفلاین دائمی، نسخهٔ دسکتاپ ویندوز را نصب کنید.</span>
    </div>
    <a
      href="https://github.com/mhdyhn20/CodEPharm-/releases"
      target="_blank"
      rel="noopener"
      className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors"
    >
      دانلود نسخه ویندوز ←
    </a>
  </div>
);

const TopBar: React.FC<{ username: string }> = ({ username }) => (
  <header className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-surface-border bg-white/70 backdrop-blur">
    <div />
    <div className="flex items-center gap-3">
      <div className="text-left">
        <div className="text-xs text-ink-muted">کاربر</div>
        <div className="text-sm font-medium text-ink">{username}</div>
      </div>
      <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-bold">
        {username.slice(0, 1).toUpperCase()}
      </div>
    </div>
  </header>
);

const App: React.FC = () => (
  <AppProvider>
    <ToastProvider>
      <Shell />
    </ToastProvider>
  </AppProvider>
);

export default App;
