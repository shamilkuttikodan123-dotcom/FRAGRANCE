import React, { useState,useEffect,useRef } from 'react';
import './Otp.css';
import { useLocation } from 'react-router-dom';
import { verifyOTP,resendOTP,clearAuthErrors } from '../../../features/authSlice';
import { useDispatch,useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
function Otp() {

   
    const location=useLocation()
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const inputRefs = useRef([]);
    const email=location.state?.email

    const {verifyLoading,
        verifyError,
        verifySuccess,
        resendLoading,
        resendError,
        resendSuccess} = useSelector((state) => state.auth);

    // Unique localStorage key for each email
    const timerKey = `otp_resend_expiry_${email}`;

    const [otp, setOtp] = useState('');

        const [countdown, setCountdown] = useState(() => {

            if (!email) return 0;

            const savedExpiry = localStorage.getItem(timerKey);

            if (savedExpiry) {
                const remaining = Math.ceil(
                    (Number(savedExpiry) - Date.now()) / 1000
                );

                return Math.max(0, remaining);
            }

            const expiryTime = Date.now() + 25 * 1000;

            localStorage.setItem(timerKey, expiryTime);

            return 25;
        });
      useEffect(() => {

            if (!email) return;

            const updateCountdown = () => {

                const savedExpiry = localStorage.getItem(timerKey);

                if (!savedExpiry) {
                    setCountdown(0);
                    return;
                }

                const remaining = Math.ceil(
                    (Number(savedExpiry) - Date.now()) / 1000
                );

                setCountdown(Math.max(0, remaining));
            };

            updateCountdown();

            const timer = setInterval(updateCountdown, 1000);

            return () => clearInterval(timer);

        }, [email, timerKey]);



    const handleVerifyOTP = async () => {
        const otpData = {email: email,otp: otp};
        try {
            await dispatch(verifyOTP(otpData)).unwrap();
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    };

    const handleResendOTP = async () => {

        if (!email) {
            navigate('/signup');
            return;
        }
            dispatch(clearAuthErrors());


        try {
            await dispatch(resendOTP(email)).unwrap();

            setOtp('');

            const expiryTime = Date.now() + 25 * 1000;

            localStorage.setItem(timerKey, expiryTime);

            setCountdown(25);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        dispatch(clearAuthErrors());
    }, [dispatch]);


    return (
        <div className="otp-container">

            <button
                className="otp-close-button"
                onClick={() => navigate('/signup')}
                type="button"
            >
                ×
            </button>



            <h2>Verify Your Email</h2>

            <p>
                Enter the 6-digit verification code
                sent to your email.
            </p>

            <p className="otp-email">
                {email}
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
                        value={otp[index] || ''}
                        maxLength={1}
                        inputMode="numeric"

                        onChange={(e) => {

                            const digit = e.target.value.replace(/\D/g, '');

                            if (!digit) return;

                            const updatedOTP = otp.split('');

                            updatedOTP[index] = digit;

                            const newOTP = updatedOTP.join('').slice(0, 6);

                            setOtp(newOTP);

                            if (index < 5) {
                                inputRefs.current[index + 1]?.focus();
                            }
                        }}

                        onKeyDown={(e) => {

                            if (e.key === 'Backspace') {

                                e.preventDefault();

                                const updatedOTP = otp.split('');

                                if (otp[index]) {
                                    updatedOTP[index] = '';
                                    setOtp(updatedOTP.join(''));
                                }
                                else if (index > 0) {
                                    updatedOTP[index - 1] = '';
                                    setOtp(updatedOTP.join(''));

                                    inputRefs.current[index - 1]?.focus();
                                }
                            }
                        }}
                    />

                ))}

            </div>


            {/* Verify Button */}

            <button
                onClick={handleVerifyOTP}
                disabled={verifyLoading || otp.length !== 6}
            >
                {verifyLoading ? 'Verifying...' : 'Verify OTP'}
            </button>



            {/* Verification Error */}
            {verifyError && (
                <p className="error-message">
                    {verifyError.message ||
                    verifyError.errors?.non_field_errors?.[0] ||
                    'OTP verification failed.'}
                </p>
            )}


            {/* Resend OTP */}

            <p className="resend-text">
                Didn't receive the code?
            </p>

            {countdown > 0 ? (
                    <p>
                        Resend OTP in {countdown} seconds
                    </p>
                ) : (
                    <button
                        className="resend-button"
                        onClick={handleResendOTP}
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
            )}


            {/* Resend Success */}

            {resendSuccess && (
                <p className="success-message">
                    A new OTP has been sent to your email.
                </p>
            )}


            {/* Resend Error */}

            {/* Resend Error */}
            {resendError && (
                <p className="error-message">
                    {resendError.message ||
                    resendError.errors?.email?.[0] ||
                    'Unable to resend OTP. Please try again.'}
                </p>
            )}

        </div>

    );
}

export default Otp;