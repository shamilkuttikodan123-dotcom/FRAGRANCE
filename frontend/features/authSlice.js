
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { USER_URL } from "../redux/URL";

export const signupUser = createAsyncThunk(
    "signup/signupUser",
    async (userData,thunkAPI) => {
        try {
            const response = await fetch(
            `${USER_URL}/signup/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return thunkAPI.rejectWithValue(data);
        }

        return data;

        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: "Something went wrong. Please try again."
            });
        }
    }
);


export const googleSignupUser=createAsyncThunk(
    "signup/googleSignupUser",
    async (credential,thunkAPI)=>{
        try{
            const response=await fetch(`${USER_URL}/google/`,{
                method:'POST',
                headers:{
                    'content-type':'application/json'
                },
                body:JSON.stringify({credential:credential})
            })
            const data =await response.json()
            if(!response.ok){
                return thunkAPI.rejectWithValue(data)
            }
            if (!data.access || !data.refresh || !data.user) {
                return thunkAPI.rejectWithValue({
                    message: 'Invalid authentication response.'
                });
            }

            // Save Google login session
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));

            return data
        }catch(error){
            return thunkAPI.rejectWithValue({message:'Something went wrong. Please try again.'})

        }
    }
)

//verify otp
export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',

    async (otpData,thunkAPI) => {

        try {
            const response = await fetch(
                `${USER_URL}/verify-otp/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(otpData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            return data;

        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: 'OTP verification failed. Please try again.'
            });
        }
    }
);


//Resend otp
export const resendOTP = createAsyncThunk(
    'auth/resendOTP',

    async (email,thunkAPI) => {

        try {
            const response = await fetch(
                `${USER_URL}/resend-otp/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            return data;

        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: 'OTP resend failed. Please try again.'
            });
        }
    }
);



//login
export const loginUser = createAsyncThunk(
    'auth/loginUser',

    async (loginData, thunkAPI) => {
        try {
            const response = await fetch(`${USER_URL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            // Save tokens for session persistence
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));

            return data;

        } catch (error) {
            return thunkAPI.rejectWithValue({
            message:
                error.response?.data?.message ||
                'Something went wrong. Please try again.'
            });
        }
    }
);



// Forgot Password - Send OTP
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',

    async (email, thunkAPI) => {
        try {
            const response = await fetch(
                `${USER_URL}/login/forgot-password/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            return data;

        } catch (error) {
            return thunkAPI.rejectWithValue({
                'message':error?.data?.message|| 'Unable to send OTP. Please try again.'
            });
        }
    }
);


// Verify Forgot Password OTP
export const verifyForgotPasswordOTP = createAsyncThunk(
    'auth/verifyForgotPasswordOTP',

    async (otpData, thunkAPI) => {
        try {
            const response = await fetch(
                `${USER_URL}/login/verify-reset-otp/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(otpData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            return data;

        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: 'OTP verification failed. Please try again.'
            });
        }
    }
);

// Reset Password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',

    async (passwordData, thunkAPI) => {
        try {
            const response = await fetch(
                `${USER_URL}/login/reset-password/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(passwordData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            return data;

        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);



export const resendForgotPasswordOTP = createAsyncThunk(
    'auth/resendForgotPasswordOTP',

    async (email, thunkAPI) => {

        try {

            const response = await fetch(
                `${USER_URL}/login/resend-otp/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            return data;

        } catch (error) {

            return thunkAPI.rejectWithValue({
                message: 'OTP resend failed. Please try again.'
            });
        }
    }
);



