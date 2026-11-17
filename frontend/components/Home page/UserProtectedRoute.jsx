
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

function UserProtectedRoute() {

    const { isAuthenticated, user } = useSelector( (state) => state.auth  );

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default UserProtectedRoute;
