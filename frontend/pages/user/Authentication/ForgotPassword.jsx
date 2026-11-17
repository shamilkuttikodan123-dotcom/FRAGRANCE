
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../../../features/authSlice";
import './ForgotPassword.css'
function ForgotPassword() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { forgotPasswordLoading, forgotPasswordError } =
        useSelector((state) => state.auth);

    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await dispatch(forgotPassword(email)).unwrap();
            localStorage.removeItem(`forgot_otp_resend_expiry_${email}`);
            navigate("/login/verify-reset-password", {
                state: { email }
            });

        } catch (error) {
            console.log(error);
        }
    };

    return (

        <div className="forgot-container">
          

            <form className="forgot-form" onSubmit={handleSubmit}>
                  <button
                className="forgot-close-button"
                onClick={() => navigate('/login')}
                type="button"
            >
                ×
            </button>

                <h2>Forgot Password?</h2>

                <p>
                    Enter your registered email address.
                    We will send you an OTP to reset your password.
                </p>

                <label>Email Address</label>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                {forgotPasswordError && (
                    <p className="error-message">
                        {forgotPasswordError.message ||
                            forgotPasswordError.email?.[0] ||
                            "Unable to process your request."}
                    </p>
                )}

                <button type="submit" disabled={forgotPasswordLoading}>
                    {forgotPasswordLoading ? "Sending..." : "Send OTP"}
                </button>

    

            </form>

        </div>
    );
}

export default ForgotPassword;
