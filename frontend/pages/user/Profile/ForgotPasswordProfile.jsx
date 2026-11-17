
import React, { useState, useEffect,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchProfile,
    sendProfileForgotPasswordOTP,
    verifyProfileForgotPasswordOTP,
    resendProfileForgotPasswordOTP,
    resetProfilePassword,
    clearPasswordError
} from "../../../features/profileSlice";
import { Eye, EyeOff } from "lucide-react";
import "./ForgotPasswordProfile.css";

function ForgotPasswordProfile({ onClose }) {

          const dispatch = useDispatch();

        const {
            profile,
            profileLoading,

            profileForgotLoading,
            profileForgotError,

            profileVerifyResetLoading,
            profileVerifyResetError,

            profileResendOTPLoading,
            profileResendOTPError,

            profileResetLoading,
            profileResetError
        } = useSelector((state) => state.profile);


          const [step, setStep] = useState(1);

          const [email, setEmail] = useState("");
          const [otp, setOtp] = useState("");
          const inputRefs = useRef([]);


          const [showNewPassword, setShowNewPassword] = useState(false);
          const [showConfirmPassword, setShowConfirmPassword] = useState(false);


          const [newPassword, setNewPassword] = useState("");
          const [confirmPassword, setConfirmPassword] = useState("");

          const [success, setSuccess] = useState("");

            // OTP Countdown
            const [countdown, setCountdown] = useState(0);

          // Fetch logged-in user's profile
          useEffect(() => {
              dispatch(fetchProfile());
          }, [dispatch]);


          // Automatically set current email
          useEffect(() => {
              if (profile?.email) {
                  setEmail(profile.email);
              }
          }, [profile]);


          useEffect(() => {

            if (countdown <= 0) return;

            const timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            return () => clearTimeout(timer);

        }, [countdown]);

    const formattedTimer = `00:${String(countdown).padStart(2, "0")}`;



        //send otp to  email
        const handleSendOTP = async (e) => {
            e.preventDefault();

            setSuccess("");

            try {
                const result = await dispatch(
                    sendProfileForgotPasswordOTP()
                ).unwrap();

                setSuccess(result.message || "OTP sent successfully.");


                setCountdown(25);
                setOtp("");
                setStep(2);

            } catch (error) {
                console.log(error)
            }
        };

        // resend otp to  email
      const handleResendOTP = async () => {
          setSuccess("");
          dispatch(clearPasswordError())


          try {
              const result = await dispatch(
                  resendProfileForgotPasswordOTP()
              ).unwrap();

              setOtp("");
              setCountdown(25);

              setSuccess(
                  result.message || "New OTP sent successfully."
              );

          } catch (error) {
             console.log(error)
          }
      };

      // verify email otp
        const handleVerifyOTP = async (e) => {
            e.preventDefault();

            setSuccess("");

            try {
                const result = await dispatch(
                    verifyProfileForgotPasswordOTP(otp)
                ).unwrap();

                setSuccess(
                    result.message || "OTP verified successfully."
                );

                setStep(3);

            } catch (error) {
               console.log(error)
            }
        };

        //reset password
        const handleResetPassword = async (e) => {
            e.preventDefault();

            setSuccess("");


            const passwordData = {
                new_password: newPassword,
                confirm_password: confirmPassword
            };

            try {
                const result = await dispatch(
                    resetProfilePassword(passwordData)
                ).unwrap();

                setSuccess(
                    result.message || "Password reset successfully."
                );

                setNewPassword("");
                setConfirmPassword("");

                setTimeout(() => {
                    onClose();
                }, 1500);

            } catch (error) {
                console.log(error)
            }
        };

    const currentError =
    step === 1
        ? profileForgotError
        : step === 2
            ? profileVerifyResetError || profileResendOTPError
            : profileResetError;


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
                    onClick={onClose}
                >
                    &times;
                </button>


                <div className="forgot-profile-container">

                    <h2>Forgot Password</h2>


                    {/* STEP 1: Email */}

                    {step === 1 && (

                        <form onSubmit={handleSendOTP}>

                            <label>Email Address</label>

                            <input
                                type="email"
                                value={email}
                                readOnly
                                placeholder={
                                    profileLoading
                                        ? "Loading email..."
                                        : "Email address not found"
                                }
                                required
                            />

                            <button
                              type="submit"
                              disabled={profileForgotLoading || profileLoading || !email}
                          >
                              {profileForgotLoading ? "Sending..." : "Send OTP"}
                          </button>

                        </form>
                    )}


                    {/* STEP 2: OTP Verification */}

                    {step === 2 && (
                        <div>

                        <form onSubmit={handleVerifyOTP}>

                            <label>Enter OTP</label>

                            <div className="otp-input-container">

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
                                          className="otp-box"

                                          onChange={(e) => {

                                              const digit = e.target.value.replace(/\D/g, "");

                                              if (!digit) return;

                                              const updatedOTP = otp.split("");

                                              updatedOTP[index] = digit;

                                              const newOTP = updatedOTP.join("").slice(0, 6);

                                              setOtp(newOTP);


                                              // Move to next input
                                              if (index < 5) {
                                                  inputRefs.current[index + 1]?.focus();
                                              }
                                          }}

                                          onKeyDown={(e) => {

                                              if (e.key === "Backspace") {

                                                  e.preventDefault();

                                                  const updatedOTP = otp.split("");

                                                  if (otp[index]) {

                                                      updatedOTP[index] = "";

                                                      setOtp(updatedOTP.join(""));

                                                  } else if (index > 0) {

                                                      updatedOTP[index - 1] = "";

                                                      setOtp(updatedOTP.join(""));

                                                      inputRefs.current[index - 1]?.focus();
                                                  }
                                              }
                                          }}
                                      />

                                  ))}

                              </div>

                            <button
                                type="submit"
                                disabled={profileVerifyResetLoading || !otp.trim()}
                            >
                                {profileVerifyResetLoading ? "Verifying..." : "Verify OTP"}
                            </button>


                           
                        </form>

                         {/* Resend OTP Countdown */}

                            <div className="resend-otp-container">

                                {countdown > 0 ? (

                                    <p>
                                        Resend OTP in{" "}
                                            {formattedTimer}
                                        
                                    </p>

                                ) : (

                                    <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={profileResendOTPLoading}
                                >
                                    {profileResendOTPLoading ? "Sending..." : "Resend OTP"}
                                </button>

                                )}

                            </div>
                        </div>
                    )}


                    {/* STEP 3: Reset Password */}

                    {step === 3 && (

                        <form onSubmit={handleResetPassword}>

                            <label>New Password</label>

                            <div className="password-input-wrapper">

                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
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

                            <label>Confirm New Password</label>

                            <div className="password-input-wrapper">

                                  <input
                                      type={showConfirmPassword ? "text" : "password"}
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      placeholder="Confirm new password"
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

                            <button
                              type="submit"
                              disabled={profileResetLoading}
                          >
                              {profileResetLoading ? "Updating..." : "Reset Password"}
                          </button>

                        </form>
                    )}



                    {/* Error Messages */}

                    {currentError && (
                        <p className="error-message">
                            {typeof currentError === "string"
                                ? currentError
                                : currentError?.detail ||
                                currentError?.message ||
                                currentError?.current_password?.[0] ||
                                currentError?.new_password?.[0] ||
                                currentError?.confirm_password?.[0] ||
                                currentError?.otp?.[0] ||
                                currentError?.non_field_errors?.[0] ||
                                JSON.stringify(currentError)}
                        </p>
                    )}

                   


                    {/* Success Message */}

                    {success && (
                        <p className="success-message">
                            {success}
                        </p>
                    )}

                </div>

            </div>

        </div>
    );
}

export default ForgotPasswordProfile;
