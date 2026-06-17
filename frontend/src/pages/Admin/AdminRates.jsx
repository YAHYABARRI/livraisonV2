import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, MapPin, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import Layout from '../../components/Common/Layout';
import EmptyState from '../../components/Common/EmptyState';
import { SkeletonTable } from '../../components/Common/Skeleton';
import { PageHeader, SectionHeader } from '../../components/Common/LogisticsUI';
import { BRAND } from '../../constants/brand';
import { usePageMeta } from '../../hooks/usePageMeta';
import { rateService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const formatDirham = (value) => `${Number(value || 0).toFixed(2)} DH`;

const AdminRates = () => {
  usePageMeta({
    title: `Tarifs - ${BRAND.name}`,
    description: 'Gestion admin des villes et prix de livraison AFRIDEEX.',
    path: '/admin/rates',
  });

  const toast = useToast();
  const [rates, setRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('16');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editCity, setEditCity] = useState('');
  const [editDeliveryFee, setEditDeliveryFee] = useState('');
  const [error, setError] = useState(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rateService.getAll();
      setRates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les tarifs.');
      toast.error('Erreur pendant le chargement des tarifs.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const filteredRates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rates.filter((rate) => rate.city?.toLowerCase().includes(term));
  }, [rates, searchTerm]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedCity = city.trim();
    const numericDeliveryFee = Number(deliveryFee);

    if (!normalizedCity) {
      toast.error('La ville est obligatoire.');
      return;
    }
    if (!Number.isFinite(numericDeliveryFee) || numericDeliveryFee <= 0) {
      toast.error('Le prix de livraison doit etre positif.');
      return;
    }

    setSaving(true);
    try {
      const createdRate = await rateService.create({
        city: normalizedCity,
        deliveryFee: numericDeliveryFee,
        returnFee: 0,
      });
      setRates((current) => [...current, createdRate].sort((a, b) => a.city.localeCompare(b.city)));
      setCity('');
      setDeliveryFee('16');
      toast.success('Ville ajoutee au tableau des tarifs.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Impossible d ajouter cette ville.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (rate) => {
    setEditingId(rate.id);
    setEditCity(rate.city || '');
    setEditDeliveryFee(String(rate.deliveryFee || ''));
  };

  const cancelEdit = () => {
    if (updatingId) return;
    setEditingId(null);
    setEditCity('');
    setEditDeliveryFee('');
  };

  const handleUpdate = async (rate) => {
    const normalizedCity = editCity.trim();
    const numericDeliveryFee = Number(editDeliveryFee);

    if (!normalizedCity) {
      toast.error('La ville est obligatoire.');
      return;
    }
    if (!Number.isFinite(numericDeliveryFee) || numericDeliveryFee <= 0) {
      toast.error('Le prix de livraison doit etre positif.');
      return;
    }

    setUpdatingId(rate.id);
    try {
      const updatedRate = await rateService.update(rate.id, {
        city: normalizedCity,
        deliveryFee: numericDeliveryFee,
        returnFee: rate.returnFee || 0,
      });
      setRates((current) => current
        .map((item) => (item.id === updatedRate.id ? updatedRate : item))
        .sort((a, b) => a.city.localeCompare(b.city)));
      setEditingId(null);
      setEditCity('');
      setEditDeliveryFee('');
      toast.success('Tarif modifie avec succes.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Impossible de modifier ce tarif.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (rate) => {
    const confirmed = window.confirm(`Supprimer ${rate.city} du tableau des tarifs ?`);
    if (!confirmed) return;

    setDeletingId(rate.id);
    try {
      await rateService.delete(rate.id);
      setRates((current) => current.filter((item) => item.id !== rate.id));
      if (editingId === rate.id) {
        cancelEdit();
      }
      toast.success('Ville supprimee du tableau des tarifs.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Impossible de supprimer cette ville.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 text-left">
        <PageHeader
          eyebrow="Administration"
          icon={MapPin}
          title="Tarifs de livraison"
          description="Ajoutez les villes et leurs prix de livraison. La page d accueil affiche automatiquement ces tarifs."
        />

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={handleSubmit} className="surface p-5">
            <SectionHeader title="Ajouter une ville" description="Prix en dirham marocain, sans frais de retour par defaut." />
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">Ville / region</span>
                <div className="relative">
                  <MapPin size={17} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    className="input-premium pl-10"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Ex: Dar Bouazza"
                    maxLength={100}
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">Prix livraison</span>
                <div className="relative">
                  <Banknote size={17} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    className="input-premium pl-10"
                    type="number"
                    min="1"
                    step="0.5"
                    value={deliveryFee}
                    onChange={(event) => setDeliveryFee(event.target.value)}
                    required
                  />
                </div>
              </label>

              <button className="btn-premium-primary w-full" type="submit" disabled={saving}>
                <Plus size={16} />
                {saving ? 'Ajout en cours...' : 'Ajouter au tableau'}
              </button>
            </div>
          </form>

          <section className="surface p-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une ville"
                className="input-premium pl-10"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </section>
        </section>

        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="rounded-premium border border-red-200 bg-red-50 p-6 text-center font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</div>
        ) : filteredRates.length === 0 ? (
          <EmptyState title="Aucun tarif trouve" description="Ajoutez une ville ou ajustez la recherche." />
        ) : (
          <section className="surface overflow-hidden">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <SectionHeader title="Tableau des tarifs" description={`${filteredRates.length} ville(s) dans la vue actuelle.`} />
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ville / region</th>
                    <th className="text-right">Prix livraison</th>
                    <th className="text-right">Frais retour</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map((rate) => (
                    <tr key={rate.id || rate.city}>
                      <td>
                        {editingId === rate.id ? (
                          <input
                            className="input-premium min-w-[13rem]"
                            value={editCity}
                            onChange={(event) => setEditCity(event.target.value)}
                            maxLength={100}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-premium bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                              <MapPin size={17} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-850 dark:text-white">{rate.city}</p>
                              <p className="text-xs font-medium text-slate-400">Destination active</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="text-right text-sm font-black text-primary-700 dark:text-primary-300">
                        {editingId === rate.id ? (
                          <input
                            className="input-premium ml-auto max-w-[9rem] text-right"
                            type="number"
                            min="1"
                            step="0.5"
                            value={editDeliveryFee}
                            onChange={(event) => setEditDeliveryFee(event.target.value)}
                          />
                        ) : (
                          formatDirham(rate.deliveryFee)
                        )}
                      </td>
                      <td className="text-right text-sm font-semibold text-slate-500 dark:text-slate-300">{formatDirham(rate.returnFee)}</td>
                      <td className="text-right">
                        {editingId === rate.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn-premium-primary px-3 py-2 text-xs"
                              type="button"
                              onClick={() => handleUpdate(rate)}
                              disabled={updatingId === rate.id}
                            >
                              <Save size={14} />
                              {updatingId === rate.id ? 'Sauvegarde...' : 'Sauver'}
                            </button>
                            <button
                              className="btn-premium-secondary px-3 py-2 text-xs"
                              type="button"
                              onClick={cancelEdit}
                              disabled={updatingId === rate.id}
                            >
                              <X size={14} />
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn-premium-secondary px-3 py-2 text-xs"
                              type="button"
                              onClick={() => startEdit(rate)}
                            >
                              <Pencil size={14} />
                              Modifier
                            </button>
                            <button
                              className="btn-premium-secondary border-red-200 px-3 py-2 text-xs text-red-700 hover:border-red-300 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
                              type="button"
                              onClick={() => handleDelete(rate)}
                              disabled={deletingId === rate.id}
                            >
                              <Trash2 size={14} />
                              {deletingId === rate.id ? 'Suppression...' : 'Supprimer'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default AdminRates;
