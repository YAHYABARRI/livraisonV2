import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar, { SidebarContent } from './Sidebar';

const Layout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />

      <div className="md:hidden border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="btn-premium-secondary px-3 py-2"
          type="button"
        >
          <Menu size={17} />
          Menu
        </button>
      </div>

      <div className="relative flex flex-1">
        <Sidebar />

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Fermer le menu"
              type="button"
            />
            <div className="relative h-full w-[min(19rem,82vw)] bg-white p-4 shadow-2xl animate-slide-right dark:bg-slate-950">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-black uppercase tracking-wider text-slate-400">Navigation</p>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="icon-button"
                  type="button"
                  aria-label="Fermer"
                >
                  <X size={17} />
                </button>
              </div>
              <SidebarContent onNavigate={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 sm:px-6 lg:px-8 md:ml-64">
          <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
