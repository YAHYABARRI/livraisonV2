import { NavLink } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  MapPin,
  Package,
  PackagePlus,
  ShieldCheck,
  Truck,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const getNavigationLinks = ({ isClient, isDriver, isAdmin }) => {
  if (isClient) {
    return [
      { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { path: '/create-parcel', label: 'Nouveau colis', icon: PackagePlus },
      { path: '/my-parcels', label: 'Mes colis', icon: Package },
      { path: '/profile', label: 'Profil', icon: User },
    ];
  }

  if (isDriver) {
    return [
      { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { path: '/driver/parcels', label: 'Colis assignés', icon: Truck },
      { path: '/profile', label: 'Profil', icon: User },
    ];
  }

  if (isAdmin) {
    return [
      { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { path: '/admin/users', label: 'Utilisateurs', icon: Users },
      { path: '/admin/parcels', label: 'Gestion colis', icon: Package },
      { path: '/admin/rates', label: 'Tarifs', icon: MapPin },
      { path: '/admin/reports', label: 'Rapports', icon: FileText },
      { path: '/profile', label: 'Profil', icon: User },
    ];
  }

  return [];
};

const SidebarContent = ({ onNavigate }) => {
  const { user, isClient, isDriver, isAdmin } = useAuth();
  const links = getNavigationLinks({ isClient, isDriver, isAdmin });
  const roleLabel = isAdmin ? 'Admin' : isDriver ? 'Livreur' : 'Client';

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div>
        <div className="mb-5 rounded-premium border border-primary-100 bg-primary-50 p-3 dark:border-primary-900/60 dark:bg-primary-950/25">
          <p className="text-[11px] font-black uppercase tracking-wider text-primary-700 dark:text-primary-300">
            Espace {roleLabel}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Pilotage logistique et suivi opérationnel.
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-premium px-3 py-3 text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-md shadow-slate-900/10 dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                <Icon size={19} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {user && (
        <div className="rounded-premium border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-premium bg-white text-primary-700 shadow-sm dark:bg-slate-800 dark:text-primary-300">
              <ShieldCheck size={17} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold text-slate-800 dark:text-slate-200">{user.email}</p>
              <p className="mt-0.5 text-[11px] font-medium text-secondary-600 dark:text-secondary-300">Session sécurisée</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = () => (
  <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-64 border-r border-slate-200/80 bg-white/92 px-4 py-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/92 md:block">
    <SidebarContent />
  </aside>
);

export { SidebarContent };
export default Sidebar;
