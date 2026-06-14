import { useAuth } from '../context/AuthContext';
import Layout from '../components/Common/Layout';
import ClientDashboard from '../components/Dashboard/ClientDashboard';
import DriverDashboard from '../components/Dashboard/DriverDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';

const Dashboard = () => {
  const { user, isClient, isDriver, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutralBg dark:bg-darkBg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <span className="text-sm font-bold text-slate-500">Chargement de votre session...</span>
        </div>
      </div>
    );
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
