
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import './Signup.css'
import { useDispatch, useSelector } from "react-redux";
import { signupUser,googleSignupUser } from "../../../features/authSlice";
import { useNavigate,Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
function Signup() {
    const navigate=useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register,handleSubmit, watch,formState: { errors }} = useForm();
    const {loading,error} =useSelector((state)=>state.auth)
    const dispatch=useDispatch()


    const password = watch("password");
    

    const onSubmit = async (data) => {
        const userData = {
            full_name: data.fullName,
            email: data.email,
            phone_number: data.phoneNumber,
            password: data.password,
            confirm_password: data.confirmPassword
        };
        try {
            await dispatch(signupUser(userData)).unwrap();
            localStorage.removeItem(`otp_resend_expiry_${data.email}`);
            navigate('/verify-otp', {state: { email: data.email }});

        } catch (err) {
            console.log(err);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const credential = credentialResponse.credential;
            await dispatch(googleSignupUser(credential)).unwrap();
            navigate('/');
        } catch (err) {
            console.log("Google Signup Failed:", err);
        }
    };
    const handleGoogleError = () => {
        console.log("Google Login Failed");
    };

  

    return (
        <div  className="signup-page">

       
        <div className="signup-container">

            <h2>Create Account</h2>

            <form onSubmit={handleSubmit(onSubmit)}>

                <div className="form-group">
                    <label>Full Name</label>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        {...register("fullName", {
                            required: "Full name is required",
                            pattern: {
                                value:/^[A-Za-z ]+$/,
                                message: "Enter a valid full name"
                            }
                        })}
                    />

                    {errors.fullName && (
                        <p className="error">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label>Email Address</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Enter a valid email address"
                            }
                        })}
                    />

                    {errors.email && (
                        <p className="error">
                            {errors.email.message}
                        </p>
                    )}

                    {error?.errors?.email && (
                        <p className="error">
                            {error.errors.email[0]}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label>Phone Number</label>

                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...register("phoneNumber", {
                            required: "Phone number is required",
                            pattern: {
                                value: /^[6-9]\d{9}$/,
                                message: "Enter a valid 10-digit Indian phone number"
                            }
                        })}
                    />

                    {errors.phoneNumber && (
                        <p className="error">
                            {errors.phoneNumber.message}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label>Password</label>

                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must contain at least 8 characters"
                                },
                                pattern: {
                                    value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/,
                                    message: "Password must contain uppercase, number and symbol"
                                }
                            })}
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>

                    <p className="password-hint">
                        8+ characters • Uppercase • Numeral • Symbol
                    </p>

                    {errors.password && (
                        <p className="error">{errors.password.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>

                    <div className="password-input-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (value) =>
                                    value === password || "Passwords do not match"
                            })}
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>

                    {errors.confirmPassword && (
                        <p className="error">{errors.confirmPassword.message}</p>
                    )}
                </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                    </form>

                    <div className="google-divider">
                        <span>OR</span>
                    </div>

                    
                        <div className="google-login">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            width={368}
                            size="large"
                            text="continue_with"
                            shape="rectangular"
                            
                        />
            </div>

        <p className="login-link">
                Don't have an account?
                <Link to="/login"> Login</Link>
            </p>

        </div>
         </div>
        
    );
}

export default Signup;
