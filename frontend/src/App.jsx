import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/Common/ErrorBoundary';
import LoadingScreen from './components/Common/LoadingScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateParcel = lazy(() => import('./pages/Client/CreateParcel'));
const MyParcels = lazy(() => import('./pages/Client/MyParcels'));
const Profile = lazy(() => import('./pages/Profile'));
const TrackParcel = lazy(() => import('./pages/TrackParcel'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminParcels = lazy(() => import('./pages/Admin/AdminParcels'));
const AdminReports = lazy(() => import('./pages/Admin/AdminReports'));
const DriverParcels = lazy(() => import('./pages/Driver/DriverParcels'));

const normalizeRole = (role) => role.replace('ROLE_', '');

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen label="Validation de sécurité..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const hasRole = user.roles.some((role) => allowedRoles.includes(normalizeRole(role)));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingScreen />}>
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
            </Suspense>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
