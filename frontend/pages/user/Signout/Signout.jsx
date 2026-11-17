import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../features/authSlice";
import {
    LogOut,
    X,
    AlertCircle
} from "lucide-react";

import "./Signout.css";

function Signout() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate(-1);
    };

    const handleLogout=()=>{

      dispatch(logout())
      navigate("/login", { replace: true });

    }

  

    return (
        <div className="signout-overlay">

            <div className="signout-popup">

                {/* Close Button */}
                <button
                    className="signout-close"
                    onClick={handleCancel}
                    type="button"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="signout-icon">
                    <LogOut size={32} />
                </div>

                {/* Content */}
                <div className="signout-content">

                    <h2>Sign Out?</h2>

                    <p>
                        Are you sure you want to sign out
                        from your FRAGRANCE account?
                    </p>

                    <div className="signout-info">
                        <AlertCircle size={17} />
                        <span>
                            You will need to sign in again to access your account.
                        </span>
                    </div>

                </div>

                {/* Buttons */}
                <div className="signout-actions">

                    <button
                        type="button"
                        className="signout-cancel-btn"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="signout-confirm-btn"
                        onClick={handleLogout}
                    >
                        <LogOut size={17} />
                        Sign Out
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Signout;