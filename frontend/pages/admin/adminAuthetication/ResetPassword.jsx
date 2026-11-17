
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { adminResetPassword,clearResetPasswordState } from "../../../features/adminfeatures/adminAuthSlice";
import "./ResetPassword.css";
import { EyeOff,Eye } from "lucide-react";
function ResetPassword() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    

    const reduxResetToken = useSelector(
        (state) => state.adminAuth.resetToken
    );

    const resetToken =location.state?.resetToken || reduxResetToken;

    const {
        resetPasswordLoading,
        resetPasswordError
    } = useSelector((state) => state.adminAuth);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return;
        }

        try {

            await dispatch(
                adminResetPassword({
                    reset_token: resetToken,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            ).unwrap();

            navigate("/admin/login", {
                replace: true,
                state: {
                    message: "Password reset successfully. Please login."
                }
            });

        } catch (error) {

            console.log(error);

        }
    };


    // CHECK RESET TOKEN

    if (!resetToken) {

        return (

            <div className="forgot-container">

                <div className="forgot-form">

                    <p>
                        Reset authorization is missing or expired.
                    </p>

                    <Link to="/admin/forgot-password">
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
                    Create a new password for your admin account.
                </p>


                {/* NEW PASSWORD */}

                <label>New Password</label>

                <div className="password-input-wrapper">
                <input
                    type={showNewPassword?"text":"password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {setNewPassword(e.target.value);dispatch(clearResetPasswordState());}}
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


                {/* CONFIRM PASSWORD */}

                <label>Confirm Password</label>
                <div className="password-input-wrapper">


                <input
                    type={showConfirmPassword?"text":"password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>{ setConfirmPassword(e.target.value);dispatch(clearResetPasswordState())}}
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

                {/* Password match validation */}

                {newPassword &&
                    confirmPassword &&
                    newPassword !== confirmPassword && (

                        <p className="error-message">
                            Passwords do not match.
                        </p>

                    )}



                {resetPasswordError && (

                    <p className="error-message">

                        {resetPasswordError.message ||
                            resetPasswordError.new_password?.[0] ||
                            "Password reset failed."}

                    </p>

                )}


                {/* RESET BUTTON */}

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
