import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Building2,
  Download,
  MapPin,
  MessageCircle,
  PackageCheck,
  Play,
  Search,
  ShieldCheck,
  Truck,
  Users,
  X,
} from 'lucide-react';
import Navbar from '../components/Common/Navbar';
import BrandLogo from '../components/Common/BrandLogo';
import { parcelService } from '../services/api';
import heroLogistics from '../assets/landing-hero-logistics.webp';
import lastMilePhoto from '../assets/landing-last-mile.webp';
import hubOperationsPhoto from '../assets/landing-hub-operations.webp';
import moroccoDeliveryMap from '../assets/morocco-delivery-map.webp';
import { foxDeliveryRates, foxRatesMeta } from '../data/foxDeliveryRates';
import {
  ProgressRoute,
  StatusBadge,
  TrackingTimeline,
  formatDate,
} from '../components/Common/LogisticsUI';

const formatDirham = (value) => `${Number(value || 0).toFixed(2)} DH`;

const MoroccoCoverageMap = () => {
  return (
    <div className="group relative overflow-hidden rounded-premium border border-slate-200 bg-white p-2 shadow-premium-xl transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_34px_95px_rgba(11,95,255,0.18)] dark:border-slate-800 dark:bg-slate-950 lg:self-start">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-white">
        <img
          src={moroccoDeliveryMap}
          alt="Carte de livraison au Maroc avec zones d'expédition et véhicule AFRIDEEX"
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary-200/50 dark:ring-white/10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/55 to-transparent dark:from-slate-950/25" />
      </div>
    </div>
  );
};

const faqs = [
  {
    q: 'Quels sont vos délais de livraison ?',
    a: 'Les livraisons sont généralement réalisées sous 24h à 72h selon la distance, le statut du colis et la ville de destination.',
  },
  {
    q: "Comment suivre l'acheminement de mon colis ?",
    a: 'Saisissez simplement votre numéro de suivi AFRIDEEX. La route, le statut et les événements de transport sont affichés en temps réel.',
  },
  {
    q: 'Proposez-vous le paiement à la livraison ?',
    a: "Oui. Les encaissements à la livraison peuvent être suivis dans le tableau de bord et consolidés dans les rapports d'activité.",
  },
];

const imageStories = [
  {
    image: lastMilePhoto,
    title: 'Livraison de proximité',
    text: 'Des remises lisibles, rapides et suivies jusqu’au dernier kilomètre.',
  },
  {
    image: hubOperationsPhoto,
    title: 'Tri opérationnel',
    text: 'Un hub organisé pour accélérer les flux et fiabiliser chaque colis.',
  },
];

const LandingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedParcel, setTrackedParcel] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [rateSearch, setRateSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');

  const filteredRates = foxDeliveryRates.filter((rate) => {
    const term = rateSearch.toLowerCase();
    const matchesSearch = rate.city.toLowerCase().includes(term);
    const matchesCity = selectedCity === 'ALL' || rate.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedParcel(null);

    try {
      const data = await parcelService.track(trackingNumber.trim());
      setTrackedParcel(data);
    } catch (err) {
      console.error(err);
      setTrackingError('Aucun colis trouvé avec ce numéro de suivi. Veuillez vérifier le code.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutralBg text-slate-950 dark:bg-darkBg dark:text-white">
      <Navbar />

      <section
        className="relative isolate min-h-[92vh] overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(7,17,31,0.96) 0%, rgba(7,17,31,0.82) 48%, rgba(7,17,31,0.46) 100%), url(${heroLogistics})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 pt-10 lg:grid-cols-[1fr_29rem] lg:items-center">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100 backdrop-blur"
            >
              <ShieldCheck size={14} />
              Plateforme logistique temps réel
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="max-w-3xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl"
            >
              AFRIDEEX
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-200"
            >
              Une console de livraison moderne pour créer, suivre, assigner et piloter vos colis avec la clarté d'une grande entreprise logistique.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              onSubmit={handleTrackSubmit}
              className="mt-8 max-w-2xl"
            >
              <div className="flex flex-col gap-3 rounded-premium border border-white/15 bg-white/12 p-2 backdrop-blur-xl sm:flex-row">
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Search size={20} className="shrink-0 text-blue-200" />
                  <input
                    type="text"
                    placeholder="Numéro de suivi, ex: QS-754910"
                    className="h-12 w-full bg-transparent text-sm font-bold text-white placeholder:text-slate-300 focus:outline-none"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
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
                <p className="mt-3 inline-flex rounded-premium border border-red-300/30 bg-red-950/40 px-3 py-2 text-xs font-bold text-red-100">
                  {trackingError}
                </p>
              )}
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/register" className="btn-premium-primary bg-primary-600">
                Créer un compte
                <ArrowRight size={16} />
              </Link>
              <Link to="/track" className="btn-premium-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                Tracking public
              </Link>
              <a
                href="https://wa.me/212701212524"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium-secondary border-white/20 bg-white/10 text-white hover:bg-[#25D366] hover:text-white"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.16 }}
            className="surface border-white/20 bg-white/94 p-4 text-slate-950 shadow-premium-xl dark:bg-slate-950/92 dark:text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Live operations</p>
                <h2 className="mt-1 text-xl font-black">Tour de contrôle</h2>
              </div>
              <StatusBadge status="IN_TRANSIT" />
            </div>

            <div className="mt-4">
              <ProgressRoute status="IN_TRANSIT" fromLabel="Entrepôt" toLabel="Client" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['198k', 'Colis livrés'],
                ['99%', 'À temps'],
                ['405', 'Zones'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-premium border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xl font-black">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {[
                ['QS-849201', 'Casablanca -> Rabat', 'OUT_FOR_DELIVERY'],
                ['QS-532840', 'Marrakech -> Agadir', 'ARRIVED_AT_HUB'],
                ['QS-118902', 'Tanger -> Fès', 'DELIVERED'],
              ].map(([id, route, status]) => (
                <div key={id} className="flex items-center justify-between gap-3 rounded-premium border border-slate-200 p-3 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-black text-primary-700 dark:text-primary-300">{id}</p>
                    <p className="text-xs font-medium text-slate-500">{route}</p>
                  </div>
                  <StatusBadge status={status} compact />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
        {[
          { icon: PackageCheck, title: 'Tracking central', text: 'Un suivi lisible et actionnable dès le premier écran.' },
          { icon: Truck, title: 'Assignation livreur', text: 'Pilotage des tournées et statuts terrain.' },
          { icon: Building2, title: 'Hub & stockage', text: 'Vision claire des étapes logistiques.' },
          { icon: Download, title: 'Rapports PDF', text: 'Exports opérationnels et financiers.' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="surface p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-premium bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                <Icon size={21} />
              </div>
              <h3 className="mt-4 font-black text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-primary-700 dark:text-primary-300">Sur le terrain</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">
                Une expérience visuelle qui montre vraiment la livraison.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400">
              La page met désormais en avant les deux moments clés du service : la remise client et le traitement en hub.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {imageStories.map((story) => (
              <figure key={story.title} className="group overflow-hidden rounded-premium border border-slate-200 bg-slate-950 shadow-premium-lg dark:border-slate-800">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/86 via-slate-950/18 to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="text-2xl font-black">{story.title}</h3>
                    <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-200">{story.text}</p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary-700 dark:text-primary-300">Workflow</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Un parcours colis pensé comme une chaîne d'opérations.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Chaque écran a été conçu pour réduire les clics inutiles: création rapide, suivi clair, attribution immédiate et reporting prêt à partager.
            </p>
            <button onClick={() => setVideoOpen(true)} className="btn-premium-secondary mt-6" type="button">
              <Play size={16} />
              Voir la démonstration
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['01', 'Créer', 'Saisir destinataire, poids et itinéraire.'],
              ['02', 'Attribuer', 'Assigner un livreur selon la charge.'],
              ['03', 'Acheminer', 'Suivre collecte, hub et transit.'],
              ['04', 'Livrer', 'Clôturer avec statut et ticket.'],
            ].map(([step, title, text]) => (
              <div key={step} className="surface p-5">
                <span className="text-xs font-black text-primary-700 dark:text-primary-300">{step}</span>
                <h3 className="mt-3 text-xl font-black text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary-700 dark:text-primary-300">Tarifs</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Simulateur de coûts.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Choisissez une destination et visualisez instantanément le tarif AFRIDEEX disponible au Maroc.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[34rem]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input className="input-premium pl-10" placeholder="Rechercher une destination" value={rateSearch} onChange={(e) => setRateSearch(e.target.value)} />
            </div>
            <select className="input-premium" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="ALL">Toutes destinations</option>
              {foxDeliveryRates.map((rate) => <option key={rate.city} value={rate.city}>{rate.city}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(23rem,0.94fr)] lg:items-stretch">
          <div className="surface overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Grille tarifaire</p>
                <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Destinations disponibles</h3>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary-50 px-3 py-1 text-xs font-black text-secondary-700 dark:bg-secondary-950/40 dark:text-secondary-300">
                <MapPin size={13} />
                {filteredRates.length} / {foxRatesMeta.uniqueCities} affichée{filteredRates.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="max-h-[42rem] overflow-auto">
              <table className="w-full min-w-[38rem] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-slate-950 text-xs font-black uppercase tracking-wider text-white dark:bg-slate-950">
                    <th className="px-5 py-4">Destination</th>
                    <th className="px-5 py-4 text-right">Frais livraison</th>
                    <th className="px-5 py-4 text-right">Frais retour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRates.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-sm font-semibold text-slate-400">Aucun tarif ne correspond à vos critères.</td>
                    </tr>
                  ) : (
                    filteredRates.map((rate) => (
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
          </div>

          <MoroccoCoverageMap />
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary-300">Performance</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Une interface faite pour l'exploitation quotidienne.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Truck, value: '198,521', label: 'Colis livrés' },
              { icon: Users, value: '2,720', label: 'Clients actifs' },
              { icon: MapPin, value: '405', label: 'Zones couvertes' },
              { icon: Award, value: '99%', label: 'Livraisons à temps' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-premium border border-white/10 bg-white/8 p-5">
                  <Icon size={22} className="text-primary-300" />
                  <p className="mt-4 text-3xl font-black">{item.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-300">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-wider text-primary-700 dark:text-primary-300">FAQ</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">Questions fréquentes</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.q} className="surface overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-black text-slate-950 dark:text-white"
                type="button"
              >
                {faq.q}
                <span className="text-primary-700">{openFaq === index ? '-' : '+'}</span>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-500 dark:border-slate-800 dark:text-slate-400"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-premium bg-primary-600 p-8 text-white shadow-premium-xl lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-black">Prêt à piloter vos expéditions ?</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-blue-50">Créez un compte et accédez à la nouvelle console AFRIDEEX.</p>
          </div>
          <Link to="/register" className="btn-premium-primary bg-white text-slate-950 hover:bg-blue-50">
            Démarrer
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <BrandLogo variant="auto" />
          </div>
          <p className="text-xs font-medium text-slate-400">© {new Date().getFullYear()} AFRIDEEX. Tous droits réservés.</p>
          <div className="flex gap-5 text-xs font-bold text-slate-500">
            <a href="#" className="hover:text-primary-700">Conditions</a>
            <a href="#" className="hover:text-primary-700">Confidentialité</a>
            <a href="#" className="hover:text-primary-700">Assistance</a>
          </div>
        </div>
      </footer>

      {videoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-premium border border-white/10 bg-black shadow-premium-xl">
            <button onClick={() => setVideoOpen(false)} className="absolute right-4 top-4 z-10 icon-button bg-slate-900/70 text-white" type="button" aria-label="Fermer">
              <X size={18} />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="AFRIDEEX Video Presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

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


