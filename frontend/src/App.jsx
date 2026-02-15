import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Ładowanie...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
    return children;
}

export default function App() {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading">Ładowanie Med-Verify PRO...</div>;

    function getDashboardRedirect() {
        if (!user) return '/login';
        if (user.role === 'DOCTOR') return '/doctor';
        if (user.role === 'ADMIN') return '/admin';
        return '/patient';
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to={getDashboardRedirect()} /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to={getDashboardRedirect()} /> : <RegisterPage />} />
            <Route
                path="/patient"
                element={
                    <ProtectedRoute roles={['PATIENT']}>
                        <PatientDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/doctor"
                element={
                    <ProtectedRoute roles={['DOCTOR']}>
                        <DoctorDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to={getDashboardRedirect()} />} />
        </Routes>
    );
}
