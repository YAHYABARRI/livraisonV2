import { useCallback, useEffect, useState } from 'react';
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
  Printer,
  Search,
  Truck,
  UserPlus,
  X,
} from 'lucide-react';
import Layout from '../../components/Common/Layout';
import EmptyState from '../../components/Common/EmptyState';
import { SkeletonTable } from '../../components/Common/Skeleton';
import TicketPdfPreview from '../../components/Common/TicketPdfPreview';
import { BRAND } from '../../constants/brand';
import { adminService, ticketService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import {
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

const extractCity = (address) => {
  if (!address) return 'Ville inconnue';
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'Ville inconnue';
};

const parcelCity = (parcel) => parcel.deliveryCity || extractCity(parcel.deliveryAddress);

const AdminParcels = () => {
  usePageMeta({
    title: `Gestion colis - ${BRAND.name}`,
    description: 'Interface admin AFRIDEEX pour gérer colis, filtres, livreurs et tickets de livraison.',
    path: '/admin/parcels',
  });

  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [assigningParcel, setAssigningParcel] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedParcelIds, setSelectedParcelIds] = useState([]);
  const [ticketDate, setTicketDate] = useState(todayIso());
  const [ticketLoading, setTicketLoading] = useState(null);
  const [ticketPreviewUrl, setTicketPreviewUrl] = useState(null);
  const [ticketPreviewName, setTicketPreviewName] = useState('tickets.pdf');
  const pageSize = 7;

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, dateFilter, cityFilter, clientFilter]);

  useEffect(() => () => {
    if (ticketPreviewUrl) {
      URL.revokeObjectURL(ticketPreviewUrl);
    }
  }, [ticketPreviewUrl]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [parcelsData, driversData, usersData] = await Promise.all([
        adminService.getAllParcels(),
        adminService.getDrivers(),
        adminService.getUsers(),
      ]);
      setParcels(parcelsData);
      setDrivers(driversData);
      setClients(usersData.filter((user) => user.roles?.includes('CLIENT')));
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les colis.');
      toast.error('Erreur de récupération des colis.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAssignModal = (parcel) => {
    setAssigningParcel(parcel);
    setSelectedDriverId(parcel.driver?.id || '');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningParcel || !selectedDriverId) return;
    setSubmittingAssign(true);

    try {
      await adminService.assignDriver({
        parcelId: assigningParcel.id,
        driverId: parseInt(selectedDriverId, 10),
      });
      toast.success('Le colis a été attribué avec succès.');
      setAssigningParcel(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Erreur d'attribution du livreur.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const exportToJson = () => {
    try {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(parcels, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'global_colis_afrideex.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Base colis exportée au format JSON.');
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
      const filename = `tickets_selection_${new Date().toISOString().split('T')[0]}.pdf`;
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
      const filename = `tickets_${ticketDate}.pdf`;
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
    const clientName = parcel.client ? `${parcel.client.firstName} ${parcel.client.lastName}` : '';
    const matchesSearch =
      parcel.trackingId?.toLowerCase().includes(term) ||
      parcel.recipientName?.toLowerCase().includes(term) ||
      clientName.toLowerCase().includes(term) ||
      parcel.deliveryAddress?.toLowerCase().includes(term);
    const matchesFilter = statusFilter === 'ALL' || parcel.status === statusFilter;
    const matchesDate = !dateFilter || parcel.createdAt?.slice(0, 10) === dateFilter;
    const matchesCity = cityFilter === 'ALL' || parcelCity(parcel) === cityFilter;
    const matchesClient = clientFilter === 'ALL' || String(parcel.client?.id) === clientFilter;
    return matchesSearch && matchesFilter && matchesDate && matchesCity && matchesClient;
  });

  const totalPages = Math.ceil(filteredParcels.length / pageSize);
  const paginatedParcels = filteredParcels.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const visibleCities = Array.from(new Set(parcels.map((parcel) => parcelCity(parcel)))).sort((a, b) => a.localeCompare(b));
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
          eyebrow="Opérations"
          icon={Package}
          title="Gestion générale des colis"
          description="Supervisez, affectez et inspectez chaque expédition de la plateforme."
          actions={
            <button onClick={exportToJson} className="btn-premium-secondary" type="button">
              <Download size={16} />
              Exporter JSON
            </button>
          }
        />

        <section className="surface p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_13rem_13rem_13rem_13rem]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par suivi, client, destinataire ou adresse"
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
            <div className="relative">
              <CalendarDays size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input className="input-premium pl-10" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <select className="input-premium pl-10" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                <option value="ALL">Toutes villes</option>
                {visibleCities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="relative">
              <Package size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <select className="input-premium pl-10" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
                <option value="ALL">Tous clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
                ))}
              </select>
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
          <div className="rounded-premium border border-red-200 bg-red-50 p-6 text-center font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</div>
        ) : filteredParcels.length === 0 ? (
          <EmptyState title="Aucun envoi trouvé" description="Modifiez vos mots clés ou filtres pour visualiser d'autres colis." />
        ) : (
          <section className="space-y-4">
            <div className="surface overflow-hidden">
              <div className="border-b border-slate-100 p-5 dark:border-slate-800">
                <SectionHeader title="Flux colis" description={`${filteredParcels.length} expédition(s) dans la vue actuelle.`} />
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
                      <th>Client</th>
                      <th>Destinataire</th>
                      <th>Livraison</th>
                      <th>Livreur</th>
                      <th>Statut</th>
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
                        <td className="text-sm font-bold text-slate-750 dark:text-slate-200">
                          {parcel.client ? `${parcel.client.firstName} ${parcel.client.lastName}` : 'Client inconnu'}
                        </td>
                        <td className="text-sm font-semibold text-slate-850 dark:text-slate-100">{parcel.recipientName}</td>
                        <td className="max-w-[220px] truncate text-sm text-slate-500" title={parcel.deliveryAddress}>{parcel.deliveryAddress}</td>
                        <td className="text-sm font-semibold">
                          {parcel.driver ? (
                            <span className="text-primary-700 dark:text-primary-300">{parcel.driver.firstName} {parcel.driver.lastName}</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-300">Non attribué</span>
                          )}
                        </td>
                        <td><StatusBadge status={parcel.status} /></td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedParcel(parcel)} className="icon-button h-9 w-9" title="Inspecter" type="button"><Eye size={15} /></button>
                            {parcel.status !== 'DELIVERED' && (
                              <button onClick={() => openAssignModal(parcel)} className="icon-button h-9 w-9" title="Attribuer" type="button"><UserPlus size={15} /></button>
                            )}
                          </div>
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

        {assigningParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
            <div className="surface w-full max-w-md overflow-hidden text-left shadow-premium-xl animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Attribuer un livreur</h3>
                  <p className="text-xs font-medium text-slate-400">{assigningParcel.trackingId}</p>
                </div>
                <button onClick={() => setAssigningParcel(null)} className="icon-button h-9 w-9" type="button" aria-label="Fermer"><X size={16} /></button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="space-y-4 p-5">
                  <div className="surface-muted p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Destination</p>
                    <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{assigningParcel.deliveryAddress}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Livreur</label>
                    <select className="input-premium" value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} required>
                      <option value="">Choisir un chauffeur</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <button type="button" onClick={() => setAssigningParcel(null)} className="btn-premium-secondary px-4 py-2">Annuler</button>
                  <button type="submit" disabled={submittingAssign || !selectedDriverId} className="btn-premium-primary px-4 py-2">
                    {submittingAssign ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    Attribuer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
            <div className="surface flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden text-left shadow-premium-xl animate-scale-up">
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Inspection colis</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{selectedParcel.trackingId}</h3>
                </div>
                <button onClick={() => setSelectedParcel(null)} className="icon-button h-9 w-9" type="button" aria-label="Fermer"><X size={16} /></button>
              </div>
              <div className="grid gap-6 overflow-y-auto p-5 lg:grid-cols-[1fr_0.95fr]">
                <div className="space-y-4">
                  <StatusBadge status={selectedParcel.status} />
                  <ProgressRoute status={selectedParcel.status} />
                  <div className="surface-muted p-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Client</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      {selectedParcel.client?.firstName} {selectedParcel.client?.lastName}
                    </p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400"><MapPin size={13} />Collecte</p>
                    <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{selectedParcel.pickupAddress}</p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400"><Truck size={13} />Livraison</p>
                    <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{selectedParcel.deliveryAddress}</p>
                  </div>
                </div>
                <TrackingTimeline status={selectedParcel.status} logs={selectedParcel.logs || []} />
              </div>
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-right dark:border-slate-800 dark:bg-slate-950/50">
                <button onClick={() => setSelectedParcel(null)} className="btn-premium-secondary px-4 py-2" type="button">Fermer</button>
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

export default AdminParcels;
