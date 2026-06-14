import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Edit,
  Loader2,
  MapPin,
  Package,
  Phone,
  Truck,
  X,
} from 'lucide-react';
import { driverService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SkeletonStats, SkeletonTable } from '../Common/Skeleton';
import {
  PageHeader,
  ProgressRoute,
  SectionHeader,
  StatCard,
  StatusBadge,
} from '../Common/LogisticsUI';

const getClientName = (parcel) => (
  parcel.client ? `${parcel.client.firstName || ''} ${parcel.client.lastName || ''}`.trim() : 'Client inconnu'
);

const getClientPhone = (parcel) => parcel.client?.phone || '';

const ClientPhoneLink = ({ parcel, className = 'mt-1 text-xs' }) => {
  const phone = getClientPhone(parcel);

  if (!phone) {
    return <span className={`${className} inline-flex items-center gap-1 font-black text-slate-400`}>Non renseigné</span>;
  }

  return (
    <a href={`tel:${phone}`} className={`${className} inline-flex items-center gap-1 font-black text-primary-700 hover:text-primary-900 dark:text-primary-300`}>
      <Phone size={13} />
      {phone}
    </a>
  );
};

const DriverDashboard = () => {
  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingParcel, setUpdatingParcel] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const data = await driverService.getAssignedParcels();
      setParcels(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les colis assignés.');
      toast.error('Erreur de récupération des courses.');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (parcel) => {
    setUpdatingParcel(parcel);
    setSelectedStatus(parcel.status);
    setUpdateDescription('');
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updatingParcel) return;

    setSubmittingUpdate(true);
    setError(null);

    try {
      await driverService.updateStatus(updatingParcel.id, {
        status: selectedStatus,
        description: updateDescription,
      });
      toast.success(`Statut du colis ${updatingParcel.trackingId} mis à jour.`);
      setUpdatingParcel(null);
      fetchParcels();
    } catch (err) {
      console.error(err);
      toast.error('Erreur de mise à jour du statut.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const stats = {
    total: parcels.length,
    assigned: parcels.filter((p) => p.status === 'ACCEPTED').length,
    active: parcels.filter((p) => ['PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY'].includes(p.status)).length,
    delivered: parcels.filter((p) => p.status === 'DELIVERED').length,
  };
  const activeParcels = parcels.filter((p) => p.status !== 'DELIVERED');
  const focusParcel = activeParcels[0];

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
        eyebrow="Espace livreur"
        icon={Truck}
        title="Livraisons assignées"
        description="Priorisez vos courses, consultez les adresses clés et mettez à jour l'avancement de chaque colis."
        actions={
          <Link to="/driver/parcels" className="btn-premium-secondary">
            Voir toutes les courses
            <ArrowUpRight size={16} />
          </Link>
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-premium border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total colis" value={stats.total} detail="Assignés au compte" icon={Package} tone="blue" />
        <StatCard title="À collecter" value={stats.assigned} detail="En attente de départ" icon={Clock3} tone="amber" />
        <StatCard title="En cours" value={stats.active} detail="Courses actives" icon={Truck} tone="sky" />
        <StatCard title="Livrés" value={stats.delivered} detail="Finalisés" icon={CheckCircle2} tone="green" />
      </div>

      {focusParcel && (
        <section className="surface overflow-hidden">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <SectionHeader
              title="Course prioritaire"
              description={`${focusParcel.recipientName} - ${focusParcel.trackingId}`}
              action={<StatusBadge status={focusParcel.status} />}
            />
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_0.75fr]">
            <ProgressRoute status={focusParcel.status} fromLabel="Collecte" toLabel="Livraison" />
            <div className="space-y-3">
              <div className="surface-muted p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <Phone size={13} />
                  Client expéditeur
                </p>
                <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{getClientName(focusParcel)}</p>
                <ClientPhoneLink parcel={focusParcel} className="mt-2 text-sm" />
              </div>
              <div className="surface-muted p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <MapPin size={13} />
                  Collecte
                </p>
                <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{focusParcel.pickupAddress}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <MapPin size={13} />
                  Livraison
                </p>
                <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{focusParcel.deliveryAddress}</p>
              </div>
              <button onClick={() => openUpdateModal(focusParcel)} className="btn-premium-primary w-full" type="button">
                <Edit size={16} />
                Mettre à jour le statut
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <SectionHeader
            title="Courses récentes"
            description="Colis actifs nécessitant une action ou une surveillance."
            action={
              <Link to="/driver/parcels" className="btn-premium-ghost py-2 text-xs">
                Voir tout
                <ArrowUpRight size={14} />
              </Link>
            }
          />
        </div>

        {activeParcels.length === 0 ? (
          <div className="p-10 text-center text-sm font-medium text-slate-400">Aucun colis actif ne vous est attribué pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Suivi</th>
                  <th>Destinataire</th>
                  <th>Client expéditeur</th>
                  <th>Collecte</th>
                  <th>Livraison</th>
                  <th>Poids</th>
                  <th>Statut</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeParcels.slice(0, 5).map((parcel) => (
                  <tr key={parcel.id}>
                    <td className="text-sm font-black text-primary-700 dark:text-primary-300">{parcel.trackingId}</td>
                    <td className="text-sm font-bold text-slate-850 dark:text-slate-200">{parcel.recipientName} ({parcel.recipientPhone})</td>
                    <td className="text-sm">
                      <span className="block font-bold text-slate-850 dark:text-slate-200">{getClientName(parcel)}</span>
                      <ClientPhoneLink parcel={parcel} />
                    </td>
                    <td className="max-w-[180px] truncate text-sm text-slate-500" title={parcel.pickupAddress}>{parcel.pickupAddress}</td>
                    <td className="max-w-[180px] truncate text-sm text-slate-500" title={parcel.deliveryAddress}>{parcel.deliveryAddress}</td>
                    <td className="text-sm font-semibold text-slate-650 dark:text-slate-300">{parcel.weight} kg</td>
                    <td><StatusBadge status={parcel.status} /></td>
                    <td className="text-right">
                      <button onClick={() => openUpdateModal(parcel)} className="btn-premium-secondary px-3 py-2 text-xs" type="button">
                        <Edit size={14} />
                        Statut
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>
        {updatingParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="surface w-full max-w-md overflow-hidden text-left shadow-premium-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Mettre à jour le statut</h3>
                  <p className="text-xs font-medium text-slate-400">{updatingParcel.trackingId}</p>
                </div>
                <button onClick={() => setUpdatingParcel(null)} className="icon-button h-9 w-9" type="button" aria-label="Fermer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleStatusUpdateSubmit}>
                <div className="space-y-4 p-5">
                  <div className="surface-muted p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Colis concerné</p>
                    <p className="mt-1 text-sm font-black text-primary-700 dark:text-primary-300">{updatingParcel.trackingId}</p>
                    <p className="text-xs font-medium text-slate-500">Destinataire : {updatingParcel.recipientName}</p>
                    <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">Client expéditeur</p>
                    <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{getClientName(updatingParcel)}</p>
                    <ClientPhoneLink parcel={updatingParcel} className="mt-2 text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="status" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Nouveau statut
                    </label>
                    <select
                      id="status"
                      className="input-premium"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="ACCEPTED">Attribué - en attente de collecte</option>
                      <option value="PICKED_UP">Collecté chez l'expéditeur</option>
                      <option value="IN_TRANSIT">En transit</option>
                      <option value="ARRIVED_AT_HUB">Arrivé au centre de tri</option>
                      <option value="OUT_FOR_DELIVERY">En cours de livraison</option>
                      <option value="DELIVERED">Livré avec succès</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="description" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Note d'étape
                    </label>
                    <textarea
                      id="description"
                      rows="3"
                      className="input-premium"
                      placeholder="Ex: Le colis a été remis en main propre contre signature."
                      value={updateDescription}
                      onChange={(e) => setUpdateDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <button type="button" onClick={() => setUpdatingParcel(null)} className="btn-premium-secondary px-4 py-2">
                    Annuler
                  </button>
                  <button type="submit" disabled={submittingUpdate} className="btn-premium-primary px-4 py-2">
                    {submittingUpdate ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Valider
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

export default DriverDashboard;
