import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Filter,
  Loader2,
  Phone,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '../../components/Common/Layout';
import EmptyState from '../../components/Common/EmptyState';
import { SkeletonTable } from '../../components/Common/Skeleton';
import { BRAND } from '../../constants/brand';
import { driverService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { PageHeader, SectionHeader, StatusBadge } from '../../components/Common/LogisticsUI';

const statusOptions = [
  ['ALL', 'Tous les statuts'],
  ['ACCEPTED', 'Attribué'],
  ['PICKED_UP', 'Collecté'],
  ['IN_TRANSIT', 'En transit'],
  ['ARRIVED_AT_HUB', 'Centre de tri'],
  ['OUT_FOR_DELIVERY', 'En livraison'],
  ['DELIVERED', 'Livré'],
];

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

const DriverParcels = () => {
  usePageMeta({
    title: `Courses livreur - ${BRAND.name}`,
    description: 'Espace livreur AFRIDEEX pour consulter les colis assignés et mettre à jour les statuts.',
    path: '/driver/parcels',
  });

  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [updatingParcel, setUpdatingParcel] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const pageSize = 7;

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter]);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    setError(null);
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
  }, [toast]);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const openUpdateModal = (parcel) => {
    setUpdatingParcel(parcel);
    setSelectedStatus(parcel.status);
    setUpdateDescription('');
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updatingParcel) return;
    setSubmittingUpdate(true);

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

  const exportToJson = () => {
    try {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(parcels, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'mes_courses_afrideex.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Courses exportées au format JSON.');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'export.");
    }
  };

  const filteredParcels = parcels.filter((parcel) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      parcel.trackingId?.toLowerCase().includes(term) ||
      parcel.recipientName?.toLowerCase().includes(term) ||
      getClientName(parcel).toLowerCase().includes(term) ||
      getClientPhone(parcel).toLowerCase().includes(term) ||
      parcel.pickupAddress?.toLowerCase().includes(term) ||
      parcel.deliveryAddress?.toLowerCase().includes(term);
    const matchesFilter = statusFilter === 'ALL' || parcel.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredParcels.length / pageSize);
  const paginatedParcels = filteredParcels.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <Layout>
      <div className="space-y-8 text-left">
        <PageHeader
          eyebrow="Tournée"
          icon={Truck}
          title="Courses et livraisons"
          description="Liste complète des colis assignés avec recherche, filtre et mise à jour de statut."
          actions={
            <button onClick={exportToJson} className="btn-premium-secondary" type="button">
              <Download size={16} />
              Exporter
            </button>
          }
        />

        <section className="surface p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_16rem]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par suivi, destinataire ou adresse"
                className="input-premium pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <select className="input-premium pl-10" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="rounded-premium border border-red-200 bg-red-50 p-6 text-center font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</div>
        ) : filteredParcels.length === 0 ? (
          <EmptyState
            title="Aucune course trouvée"
            description={searchTerm || statusFilter !== 'ALL' ? "Ajustez vos filtres pour voir d'autres colis." : "Aucun colis ne vous est assigné pour le moment."}
          />
        ) : (
          <section className="space-y-4">
            <div className="surface overflow-hidden">
              <div className="border-b border-slate-100 p-5 dark:border-slate-800">
                <SectionHeader title="Colis assignés" description={`${filteredParcels.length} course(s) dans la vue actuelle.`} />
              </div>
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
                    {paginatedParcels.map((parcel) => (
                      <tr key={parcel.id}>
                        <td className="text-sm font-black text-primary-700 dark:text-primary-300">{parcel.trackingId}</td>
                        <td className="text-sm font-bold text-slate-850 dark:text-slate-200">{parcel.recipientName} ({parcel.recipientPhone})</td>
                        <td className="text-sm">
                          <span className="block font-bold text-slate-850 dark:text-slate-200">{getClientName(parcel)}</span>
                          <ClientPhoneLink parcel={parcel} />
                        </td>
                        <td className="max-w-[200px] truncate text-sm text-slate-500" title={parcel.pickupAddress}>{parcel.pickupAddress}</td>
                        <td className="max-w-[200px] truncate text-sm text-slate-500" title={parcel.deliveryAddress}>{parcel.deliveryAddress}</td>
                        <td className="text-sm font-semibold text-slate-650 dark:text-slate-300">{parcel.weight} kg</td>
                        <td><StatusBadge status={parcel.status} /></td>
                        <td className="text-right">
                          {parcel.status !== 'DELIVERED' ? (
                            <button onClick={() => openUpdateModal(parcel)} className="btn-premium-secondary px-3 py-2 text-xs" type="button">
                              <Edit size={14} />
                              Statut
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
            </div>

            {totalPages > 1 && (
              <div className="surface flex items-center justify-between p-4">
                <span className="text-xs font-bold text-slate-500">Page {currentPage + 1} sur {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage((page) => Math.max(0, page - 1))} disabled={currentPage === 0} className="icon-button h-9 w-9 disabled:opacity-40" type="button"><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))} disabled={currentPage === totalPages - 1} className="icon-button h-9 w-9 disabled:opacity-40" type="button"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </section>
        )}

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
                  <button onClick={() => setUpdatingParcel(null)} className="icon-button h-9 w-9" type="button" aria-label="Fermer"><X size={16} /></button>
                </div>
                <form onSubmit={handleStatusUpdateSubmit}>
                  <div className="space-y-4 p-5">
                    <div className="surface-muted p-4">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Client expéditeur</p>
                      <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{getClientName(updatingParcel)}</p>
                      <ClientPhoneLink parcel={updatingParcel} className="mt-2 text-sm" />
                      <p className="mt-2 text-xs font-medium text-slate-500">Destinataire : {updatingParcel.recipientName} ({updatingParcel.recipientPhone})</p>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="status" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Nouveau statut</label>
                      <select id="status" className="input-premium" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="ACCEPTED">Attribué - en attente de collecte</option>
                        <option value="PICKED_UP">Collecté chez l'expéditeur</option>
                        <option value="IN_TRANSIT">En transit</option>
                        <option value="ARRIVED_AT_HUB">Arrivé au centre de tri</option>
                        <option value="OUT_FOR_DELIVERY">En cours de livraison</option>
                        <option value="DELIVERED">Livré avec succès</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="description" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Note d'étape</label>
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
                    <button type="button" onClick={() => setUpdatingParcel(null)} className="btn-premium-secondary px-4 py-2">Annuler</button>
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
      </div>
    </Layout>
  );
};

export default DriverParcels;
