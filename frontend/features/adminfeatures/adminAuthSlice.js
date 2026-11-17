
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ADMIN_URL } from '../../redux/URL';

// ADMIN LOGIN
export const adminLogin = createAsyncThunk(
    'adminAuth/adminLogin',

    async (formData, { rejectWithValue }) => {

        try {

            const response = await fetch(`${ADMIN_URL}/login/`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data);
            }

            localStorage.setItem('admin_access', data.access);
            localStorage.setItem('admin_refresh', data.refresh);
            localStorage.setItem('admin_user', JSON.stringify(data.user));

            return data;

        } catch (error) {

            return rejectWithValue({
                message: 'Server connection failed. Please try again.',
            });

        }
    }
);




// ADMIN FORGOT PASSWORD - SEND OTP

export const adminForgotPassword = createAsyncThunk(
    'adminAuth/adminForgotPassword',

    async (email, { rejectWithValue }) => {

        try {

            const response = await fetch(
                `${ADMIN_URL}/forgot-password/`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify({
                        email: email,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data);
            }

            return data;

        } catch (error) {

            return rejectWithValue({
                message: 'Server connection failed. Please try again.',
            });

        }
    }
);



// ADMIN VERIFY FORGOT PASSWORD OTP

export const adminVerifyForgotPasswordOTP = createAsyncThunk(
    'adminAuth/adminVerifyForgotPasswordOTP',

    async ({ email, otp }, { rejectWithValue }) => {

        try {

            const response = await fetch(`${ADMIN_URL}/verify-otp/`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    email,
                    otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data);
            }

            return data;

        } catch (error) {

            return rejectWithValue({
                message: 'Server connection failed. Please try again.',
            });
        }
    }
);


// ADMIN RESEND FORGOT PASSWORD OTP

export const adminResendForgotPasswordOTP = createAsyncThunk(
    'adminAuth/adminResendForgotPasswordOTP',

    async (email, { rejectWithValue }) => {

        try {

            const response = await fetch(`${ADMIN_URL}/resend-otp/`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data);
            }

            return data;

        } catch (error) {

            return rejectWithValue({
                message: 'Server connection failed. Please try again.',
            });
        }
    }
);


// ADMIN RESET PASSWORD

export const adminResetPassword = createAsyncThunk(
    'adminAuth/adminResetPassword',

    async (
        { reset_token, new_password, confirm_password },
        { rejectWithValue }
    ) => {

        try {

            const response = await fetch(`${ADMIN_URL}/reset-password/`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    reset_token,
                    new_password,
                    confirm_password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data);
            }

            return data;

        } catch (error) {

            return rejectWithValue({
                message: 'Server connection failed. Please try again.',
            });
        }
    }
);

const adminAuthSlice = createSlice({

    name: 'adminAuth',

    initialState: {

        admin: JSON.parse(localStorage.getItem('admin_user')) || null,
        access: localStorage.getItem('admin_access') || null,
        refresh: localStorage.getItem('admin_refresh') || null,
        loading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem('admin_access'),

        // ADMIN VERIFY FORGOT PASSWORD OTP
            verifyResetLoading: false,
            verifyResetError: null,
            resetToken: null,

            // ADMIN RESET PASSWORD
            resetPasswordLoading: false,
            resetPasswordError: null,
            resetPasswordSuccess: false,
            

    },

    reducers: {

        adminLogout: (state) => {

                localStorage.removeItem('admin_access');
                localStorage.removeItem('admin_refresh');
                localStorage.removeItem('admin_user');

                state.admin = null;
                state.access = null;
                state.refresh = null;

                state.loading = false;
                state.error = null;
                state.isAuthenticated = false;

                // Clear forgot password states
                state.verifyResetLoading = false;
                state.verifyResetError = null;
                state.resetToken = null;

                state.resetPasswordLoading = false;
                state.resetPasswordError = null;
                state.resetPasswordSuccess = false;

            },
            adminTokenRefreshed: (state, action) => {

                state.access = action.payload.access;
                state.refresh = action.payload.refresh;

            },
            clearResetPasswordState: (state) => {
                state.resetPasswordLoading = false;
                state.resetPasswordError = null;
                state.resetPasswordSuccess = false;
            },

    },

    extraReducers: (builder) => {

        builder

            .addCase(adminLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(adminLogin.fulfilled, (state, action) => {

                state.loading = false;

                state.admin = action.payload.user;
                state.access = action.payload.access;
                state.refresh = action.payload.refresh;

                state.isAuthenticated = true;
                state.error = null;
            })

            .addCase(adminLogin.rejected, (state, action) => {

                state.loading = false;

                state.error = action.payload || {
                    message: 'Login failed. Please try again.',
                };

                state.isAuthenticated = false;
            })

           .addCase(adminForgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;

            })

            .addCase(adminForgotPassword.fulfilled, (state) => {

                state.loading = false;
                state.error = null;

            })

            .addCase(adminForgotPassword.rejected, (state, action) => {

                state.loading = false;

                state.error = action.payload || {
                    message: 'Failed to send OTP. Please try again.',
                };

            })
            // VERIFY FORGOT PASSWORD OTP
            .addCase(adminVerifyForgotPasswordOTP.pending, (state) => {
                state.verifyResetLoading = true;
                state.verifyResetError = null;
                state.resetToken = null;
            })

            .addCase(adminVerifyForgotPasswordOTP.fulfilled, (state, action) => {
                state.verifyResetLoading = false;
                state.verifyResetError = null;
                state.resetToken = action.payload.reset_token;
            })

            .addCase(adminVerifyForgotPasswordOTP.rejected, (state, action) => {
                state.verifyResetLoading = false;
                state.verifyResetError = action.payload;
                state.resetToken = null;
            })
            // RESEND OTP PENDING
            .addCase(adminResendForgotPasswordOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.verifyResetError=null
            })

            // RESEND OTP SUCCESS
            .addCase(adminResendForgotPasswordOTP.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })

            // RESEND OTP FAILED
            .addCase(adminResendForgotPasswordOTP.rejected, (state, action) => {
                state.loading = false;

                state.error = action.payload || {
                    message: 'Failed to resend OTP. Please try again.',
                };
            })
            // RESET PASSWORD

            .addCase(adminResetPassword.pending, (state) => {
                state.resetPasswordLoading = true;
                state.resetPasswordError = null;
                state.resetPasswordSuccess = false;
            })

            .addCase(adminResetPassword.fulfilled, (state) => {
                state.resetPasswordLoading = false;
                state.resetPasswordSuccess = true;
                state.resetToken = null;
            })

            .addCase(adminResetPassword.rejected, (state, action) => {
                state.resetPasswordLoading = false;
                state.resetPasswordError = action.payload;
            })

    },

});


export const {
    adminLogout,
    adminTokenRefreshed,
    clearResetPasswordState
} = adminAuthSlice.actions;


export default adminAuthSlice.reducer;
