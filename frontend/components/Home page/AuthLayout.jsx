import { Outlet } from "react-router-dom";
import LandingNavbar from "./LandigNavbar";
function AuthLayout() {
    return (
        <>
        <LandingNavbar/>
            <Outlet />
        </>
    );
}

export default AuthLayout;