const authSlice = createSlice({
    name: "signup",
     initialState : {
        //signup/login
        loading: false,
        error: null,
        success: false,
        user: JSON.parse(localStorage.getItem('user')) || null,
        access: localStorage.getItem('access') || null,
        refresh: localStorage.getItem('refresh') || null,
        isAuthenticated: !!localStorage.getItem('access'),

        //otp
        verifyLoading: false,
        verifyError: null,
        verifySuccess: false,

        resendLoading: false,
        resendError: null,
        resendSuccess: false,


        // Forgot Password
        forgotPasswordLoading: false,
        forgotPasswordError: null,
        forgotPasswordSuccess: false,

        // Verify Forgot Password OTP
        verifyResetLoading: false,
        verifyResetError: null,
        resetToken: null,

        // Reset Password
        resetPasswordLoading: false,
        resetPasswordError: null,
        resetPasswordSuccess: false,

        resendForgotPasswordLoading: false,
        resendForgotPasswordError: null,

    },

    reducers: {
         clearSignupState: (state) => {
        state.loading = false;
        state.error = null;
        state.success = false;
       },
       clearAuthErrors: (state) => {
            state.error = null;
            state.verifyError = null;
            state.resendError = null;
            state.forgotPasswordError = null;
            state.verifyResetError = null;
            state.resetPasswordError = null;
            state.resendForgotPasswordError = null;
        },

        // Update access token
        tokenRefreshed: (state, action) => {
            state.access = action.payload.access;

            if (action.payload.refresh) {
                state.refresh = action.payload.refresh;
            }
        },

        // Logout
        logout: (state) => {
            state.user = null;
            state.access = null;
            state.refresh = null;
            state.isAuthenticated = false;
            state.error = null;
            state.success = false;
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
        }

    },

    extraReducers: (builder) => {

        builder
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.error = null;
            })

            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            .addCase(googleSignupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(googleSignupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.access = action.payload.access;
                state.refresh = action.payload.refresh;
                state.isAuthenticated = true;
                state.error = null;
                state.success = true;
            })


            .addCase(googleSignupUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            })
            .addCase(verifyOTP.pending, (state) => {
            state.verifyLoading = true;
            state.verifyError = null;
            state.verifySuccess = false;
            })

        .addCase(verifyOTP.fulfilled, (state) => {
            state.verifyLoading = false;
            state.verifySuccess = true;
            })

        .addCase(verifyOTP.rejected, (state, action) => {
            state.verifyLoading = false;
            state.verifyError = action.payload;
            })

        .addCase(resendOTP.pending, (state) => {
            state.resendLoading = true;
            state.resendError = null;
            state.resendSuccess = false;
            })

        .addCase(resendOTP.fulfilled, (state) => {
            state.resendLoading = false;
            state.resendSuccess = true;
            })

        .addCase(resendOTP.rejected, (state, action) => {
            state.resendLoading = false;
            state.resendError = action.payload;
            })

        .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
            })

        .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.access = action.payload.access;
            state.refresh = action.payload.refresh;
            state.isAuthenticated = true;
            state.error = null;
            state.success = true;
        })

        .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            })

       

        // Forgot Password
        .addCase(forgotPassword.pending, (state) => {
            state.forgotPasswordLoading = true;
            state.forgotPasswordError = null;
            state.forgotPasswordSuccess = false;
        })

        .addCase(forgotPassword.fulfilled, (state) => {
            state.forgotPasswordLoading = false;
            state.forgotPasswordSuccess = true;
        })

        .addCase(forgotPassword.rejected, (state, action) => {
            state.forgotPasswordLoading = false;
            state.forgotPasswordError = action.payload;
        })


        // Verify Forgot Password OTP
        .addCase(verifyForgotPasswordOTP.pending, (state) => {
            state.verifyResetLoading = true;
            state.verifyResetError = null;
            state.resetToken = null;
        })

        .addCase(verifyForgotPasswordOTP.fulfilled, (state, action) => {
            state.verifyResetLoading = false;
            state.resetToken = action.payload.reset_token;
        })

        .addCase(verifyForgotPasswordOTP.rejected, (state, action) => {
            state.verifyResetLoading = false;
            state.verifyResetError = action.payload;
        })


        // Reset Password
        .addCase(resetPassword.pending, (state) => {
            state.resetPasswordLoading = true;
            state.resetPasswordError = null;
            state.resetPasswordSuccess = false;
        })

        .addCase(resetPassword.fulfilled, (state) => {
            state.resetPasswordLoading = false;
            state.resetPasswordSuccess = true;
            state.resetToken = null;
        })

        .addCase(resetPassword.rejected, (state, action) => {
            state.resetPasswordLoading = false;
            state.resetPasswordError = action.payload;
        })
        // Resend Forgot Password OTP
        .addCase(resendForgotPasswordOTP.pending, (state) => {
            state.resendForgotPasswordLoading = true;
            state.resendForgotPasswordError = null;
        })

        .addCase(resendForgotPasswordOTP.fulfilled, (state, action) => {
            state.resendForgotPasswordLoading = false;
            state.resendForgotPasswordError = null;
        })

        .addCase(resendForgotPasswordOTP.rejected, (state, action) => {
            state.resendForgotPasswordLoading = false;
            state.resendForgotPasswordError = action.payload || {
                message: "Unable to resend OTP."
            };
        })

       
    
     }
        })
        

export const { clearSignupState,tokenRefreshed,logout,clearAuthErrors } = authSlice.actions;

export default authSlice.reducer;
