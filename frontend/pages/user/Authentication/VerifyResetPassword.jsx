import { useState, useRef,useEffect } from "react";import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {verifyForgotPasswordOTP,resendForgotPasswordOTP,clearAuthErrors} from "../../../features/authSlice";import './VerifyResetPassword.css'
function VerifyResetPassword() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();


    const email = location.state?.email || "";

    const { verifyResetLoading,
         verifyResetError,
          resendForgotPasswordLoading,
          resendForgotPasswordError} = useSelector((state) => state.auth);

    const [otp, setOtp] = useState("");
    const inputRefs = useRef([]);




        // Unique localStorage key for each email
    const timerKey = `forgot_otp_resend_expiry_${email}`;

    // Get remaining countdown from localStorage
    const [countdown, setCountdown] = useState(() => {

        if (!email) return 0;

        const savedExpiry = localStorage.getItem(timerKey);

        if (savedExpiry) {

            const remaining = Math.ceil(
                (Number(savedExpiry) - Date.now()) / 1000
            );

            return Math.max(0, remaining);
        }

        // First time page opens
        const expiryTime = Date.now() + 25 * 1000;

        localStorage.setItem(timerKey, expiryTime);

        return 25;
    });


    useEffect(() => {
            dispatch(clearAuthErrors());
        }, [dispatch]);
    

        useEffect(() => {

            if (!email) return;

            const timer = setInterval(() => {

                const savedExpiry = localStorage.getItem(timerKey);

                if (!savedExpiry) {
                    setCountdown(0);
                    return;
                }

                const remaining = Math.ceil(
                    (Number(savedExpiry) - Date.now()) / 1000
                );

                setCountdown(Math.max(0, remaining));

            }, 1000);

            return () => clearInterval(timer);

        }, [email, timerKey]);



    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const result = await dispatch(
                verifyForgotPasswordOTP({
                    email,
                    otp
                })
            ).unwrap();

            navigate("/login/reset-password", {
                state: {
                    resetToken: result.reset_token
                }
            });

        } catch (error) {
            console.log(error);
        }
    };


    const handleResendOTP = async () => {

    if (countdown > 0 || resendForgotPasswordLoading) return;
        dispatch(clearAuthErrors());


    try {

        await dispatch(
            resendForgotPasswordOTP(email)
        ).unwrap();

        setOtp("");

        inputRefs.current[0]?.focus();
        const expiryTime = Date.now() + 25 * 1000;

        localStorage.setItem(timerKey, expiryTime);

        setCountdown(25);

    } catch (error) {

        console.log(error);

    }
};
    if (!email) {
        return (
            <div className="forgot-container">
                <div className="forgot-form">
                    <p>Please enter your email first.</p>
                    <Link to="/forgot-password">
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
                onClick={() => navigate('/login')}
                type="button"
            >
                ×
            </button>

                <h2>Verify OTP</h2>

                <p>
                    Enter the 6-digit OTP sent to
                    <strong> {email}</strong>
                </p>

                {/* OTP Input Boxes */}

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

                            const digit = e.target.value.replace(/\D/g, "").slice(-1);

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

                {verifyResetError && (
                    <p className="error-message">
                        {verifyResetError.otp ||
                        verifyResetError.email ||
                        "OTP verification failed."}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={verifyResetLoading || otp.length !== 6}
                >
                    {verifyResetLoading ? "Verifying..." : "Verify OTP"}
                </button>
                        {countdown > 0 ? (

                        <p>
                            Resend OTP in {countdown} seconds
                        </p>

                    ) : (

                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendForgotPasswordLoading}
                        >
                            {resendForgotPasswordLoading ? "Sending..." : "Resend OTP"}
                        </button>

                    )}

                    {resendForgotPasswordError && (
                            <p className="error-message">
                                {resendForgotPasswordError.message ||
                                "Unable to resend OTP."}
                            </p>
                        )}

            </form>

       



        </div>
    );
}

export default VerifyResetPassword;
