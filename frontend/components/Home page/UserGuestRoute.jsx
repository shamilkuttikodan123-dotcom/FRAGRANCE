import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function UserGuestRoute() {

    // Customer authentication
    const { isAuthenticated: isUserAuthenticated } = useSelector(
        (state) => state.auth
    );

    // Admin authentication
    const { isAuthenticated: isAdminAuthenticated, admin } = useSelector(
        (state) => state.adminAuth
    );

    // Admin already logged in
    if (isAdminAuthenticated && admin?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Customer already logged in
    if (isUserAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default UserGuestRoute;