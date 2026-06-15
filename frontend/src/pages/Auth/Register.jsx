import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import AuthFrame from '../../components/Common/AuthFrame';
import { BRAND } from '../../constants/brand';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { getApiErrorMessage } from '../../utils/apiError';
import { registerSchema } from '../../utils/validators';

const FieldError = ({ error }) => (
  error ? <p className="text-xs font-bold text-red-500">{error.message}</p> : null
);

const normalizeRegisterPayload = (data) => ({
  email: data.email.trim().toLowerCase(),
  password: data.password,
  firstName: data.firstName.trim(),
  lastName: data.lastName.trim(),
  phone: data.phone.trim(),
  role: data.role || 'CLIENT',
});

const Register = () => {
  usePageMeta({
    title: `Créer un compte - ${BRAND.name}`,
    description: 'Créez un compte client ou livreur pour accéder à la console de livraison AFRIDEEX.',
    path: '/register',
  });

  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CLIENT' },
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await signup(normalizeRegisterPayload(data));
      toast.success('Votre compte AFRIDEEX a été créé avec succès. Redirection...');
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      console.error(err);
      const errMsg = getApiErrorMessage(
        err,
        "Impossible de créer le compte. Vérifiez que l'API backend est démarrée."
      );
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <AuthFrame
      eyebrow="Inscription"
      title="Créer un espace AFRIDEEX"
      description="Créez un accès client ou livreur. L'accès administrateur est réservé au compte interne AFRIDEEX."
      footer={(
        <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="font-black text-primary-700 dark:text-primary-300">Se connecter</Link>
        </p>
      )}
    >
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-premium border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Prénom</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input id="firstName" type="text" autoComplete="given-name" placeholder="Jean" className={`input-premium pl-10 ${errors.firstName ? 'border-red-400' : ''}`} {...register('firstName')} />
            </div>
            <FieldError error={errors.firstName} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Nom</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input id="lastName" type="text" autoComplete="family-name" placeholder="Dupont" className={`input-premium pl-10 ${errors.lastName ? 'border-red-400' : ''}`} {...register('lastName')} />
            </div>
            <FieldError error={errors.lastName} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Adresse email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
            <input id="email" type="email" autoComplete="email" placeholder="nom@exemple.com" className={`input-premium pl-10 ${errors.email ? 'border-red-400' : ''}`} {...register('email')} />
          </div>
          <FieldError error={errors.email} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Mot de passe</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`input-premium pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FieldError error={errors.password} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Téléphone</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input id="phone" type="tel" autoComplete="tel" placeholder="0612345678" className={`input-premium pl-10 ${errors.phone ? 'border-red-400' : ''}`} {...register('phone')} />
            </div>
            <FieldError error={errors.phone} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Type de compte</label>
          <select id="role" className={`input-premium ${errors.role ? 'border-red-400' : ''}`} {...register('role')}>
            <option value="CLIENT">Client expéditeur</option>
            <option value="DRIVER">Livreur</option>
          </select>
          <FieldError error={errors.role} />
          <p className="text-xs font-semibold text-slate-400">
            Les comptes administrateurs ne sont pas créés depuis l'inscription publique.
          </p>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-premium-primary w-full">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <User size={18} />}
          {isSubmitting ? 'Création du compte...' : "Créer l'espace"}
        </button>
      </form>
    </AuthFrame>
  );
};

export default Register;
