import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  PackagePlus,
  Phone,
  Scale,
  User,
} from 'lucide-react';
import Layout from '../../components/Common/Layout';
import { parcelService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { parcelSchema } from '../../utils/validators';
import { PageHeader, SectionHeader } from '../../components/Common/LogisticsUI';

const FieldError = ({ error }) => (
  error ? <p className="text-xs font-bold text-red-500">{error.message}</p> : null
);

const CreateParcel = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      description: '',
      weight: '',
    },
  });

  const onSubmit = async (data) => {
    setError(null);

    const payload = { ...data };

    try {
      const response = await parcelService.create(payload);
      toast.success(`Colis créé avec succès. Suivi : ${response.trackingNumber}`);
      setTimeout(() => {
        navigate('/my-parcels');
      }, 1600);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement du colis.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 text-left">
        <PageHeader
          eyebrow="Nouvelle commande"
          icon={PackagePlus}
          title="Expédier un colis"
          description="Créez une expédition avec les informations destinataire, colis et itinéraire. Le backend et la tarification restent inchangés."
        />

        {error && (
          <div className="flex items-start gap-3 rounded-premium border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_18rem]">
          <form onSubmit={handleSubmit(onSubmit)} className="surface overflow-hidden">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <SectionHeader title="Informations d'expédition" description="Les champs requis permettent d'enregistrer et programmer le colis." />
            </div>

            <div className="space-y-8 p-5 lg:p-6">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-premium bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">1</span>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Destinataire</h3>
                </div>

                <div className="max-w-sm">
                  <div className="space-y-1.5">
                    <label htmlFor="recipientName" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Nom du destinataire
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        id="recipientName"
                        type="text"
                        placeholder="Jean Martin"
                        className={`input-premium pl-10 ${errors.recipientName ? 'border-red-400' : ''}`}
                        {...register('recipientName')}
                      />
                    </div>
                    <FieldError error={errors.recipientName} />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="recipientPhone" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        id="recipientPhone"
                        type="tel"
                        placeholder="0612345678"
                        className={`input-premium pl-10 ${errors.recipientPhone ? 'border-red-400' : ''}`}
                        {...register('recipientPhone')}
                      />
                    </div>
                    <FieldError error={errors.recipientPhone} />
                  </div>
                </div>
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-premium bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">2</span>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Colis</h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="weight" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Poids en kg (max 5 kg)
                    </label>
                    <div className="relative">
                      <Scale size={18} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="5"
                        placeholder="1.5"
                        className={`input-premium pl-10 ${errors.weight ? 'border-red-400' : ''}`}
                        {...register('weight')}
                      />
                    </div>
                    <FieldError error={errors.weight} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                    Description du contenu
                  </label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    <textarea
                      id="description"
                      rows="3"
                      placeholder="Contenu fragile, documents importants..."
                      className="input-premium pl-10"
                      {...register('description')}
                    />
                  </div>
                  <FieldError error={errors.description} />
                </div>
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-premium bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">3</span>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Itinéraire</h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="pickupAddress" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Adresse de collecte
                    </label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        id="pickupAddress"
                        type="text"
                        placeholder="12 Rue de la Paix, 75002 Paris"
                        className={`input-premium pl-10 ${errors.pickupAddress ? 'border-red-400' : ''}`}
                        {...register('pickupAddress')}
                      />
                    </div>
                    <FieldError error={errors.pickupAddress} />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="deliveryAddress" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Adresse de livraison
                    </label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        id="deliveryAddress"
                        type="text"
                        placeholder="45 Avenue des Champs-Élysées, 75008 Paris"
                        className={`input-premium pl-10 ${errors.deliveryAddress ? 'border-red-400' : ''}`}
                        {...register('deliveryAddress')}
                      />
                    </div>
                    <FieldError error={errors.deliveryAddress} />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => navigate('/my-parcels')} className="btn-premium-secondary">
                Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-premium-primary">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <PackagePlus size={18} />}
                {isSubmitting ? 'Création du colis...' : "Confirmer l'expédition"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            {[
              ['1', 'Créer', 'Enregistrement de la commande'],
              ['2', 'Attribuer', 'Affectation par l’équipe admin'],
              ['3', 'Acheminer', 'Suivi en temps réel'],
              ['4', 'Livrer', 'Clôture et ticket'],
            ].map(([step, title, desc]) => (
              <div key={step} className="surface p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-premium bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                    {step}
                  </span>
                  <div>
                    <p className="font-extrabold text-slate-950 dark:text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="surface border-secondary-200 bg-secondary-50 p-4 text-secondary-800 dark:border-secondary-900/60 dark:bg-secondary-950/25 dark:text-secondary-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                <p className="text-sm font-bold leading-6">
                  Les informations saisies alimentent directement le tracking et le ticket du colis.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default CreateParcel;
