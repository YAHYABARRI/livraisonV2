import { Link } from 'react-router-dom';
import { CheckCircle2, Route, ShieldCheck, Truck } from 'lucide-react';
import BrandLogo from './BrandLogo';

const AuthFrame = ({ eyebrow, title, description, children, footer }) => (
  <div className="min-h-screen bg-slate-950 text-white">
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section
        className="relative hidden overflow-hidden px-10 py-8 lg:flex lg:flex-col lg:justify-between"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(7,17,31,0.62), rgba(7,17,31,0.92)), url('https://images.unsplash.com/photo-1606964212858-c215029db704?auto=format&fit=crop&w=1500&q=85')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <Link to="/" className="flex w-fit items-center">
          <BrandLogo variant="light" />
        </Link>

        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100 backdrop-blur">
            <ShieldCheck size={14} />
            Accès sécurisé
          </div>
          <h1 className="text-5xl font-black leading-tight">Connectez votre logistique à une console claire.</h1>
          <p className="mt-5 text-base leading-8 text-slate-200">
            Suivi colis, création d'envois, affectation livreur et rapports PDF dans une interface pensée pour l'exploitation.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Route, label: 'Tracking temps réel' },
            { icon: Truck, label: 'Tournées livreur' },
            { icon: CheckCircle2, label: 'Livraison suivie' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-premium border border-white/10 bg-white/10 p-4 backdrop-blur">
                <Icon size={20} className="text-primary-300" />
                <p className="mt-3 text-xs font-black uppercase tracking-wider text-white">{item.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4 py-10 text-slate-950 dark:bg-darkBg dark:text-white sm:px-6">
        <div className="w-full max-w-xl">
          <Link to="/" className="mb-8 flex w-fit items-center lg:hidden">
            <BrandLogo variant="auto" />
          </Link>

          <div className="surface overflow-hidden">
            <div className="border-b border-slate-100 p-6 dark:border-slate-800">
              <p className="text-xs font-black uppercase tracking-wider text-primary-700 dark:text-primary-300">{eyebrow}</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <div className="p-6">{children}</div>
            {footer && <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default AuthFrame;
