import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../src/utils/apiRequest";

// Fetch logged-in user's profile
export const fetchProfile = createAsyncThunk(
    "profile/fetchProfile",

    async (_, { dispatch, rejectWithValue }) => {

        try {
            const data = await apiRequest(
                "/user/profile/",
                {
                    method: "GET"
                },
                dispatch
            );

            return data;

        } catch (error) {
            return rejectWithValue(
                error?.detail || error?.message || "Failed to fetch profile"
            );
        }
    }
);


//update profile 
export const UpdateProfile = createAsyncThunk(
    'profile/updateprofile',

    async (newData, { dispatch, rejectWithValue }) => {

        try {

            const data = await apiRequest(
                '/user/profile/update/',
                {
                    method: 'PATCH',
                    body: newData
                },
                dispatch
            );

            return data.data;

        } catch (error) {

            return rejectWithValue(error);
        }
    }
);




// password change --- profile

export const changePassword = createAsyncThunk(
    "profile/changePassword",

    async (passwordData, thunkAPI) => {
        try {
            const data = await apiRequest(
                "/user/profile/change-password/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(passwordData),
                },
                thunkAPI.dispatch
            );

            return data;

        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const sendProfileForgotPasswordOTP = createAsyncThunk(
    "profile/sendForgotPasswordOTP",

    async (_, { dispatch, rejectWithValue }) => {

        try {

            const response = await apiRequest(
                "/user/profile/forgot-password/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                },
                dispatch
            );

            return response;

        } catch (error) {

            return rejectWithValue(error);
        }
    }
);


export const verifyProfileForgotPasswordOTP = createAsyncThunk(
    "profile/verifyForgotPasswordOTP",

    async (otp, { dispatch, rejectWithValue }) => {

        try {

            const response = await apiRequest(
                "/user/profile/verify-forgot-password-otp/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ otp })
                },
                dispatch
            );

            return response;

        } catch (error) {

            return rejectWithValue(error);
        }
    }
);

export const resendProfileForgotPasswordOTP = createAsyncThunk(
    "profile/resendForgotPasswordOTP",

    async (_, { dispatch, rejectWithValue }) => {

        try {

            const response = await apiRequest(
                "/user/profile/resend-forgot-password-otp/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                },
                dispatch
            );

            return response;

        } catch (error) {

            return rejectWithValue(error);
        }
    }
);

export const resetProfilePassword = createAsyncThunk(
    "profile/resetPassword",

    async (
        {new_password, confirm_password },
        { dispatch, rejectWithValue }
    ) => {

        try {

            const response = await apiRequest(
                "/user/profile/reset-password/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        new_password,
                        confirm_password
                    })
                },
                dispatch
            );

            return response;

        } catch (error) {

            return rejectWithValue(error);
        }
    }
);

// email change -- profile

// 1. Common Send Email Change OTP
export const sendEmailChangeOTP = createAsyncThunk(
    "profile/sendEmailChangeOTP",

    async ({ purpose, email }, thunkAPI) => {

        try {

            const data = await apiRequest(
                "/user/profile/send-email-change-otp/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        purpose,
                        ...(email && { email })
                    }),
                },
                thunkAPI.dispatch
            );

            return data;

        } catch (error) {

            return thunkAPI.rejectWithValue(error);
        }
    }
);


// 2. Common Verify Email Change OTP
export const verifyEmailChangeOTP = createAsyncThunk(
    "profile/verifyEmailChangeOTP",

    async ({ purpose, otp, email }, thunkAPI) => {

        try {

            const data = await apiRequest(
                "/user/profile/verify-email-change-otp/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        purpose,
                        otp,
                        ...(email && { email })
                    }),
                },
                thunkAPI.dispatch
            );

            return data;

        } catch (error) {

            return thunkAPI.rejectWithValue(error)
        }
    }
);

