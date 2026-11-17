import React, { useState, useEffect,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    sendEmailChangeOTP,
    verifyEmailChangeOTP,
    resendProfileOTP
} from "../../../features/profileSlice";
import "./ChangeEmail.css";


function ChangeEmail({ onClose }) {

    const dispatch = useDispatch();

    const {
        profile,
        emailOtpLoading,
        emailOtpError,
        resendProfileOTPLoading,
        resendProfileOTPError
    } = useSelector((state) => state.profile);

    //popup set
    const [step, setStep] = useState(1);
    const [countdown, setCountdown] = useState(0);
    const currentOtpRefs = useRef([]);
    const newEmailOtpRefs = useRef([]);
    //form values
    const [currentOtp, setCurrentOtp] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newEmailOtp, setNewEmailOtp] = useState("");
    //local success and error
    const [success, setSuccess] = useState("");
    const currentEmail = profile?.email || "";

        
      


        //count down
    useEffect(() => {

        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [countdown]);
    const formattedTimer = `00:${String(countdown).padStart(2, "0")}`;



    //step 1- current email otp
    const handleSendCurrentOTP = async () => {

        setSuccess("");

        try {

            const response = await dispatch(
                sendEmailChangeOTP({
                    purpose: "current_email"
                })
            ).unwrap();

            setStep(2);
            setCurrentOtp("");
            setCountdown(25);

            setSuccess(
                response?.message ||
                "OTP sent to your current email."
            );

        } catch (error) {

            console.log(error)
        }
    };


    // STEP 2: VERIFY CURRENT EMAIL OTP
    const handleVerifyCurrentOTP = async (e) => {

        e.preventDefault();

        setSuccess("");

        try {

            const response = await dispatch(
                verifyEmailChangeOTP({
                    purpose: "current_email",
                    otp: currentOtp
                })
            ).unwrap();

            setStep(3);
            setCurrentOtp("");
            setCountdown(0);

            setSuccess(
                response?.message ||
                "Current email verified successfully."
            );

        } catch (error) {

            console.log(error)
        }
    };


    // STEP 2: RESEND CURRENT EMAIL OTP
    const handleResendCurrentOTP = async () => {

        setSuccess("");

        try {

            const response = await dispatch(
                resendProfileOTP({
                    email: currentEmail,
                    purpose: "current_email"
                })
            ).unwrap();

            setCurrentOtp("");
            setCountdown(25);

            setSuccess(
                response?.message ||
                "OTP resent successfully."
            );

        } catch (err) {
                console.log(err)
        }
    };


  
    // STEP 3: SEND NEW EMAIL OTP
    const handleSendNewEmailOTP = async (e) => {

    e.preventDefault();

    setSuccess("");

    // Normalize email
    const normalizedEmail = newEmail.trim().toLowerCase();


    try {

       const response = await dispatch(
            sendEmailChangeOTP({
                purpose: "new_email",
                email: normalizedEmail
            })
        ).unwrap();

        setStep(4);
        setNewEmailOtp("");
        setCountdown(25);

        setSuccess(
            response?.message ||
            "OTP sent to your new email."
        );

    } catch (err) {

        console.log(err)
    }
};


    
    // STEP 4: VERIFY NEW EMAIL OTP
    const handleVerifyNewEmailOTP = async (e) => {

        e.preventDefault();

        setSuccess("");

        try {

           const response = await dispatch(
                verifyEmailChangeOTP({
                    purpose: "new_email",
                    email: newEmail.trim().toLowerCase(),
                    otp: newEmailOtp
                })
            ).unwrap();

            setStep(5);
            setCountdown(0);

            setSuccess(
                response?.message ||
                "Email address updated successfully."
            );

        } catch (err) {

                console.log(err)
        }
    };


    // STEP 4: RESEND NEW EMAIL OTP
    const handleResendNewEmailOTP = async () => {

        setSuccess("");

        try {

            const response = await dispatch(
                resendProfileOTP({
                    email: newEmail.trim().toLowerCase(),
                    purpose: "new_email"
                })
            ).unwrap();

            setNewEmailOtp("");
            setCountdown(25);

            setSuccess(
                response?.message ||
                "OTP resent successfully."
            );

        } catch (err) {

            console.log(err)
        }
    };


    
    // CLOSE POPUP
    

    const handleClose = () => {
        onClose();
    };

    const getErrorMessage = (err) => {
    if (typeof err === "string") return err;

    return (
        err?.detail ||
        err?.message ||
        err?.email?.[0] ||
        err?.otp?.[0] ||
        err?.non_field_errors?.[0] ||
        "Something went wrong. Please try again."
    );
};


    return (

        <div className="change-email-overlay">

            <div className="change-email-card">

                {/* Close Button */}

                <button
                    type="button"
                    onClick={handleClose}
                    className="change-email-close"
                    aria-label="Close"
                >
                    ×
                </button>


                    {/* STEP 1: CURRENT EMAIL */}

                {step === 1 && (

                    <>

                        <h2 className="change-email-heading">
                            Change Email Address
                        </h2>

                        <p className="change-email-description">
                            Verify your current email address first.
                            We will send you an OTP.
                        </p>

                        <label className="change-email-label">
                            Current Email
                        </label>

                        <input
                            type="email"
                            value={currentEmail}
                            readOnly
                            className="change-email-input"
                        />

                        <button
                            type="button"
                            onClick={handleSendCurrentOTP}
                            disabled={emailOtpLoading}
                            className="change-email-button"
                        >
                            {emailOtpLoading
                                ? "Sending..."
                                : "Send OTP"}
                        </button>
                        {emailOtpError && (
                            <p className="change-email-error">
                                {getErrorMessage(emailOtpError)}
                            </p>
                        )}

                    </>

                )}


                    {/* STEP 2: VERIFY CURRENT EMAIL */}

                {step === 2 && (

                    <>

                        <h2 className="change-email-heading">
                            Verify Current Email
                        </h2>

                        <p className="change-email-description">
                            Enter the OTP sent to {currentEmail}.
                        </p>

                        <form onSubmit={handleVerifyCurrentOTP}>

                            <label className="change-email-label">
                                Enter OTP
                            </label>

                            <div className="change-email-otp-inputs">

                                {Array.from({ length: 6 }).map((_, index) => (

                                    <input
                                        key={index}
                                        ref={(element) => {
                                            currentOtpRefs.current[index] = element;
                                        }}
                                        type="text"
                                        value={currentOtp[index] || ""}
                                        maxLength={1}
                                        inputMode="numeric"

                                        onChange={(e) => {
                                            const digit = e.target.value.replace(/\D/g, "").slice(-1);

                                            const updatedOTP = Array.from(
                                                { length: 6 },
                                                (_, i) => currentOtp[i] || ""
                                            );

                                            updatedOTP[index] = digit;
                                            setCurrentOtp(updatedOTP.join(""));

                                            if (digit && index < 5) {
                                                currentOtpRefs.current[index + 1]?.focus();
                                            }
                                        }}

                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace") {
                                                if (currentOtp[index]) {
                                                    const updatedOTP = Array.from(
                                                        { length: 6 },
                                                        (_, i) => currentOtp[i] || ""
                                                    );

                                                    updatedOTP[index] = "";
                                                    setCurrentOtp(updatedOTP.join(""));
                                                } else if (index > 0) {
                                                    currentOtpRefs.current[index - 1]?.focus();
                                                }
                                            }
                                        }}

                                        className="change-email-otp-box"
                                    />

                                ))}

                            </div>

                            <button
                                type="submit"
                                disabled={
                                    emailOtpLoading ||
                                    currentOtp.length !== 6
                                }
                                className="change-email-button"
                            >
                                {emailOtpLoading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </button>
                            {emailOtpError && (
                            <p className="change-email-error">
                                {getErrorMessage(emailOtpError)}
                            </p>
                        )}

                        </form>


                        {/* Resend Current Email OTP */}

                        <button
                            type="button"
                            onClick={handleResendCurrentOTP}
                            disabled={
                                resendProfileOTPLoading ||
                                countdown > 0
                            }
                            className="change-email-secondary-button"
                        >

                            {resendProfileOTPLoading
                                ? "Sending..."
                                : countdown > 0
                                    ? `Resend OTP (${formattedTimer})`
                                    : "Resend OTP"}

                        </button>
                        {resendProfileOTPError && (
                        <p className="change-email-error">
                            {getErrorMessage(resendProfileOTPError)}
                        </p>
                    )}

                    </>

                )}


         
                    {/* STEP 3: ENTER NEW EMAIL */}
              

                {step === 3 && (

                    <>

                        <h2 className="change-email-heading">
                            Enter New Email
                        </h2>

                        <p className="change-email-description">
                            Your current email is verified.
                            Enter your new email address.
                        </p>

                        <form onSubmit={handleSendNewEmailOTP}>

                            <label className="change-email-label">
                                New Email Address
                            </label>

                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) =>
                                    setNewEmail(e.target.value)
                                }
                                placeholder="Enter new email"
                                required
                                className="change-email-input"
                            />

                            <button
                                type="submit"
                                disabled={emailOtpLoading}
                                className="change-email-button"
                            >
                                {emailOtpLoading
                                    ? "Sending..."
                                    : "Send OTP"}
                            </button>
                            {emailOtpError && (
                                <p className="change-email-error">
                                    {getErrorMessage(emailOtpError)}
                                </p>
                            )}

                        </form>

                    </>

                )}


           
                    {/* STEP 4: VERIFY NEW EMAIL */}
              

                {step === 4 && (

                    <>

                        <h2 className="change-email-heading">
                            Verify New Email
                        </h2>

                        <p className="change-email-description">
                            Enter the OTP sent to {newEmail}.
                        </p>

                        <form onSubmit={handleVerifyNewEmailOTP}>

                            <label className="change-email-label">
                                Enter OTP
                            </label>

                            <div className="change-email-otp-inputs">

                                {Array.from({ length: 6 }).map((_, index) => (

                                    <input
                                        key={index}
                                        ref={(element) => {
                                            newEmailOtpRefs.current[index] = element;
                                        }}
                                        type="text"
                                        value={newEmailOtp[index] || ""}
                                        maxLength={1}
                                        inputMode="numeric"
                                        onChange={(e) => {

                                            const digit = e.target.value.replace(/\D/g, "").slice(-1);

                                            const updatedOTP = Array.from(
                                                { length: 6 },
                                                (_, i) => newEmailOtp[i] || ""
                                            );

                                            updatedOTP[index] = digit;

                                            setNewEmailOtp(updatedOTP.join(""));

                                            if (digit && index < 5) {
                                                newEmailOtpRefs.current[index + 1]?.focus();
                                            }

                                        }}

                                        onKeyDown={(e) => {

                                            if (e.key === "Backspace") {

                                                if (newEmailOtp[index]) {

                                                    const updatedOTP = Array.from(
                                                        { length: 6 },
                                                        (_, i) => newEmailOtp[i] || ""
                                                    );

                                                    updatedOTP[index] = "";

                                                    setNewEmailOtp(updatedOTP.join(""));

                                                } else if (index > 0) {

                                                    newEmailOtpRefs.current[index - 1]?.focus();

                                                }
                                            }
                                        }}

                                        className="change-email-otp-box"
                                    />

                                ))}

                            </div>

                            <button
                                type="submit"
                                disabled={
                                    emailOtpLoading ||
                                    newEmailOtp.length !== 6
                                }
                                className="change-email-button"
                            >
                                {emailOtpLoading
                                    ? "Updating..."
                                    : "Verify & Update Email"}
                            </button>
                            {emailOtpError && (
                                <p className="change-email-error">
                                    {getErrorMessage(emailOtpError)}
                                </p>
                            )}


                            {/* Resend New Email OTP */}

                            <button
                                type="button"
                                onClick={handleResendNewEmailOTP}
                                disabled={
                                    resendProfileOTPLoading ||
                                    countdown > 0
                                }
                                className="change-email-secondary-button"
                            >

                                {resendProfileOTPLoading
                                    ? "Sending..."
                                    : countdown > 0
                                        ? `Resend OTP (${formattedTimer})`
                                        : "Resend OTP"}

                            </button>

                            {resendProfileOTPError && (
                            <p className="change-email-error">
                                {getErrorMessage(resendProfileOTPError)}
                            </p>
                        )}

                        </form>

                    </>

                )}


                    {/* STEP 5: SUCCESS */}
            

                {step === 5 && (

                    <>

                        <h2 className="change-email-heading">
                            Email Updated Successfully!
                        </h2>

                        <p className="change-email-description">
                            Your email address has been changed to:
                        </p>

                        <p className="change-email-text">
                            {newEmail}
                        </p>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="change-email-button"
                        >
                            Back to Profile
                        </button>

                    </>

                )}


            
                
                {success && step !== 5 && (

                    <p className="change-email-success">
                        {success}
                    </p>

                )}

            </div>

        </div>

    );

}

export default ChangeEmail;

