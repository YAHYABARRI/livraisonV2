import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  Loader2,
  Package,
  Truck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SkeletonStats, SkeletonTable } from '../Common/Skeleton';
import {
  formatCurrency,
  PageHeader,
  SectionHeader,
  StatCard,
  StatusBadge,
} from '../Common/LogisticsUI';

const AdminDashboard = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigningParcel, setAssigningParcel] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, parcelsData, driversData] = await Promise.all([
        adminService.getStats(),
        adminService.getAllParcels(),
        adminService.getDrivers(),
      ]);
      setStats(statsData);
      setParcels(parcelsData);
      setDrivers(driversData);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données d'administration.");
      toast.error('Erreur de récupération des données administrateur.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const openAssignModal = (parcel) => {
    setAssigningParcel(parcel);
    setSelectedDriverId(parcel.driver?.id || '');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningParcel || !selectedDriverId) return;

    setSubmittingAssign(true);
    setError(null);

    try {
      await adminService.assignDriver({
        parcelId: assigningParcel.id,
        driverId: parseInt(selectedDriverId, 10),
      });
      toast.success('Le colis a été attribué avec succès.');
      setAssigningParcel(null);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Erreur d'attribution du livreur.");
    } finally {
      setSubmittingAssign(false);
    }
  };

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
        eyebrow="Control tower"
        icon={Package}
        title="Console d'administration"
        description="Supervisez l'activité logistique, détectez les colis non attribués et pilotez les opérations en temps réel."
      />

      {error && (
        <div className="flex items-start gap-3 rounded-premium border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Clients actifs" value={stats.totalClients} detail="Comptes expéditeurs" icon={Users} tone="blue" />
          <StatCard title="Livreurs" value={stats.totalDrivers} detail="Capacité disponible" icon={Truck} tone="amber" />
          <StatCard title="Colis total" value={stats.totalParcels} detail="Flux plateforme" icon={Package} tone="sky" />
          <StatCard title="Chiffre d'affaires" value={formatCurrency(stats.simulatedRevenue)} detail="Revenu estimé" icon={Coins} tone="green" />
        </div>
      )}

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <SectionHeader
            title="Suivi global des envois"
            description="Vue priorisée des colis récents et de leur affectation livreur."
          />
        </div>

        {parcels.length === 0 ? (
          <div className="p-10 text-center text-sm font-medium text-slate-400">Aucun colis créé sur la plateforme.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Suivi</th>
                  <th>Client</th>
                  <th>Destinataire</th>
                  <th>Livraison</th>
                  <th>Livreur</th>
                  <th>Statut</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {parcels.slice(0, 7).map((parcel) => (
                  <tr key={parcel.id}>
                    <td className="text-sm font-black text-primary-700 dark:text-primary-300">{parcel.trackingId}</td>
                    <td className="text-sm font-bold text-slate-750 dark:text-slate-200">
                      {parcel.client ? `${parcel.client.firstName} ${parcel.client.lastName}` : 'Client inconnu'}
                    </td>
                    <td className="text-sm font-semibold text-slate-850 dark:text-slate-100">{parcel.recipientName}</td>
                    <td className="max-w-[220px] truncate text-sm text-slate-500" title={parcel.deliveryAddress}>
                      {parcel.deliveryAddress}
                    </td>
                    <td className="text-sm">
                      {parcel.driver ? (
                        <span className="font-bold text-primary-700 dark:text-primary-300">
                          {parcel.driver.firstName} {parcel.driver.lastName}
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-600 dark:text-amber-300">Non attribué</span>
                      )}
                    </td>
                    <td><StatusBadge status={parcel.status} /></td>
                    <td className="text-right">
                      {parcel.status !== 'DELIVERED' ? (
                        <button
                          onClick={() => openAssignModal(parcel)}
                          className="btn-premium-secondary px-3 py-2 text-xs"
                          type="button"
                        >
                          <UserPlus size={14} />
                          Attribuer
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-secondary-600 dark:text-secondary-300">
                          <CheckCircle2 size={13} />
                          Livré
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>
        {assigningParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="surface w-full max-w-md overflow-hidden text-left shadow-premium-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Attribuer un livreur</h3>
                  <p className="text-xs font-medium text-slate-400">Affectation opérationnelle du colis</p>
                </div>
                <button onClick={() => setAssigningParcel(null)} className="icon-button h-9 w-9" type="button" aria-label="Fermer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit}>
                <div className="space-y-4 p-5">
                  <div className="surface-muted p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Colis sélectionné</p>
                    <p className="mt-1 text-sm font-black text-primary-700 dark:text-primary-300">{assigningParcel.trackingId}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Destinataire : {assigningParcel.recipientName}</p>
                    <p className="text-xs font-medium text-slate-500">Destination : {assigningParcel.deliveryAddress}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="driver" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Livreur disponible
                    </label>
                    <select
                      id="driver"
                      className="input-premium"
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      required
                    >
                      <option value="">Choisir un chauffeur</option>
                      {drivers.map((driver) => {
                        const activeCount = parcels.filter((p) => p.driver && p.driver.id === driver.id && p.status !== 'DELIVERED').length;
                        return (
                          <option key={driver.id} value={driver.id}>
                            {driver.firstName} {driver.lastName} - {activeCount} livraison(s) active(s)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <button type="button" onClick={() => setAssigningParcel(null)} className="btn-premium-secondary px-4 py-2">
                    Annuler
                  </button>
                  <button type="submit" disabled={submittingAssign || !selectedDriverId} className="btn-premium-primary px-4 py-2">
                    {submittingAssign ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    Confirmer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