export const resendProfileOTP = createAsyncThunk(
    "profile/resendProfileOTP",

    async ({ email, purpose }, thunkAPI) => {

        try {

            const data = await apiRequest(
                "/user/profile/email-resend-otp/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        purpose
                    }),
                },
                thunkAPI.dispatch
            );

            return data;

        } catch (error) {

            return thunkAPI.rejectWithValue(error);
        }
    }
);


// Profile Slice
const profileSlice = createSlice({

        name: "profile",

        initialState: {
        profile: null,

        // Fetch Profile
        profileLoading: false,
        profileError: null,

        // Update Profile
        updateLoading: false,
        updateError: null,

        // Email Change OTP
        emailOtpLoading: false,
        emailOtpError: null,

        // Change Password
        passwordLoading: false,
        passwordError: null,

        // Common Profile OTP Resend
        resendProfileOTPLoading: false,
        resendProfileOTPError: null,


        // Profile Forgot Password OTP
        profileForgotLoading: false,
        profileForgotError: null,

        // Profile Verify Forgot Password OTP
        profileVerifyResetLoading: false,
        profileVerifyResetError: null,

        // Profile Resend Forgot Password OTP
        profileResendOTPLoading: false,
        profileResendOTPError: null,

        // Profile Reset Password
        profileResetLoading: false,
        profileResetError: null,

        otpVerified: false,
    },

        reducers: {
                    clearProfile: (state) => {

            state.profile = null;

            // Clear errors
            state.profileError = null;
            state.updateError = null;
            state.emailOtpError = null;
            state.passwordError = null;

            state.resendProfileOTPError = null;

            state.profileForgotError = null;
            state.profileVerifyResetError = null;
            state.profileResendOTPError = null;
            state.profileResetError = null;

            // Reset loading states
            state.profileLoading = false;
            state.updateLoading = false;
            state.emailOtpLoading = false;
            state.passwordLoading = false;
            state.resendProfileOTPLoading = false;

            state.profileForgotLoading = false;
            state.profileVerifyResetLoading = false;
            state.profileResendOTPLoading = false;
            state.profileResetLoading = false;

            // Reset Forgot Password data
            state.resetToken = null;
            state.otpVerified = false;
        },
        clearPasswordError: (state) => {
            state.passwordError = null;
            state.profileForgotError = null;
            state.profileVerifyResetError = null;
            state.profileResendOTPError = null;
            state.profileResetError = null;
        }
        },
        

        extraReducers: (builder) => {

            builder


                .addCase(fetchProfile.pending, (state) => {
                    state.profileLoading = true;
                    state.profileError = null;
                })

                .addCase(fetchProfile.fulfilled, (state, action) => {
                    state.profileLoading = false;
                    state.profile = action.payload;
                })

                .addCase(fetchProfile.rejected, (state, action) => {
                    state.profileLoading = false;
                    state.profileError = action.payload || "Failed to fetch profile";
                })


                .addCase(UpdateProfile.pending, (state) => {
                    state.updateLoading = true;
                    state.updateError = null;
                })

                .addCase(UpdateProfile.fulfilled, (state, action) => {
                        state.updateLoading = false;
                        state.updateError = null;

                        state.profile = {
                            ...state.profile,
                            ...action.payload
                        };
                    })

                .addCase(UpdateProfile.rejected, (state, action) => {
                    state.updateLoading = false;
                    state.updateError = action.payload || "Failed to update profile";
                })

                .addCase(sendEmailChangeOTP.pending, (state) => {
                    state.emailOtpLoading = true;
                    state.emailOtpError = null;
                })

                .addCase(sendEmailChangeOTP.fulfilled, (state) => {
                    state.emailOtpLoading = false;
                    state.emailOtpError = null;
                })

                .addCase(sendEmailChangeOTP.rejected, (state, action) => {
                    state.emailOtpLoading = false;
                    state.emailOtpError =
                        action.payload || "Failed to send OTP.";
                })


                // Common Verify Email Change OTP

                .addCase(verifyEmailChangeOTP.pending, (state) => {
                    state.emailOtpLoading = true;
                    state.emailOtpError = null;
                })

                .addCase(verifyEmailChangeOTP.fulfilled, (state, action) => {
                    state.emailOtpLoading = false;
                    state.emailOtpError = null;

                    // Update profile email only after new email verification
                    if (action.payload?.email && state.profile) {
                        state.profile.email = action.payload.email;
                    }

                })

                .addCase(verifyEmailChangeOTP.rejected, (state, action) => {
                    state.emailOtpLoading = false;
                    state.emailOtpError =
                        action.payload || "OTP verification failed.";
                })

                .addCase(changePassword.pending, (state) => {
                    state.passwordLoading = true;
                    state.passwordError = null;
                })

                .addCase(changePassword.fulfilled, (state) => {
                    state.passwordLoading = false;
                    state.passwordError = null;
                })

                .addCase(changePassword.rejected, (state, action) => {
                    state.passwordLoading = false;
                    state.passwordError = action.payload || "Failed to change password.";
                })

                // Common Profile OTP Resend

                .addCase(resendProfileOTP.pending, (state) => {
                    state.resendProfileOTPLoading = true;
                    state.resendProfileOTPError = null;
                })

                .addCase(resendProfileOTP.fulfilled, (state) => {
                    state.resendProfileOTPLoading = false;
                    state.resendProfileOTPError = null;
                    state.emailOtpError=null
                })

                .addCase(resendProfileOTP.rejected, (state, action) => {
                    state.resendProfileOTPLoading = false;
                    state.resendProfileOTPError =
                        action.payload || "Failed to resend OTP.";
                })
                        
                .addCase(sendProfileForgotPasswordOTP.pending, (state) => {
                    state.profileForgotLoading = true;
                    state.profileForgotError = null;
                })

                .addCase(sendProfileForgotPasswordOTP.fulfilled, (state) => {
                    state.profileForgotLoading = false;
                    state.profileForgotError = null;
                })

                .addCase(sendProfileForgotPasswordOTP.rejected, (state, action) => {
                    state.profileForgotLoading = false;
                    state.profileForgotError =
                        action.payload || "Failed to send OTP.";
                })

                .addCase(verifyProfileForgotPasswordOTP.pending, (state) => {
                    state.profileVerifyResetLoading = true;
                    state.profileVerifyResetError = null;
                })

                .addCase(verifyProfileForgotPasswordOTP.fulfilled, (state, action) => {
                    state.profileVerifyResetLoading = false;
                    state.profileVerifyResetError = null;

                    state.otpVerified = true;
                })

                .addCase(verifyProfileForgotPasswordOTP.rejected, (state, action) => {
                    state.profileVerifyResetLoading = false;
                    state.profileVerifyResetError =
                        action.payload || "OTP verification failed.";
                })


                .addCase(resendProfileForgotPasswordOTP.pending, (state) => {
                    state.profileResendOTPLoading = true;
                    state.profileResendOTPError = null;
                })

                .addCase(resendProfileForgotPasswordOTP.fulfilled, (state) => {
                    state.profileResendOTPLoading = false;
                    state.profileResendOTPError = null;
                })

                .addCase(resendProfileForgotPasswordOTP.rejected, (state, action) => {
                    state.profileResendOTPLoading = false;
                    state.profileResendOTPError =
                        action.payload || "Failed to resend OTP.";
                })


                .addCase(resetProfilePassword.pending, (state) => {
                    state.profileResetLoading = true;
                    state.profileResetError = null;
                })

                .addCase(resetProfilePassword.fulfilled, (state) => {
                    state.profileResetLoading = false;
                    state.profileResetError = null;

                    state.resetToken = null;
                    state.otpVerified = false;
                })

                .addCase(resetProfilePassword.rejected, (state, action) => {
                    state.profileResetLoading = false;
                    state.profileResetError =
                        action.payload || "Password reset failed.";
                })

        }

                    
            
});

export const { clearProfile,clearPasswordError } = profileSlice.actions;

export default profileSlice.reducer;