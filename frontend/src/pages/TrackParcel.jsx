import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  Phone,
  Scale,
  Search,
  User,
} from 'lucide-react';
import Navbar from '../components/Common/Navbar';
import { parcelService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  formatDate,
  PageHeader,
  ProgressRoute,
  StatusBadge,
  TrackingTimeline,
} from '../components/Common/LogisticsUI';

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="surface-muted p-4">
    <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
      <Icon size={14} />
      {label}
    </p>
    <p className="mt-2 text-sm font-bold leading-6 text-slate-850 dark:text-slate-100">{value || 'Non renseigné'}</p>
  </div>
);

const TrackParcel = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchVal, setSearchVal] = useState(trackingNumber || '');
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trackingNumber) {
      handleTrack(trackingNumber);
    } else {
      setParcel(null);
      setError(null);
    }
  }, [trackingNumber]);

  const handleTrack = async (num) => {
    if (!num || num.trim() === '') {
      toast.warning('Veuillez saisir un numéro de suivi valide.');
      return;
    }

    setLoading(true);
    setError(null);
    setParcel(null);

    try {
      const data = await parcelService.track(num.trim());
      setParcel(data);
    } catch (err) {
      console.error(err);
      setError('Numéro de suivi introuvable. Veuillez vérifier votre saisie.');
      toast.error('Colis introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/track/${searchVal.trim()}`);
    }
  };

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/" className="btn-premium-ghost w-fit px-0 hover:bg-transparent">
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>

        <PageHeader
          eyebrow="Tracking"
          icon={Package}
          title="Suivi d'expédition en temps réel"
          description="Consultez l'avancement, les informations logistiques et les événements de transport d'un colis AFRIDEEX."
        />

        <section className="surface overflow-hidden">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Numéro de suivi du colis"
                  className="input-premium pl-10 text-base"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-premium-primary sm:w-auto">
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 p-14">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
              <p className="text-sm font-bold text-slate-400">Récupération des événements de transport...</p>
            </div>
          )}

          {error && !loading && (
            <div className="m-5 flex items-start gap-3 rounded-premium border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              <AlertCircle size={22} className="mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold">Recherche impossible</h4>
                <p className="mt-1 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {!parcel && !loading && !error && (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-500">Saisissez un numéro de suivi pour afficher la fiche colis.</p>
            </div>
          )}
        </section>

        {parcel && !loading && (
          <div className="space-y-6 animate-fade-in">
            <section className="surface p-5">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Colis suivi</p>
                  <h2 className="mt-1 text-2xl font-black text-primary-700 dark:text-primary-300">{parcel.trackingId}</h2>
                </div>
                <StatusBadge status={parcel.status} />
              </div>
              <div className="mt-5">
                <ProgressRoute status={parcel.status} fromLabel="Départ" toLabel="Arrivée" />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="surface p-5">
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Fiche logistique</h3>
                <div className="mt-5 grid gap-3">
                  <DetailItem icon={MapPin} label="Adresse de collecte" value={parcel.pickupAddress} />
                  <DetailItem icon={MapPin} label="Adresse de livraison" value={parcel.deliveryAddress} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem icon={Scale} label="Poids" value={`${parcel.weight} kg`} />
                    <DetailItem icon={Calendar} label="Livraison estimée" value={formatDate(parcel.estimatedDelivery)} />
                    <DetailItem icon={User} label="Destinataire" value={parcel.recipientName} />
                    <DetailItem icon={Phone} label="Téléphone" value={parcel.recipientPhone} />
                  </div>
                </div>
              </section>

              <section className="surface p-5">
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Timeline d'acheminement</h3>
                <div className="mt-5">
                  <TrackingTimeline status={parcel.status} logs={parcel.logs || []} />
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrackParcel;
