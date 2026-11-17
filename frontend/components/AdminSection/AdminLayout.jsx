
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";
function AdminLayout() {

    return (

        <div className="admin-layout">

            <AdminSidebar />

            <main className="admin-main-content">

                <div className="admin-page-container">

                    <Outlet />

                </div>

            </main>

        </div>

    );

}

export default AdminLayout;
