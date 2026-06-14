import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import CreateParcel from './pages/Client/CreateParcel';
import MyParcels from './pages/Client/MyParcels';
import Profile from './pages/Profile';
import TrackParcel from './pages/TrackParcel';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminParcels from './pages/Admin/AdminParcels';
import AdminReports from './pages/Admin/AdminReports';
import DriverParcels from './pages/Driver/DriverParcels';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutralBg dark:bg-darkBg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <span className="text-sm font-bold text-slate-500">Validation de sécurité...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const hasRole = user.roles.some((role) => allowedRoles.includes(role.replace('ROLE_', '')));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track" element={<TrackParcel />} />
            <Route path="/track/:trackingNumber" element={<TrackParcel />} />

            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/create-parcel"
              element={(
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <CreateParcel />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/my-parcels"
              element={(
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <MyParcels />
                </ProtectedRoute>
              )}
            />

            <Route
              path="/driver/parcels"
              element={(
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <DriverParcels />
                </ProtectedRoute>
              )}
            />

            <Route
              path="/admin/users"
              element={(
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/parcels"
              element={(
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminParcels />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/reports"
              element={(
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminReports />
                </ProtectedRoute>
              )}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
