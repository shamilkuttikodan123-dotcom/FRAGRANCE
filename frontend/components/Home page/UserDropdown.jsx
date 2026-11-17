import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/authSlice";
import {
    UserRound,
    Package,
    Heart,
    Wallet,
    Gift,
    MapPin,
    LogOut
} from "lucide-react";

import "./UserDropdown.css";

function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);


    const menuItems = [
        {
            name: "My Profile",
            path: "/profile",
            icon: <UserRound />
        },
        {
            name: "My Orders",
            path: "/my-orders",
            icon: <Package />
        },
        {
            name: "My Wishlist",
            path: "/wishlist",
            icon: <Heart />
        },
        {
            name: "My Wallet",
            path: "/wallet",
            icon: <Wallet />
        },
        {
            name: "Coupons & Referral",
            path: "/coupons-referral",
            icon: <Gift />
        },
        {
            name: "Address Book",
            path: "/address-book",
            icon: <MapPin />
        },
        {
            name: "Sign Out",
            path: "/signout",
            icon: <LogOut />
        }
    ];

    return (
        <div className="user-dropdown-container">

            {/* User Icon */}
            <button
                className="user-icon-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <UserRound size={23} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="user-dropdown">

                    {menuItems.map((item, index) => (
                        <Link
                            to={item.path}
                            key={index}
                            className="dropdown-item"
                            onClick={() => setIsOpen(false)}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    <div className="dropdown-divider"></div>

                </div>
            )}

        </div>
    );
}

export default UserDropdown;