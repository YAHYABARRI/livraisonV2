import { useAuth } from '../context/AuthContext';
import Layout from '../components/Common/Layout';
import LoadingScreen from '../components/Common/LoadingScreen';
import ClientDashboard from '../components/Dashboard/ClientDashboard';
import DriverDashboard from '../components/Dashboard/DriverDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import { BRAND } from '../constants/brand';
import { usePageMeta } from '../hooks/usePageMeta';

const Dashboard = () => {
  usePageMeta({
    title: `Dashboard - ${BRAND.name}`,
    description: 'Tableau de bord AFRIDEEX pour piloter colis, statuts, livreurs, rapports et opérations de livraison.',
    path: '/dashboard',
  });

  const { user, isClient, isDriver, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen label="Chargement de votre session..." />;
  }

  if (!user) return null;

  return (
    <Layout>
      {isClient && <ClientDashboard />}
      {isDriver && <DriverDashboard />}
      {isAdmin && <AdminDashboard />}
    </Layout>
  );
};

export default Dashboard;
