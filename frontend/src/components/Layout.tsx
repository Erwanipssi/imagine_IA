import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/create', label: 'Créer', icon: '✨' },
  { to: '/library', label: 'Bibliothèque', icon: '📚' },
  { to: '/feed', label: 'Feed', icon: '🌍' },
  { to: '/profiles', label: 'Profils', icon: '👤' },
] as const;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-primary-500 text-white shadow-soft'
        : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
    }`;

  const SidebarContent = () => (
    <>
      <NavLink
        to="/"
        onClick={() => setSidebarOpen(false)}
        className="flex items-center gap-2 px-4 py-4 border-b border-primary-100/60"
      >
        <span className="text-2xl">✨</span>
        <span className="text-xl font-display font-bold text-primary-600">Imagine AI</span>
      </NavLink>
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={navClass}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={navClass}
          >
            <span className="text-lg">🛡️</span>
            Admin
          </NavLink>
        )}
      </nav>
      <div className="p-4 border-t border-primary-100/60 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Compte</p>
        <p className="text-sm text-gray-600 truncate px-2" title={user?.email}>
          {user?.email}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-gray-600 bg-surface-100 hover:bg-surface-200 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Overlay mobile */}
      <button
        type="button"
        aria-label="Fermer le menu"
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/95 backdrop-blur-md border-r border-primary-100/80 shadow-soft flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Top bar mobile */}
      <header className="fixed top-0 right-0 left-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-primary-100/80 shadow-soft flex items-center px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl text-gray-600 hover:bg-primary-50"
          aria-label="Ouvrir le menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-3 font-display font-bold text-primary-600">Imagine AI</span>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-screen lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
