
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../src/utils/apiRequest';

// Get all addresses
export const fetchAddresses = createAsyncThunk(
    'address/fetchAddresses',
    async (_, thunkAPI) => {
        try {
            const response = await apiRequest(
                '/user/address/',
                { method: 'GET' },
                thunkAPI.dispatch
            );
            console.log('Fetched addresses:', response);


            return response;

        } catch (error) {
            return thunkAPI.rejectWithValue(
                error || 'Failed to fetch addresses.'
            );
        }
    }
);



// Add new address
export const addAddress = createAsyncThunk(
    'address/addAddress',
    async (addressData, thunkAPI) => {
        try {
            const response = await apiRequest(
                '/user/address/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(addressData)
                },
                thunkAPI.dispatch
            );

            return response;

        } catch (error) {
            return thunkAPI.rejectWithValue(
                error || 'Failed to add address.'
            );
        }
    }
);


// Edit address
export const updateAddress = createAsyncThunk(
    'address/updateAddress',
    async ({ id, addressData }, thunkAPI) => {
        try {
            const response = await apiRequest(
                `/user/address/${id}/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(addressData)
                },
                thunkAPI.dispatch
            );

            return response;

        } catch (error) {
                            console.log("ADDRESS FORM ERRORS:", error)

            return thunkAPI.rejectWithValue(
                error || 'Failed to update address.'
            );
        }
    }
);


// Delete address
export const deleteAddress = createAsyncThunk(
    'address/deleteAddress',
    async (id, thunkAPI) => {
        try {
            const response = await apiRequest(
                `/user/address/${id}/`,
                { method: 'DELETE' },
                thunkAPI.dispatch
            );

            return { id, response };

        } catch (error) {
            return thunkAPI.rejectWithValue(
                error|| 'Failed to delete address.'
            );
        }
    }
);


// Set default address
export const setDefaultAddress = createAsyncThunk(
    'address/setDefaultAddress',
    async (id, thunkAPI) => {
        try {
            const response = await apiRequest(
                `/user/address/set-default/${id}/`,
                { method: 'PATCH' },
                thunkAPI.dispatch
            );

            return response.address;

        } catch (error) {
            return thunkAPI.rejectWithValue(
                error || 'Failed to set default address.'
            );
        }
    }
);




const addressSlice = createSlice({
        name: 'address',

        initialState : {
            addresses: [],

            loading: false,
            error: null,

            actionLoading: false,
            actionError: null
        },

        reducers: {
            clearAddressError: (state) => {
                state.error = null;
                state.actionError = null;
            },

        },

            extraReducers: (builder) => {
                builder
                    .addCase(fetchAddresses.pending, (state) => {
                        state.loading = true;
                        state.error = null;
                    })

                    .addCase(fetchAddresses.fulfilled, (state, action) => {
                        state.loading = false;
                        state.addresses = action.payload;
                    })

                    .addCase(fetchAddresses.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                    })

                    .addCase(addAddress.pending, (state) => {
                        state.actionLoading = true;
                        state.actionError = null;
                                })

                    .addCase(addAddress.fulfilled, (state, action) => {

                            state.actionLoading = false;
                            state.addresses.push(action.payload);
                            state.addresses.sort((a, b) => {
                                if (a.is_default !== b.is_default) {
                                    return Number(b.is_default) - Number(a.is_default);
                                }
                                return new Date(b.created_at) - new Date(a.created_at);
                            });

                        })

                    .addCase(addAddress.rejected, (state, action) => {
                        state.actionLoading = false;
                        state.actionError = action.payload;
                    })


                    .addCase(updateAddress.pending, (state) => {
                        state.actionLoading = true;
                        state.actionError = null;
                    })

                    .addCase(updateAddress.fulfilled, (state, action) => {

                            state.actionLoading = false;
                            const updatedAddress = action.payload;

                            state.addresses = state.addresses.map((address) => {

                                if (address.id === updatedAddress.id) {
                                    return updatedAddress;
                                }

                                if (updatedAddress.is_default) {
                                    return {
                                        ...address,
                                        is_default: false
                                    };
                                }

                                return address;
                            });

                        })

                    .addCase(updateAddress.rejected, (state, action) => {
                        state.actionLoading = false;
                        state.actionError = action.payload;
                    })

                    .addCase(deleteAddress.pending, (state) => {
                        state.actionLoading = true;
                        state.actionError = null;
                    })

                    .addCase(deleteAddress.fulfilled, (state, action) => {
                        state.actionLoading = false;

                        state.addresses = state.addresses.filter(
                            (address) => address.id !== action.payload.id
                        );

                    })

                    .addCase(deleteAddress.rejected, (state, action) => {
                        state.actionLoading = false;
                        state.actionError = action.payload;
                    })

                    .addCase(setDefaultAddress.pending, (state) => {
                        state.actionLoading = true;
                        state.actionError = null;
                    })

                    .addCase(setDefaultAddress.fulfilled, (state, action) => {
                        state.actionLoading = false;

                        state.addresses = state.addresses.map((address) => ({
                            ...address,
                            is_default: address.id === action.payload.id
                        }));

                    })

                    .addCase(setDefaultAddress.rejected, (state, action) => {
                        state.actionLoading = false;
                        state.actionError = action.payload;
                    });

            }
        });


export const {clearAddressError} = addressSlice.actions;

export default addressSlice.reducer;
