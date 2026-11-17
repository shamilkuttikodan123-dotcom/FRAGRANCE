
import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    Package,
    Tags,
    Gift,
    ShoppingBag,
    Users,
    TicketPercent,
    RotateCcw,
    Star,
    ChartNoAxesCombined,
    Settings,
    LogOut
} from "lucide-react";

import "./AdminSidebar.css";


function AdminSidebar() {

    const menuItems = [

        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard
        },

        {
            name: "Sales Report",
            path: "/admin/sales-report",
            icon: ChartNoAxesCombined
        },

        {
            name: "Customers",
            path: "/admin/customers",
            icon: Users
        },

        {
            name: "Products",
            path: "/admin/products",
            icon: Package
        },

        {
            name: "Category",
            path: "/admin/category",
            icon: Tags
        },

        {
            name: "Referrals",
            path: "/admin/referrals",
            icon: Gift
        },

        {
            name: "Orders",
            path: "/admin/orders",
            icon: ShoppingBag
        },

        {
            name: "Coupons",
            path: "/admin/coupens",
            icon: TicketPercent
        },

        {
            name: "Returns",
            path: "/admin/returns",
            icon: RotateCcw
        },

        {
            name: "Reviews",
            path: "/admin/reviews",
            icon: Star
        },
        {
            name: 'Sign Out',
            path: '/admin/signout',
            icon:LogOut
            }

    ];


    return (

        <aside className="admin-sidebar">


            {/* BRAND */}

            <div className="admin-sidebar-brand">

                <div className="admin-brand-icon">
                    <span>✦</span>
                </div>

                <div className="admin-brand-text">

                    <h2>FRAGRANCE</h2>

                <p>LUXURY PERFUMERY</p>

                </div>

            </div>


            {/* MENU */}

            <nav className="admin-sidebar-menu">

                {menuItems.map((item) => {

                    const Icon = item.icon;

                    return (

                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === "/admin/dashboard"}
                            className={({ isActive }) =>
                                `admin-sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >

                            <Icon
                                size={17}
                                strokeWidth={1.8}
                            />

                            <span>{item.name}</span>

                        </NavLink>

                    );

                })}

            </nav>



          

        </aside>

    );

}

export default AdminSidebar;
