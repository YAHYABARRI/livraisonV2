import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock3,
  Coins,
  Download,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Square,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import Layout from '../../components/Common/Layout';
import { BRAND } from '../../constants/brand';
import { adminService, reportService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { formatCurrency, PageHeader, SectionHeader, StatCard } from '../../components/Common/LogisticsUI';

const AdminReports = () => {
  usePageMeta({
    title: `Rapports admin - ${BRAND.name}`,
    description: 'Générez les rapports PDF GLADEX DELIVERY par date, livreur, client et période.',
    path: '/admin/reports',
  });

  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [driverId, setDriverId] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState('custom');

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const statsData = await reportService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error(err);
      toast.error('Erreur de chargement des statistiques.');
    } finally {
      setLoadingStats(false);
    }
  }, [toast]);

  const fetchMetadata = useCallback(async () => {
    setLoadingMetadata(true);
    try {
      const [driversData, usersData] = await Promise.all([
        adminService.getDrivers(),
        adminService.getUsers(),
      ]);
      setDrivers(driversData);
      setClients(usersData.filter((user) => user.roles.some((role) => role.includes('CLIENT') || role === 'CLIENT')));
    } catch (err) {
      console.error(err);
      toast.error('Erreur de chargement des livreurs ou clients.');
    } finally {
      setLoadingMetadata(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
    fetchMetadata();
  }, [fetchMetadata, fetchStats]);

  const filteredClients = clients.filter((client) => {
    const term = clientSearch.toLowerCase();
    return client.firstName.toLowerCase().includes(term) || client.lastName.toLowerCase().includes(term) || client.email.toLowerCase().includes(term);
  });

  const toggleClient = (clientId) => {
    setSelectedClientIds((prev) => (
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    ));
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setDriverId('');
    setSelectedClientIds([]);
    toast.success('Filtres réinitialisés.');
  };

  const getFilteredPayloadAndType = (type) => {
    let callType = type;
    let params = {};

    if (type === 'custom') {
      if (selectedClientIds.length > 1) {
        callType = 'by-clients';
        params = {
          startDate: startDate || null,
          endDate: endDate || null,
          driverId: driverId ? parseInt(driverId, 10) : null,
          clientIds: selectedClientIds,
        };
      } else {
        params = {
          startDate: startDate || null,
          endDate: endDate || null,
          driverId: driverId ? parseInt(driverId, 10) : null,
        };
        if (selectedClientIds.length === 1) {
          params.clientId = selectedClientIds[0];
        }
      }
    }

    return { callType, params };
  };

  const createReportBlob = async (type) => {
    const { callType, params } = getFilteredPayloadAndType(type);
    if (callType === 'daily') return { blob: await reportService.getDailyPdf(), callType };
    if (callType === 'weekly') return { blob: await reportService.getWeeklyPdf(), callType };
    if (callType === 'monthly') return { blob: await reportService.getMonthlyPdf(), callType };
    if (callType === 'by-clients') return { blob: await reportService.getMultiClientsPdf(params), callType };
    return { blob: await reportService.getCustomPdf(params), callType };
  };

  const handleDownload = async (type) => {
    setGenerating(true);
    try {
      const { blob, callType } = await createReportBlob(type);
      const fileUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `rapport_${callType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(fileUrl);
      toast.success('Téléchargement du rapport PDF réussi.');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la génération ou du téléchargement du PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async (type) => {
    setGenerating(true);
    setPreviewType(type);
    try {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      const { blob } = await createReportBlob(type);
      setPdfPreviewUrl(URL.createObjectURL(blob));
      setShowPreview(true);
      toast.success('Aperçu du rapport PDF généré.');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la génération de l'aperçu PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 text-left">
        <PageHeader
          eyebrow="Rapports"
          icon={FileText}
          title="Rapports et exports"
          description="Générez des PDF consolidés, prévisualisez les documents et suivez les indicateurs financiers."
          actions={
            <button onClick={() => { fetchStats(); fetchMetadata(); }} disabled={loadingStats || loadingMetadata} className="btn-premium-secondary" type="button">
              <RefreshCw size={16} className={(loadingStats || loadingMetadata) ? 'animate-spin' : ''} />
              Actualiser
            </button>
          }
        />

        {loadingStats ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => <div key={item} className="surface h-28 animate-pulse" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="CA jour" value={formatCurrency(stats.revenueToday)} icon={Coins} tone="blue" />
            <StatCard title="CA mensuel" value={formatCurrency(stats.revenueMonth)} icon={Coins} tone="green" />
            <StatCard title="Colis livrés" value={stats.deliveredCount} icon={CheckCircle2} tone="green" />
            <StatCard title="En attente" value={stats.pendingCount} icon={Clock3} tone="amber" />
            <StatCard title="Retournés" value={stats.returnedCount} icon={XCircle} tone="rose" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
          <section className="surface overflow-hidden">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <SectionHeader title="Rapport personnalisé" description="Définissez la période, le livreur et les clients concernés." />
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Date de début</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input type="date" className="input-premium pl-10" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Date de fin</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input type="date" className="input-premium pl-10" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Livreur associé</label>
                <div className="relative">
                  <Truck size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <select className="input-premium pl-10" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                    <option value="">Tous les livreurs</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName} ({driver.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Sélection clients</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedClientIds(filteredClients.map((client) => client.id))} className="btn-premium-ghost py-1 text-xs" type="button">Tout sélectionner</button>
                    <button onClick={() => setSelectedClientIds([])} className="btn-premium-ghost py-1 text-xs" type="button">Vider</button>
                  </div>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" placeholder="Filtrer les clients" className="input-premium pl-10 py-2.5" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                </div>
                <div className="h-56 overflow-y-auto rounded-premium border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40">
                  {loadingMetadata ? (
                    <div className="p-6 text-center text-sm font-semibold text-slate-400">Chargement de la liste...</div>
                  ) : filteredClients.length === 0 ? (
                    <div className="p-6 text-center text-sm font-semibold text-slate-400">Aucun client trouvé</div>
                  ) : (
                    filteredClients.map((client) => {
                      const isSelected = selectedClientIds.includes(client.id);
                      return (
                        <button
                          key={client.id}
                          onClick={() => toggleClient(client.id)}
                          className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-primary-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40 ${isSelected ? 'bg-primary-50 dark:bg-primary-950/15' : ''}`}
                          type="button"
                        >
                          {isSelected ? <CheckSquare size={16} className="text-primary-600" /> : <Square size={16} className="text-slate-400" />}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-extrabold text-slate-850 dark:text-white">{client.firstName} {client.lastName}</span>
                            <span className="block truncate text-xs font-medium text-slate-400">{client.email}</span>
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">#{client.id}</span>
                        </button>
                      );
                    })
                  )}
                </div>
                {selectedClientIds.length > 0 && (
                  <p className="text-xs font-bold text-primary-700 dark:text-primary-300">{selectedClientIds.length} client(s) sélectionné(s)</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={resetFilters} className="btn-premium-secondary" type="button">
                <Filter size={16} />
                Réinitialiser
              </button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button disabled={generating} onClick={() => handlePreview('custom')} className="btn-premium-secondary" type="button">
                  <Eye size={16} />
                  {generating ? 'Génération...' : 'Aperçu PDF'}
                </button>
                <button disabled={generating} onClick={() => handleDownload('custom')} className="btn-premium-primary" type="button">
                  <Download size={16} />
                  {generating ? 'Génération...' : 'Télécharger PDF'}
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="surface overflow-hidden">
              <div className="border-b border-slate-100 p-5 dark:border-slate-800">
                <SectionHeader title="Bilan périodique" description="Exports rapides." />
              </div>
              <div className="space-y-3 p-5">
                {[
                  ['daily', "Aujourd'hui", "Rapport d'activité du jour"],
                  ['weekly', 'Cette semaine', 'Bilan consolidé hebdomadaire'],
                  ['monthly', 'Ce mois', 'Rapport de facturation mensuel'],
                ].map(([type, title, desc]) => (
                  <div key={type} className="rounded-premium border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-slate-850 dark:text-white">{title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handlePreview(type)} className="icon-button h-9 w-9" title="Aperçu" type="button"><Eye size={15} /></button>
                        <button onClick={() => handleDownload(type)} className="icon-button h-9 w-9" title="Télécharger" type="button"><Download size={15} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        {showPreview && pdfPreviewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="surface flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden shadow-premium-xl animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Aperçu du rapport PDF</h3>
                  <p className="text-xs font-medium text-slate-400">Validation du document généré</p>
                </div>
                <button onClick={closePreview} className="icon-button h-9 w-9" type="button" aria-label="Fermer"><X size={16} /></button>
              </div>
              <div className="flex-1 bg-slate-100 p-2 dark:bg-slate-950">
                <iframe src={pdfPreviewUrl} title="PDF Preview" className="h-full w-full rounded-premium border-0 bg-white" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/50">
                <button onClick={closePreview} className="btn-premium-secondary px-4 py-2" type="button">Fermer</button>
                <button onClick={() => handleDownload(previewType)} className="btn-premium-primary px-4 py-2" type="button">
                  <Download size={15} />
                  Télécharger le PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminReports;
