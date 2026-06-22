import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Coins,
  Eye,
  Package,
  PackagePlus,
  Search,
  Truck,
} from 'lucide-react';
import { parcelService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SkeletonStats, SkeletonTable } from '../Common/Skeleton';
import {
  formatCurrency,
  PageHeader,
  ProgressRoute,
  SectionHeader,
  StatCard,
  StatusBadge,
} from '../Common/LogisticsUI';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickTrackId, setQuickTrackId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await parcelService.getAllMyParcels();
        setParcels(data);
      } catch (err) {
        console.error(err);
        toast.error('Impossible de charger les données du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const stats = (() => {
    const total = parcels.length;
    const active = parcels.filter((p) => p.status !== 'DELIVERED').length;
    const delivered = parcels.filter((p) => p.status === 'DELIVERED').length;
    const now = new Date();
    const monthlySpending = parcels
      .filter((p) => {
        const d = new Date(p.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, p) => sum + (p.shippingPrice || 0), 0);

    return { total, active, delivered, monthlySpending };
  })();

  const handleQuickTrackSubmit = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track/${quickTrackId.trim()}`);
    }
  };

  const latestParcel = parcels[0];
  const chartData = [
    { month: 'Jan', count: 4 },
    { month: 'Fév', count: 7 },
    { month: 'Mar', count: 12 },
    { month: 'Avr', count: 9 },
    { month: 'Mai', count: 15 },
    { month: 'Juin', count: Math.max(stats.total, 3) },
  ];
  const chartMax = Math.max(...chartData.map((item) => item.count), 1);

  if (loading) {
    return (
      <div className="space-y-8 text-left">
        <SkeletonStats />
        <SkeletonTable />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 text-left"
    >
      <PageHeader
        eyebrow="Espace client"
        icon={Package}
        title="Tableau de bord logistique"
        description="Suivez vos expéditions, lancez une nouvelle commande et gardez les colis critiques visibles dès l'ouverture."
        actions={
          <Link to="/create-parcel" className="btn-premium-primary">
            <PackagePlus size={17} />
            Nouveau colis
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total colis" value={stats.total} detail="Historique complet" icon={Package} tone="blue" />
        <StatCard title="Livrés" value={stats.delivered} detail="Remis au destinataire" icon={CheckCircle2} tone="green" />
        <StatCard title="En cours" value={stats.active} detail="À surveiller aujourd'hui" icon={Truck} tone="amber" />
        <StatCard title="Dépenses mois" value={formatCurrency(stats.monthlySpending)} detail="Facturation estimée" icon={Coins} tone="sky" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="surface overflow-hidden xl:col-span-2">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <SectionHeader
              title="Suivi express"
              description="Entrez un numéro GLADEX DELIVERY pour ouvrir le tracking temps réel."
              action={latestParcel && <StatusBadge status={latestParcel.status} />}
            />
          </div>
          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_0.95fr]">
            <form onSubmit={handleQuickTrackSubmit} className="space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="QS-754910"
                  className="input-premium pl-10 text-base"
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-premium-primary w-full sm:w-auto">
                Rechercher le colis
                <ArrowRight size={16} />
              </button>
              {latestParcel && (
                <div className="surface-muted p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Dernier colis actif</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-primary-700 dark:text-primary-300">{latestParcel.trackingId}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{latestParcel.recipientName}</p>
                    </div>
                    <button
                      onClick={() => navigate('/my-parcels')}
                      className="icon-button"
                      title="Voir les détails"
                      type="button"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              )}
            </form>
            <ProgressRoute status={latestParcel?.status || 'CREATED'} fromLabel="Collecte" toLabel="Destination" />
          </div>
        </section>

        <section className="surface p-5">
          <SectionHeader title="Actions rapides" description="Les raccourcis les plus utilisés." />
          <div className="mt-5 space-y-2">
            {[
              { to: '/create-parcel', icon: PackagePlus, label: 'Expédier un colis', note: 'Créer une commande' },
              { to: '/my-parcels', icon: Package, label: 'Mes expéditions', note: 'Historique et tickets' },
              { to: '/track', icon: Truck, label: 'Tracking public', note: 'Suivi par numéro' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between gap-3 rounded-premium border border-slate-200 p-3 transition-all hover:border-primary-200 hover:bg-primary-50/60 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/40"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-premium bg-white text-primary-700 shadow-sm dark:bg-slate-900 dark:text-primary-300">
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold text-slate-850 dark:text-white">{item.label}</span>
                      <span className="text-xs text-slate-400">{item.note}</span>
                    </span>
                  </span>
                  <ArrowRight size={15} className="text-slate-400" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="surface p-5">
          <SectionHeader
            title="Volume mensuel"
            description="Évolution des expéditions."
            action={<BarChart3 size={18} className="text-primary-600" />}
          />
          <div className="mt-6 flex h-48 items-end justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            {chartData.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-xs font-black text-primary-700 dark:text-primary-300">{item.count}</div>
                <div className="w-full rounded-t bg-primary-100 transition-colors hover:bg-primary-600 dark:bg-slate-800" style={{ height: `${Math.max(18, (item.count / chartMax) * 100)}%` }} />
                <span className="text-xs font-bold text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface overflow-hidden xl:col-span-2">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <SectionHeader
              title="Dernières expéditions"
              description="Vos cinq commandes les plus récentes."
              action={
                <Link to="/my-parcels" className="btn-premium-ghost py-2 text-xs">
                  Voir tout
                  <ArrowUpRight size={14} />
                </Link>
              }
            />
          </div>

          {parcels.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-slate-400">Aucun colis enregistré pour le moment.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Suivi</th>
                    <th>Destinataire</th>
                    <th>Type</th>
                    <th>Prix</th>
                    <th>Statut</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.slice(0, 5).map((parcel) => (
                    <tr key={parcel.id}>
                      <td className="text-sm font-black text-primary-700 dark:text-primary-300">{parcel.trackingId}</td>
                      <td className="text-sm font-bold text-slate-850 dark:text-slate-200">{parcel.recipientName}</td>
                      <td className="text-sm text-slate-500">{parcel.parcelType || 'Standard'}</td>
                      <td className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {parcel.shippingPrice ? formatCurrency(parcel.shippingPrice) : 'N/A'}
                      </td>
                      <td><StatusBadge status={parcel.status} /></td>
                      <td className="text-right">
                        <button onClick={() => navigate('/my-parcels')} className="icon-button h-9 w-9" type="button" title="Voir">
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default ClientDashboard;
