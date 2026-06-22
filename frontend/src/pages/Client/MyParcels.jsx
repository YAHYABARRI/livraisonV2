import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  FileText,
  Loader2,
  MapPin,
  Package,
  PackagePlus,
  Printer,
  Search,
  X,
} from 'lucide-react';
import Layout from '../../components/Common/Layout';
import EmptyState from '../../components/Common/EmptyState';
import { SkeletonTable } from '../../components/Common/Skeleton';
import TicketPdfPreview from '../../components/Common/TicketPdfPreview';
import { BRAND } from '../../constants/brand';
import { parcelService, ticketService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import {
  formatCurrency,
  formatDate,
  PageHeader,
  ProgressRoute,
  SectionHeader,
  StatusBadge,
  TrackingTimeline,
} from '../../components/Common/LogisticsUI';

const statusOptions = [
  ['ALL', 'Tous les statuts'],
  ['CREATED', 'Créé'],
  ['ACCEPTED', 'Accepté'],
  ['PICKED_UP', 'Collecté'],
  ['IN_TRANSIT', 'En transit'],
  ['ARRIVED_AT_HUB', 'Centre de tri'],
  ['OUT_FOR_DELIVERY', 'En livraison'],
  ['DELIVERED', 'Livré'],
];

const todayIso = () => new Date().toISOString().split('T')[0];

const MyParcels = () => {
  usePageMeta({
    title: `Mes colis - ${BRAND.name}`,
    description: 'Consultez, filtrez et imprimez les tickets de vos colis GLADEX DELIVERY.',
    path: '/my-parcels',
  });

  const navigate = useNavigate();
  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedParcelIds, setSelectedParcelIds] = useState([]);
  const [ticketDate, setTicketDate] = useState(todayIso());
  const [ticketLoading, setTicketLoading] = useState(null);
  const [ticketPreviewUrl, setTicketPreviewUrl] = useState(null);
  const [ticketPreviewName, setTicketPreviewName] = useState('tickets.pdf');
  const pageSize = 6;

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, dateFilter]);

  useEffect(() => () => {
    if (ticketPreviewUrl) {
      URL.revokeObjectURL(ticketPreviewUrl);
    }
  }, [ticketPreviewUrl]);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parcelService.getAllMyParcels();
      setParcels(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger vos colis.');
      toast.error('Erreur de récupération des colis.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const exportToJson = () => {
    try {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(parcels, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'mes_colis_gladexdelivery.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Données exportées au format JSON.');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'export.");
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const printBlob = (blob) => {
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
        window.URL.revokeObjectURL(url);
      }, 1000);
    };
  };

  const printPreview = () => {
    if (!ticketPreviewUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = ticketPreviewUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 1000);
    };
  };

  const downloadPreview = () => {
    if (!ticketPreviewUrl) return;
    const link = document.createElement('a');
    link.href = ticketPreviewUrl;
    link.setAttribute('download', ticketPreviewName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const closeTicketPreview = () => {
    if (ticketPreviewUrl) {
      URL.revokeObjectURL(ticketPreviewUrl);
    }
    setTicketPreviewUrl(null);
  };

  const handleTicketBlob = (blob, mode, filename) => {
    if (mode === 'preview') {
      if (ticketPreviewUrl) {
        URL.revokeObjectURL(ticketPreviewUrl);
      }
      setTicketPreviewName(filename);
      setTicketPreviewUrl(window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })));
      return;
    }
    if (mode === 'print') {
      printBlob(blob);
      return;
    }
    downloadBlob(blob, filename);
  };

  const generateSelectedTickets = async (mode) => {
    if (selectedParcelIds.length === 0) {
      toast.warning('Sélectionnez au moins une commande.');
      return;
    }
    setTicketLoading(`selected-${mode}`);
    try {
      const blob = await ticketService.getSelectedTicketsPdf(selectedParcelIds);
      const filename = `mes_tickets_${new Date().toISOString().split('T')[0]}.pdf`;
      handleTicketBlob(blob, mode, filename);
      toast.success(mode === 'preview' ? 'Aperçu des tickets généré.' : 'Tickets générés avec succès.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Impossible de générer les tickets sélectionnés.');
    } finally {
      setTicketLoading(null);
    }
  };

  const generateDailyTickets = async (mode) => {
    if (!ticketDate) {
      toast.warning('Choisissez une date.');
      return;
    }
    setTicketLoading(`day-${mode}`);
    try {
      const blob = await ticketService.getDailyTicketsPdf(ticketDate);
      const filename = `mes_tickets_${ticketDate}.pdf`;
      handleTicketBlob(blob, mode, filename);
      toast.success(mode === 'preview' ? 'Aperçu des tickets du jour généré.' : 'Tickets du jour générés avec succès.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Aucune commande trouvée pour cette date.');
    } finally {
      setTicketLoading(null);
    }
  };

  const filteredParcels = parcels.filter((parcel) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      parcel.trackingId?.toLowerCase().includes(term) ||
      parcel.recipientName?.toLowerCase().includes(term) ||
      parcel.deliveryAddress?.toLowerCase().includes(term);
    const matchesFilter = statusFilter === 'ALL' || parcel.status === statusFilter;
    const matchesDate = !dateFilter || parcel.createdAt?.slice(0, 10) === dateFilter;
    return matchesSearch && matchesFilter && matchesDate;
  });

  const totalPages = Math.ceil(filteredParcels.length / pageSize);
  const paginatedParcels = filteredParcels.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const allPageSelected = paginatedParcels.length > 0 && paginatedParcels.every((parcel) => selectedParcelIds.includes(parcel.id));

  const toggleParcelSelection = (parcelId) => {
    setSelectedParcelIds((current) => (
      current.includes(parcelId)
        ? current.filter((id) => id !== parcelId)
        : [...current, parcelId]
    ));
  };

  const togglePageSelection = () => {
    const pageIds = paginatedParcels.map((parcel) => parcel.id);
    setSelectedParcelIds((current) => {
      if (pageIds.every((id) => current.includes(id))) {
        return current.filter((id) => !pageIds.includes(id));
      }
      return Array.from(new Set([...current, ...pageIds]));
    });
  };

  return (
    <Layout>
      <div className="space-y-8 text-left">
        <PageHeader
          eyebrow="Expéditions"
          icon={Package}
          title="Mes colis"
          description="Filtrez, consultez le suivi détaillé et générez vos tickets de livraison."
          actions={
            <>
              <button onClick={exportToJson} className="btn-premium-secondary" type="button">
                <Download size={16} />
                Exporter
              </button>
              <button onClick={() => navigate('/create-parcel')} className="btn-premium-primary" type="button">
                <PackagePlus size={16} />
                Nouveau colis
              </button>
            </>
          }
        />

        <section className="surface p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_16rem_13rem]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro, destinataire ou adresse"
                className="input-premium pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <select className="input-premium pl-10" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statusOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <CalendarDays size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input className="input-premium pl-10" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="surface p-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="surface-muted p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tickets sélectionnés</p>
                  <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">
                    {selectedParcelIds.length} commande(s) sélectionnée(s)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => generateSelectedTickets('preview')} disabled={ticketLoading !== null || selectedParcelIds.length === 0} className="btn-premium-secondary px-4 py-2" type="button">
                    {ticketLoading === 'selected-preview' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                    Aperçu avant impression
                  </button>
                  <button onClick={() => generateSelectedTickets('download')} disabled={ticketLoading !== null || selectedParcelIds.length === 0} className="btn-premium-secondary px-4 py-2" type="button">
                    {ticketLoading === 'selected-download' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                    Télécharger PDF
                  </button>
                  <button onClick={() => generateSelectedTickets('print')} disabled={ticketLoading !== null || selectedParcelIds.length === 0} className="btn-premium-primary px-4 py-2" type="button">
                    {ticketLoading === 'selected-print' ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
                    Imprimer
                  </button>
                </div>
              </div>
            </div>

            <div className="surface-muted p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tickets du jour</p>
                  <div className="mt-2 max-w-48">
                    <input className="input-premium" type="date" value={ticketDate} onChange={(e) => setTicketDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => generateDailyTickets('preview')} disabled={ticketLoading !== null} className="btn-premium-secondary px-4 py-2" type="button">
                    {ticketLoading === 'day-preview' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                    Aperçu
                  </button>
                  <button onClick={() => generateDailyTickets('download')} disabled={ticketLoading !== null} className="btn-premium-secondary px-4 py-2" type="button">
                    {ticketLoading === 'day-download' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                    Télécharger
                  </button>
                  <button onClick={() => generateDailyTickets('print')} disabled={ticketLoading !== null} className="btn-premium-primary px-4 py-2" type="button">
                    {ticketLoading === 'day-print' ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
                    Imprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="rounded-premium border border-red-200 bg-red-50 p-6 text-center font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        ) : filteredParcels.length === 0 ? (
          <EmptyState
            title="Aucun colis trouvé"
            description={searchTerm || statusFilter !== 'ALL' ? "Ajustez vos filtres pour afficher d'autres résultats." : "Vous n'avez pas encore envoyé de colis."}
            actionText={!(searchTerm || statusFilter !== 'ALL') ? 'Expédier un colis' : null}
            onAction={() => navigate('/create-parcel')}
          />
        ) : (
          <section className="space-y-4">
            <div className="surface overflow-hidden">
              <div className="border-b border-slate-100 p-5 dark:border-slate-800">
                <SectionHeader title="Historique des expéditions" description={`${filteredParcels.length} colis correspondent à la vue actuelle.`} />
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          onChange={togglePageSelection}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600"
                          aria-label="Sélectionner les colis affichés"
                        />
                      </th>
                      <th>Suivi</th>
                      <th>Destinataire</th>
                      <th>Destination</th>
                      <th>Poids</th>
                      <th>Statut</th>
                      <th>Création</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedParcels.map((parcel) => (
                      <tr key={parcel.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedParcelIds.includes(parcel.id)}
                            onChange={() => toggleParcelSelection(parcel.id)}
                            className="h-4 w-4 rounded border-slate-300 text-primary-600"
                            aria-label={`Sélectionner ${parcel.trackingId}`}
                          />
                        </td>
                        <td className="text-sm font-black text-primary-700 dark:text-primary-300">{parcel.trackingId}</td>
                        <td className="text-sm font-bold text-slate-850 dark:text-slate-200">{parcel.recipientName}</td>
                        <td className="max-w-[240px] truncate text-sm text-slate-500" title={parcel.deliveryAddress}>{parcel.deliveryAddress}</td>
                        <td className="text-sm font-semibold text-slate-650 dark:text-slate-300">{parcel.weight} kg</td>
                        <td><StatusBadge status={parcel.status} /></td>
                        <td className="text-xs font-semibold text-slate-400">{formatDate(parcel.createdAt)}</td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedParcel(parcel)} className="icon-button h-9 w-9" title="Voir le suivi" type="button">
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Page {currentPage + 1} sur {totalPages} - {filteredParcels.length} colis
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button onClick={() => setCurrentPage((page) => Math.max(0, page - 1))} disabled={currentPage === 0} className="icon-button h-9 w-9 disabled:cursor-not-allowed disabled:opacity-40" type="button">
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`h-9 min-w-9 rounded-premium px-3 text-xs font-black transition-all ${currentPage === i ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}`}
                      type="button"
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))} disabled={currentPage === totalPages - 1} className="icon-button h-9 w-9 disabled:cursor-not-allowed disabled:opacity-40" type="button">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {selectedParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm animate-fade-in">
            <div className="surface flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden text-left shadow-premium-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Détails colis</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                    {selectedParcel.trackingId}
                  </h3>
                </div>
                <button onClick={() => setSelectedParcel(null)} className="icon-button h-9 w-9" type="button" aria-label="Fermer">
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.95fr]">
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <StatusBadge status={selectedParcel.status} />
                    </div>
                    <ProgressRoute status={selectedParcel.status} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="surface-muted p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Livraison estimée</p>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white">{formatDate(selectedParcel.estimatedDelivery)}</p>
                      </div>
                      <div className="surface-muted p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Prix</p>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white">
                          {selectedParcel.shippingPrice ? formatCurrency(selectedParcel.shippingPrice) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="surface-muted p-4">
                      <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        <MapPin size={13} />
                        Collecte
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{selectedParcel.pickupAddress}</p>
                    </div>
                    <div className="surface-muted p-4">
                      <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        <MapPin size={13} />
                        Livraison
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{selectedParcel.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="surface-muted p-4">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Destinataire</p>
                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {selectedParcel.recipientName} ({selectedParcel.recipientPhone})
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Poids : {selectedParcel.weight} kg - Type : {selectedParcel.parcelType || 'Standard'}
                      </p>
                    </div>
                    <TrackingTimeline status={selectedParcel.status} logs={selectedParcel.logs || []} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-right dark:border-slate-800 dark:bg-slate-950/50">
                <button onClick={() => setSelectedParcel(null)} className="btn-premium-secondary px-4 py-2" type="button">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        <TicketPdfPreview
          url={ticketPreviewUrl}
          title="Aperçu tickets de livraison"
          onClose={closeTicketPreview}
          onDownload={downloadPreview}
          onPrint={printPreview}
        />
      </div>
    </Layout>
  );
};

export default MyParcels;
