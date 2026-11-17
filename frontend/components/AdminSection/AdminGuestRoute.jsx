
// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// function AdminGuestRoute() {

//     const { isAuthenticated, admin } = useSelector(
//         (state) => state.adminAuth
//     );

//     // Already logged in admin
//     if (isAuthenticated && admin?.role === "admin") {
//         return (
//             <Navigate
//                 to="/admin/dashboard"
//                 replace
//             />
//         );
//     }

//     return <Outlet />;

// }

// export default AdminGuestRoute;

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminGuestRoute() {

    // Admin authentication
    const { isAuthenticated: isAdminAuthenticated, admin } = useSelector((state) => state.adminAuth);

    // Customer authentication
    const { isAuthenticated: isUserAuthenticated } = useSelector((state) => state.auth );

    // Already logged-in admin
    if (isAdminAuthenticated && admin?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Already logged-in customer
    if (isUserAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default AdminGuestRoute;