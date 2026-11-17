
import { Outlet,Navigate } from "react-router-dom";
import LandingNavbar from "./LandigNavbar";
import HomeNavbar from "./HomeNavbar";
import { useSelector } from "react-redux";
import Footer from "./Footer";
import React from "react";


function CustomerLayout() {

    const { isAuthenticated: isUserAuthenticated } = useSelector((state) => state.auth);

    const { isAuthenticated: isAdminAuthenticated, admin } = useSelector((state) => state.adminAuth);

    // Admin cannot access customer website
    if (isAdminAuthenticated && admin?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <>
            {isUserAuthenticated ? (
                <HomeNavbar />
            ) : (
                <LandingNavbar />
            )}

            <Outlet />

            <Footer />
        </>
    );
}

export default CustomerLayout;