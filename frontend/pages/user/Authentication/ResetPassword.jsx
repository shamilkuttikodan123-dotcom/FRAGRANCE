
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../../features/authSlice";
import { Eye, EyeOff } from "lucide-react";
import './ResetPassword.css'
function ResetPassword() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const reduxResetToken = useSelector((state) => state.auth.resetToken);

    const resetToken =
        location.state?.resetToken || reduxResetToken;

    const { resetPasswordLoading, resetPasswordError } =
        useSelector((state) => state.auth);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return;
        }

        try {
            await dispatch(
                resetPassword({
                    reset_token: resetToken,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            ).unwrap();

            navigate("/login", {
                replace: true,
                state: {
                    message: "Password reset successfully. Please login."
                }
            });

        } catch (error) {
            console.log(error);
        }
    };

    if (!resetToken) {
        return (
            <div className="forgot-container">
                <div className="forgot-form">
                    <p>Reset authorization is missing or expired.</p>
                    <Link to="/forgot-password">
                        Request a new OTP
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-container">

            <form className="forgot-form" onSubmit={handleSubmit}>

                <h2>Reset Password</h2>

                <p>
                    Create a new password for your account.
                </p>

                <label>New Password</label>

                <div className="password-input-wrapper">

                <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />

                <button
                    type="button"
                    className="password-eye-button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                >
                    {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>

            </div>

                <label>Confirm Password</label>

                <div className="password-input-wrapper">

                <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button
                    type="button"
                    className="password-eye-button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>

            </div>

                {newPassword &&
                    confirmPassword &&
                    newPassword !== confirmPassword && (
                        <p className="error-message">
                            Passwords do not match.
                        </p>
                    )}

                {resetPasswordError && (
                <p className="error-message">
                    {
                        resetPasswordError.errors?.new_password?.[0] ||
                        resetPasswordError.errors?.confirm_password?.[0] ||
                        resetPasswordError.errors?.reset_token?.[0] ||
                        resetPasswordError.errors?.detail ||
                        resetPasswordError.errors?.non_field_errors?.[0] ||
                        resetPasswordError.message ||
                        "Password reset failed. Please try again."
                    }
                </p>
            )}

                <button
                    type="submit"
                    disabled={
                        resetPasswordLoading ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword
                    }
                >
                    {resetPasswordLoading
                        ? "Updating..."
                        : "Reset Password"}
                </button>

            </form>

        </div>
    );
}

export default ResetPassword;
