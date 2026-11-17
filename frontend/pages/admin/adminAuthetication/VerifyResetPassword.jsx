
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";


import { adminVerifyForgotPasswordOTP,adminResendForgotPasswordOTP } from "../../../features/adminfeatures/adminAuthSlice";
import "./VerifyResetPassword.css";

function VerifyResetPassword() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const {
        verifyResetLoading,
        verifyResetError,
        loading,
        
    } = useSelector((state) => state.adminAuth);

    const [otp, setOtp] = useState("");
    const inputRefs = useRef([]);
    const [countdown, setCountdown] = useState(25);

    // COUNTDOWN TIMER
    useEffect(() => {

        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((previous) => previous - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [countdown]);


    // VERIFY OTP
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const result = await dispatch(
                adminVerifyForgotPasswordOTP({
                    email,
                    otp
                })
            ).unwrap();

            navigate("/admin/reset-password");

        } catch (error) {

            console.log(error);

        }
    };


    // RESEND OTP
    const handleResendOTP = async () => {

        if (countdown > 0 || loading) return;

        try {

            await dispatch(
                adminResendForgotPasswordOTP(email)
            ).unwrap();

            setOtp("");

            inputRefs.current[0]?.focus();

            setCountdown(25);

        } catch (error) {

            console.log(error);

        }
    };


    // CHECK EMAIL
    if (!email) {

        return (

            <div className="forgot-container">

                <div className="forgot-form">

                    <p>Please enter your email first.</p>

                    <Link to="/admin/forgot-password">
                        Go to Forgot Password
                    </Link>

                </div>

            </div>
        );
    }


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

                <h2>Verify OTP</h2>

                <p>
                    Enter the 6-digit OTP sent to
                    <strong> {email}</strong>
                </p>


                {/* OTP INPUT BOXES */}

                <div className="otp-input-group">

                    {Array.from({ length: 6 }).map((_, index) => (

                        <input
                            key={index}

                            ref={(element) => {
                                inputRefs.current[index] = element;
                            }}

                            type="text"
                            value={otp[index] || ""}
                            maxLength={1}
                            inputMode="numeric"

                            onChange={(e) => {

                                const digit = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(-1);

                                const updatedOTP = otp.split("");

                                updatedOTP[index] = digit;

                                const newOTP = updatedOTP.join("").slice(0, 6);

                                setOtp(newOTP);

                                if (digit && index < 5) {
                                    inputRefs.current[index + 1]?.focus();
                                }

                            }}

                            onKeyDown={(e) => {

                                if (
                                    e.key === "Backspace" &&
                                    !otp[index] &&
                                    index > 0
                                ) {
                                    inputRefs.current[index - 1]?.focus();
                                }

                            }}
                        />

                    ))}

                </div>


                {/* VERIFY ERROR */}
                {verifyResetError && (

                <p className="error-message">

                    {typeof verifyResetError === "string"
                        ? verifyResetError
                        : verifyResetError.otp ||
                        verifyResetError.email||
                        verifyResetError.message ||
                        verifyResetError.detail ||
                        verifyResetError.non_field_errors||
                        "OTP verification failed."
                    }

                </p>

            )}


            


                {/* VERIFY BUTTON */}

                <button
                    type="submit"
                    disabled={verifyResetLoading || otp.length !== 6}
                >

                    {verifyResetLoading
                        ? "Verifying..."
                        : "Verify OTP"}

                </button>


                {/* RESEND OTP COUNTDOWN */}

                {countdown > 0 ? (

                    <p>
                        Resend OTP in {countdown} seconds
                    </p>

                ) : (

                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                    >

                        {loading ? "Sending..." : "Resend OTP"}

                    </button>

                )}




            
            </form>

        </div>
    );
}

export default VerifyResetPassword;
