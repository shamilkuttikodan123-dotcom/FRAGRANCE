
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./ChangePassword.css";
import { changePassword,clearPasswordError } from "../../../features/profileSlice";
import { Eye, EyeOff } from "lucide-react";
function ChangePassword({ onClose, onForgotPassword }) {

    const dispatch = useDispatch();

    const { passwordLoading, passwordError } = useSelector(
        (state) => state.profile
    );

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [success, setSuccess] = useState("");
    
    const handleClose = () => {
        dispatch(clearPasswordError())
        onClose();
    };

    const handleSubmit = async (e) => {

        e.preventDefault();



        const passwordData = {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        };

        try {

            const result = await dispatch(
                changePassword(passwordData)
            ).unwrap();

            setSuccess(
                result.message || "Password changed successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Close popup after success
            setTimeout(() => {
                handleClose()
            }, 1000);

        } catch (error) {
           console.log(error)
        }
    };



    return (

        <div
            className="password-popup-overlay"
        >

            <div
                className="password-popup-card"
            >

                <button
                    type="button"
                    className="password-popup-close"
                    onClick={handleClose}
                >
                    &times;
                </button>

                <div className="change-password-container">

                    <h2>Change Password</h2>

                    <form onSubmit={handleSubmit}>

                        <div>
                            <label>Current Password</label>

                            <div className="password-input-wrapper">

                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => {setCurrentPassword(e.target.value) ;dispatch(clearPasswordError())}}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-eye-button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>

                            </div>
                        </div>
                        {passwordError?.current_password && (
                            <p className="error-message">
                                {passwordError.current_password[0]}
                            </p>
                        )}

                        <div className="forgot-password-link">

                            <button
                                type="button"
                                onClick={onForgotPassword}
                            >
                                Forgot Password?
                            </button>

                        </div>

                        <div>
                            <label>New Password</label>

                            <div className="password-input-wrapper">

                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => {setNewPassword(e.target.value); dispatch(clearPasswordError())}}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-eye-button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>

                            </div>
                        </div>
                        {passwordError?.new_password && (
                            <p className="error-message">
                                {passwordError.new_password[0]}
                            </p>
                        )}

                        <div>
                            <label>Confirm New Password</label>

                            <div className="password-input-wrapper">

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => {setConfirmPassword(e.target.value); dispatch(clearPasswordError())}}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-eye-button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>

                            </div>
                        </div>
                        {passwordError?.confirm_password && (
                                <p className="error-message">
                                    {passwordError.confirm_password[0]}
                                </p>
                            )}


                        {success && (
                            <p className="success-message">
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={passwordLoading}
                        >
                            {passwordLoading
                                ? "Updating..."
                                : "Update Password"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default ChangePassword;
