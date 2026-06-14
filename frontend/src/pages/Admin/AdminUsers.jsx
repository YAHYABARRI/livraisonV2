import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Mail, Phone, Search, Users } from 'lucide-react';
import Layout from '../../components/Common/Layout';
import EmptyState from '../../components/Common/EmptyState';
import { SkeletonTable } from '../../components/Common/Skeleton';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader, SectionHeader } from '../../components/Common/LogisticsUI';

const getRoleBadge = (roles = []) => {
  if (roles.some((role) => role.includes('ADMIN'))) {
    return <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-700 ring-1 ring-red-200 dark:bg-red-950/25 dark:text-red-300 dark:ring-red-900/50">Admin</span>;
  }
  if (roles.some((role) => role.includes('DRIVER'))) {
    return <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/25 dark:text-amber-300 dark:ring-amber-900/50">Livreur</span>;
  }
  return <span className="inline-flex rounded-full bg-primary-50 px-2.5 py-1 text-xs font-black text-primary-700 ring-1 ring-primary-200 dark:bg-primary-950/25 dark:text-primary-300 dark:ring-primary-900/50">Client</span>;
};

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 7;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les utilisateurs.');
      toast.error('Erreur de récupération des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return u.email?.toLowerCase().includes(term) || u.firstName?.toLowerCase().includes(term) || u.lastName?.toLowerCase().includes(term);
  });
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <Layout>
      <div className="space-y-8 text-left">
        <PageHeader
          eyebrow="Administration"
          icon={Users}
          title="Gestion des utilisateurs"
          description="Visualisez les clients, livreurs et administrateurs enregistrés sur la plateforme."
        />

        <section className="surface p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur par nom, prénom ou email"
              className="input-premium pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="rounded-premium border border-red-200 bg-red-50 p-6 text-center font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState title="Aucun utilisateur trouvé" description="Ajustez la recherche pour afficher d'autres résultats." />
        ) : (
          <section className="space-y-4">
            <div className="surface overflow-hidden">
              <div className="border-b border-slate-100 p-5 dark:border-slate-800">
                <SectionHeader title="Annuaire plateforme" description={`${filteredUsers.length} utilisateur(s) dans la vue actuelle.`} />
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Type de compte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-premium bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-850 dark:text-white">{u.firstName} {u.lastName}</p>
                              <p className="text-xs font-medium text-slate-400">ID #{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-2"><Mail size={14} />{u.email}</span>
                        </td>
                        <td className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-2"><Phone size={14} />{u.phone || 'Non renseigné'}</span>
                        </td>
                        <td>{getRoleBadge(u.roles)}</td>
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
      </div>
    </Layout>
  );
};

export default AdminUsers;
