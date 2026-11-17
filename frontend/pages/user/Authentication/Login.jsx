
import React, { useState } from 'react';
import './Login.css';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser, googleSignupUser } from '../../../features/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { GoogleLogin } from '@react-oauth/google';

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { loading, error } = useSelector(
        (state) => state.auth
    );

    // Normal Login
    const handleLogin = async (e) => {
        e.preventDefault();

        const loginData = {
            email,
            password
        };

        try {
            await dispatch(loginUser(loginData)).unwrap();

            navigate('/', { replace: true });

        } catch (err) {
            console.log(err);
        }
    };

    // Google Login
    const handleGoogleLogin = async (credentialResponse) => {

        try {

            await dispatch(
                googleSignupUser(credentialResponse.credential)
            ).unwrap();

            navigate('/', { replace: true });

        } catch (err) {
            console.log('Google Login Failed:', err);
        }
    };

    return (
        <div className='login-page'>
        <div className="login-container">

            <h2>Welcome Back</h2>

            <p className="login-description">
                Login to your FRAGRANCE account
            </p>

            <form onSubmit={handleLogin}>

                <div className="login-form-group">
                    <label>Email Address</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="login-form-group">
                    <label>Password</label>

                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>
                </div>

                <div className="forgot-password">
                    <Link to="/login/forgot-password">
                        Forgot Password?
                    </Link>
                </div>

                {error && (
                    <p className="error-message">
                        {
                            error.errors?.message ||
                            error.detail ||
                            error.message ||
                            "Login failed. Please try again."
                        }
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

            </form>

            {/* OR Divider */}
            <div className="login-divider">
                <span>OR</span>
            </div>

            {/* Google Login */}
            <div className="google-login">

                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                      width={368}
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                
                />

            </div>

            <p className="signup-link">
                Don't have an account?
                <Link to="/signup"> Sign Up</Link>
            </p>

        </div>
        </div>
    );
}

export default Login;
