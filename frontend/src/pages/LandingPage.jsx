import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Download,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import Navbar from '../components/Common/Navbar';
import BrandLogo from '../components/Common/BrandLogo';
import { BRAND } from '../constants/brand';
import { foxDeliveryRates, foxRatesMeta } from '../data/foxDeliveryRates';
import { usePageMeta } from '../hooks/usePageMeta';
import heroLogistics from '../assets/landing-hero-logistics.webp';
import moroccoDeliveryMap from '../assets/morocco-delivery-map.webp';
import { parcelService, rateService } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import {
  ProgressRoute,
  StatusBadge,
  TrackingTimeline,
  formatDate,
} from '../components/Common/LogisticsUI';

const formatDirham = (value) => `${Number(value || 0).toFixed(2)} DH`;
const RATES_PER_PAGE = 8;
const WHATSAPP_NUMBER = (BRAND.whatsapp || BRAND.supportPhone).replace(/\D/g, '');
const WHATSAPP_MESSAGE =
  "Bonjour GLADEX DELIVERY, je souhaite avoir plus d'informations sur vos services de livraison.";
const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const WhatsAppIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.148-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.883 9.888-9.883a9.81 9.81 0 0 1 6.993 2.899 9.825 9.825 0 0 1 2.895 6.994c-.002 5.45-4.437 9.883-9.896 9.883m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const heroStats = [
  ['6', 'zones Casablanca'],
  ['24-72h', 'délais moyens'],
  ['COD', 'paiement livraison'],
];

const services = [
  {
    icon: PackageCheck,
    title: 'Création colis rapide',
    text: 'Saisie claire du destinataire, de la ville, de l’adresse et du poids avec validation immédiate.',
  },
  {
    icon: Truck,
    title: 'Suivi colis clair',
    text: 'Chaque expedition reste tracable avec un numero de suivi simple a partager avec vos clients.',
  },
  {
    icon: ShieldCheck,
    title: 'Livraison securisee',
    text: 'Vos colis sont suivis de la creation jusqu a la livraison avec des statuts lisibles et rassurants.',
  },
  {
    icon: Download,
    title: 'Tickets prets a imprimer',
    text: 'Generez des tickets propres pour preparer vos commandes et accelerer vos expeditions.',
  },
];

const MoroccoCoverageMap = () => (
  <div className="group relative overflow-hidden rounded-premium border border-slate-200 bg-white p-2 shadow-premium-xl dark:border-slate-800 dark:bg-slate-950">
    <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-white">
      <img
        src={moroccoDeliveryMap}
        alt="Carte de livraison GLADEX DELIVERY au Maroc"
        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary-200/50 dark:ring-white/10" />
      
    </div>
  </div>
);

