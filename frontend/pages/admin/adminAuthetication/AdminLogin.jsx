
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { adminLogin } from '../../../features/adminfeatures/adminAuthSlice';
import './AdminLogin.css'
function AdminLogin() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error } = useSelector(
        (state) => state.adminAuth
    );

    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (formData) => {


        try {

            await dispatch(adminLogin({
                email: formData.email.trim(),
                password: formData.password
            })).unwrap();

            navigate('/admin/dashboard', { replace: true });

        } catch (error) {
            console.log(error);
        }
    };

    return (

        <div className="admin-login-page">

            <div className="admin-login-card">

                <div className="admin-login-brand">
                    <h1>FRAGRANCE</h1>
                    <span>ADMIN PANEL</span>
                </div>

                <div className="admin-login-heading">
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your admin dashboard.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>

                    {/* EMAIL */}

                    <div className="admin-form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className="admin-input-wrapper">

                            <Mail size={18} />

                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                autoComplete="username"

                                {...register('email', {
                                    required: 'Email is required',

                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Enter a valid email address'
                                    }
                                })}
                            />

                        </div>

                        {errors.email && (
                            <span className="admin-field-error">
                                {errors.email.message}
                            </span>
                        )}

                    </div>


                    {/* PASSWORD */}

                    <div className="admin-form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="admin-input-wrapper">

                            <LockKeyhole size={18} />

                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"

                                {...register('password', {
                                    required: 'Password is required'
                                })}
                            />

                            <button
                                type="button"
                                className="admin-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }
                            </button>

                        </div>

                        {errors.password && (
                            <span className="admin-field-error">
                                {errors.password.message}
                            </span>
                        )}

                    </div>


                    {/* FORGOT PASSWORD */}

                    <div className="admin-forgot-password">

                        <span
                            onClick={() => navigate('/admin/forgot-password')}
                        >
                            Forgot Password?
                        </span>

                    </div>


                    {/* BACKEND ERROR */}

                    {error && (
                        <div className="admin-login-error">

                            {typeof error === 'string'
                                ? error
                                : error.message ||
                                  error.non_field_errors?.[0] ||
                                  'Login failed. Please try again.'
                            }

                        </div>
                    )}


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                </form>


                <div className="admin-login-footer">
                    <p>FRAGRANCE Admin Portal</p>
                </div>

            </div>

        </div>
    );
}

export default AdminLogin;
