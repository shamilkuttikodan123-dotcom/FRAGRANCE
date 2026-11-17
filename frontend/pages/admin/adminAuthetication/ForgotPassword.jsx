
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminForgotPassword } from "../../../features/adminfeatures/adminAuthSlice";
import "./ForgotPassword.css";

function ForgotPassword() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error } = useSelector(
        (state) => state.adminAuth
    );

    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            await dispatch(adminForgotPassword(email)).unwrap();

            navigate("/admin/verify-reset-password", {
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
                    onClick={() => navigate("/admin/login")}
                    type="button"
                >
                    ×
                </button>

                <h2>Forgot Password?</h2>

                <p>
                    Enter your registered admin email address.
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

                {error && (
                    <p className="error-message">
                        {typeof error === "string"
                            ? error
                            : error.message ||
                            error.email ||
                            error.detail ||
                            "Unable to process your request."
                        }
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                </button>

            </form>

        </div>
    );
}

export default ForgotPassword;
