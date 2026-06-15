import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api';
import BrandLogo from './BrandLogo';

const getRoleLabel = (roles = []) => {
  if (roles.some((role) => role.includes('ADMIN'))) return 'Administrateur';
  if (roles.some((role) => role.includes('DRIVER'))) return 'Livreur';
  return 'Client';
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Erreur de récupération des notifications', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/88 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/86">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex shrink-0 items-center">
          <BrandLogo variant="auto" />
        </Link>

        {!isAuthenticated && (
          <nav className="hidden items-center gap-7 text-sm font-extrabold text-slate-600 lg:flex">
            <a href="/#services" className="transition-colors hover:text-primary-700">Services</a>
            <a href="/#pricing" className="transition-colors hover:text-primary-700">Tarifs</a>
            <Link to="/track" className="transition-colors hover:text-primary-700">Suivi colis</Link>
          </nav>
        )}

        {isAuthenticated && (
          <button
            onClick={() => navigate('/track')}
            className="hidden min-w-0 flex-1 items-center gap-3 rounded-premium border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-sm font-semibold text-slate-500 transition-all hover:border-primary-200 hover:bg-white hover:text-primary-700 lg:flex lg:max-w-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-primary-800"
          >
            <Search size={17} className="shrink-0" />
            <span className="truncate">Rechercher un numéro de suivi</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="icon-button"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            type="button"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications((value) => !value)}
                className="icon-button relative"
                aria-label="Notifications"
                type="button"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Fermer les notifications"
                    type="button"
                  />
                  <div className="surface absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden text-left animate-scale-up">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-extrabold text-slate-950 dark:text-white">Notifications</p>
                        <p className="text-xs text-slate-400">{unreadCount} non lue(s)</p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="btn-premium-ghost py-1 text-xs"
                          type="button"
                        >
                          <Check size={14} />
                          Tout lire
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm font-medium text-slate-400">Aucune notification</div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => {
                              if (!notification.read) handleMarkAsRead(notification.id);
                              setShowNotifications(false);
                              navigate('/my-parcels');
                            }}
                            className={`block w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-primary-50/60 dark:hover:bg-slate-800/50 ${!notification.read ? 'bg-primary-50/50 dark:bg-primary-950/15' : ''}`}
                            type="button"
                          >
                            <p className="text-sm font-semibold leading-5 text-slate-750 dark:text-slate-200">
                              {notification.message}
                            </p>
                            <span className="mt-1 block text-[11px] font-medium text-slate-400">
                              {new Date(notification.createdAt).toLocaleString('fr-FR')}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/register" className="btn-premium-secondary hidden px-4 py-2 text-xs sm:inline-flex">
                Inscription
              </Link>
              <Link to="/login" className="btn-premium-primary px-4 py-2 text-xs">
                <User size={14} />
                Espace client
              </Link>
            </div>
          ) : (
            user && (
              <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-extrabold leading-4 text-slate-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs font-medium text-slate-400">{getRoleLabel(user.roles)}</p>
                </div>
                <Link to="/profile" className="icon-button" title="Profil">
                  <User size={17} />
                </Link>
                <button onClick={handleLogout} className="icon-button hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-950/30" title="Se déconnecter" type="button">
                  <LogOut size={17} />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
