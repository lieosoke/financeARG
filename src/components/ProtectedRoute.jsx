import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-dark-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access if required
    if (requiredRoles.length > 0 && user) {
        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            return (
                <div className="min-h-screen bg-dark-primary flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h1>
                        <p className="text-gray-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;
