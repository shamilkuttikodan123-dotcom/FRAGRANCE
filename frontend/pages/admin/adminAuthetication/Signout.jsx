
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminLogout } from '../../../features/adminfeatures/adminAuthSlice';
import './Signout.css';

function Signout() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showConfirm, setShowConfirm] = useState(true);

    // CANCEL SIGNOUT
    const handleCancel = () => {

        setShowConfirm(false);

        navigate('/admin/dashboard', {
            replace: true
        });

    };

    // CONFIRM SIGNOUT
    const handleSignout = () => {

        dispatch(adminLogout());

        navigate('/admin/login', {
            replace: true
        });

    };

    return (

        <div className="admin-signout-page">

            {showConfirm && (

                <div className="signout-overlay">

                    <div className="signout-modal">

                        <div className="signout-icon">
                            <span>!</span>
                        </div>

                        <h2>Sign Out?</h2>

                        <p>
                            Are you sure you want to sign out
                            from your admin account?
                        </p>

                        <div className="signout-actions">

                            <button
                                className="signout-cancel-btn"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>

                            <button
                                className="signout-confirm-btn"
                                onClick={handleSignout}
                            >
                                Yes, Sign Out
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Signout;