const LandingPage = () => {
  usePageMeta({
    title: `${BRAND.name} - Livraison e-commerce au Maroc`,
    description: 'Livraison e-commerce au Maroc avec suivi colis reel, tarifs par ville et tickets imprimables pour les vendeurs.',
    path: '/',
  });

  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedParcel, setTrackedParcel] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [rateSearch, setRateSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [ratePage, setRatePage] = useState(1);
  const [rates, setRates] = useState(foxDeliveryRates);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchRates = async () => {
      setRatesLoading(true);
      setRatesError(null);
      try {
        const data = await rateService.getAll();
        if (mounted) {
          setRates(Array.isArray(data) && data.length > 0 ? data : []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setRates(foxDeliveryRates);
          setRatesError('Tarifs API indisponibles. Affichage de la grille Casablanca par defaut.');
        }
      } finally {
        if (mounted) {
          setRatesLoading(false);
        }
      }
    };

    fetchRates();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredRates = useMemo(() => {
    const term = rateSearch.trim().toLowerCase();
    return rates.filter((rate) => {
      const matchesSearch = rate.city.toLowerCase().includes(term);
      const matchesCity = selectedCity === 'ALL' || rate.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [rateSearch, rates, selectedCity]);

  const totalRatePages = Math.max(1, Math.ceil(filteredRates.length / RATES_PER_PAGE));
  const currentRatePage = Math.min(ratePage, totalRatePages);
  const rateStart = filteredRates.length === 0 ? 0 : (currentRatePage - 1) * RATES_PER_PAGE + 1;
  const rateEnd = Math.min(currentRatePage * RATES_PER_PAGE, filteredRates.length);
  const paginatedRates = useMemo(() => {
    const start = (currentRatePage - 1) * RATES_PER_PAGE;
    return filteredRates.slice(start, start + RATES_PER_PAGE);
  }, [currentRatePage, filteredRates]);
  const visibleRatePages = useMemo(() => {
    const start = Math.max(1, currentRatePage - 1);
    const end = Math.min(totalRatePages, start + 2);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentRatePage, totalRatePages]);

  useEffect(() => {
    setRatePage(1);
  }, [rateSearch, selectedCity]);

  const handleTrackSubmit = async (event) => {
    event.preventDefault();
    if (!trackingNumber.trim()) return;

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedParcel(null);

    try {
      const data = await parcelService.track(trackingNumber.trim());
      setTrackedParcel(data);
    } catch (err) {
      console.error(err);
      setTrackingError(getApiErrorMessage(err, 'Aucun colis trouvé avec ce numéro de suivi. Vérifiez le code.'));
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutralBg text-slate-950 dark:bg-darkBg dark:text-white">
      <Navbar />

      <section
        className="landing-hero relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-10 text-white sm:px-6 lg:px-8 lg:pb-20"
        style={{
          '--landing-hero-image': `url(${heroLogistics})`,
          backgroundImage: `linear-gradient(90deg, rgba(5,13,28,0.96) 0%, rgba(5,13,28,0.84) 48%, rgba(5,13,28,0.46) 100%), url(${heroLogistics})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutralBg to-transparent dark:from-darkBg" />

        <div className="landing-hero-content relative mx-auto max-w-7xl pt-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100 backdrop-blur"
            >
              <Sparkles size={14} />
              Livraison e-commerce au Maroc
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="landing-hero-title max-w-4xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl"
            >
              Pilotez vos colis avec une plateforme logistique premium.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.09 }}
              className="landing-hero-description mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-200"
            >
              GLADEX DELIVERY simplifie l envoi de vos colis e-commerce avec creation rapide, suivi clair, tarifs transparents et tickets imprimables.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              onSubmit={handleTrackSubmit}
              className="landing-hero-tracking mt-8 max-w-2xl rounded-premium border border-white/18 bg-white/12 p-2 shadow-2xl backdrop-blur-xl"
            >
              <div className="landing-hero-tracking-row flex flex-col gap-2 sm:flex-row">
                <div className="landing-hero-tracking-field flex flex-1 items-center gap-3 px-3">
                  <Search size={20} className="shrink-0 text-blue-200" />
                  <input
                    type="text"
                    placeholder="Numéro de suivi, ex: QS-754910"
                    className="h-12 w-full bg-transparent text-sm font-bold text-white placeholder:text-slate-300 focus:outline-none"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    aria-label="Numéro de suivi"
                  />
                </div>
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="btn-premium-primary h-12 bg-white px-5 text-slate-950 hover:bg-blue-50"
                >
                  {trackingLoading ? 'Recherche...' : 'Suivre'}
                  <ArrowRight size={16} />
                </button>
              </div>
              {trackingError && (
                <p className="mt-3 rounded-premium border border-red-300/30 bg-red-950/50 px-3 py-2 text-xs font-bold text-red-100">
                  {trackingError}
                </p>
              )}
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="landing-hero-ctas mt-7 flex flex-wrap items-center gap-3"
            >
              <Link to="/register" className="btn-premium-primary bg-primary-600">
                Créer un compte
                <ArrowRight size={16} />
              </Link>
              <a href="#pricing" className="btn-premium-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                Voir les tarifs
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-premium bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-lg active:translate-y-px"
                aria-label="Contacter GLADEX DELIVERY sur WhatsApp"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0" />
                WhatsApp
              </a>
            </motion.div>

            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-2">
              {heroStats.map(([value, label]) => (
                <div key={label} className="rounded-premium border border-white/14 bg-white/10 p-3 backdrop-blur">
                  <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="surface surface-hover p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-premium bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                  <Icon size={21} />
                </div>
                <h3 className="mt-4 font-black text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_34rem] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary-700 dark:text-primary-300">Tarifs Maroc</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Tableau des tarifs par ville.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Le tableau reste central : recherchez une ville de Casablanca et ses regions, puis consultez les frais de livraison.
            </p>
          </div>
          <div className="surface p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  className="input-premium pl-10"
                  placeholder="Rechercher une ville"
                  value={rateSearch}
                  onChange={(e) => setRateSearch(e.target.value)}
                  aria-label="Rechercher une ville dans le tableau des tarifs"
                />
              </div>
              <select className="input-premium" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} aria-label="Filtrer les tarifs par destination">
                <option value="ALL">Toutes destinations</option>
                {rates.map((rate) => <option key={rate.city} value={rate.city}>{rate.city}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(23rem,0.94fr)] lg:items-start">
          <div className="surface overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Grille tarifaire</p>
                <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Destinations disponibles</h3>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Tarifs GLADEX DELIVERY Casablanca, mise a jour {new Date(foxRatesMeta.updatedAt).toLocaleDateString('fr-FR')}.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary-50 px-3 py-1 text-xs font-black text-secondary-700 dark:bg-secondary-950/40 dark:text-secondary-300">
                <MapPin size={13} />
                {filteredRates.length} / {rates.length || foxRatesMeta.uniqueCities} affichee{filteredRates.length > 1 ? 's' : ''}
              </span>
            </div>

            {ratesError && (
              <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                {ratesError}
              </div>
            )}

            <div className="max-h-[44rem] overflow-auto overscroll-contain">
              <table className="w-full min-w-[39rem] border-separate border-spacing-0 text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-950 text-xs font-black uppercase tracking-wider text-white dark:bg-slate-950">
                    <th className="px-5 py-4">Ville / zone</th>
                    <th className="px-5 py-4 text-right">Frais livraison</th>
                    <th className="px-5 py-4 text-right">Frais retour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ratesLoading ? (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-sm font-semibold text-slate-400">Chargement des tarifs...</td>
                    </tr>
                  ) : filteredRates.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-sm font-semibold text-slate-400">Aucun tarif ne correspond à vos critères.</td>
                    </tr>
                  ) : (
                    paginatedRates.map((rate) => (
                      <tr key={`${rate.city}-${rate.deliveryFee}-${rate.returnFee}`} className="group bg-white transition-colors duration-200 hover:bg-primary-50/50 dark:bg-slate-900 dark:hover:bg-slate-800/60">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-premium bg-primary-50 text-primary-700 transition-colors duration-200 group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-950/40 dark:text-primary-300">
                              <MapPin size={17} />
                            </span>
                            <div>
                              <p className="text-sm font-black text-slate-950 dark:text-white">{rate.city}</p>
                              <p className="mt-0.5 text-xs font-semibold text-slate-400">Destination Maroc</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-lg font-black text-primary-700 dark:text-primary-300">{formatDirham(rate.deliveryFee)}</p>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Colis standard</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{formatDirham(rate.returnFee)}</p>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Retour</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Navigation tarifs</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {filteredRates.length === 0
                      ? 'Aucune destination à afficher'
                      : `${rateStart}-${rateEnd} sur ${filteredRates.length} destinations`}
                  </p>
                  <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-600 via-sky-500 to-secondary-500 transition-all duration-500"
                      style={{ width: `${filteredRates.length === 0 ? 0 : (currentRatePage / totalRatePages) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRatePage((page) => Math.max(1, page - 1))}
                    disabled={currentRatePage === 1 || filteredRates.length === 0}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    Précédent
                  </button>

                  <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {visibleRatePages.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setRatePage(page)}
                        className={`h-9 min-w-9 rounded-full px-3 text-xs font-black transition-all ${
                          page === currentRatePage
                            ? 'bg-slate-950 text-white shadow-md dark:bg-white dark:text-slate-950'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                        aria-current={page === currentRatePage ? 'page' : undefined}
                      >
                        {String(page).padStart(2, '0')}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setRatePage((page) => Math.min(totalRatePages, page + 1))}
                    disabled={currentRatePage === totalRatePages || filteredRates.length === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition-all hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 dark:bg-white dark:text-slate-950 dark:hover:bg-primary-100"
                  >
                    Suivant
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <MoroccoCoverageMap />
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary-300">Espace vendeur</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Tout pour envoyer vos colis sans friction.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Creez vos expeditions, consultez vos tarifs, suivez vos colis et preparez vos tickets depuis une experience claire.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Truck, value: 'Suivi', label: 'Tracking colis en temps reel' },
              { icon: PackageCheck, value: 'Commandes', label: 'Creation colis rapide' },
              { icon: Download, value: 'Tickets', label: 'Preparation imprimable' },
              { icon: ShieldCheck, value: 'Confiance', label: 'Statuts clairs pour le client' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-premium border border-white/10 bg-white/8 p-5">
                  <Icon size={22} className="text-primary-300" />
                  <p className="mt-4 text-2xl font-black">{item.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-300">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-premium bg-primary-600 p-8 text-white shadow-premium-xl lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-black">Pret a envoyer vos colis ?</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-blue-50">Creez un compte vendeur et commencez a preparer vos expeditions.</p>
          </div>
          <Link to="/register" className="btn-premium-primary bg-white text-slate-950 hover:bg-blue-50">
            Démarrer
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <BrandLogo variant="auto" />
          <p className="text-xs font-medium text-slate-400">© {new Date().getFullYear()} GLADEX DELIVERY. Tous droits réservés.</p>
          <div className="flex gap-5 text-xs font-bold text-slate-500">
            <a href="#services" className="hover:text-primary-700">Services</a>
            <a href="#pricing" className="hover:text-primary-700">Tarifs</a>
            <Link to="/track" className="hover:text-primary-700">Suivi</Link>
          </div>
        </div>
      </footer>

      {trackedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="surface flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden text-left shadow-premium-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Suivi colis</p>
                <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{trackedParcel.trackingId}</h3>
              </div>
              <button onClick={() => setTrackedParcel(null)} className="icon-button h-9 w-9" type="button" aria-label="Fermer">
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-6 overflow-y-auto p-5 lg:grid-cols-[1fr_0.95fr]">
              <div className="space-y-4">
                <StatusBadge status={trackedParcel.status} />
                <ProgressRoute status={trackedParcel.status} fromLabel="Départ" toLabel="Arrivée" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="surface-muted p-4">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Destinataire</p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">{trackedParcel.recipientName}</p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Estimation</p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">{formatDate(trackedParcel.estimatedDelivery)}</p>
                  </div>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Collecte</p>
                  <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{trackedParcel.pickupAddress}</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Livraison</p>
                  <p className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-100">{trackedParcel.deliveryAddress}</p>
                </div>
              </div>
              <TrackingTimeline status={trackedParcel.status} logs={trackedParcel.logs || []} />
            </div>
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-right dark:border-slate-800 dark:bg-slate-950/50">
              <button onClick={() => setTrackedParcel(null)} className="btn-premium-secondary px-4 py-2" type="button">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
