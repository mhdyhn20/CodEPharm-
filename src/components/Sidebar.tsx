import React from 'react';
import Logo from './Logo';
import { STR } from '@/constants/strings';

export type PageKey = 'home' | 'create' | 'all' | 'about' | 'settings';

interface Props {
  current: PageKey;
  onNavigate: (p: PageKey) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

interface NavItem {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
}

const Icon = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V11z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
    </svg>
  ),
  list: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.3" fill="currentColor" />
      <circle cx="4" cy="12" r="1.3" fill="currentColor" />
      <circle cx="4" cy="18" r="1.3" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="17" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.2" fill="currentColor" />
    </svg>
  ),
  gear: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinejoin="round" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
    </svg>
  ),
  collapse: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const items: NavItem[] = [
  { key: 'home', label: STR.nav.home, icon: Icon.home },
  { key: 'create', label: STR.nav.create, icon: Icon.plus },
  { key: 'all', label: STR.nav.all, icon: Icon.list },
  { key: 'settings', label: STR.nav.settings, icon: Icon.gear },
  { key: 'about', label: STR.nav.about, icon: Icon.info },
];

export const Sidebar: React.FC<Props> = ({ current, onNavigate, onLogout, collapsed, onToggleCollapsed }) => {
  return (
    <aside
      className={`flex flex-col bg-gradient-to-b from-brand to-brand-700 text-white transition-all duration-300 rounded-l-3xl shadow-float m-3 ml-0 ${
        collapsed ? 'w-[78px]' : 'w-[250px]'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 pt-5 pb-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {collapsed ? (
          <Logo size={40} showText={false} />
        ) : (
          <Logo size={42} showText variant="light" />
        )}
      </div>
      {!collapsed && (
        <div className="px-4 pb-4 text-white/70 text-[11px] border-b border-white/10">
          {STR.tagline}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(item => {
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? 'bg-white text-brand shadow-md font-medium'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className={active ? 'text-brand' : 'text-white/80'}>{item.icon}</span>
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom: collapse toggle + logout */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          onClick={onToggleCollapsed}
          title={STR.nav.collapse}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/75 hover:bg-white/10 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}>{Icon.collapse}</span>
          {!collapsed && <span className="text-sm">{STR.nav.collapse}</span>}
        </button>
        <button
          onClick={onLogout}
          title={collapsed ? STR.nav.logout : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/85 hover:bg-danger/80 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span>{Icon.logout}</span>
          {!collapsed && <span className="text-sm">{STR.nav.logout}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
