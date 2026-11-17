
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminProtectedRoute() {

    const { isAuthenticated, admin } = useSelector((state) => state.adminAuth);


    // CHECK ADMIN LOGIN
    if (!isAuthenticated) {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );

    }


    // CHECK ADMIN USER
    if (!admin || admin.role !== "admin") {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );

    }

    return <Outlet/>;

}

export default AdminProtectedRoute;
