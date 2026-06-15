import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import AuthFrame from '../../components/Common/AuthFrame';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginSchema } from '../../utils/validators';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter.');
    }
  }, [searchParams, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await login(data);
      toast.success('Ravi de vous revoir. Connexion réussie.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Identifiants incorrects ou connexion au serveur impossible.';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <AuthFrame
      eyebrow="Connexion"
      title="Accéder à la console"
      description="Retrouvez vos colis, tournées, rapports et actions prioritaires dans votre espace AFRIDEEX."
      footer={(
        <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          Vous n'avez pas de compte ?{' '}
          <Link to="/register" className="font-black text-primary-700 dark:text-primary-300">S'inscrire</Link>
        </p>
      )}
    >
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-premium border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Adresse email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              id="email"
              type="email"
              placeholder="nom@exemple.com"
              className={`input-premium pl-10 ${errors.email ? 'border-red-400' : ''}`}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs font-bold text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Mot de passe</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
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
          {errors.password && <p className="text-xs font-bold text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-premium-primary w-full">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
          {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </AuthFrame>
  );
};

export default Login;
