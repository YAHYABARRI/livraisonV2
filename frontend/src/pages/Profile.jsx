import { useEffect, useState } from 'react';
import { Edit3, Loader2, Mail, Phone, Save, Shield, User, X } from 'lucide-react';
import Layout from '../components/Common/Layout';
import { BRAND } from '../constants/brand';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { authService } from '../services/api';
import { PageHeader, SectionHeader } from '../components/Common/LogisticsUI';

const getRoleLabel = (roles = []) => {
  if (roles.some((role) => role.includes('ADMIN'))) return 'Administrateur';
  if (roles.some((role) => role.includes('DRIVER'))) return 'Livreur';
  return 'Client';
};

const Profile = () => {
  usePageMeta({
    title: `Profil - ${BRAND.name}`,
    description: 'Gérez vos informations de compte AFRIDEEX utilisées pour les expéditions, notifications et opérations.',
    path: '/profile',
  });

  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) {
      toast.warning('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      await authService.updateProfile({ firstName, lastName, phone });
      await refreshUser();
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès.');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8 text-left">
        <PageHeader
          eyebrow="Compte"
          icon={User}
          title="Profil utilisateur"
          description="Gérez les informations personnelles utilisées pour vos expéditions, affectations et notifications."
          actions={
            !isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn-premium-primary" type="button">
                <Edit3 size={16} />
                Modifier
              </button>
            ) : (
              <>
                <button onClick={handleCancel} className="btn-premium-secondary" type="button">
                  <X size={16} />
                  Annuler
                </button>
                <button onClick={handleSave} disabled={loading} className="btn-premium-primary" type="button">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Enregistrer
                </button>
              </>
            )
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
          <section className="surface overflow-hidden">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <SectionHeader title="Informations générales" description="Ces données sont visibles dans les opérations liées au compte." />
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:p-6">
              <div className="space-y-1.5">
                <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Prénom</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-premium pl-10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-950/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Nom</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-premium pl-10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-950/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Adresse email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="input-premium pl-10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-950/40"
                  />
                </div>
                <p className="text-xs font-medium text-slate-400">L'adresse email sert d'identifiant et ne peut pas être modifiée.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Téléphone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-premium pl-10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-950/40"
                  />
                </div>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="surface p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-premium bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                  <Shield size={22} />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Rôle attribué</p>
                  <p className="text-lg font-black text-slate-950 dark:text-white">{getRoleLabel(user.roles)}</p>
                </div>
              </div>
            </div>

            <div className="surface p-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Identité</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-premium bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                  {firstName?.[0]}{lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950 dark:text-white">{firstName} {lastName}</p>
                  <p className="truncate text-sm font-medium text-slate-400">{user.email}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
