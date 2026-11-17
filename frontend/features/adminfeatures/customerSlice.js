
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../src/utils/apiRequest";

// FETCH CUSTOMERS

export const fetchCustomers = createAsyncThunk(
    "customers/fetch",
    async (
        { search = "", page = 1, pageSize = 10 } = {},
        { rejectWithValue, dispatch }
    ) => {
        try {
            const params = new URLSearchParams();

            const searchValue = String(search || "").trim();

            if (searchValue) {
                params.append("search", searchValue);
            }

            params.append("page", page);
            params.append("page_size", pageSize);

            const endpoint = `/admin/customers/?${params.toString()}`;

            const response = await apiRequest(
                endpoint,
                { method: "GET" },
                dispatch,
                true
            );

            return response;

        } catch (error) {
            return rejectWithValue(
                error.message ||
                error.detail ||
                "Failed to fetch customers."
            );
        }
    }
);


export const customerBlock =createAsyncThunk(
    'customer/block',
    async(id,{rejectWithValue,dispatch})=>{
        try{
            const response=await apiRequest(`/admin/customers/${id}/block/`,
                {method:'PATCH'},
                dispatch,
                true
            )

            return response
        }catch(error){
            return rejectWithValue(
                error.message || error.detail || "Failed to block customer."
            );

        }
    }
)


// CUSTOMER SLICE
const customerSlice = createSlice({
    name: "customer",

    initialState: {
            customers: [],
            searchLoading: false,
            blockLoading: false,
            error: null,

            next: null,
            previous: null,
            count:null,
             stats: {
                total_customers: 0,
                blocked_customers: 0,
                not_blocked_customers: 0
            },
            
    },

    reducers: {
        clearCustomerError: (state) => {
            state.error = null;
        }
    },

   
        extraReducers: (builder) => {
            builder

                // FETCH CUSTOMERS
                .addCase(fetchCustomers.pending, (state) => {
                    state.searchLoading = true;
                    state.error = null;
                })

                .addCase(fetchCustomers.fulfilled, (state, action) => {
                        state.searchLoading = false;

                        state.customers = action.payload.results || [];

                        state.stats = action.payload.stats || {
                            total_customers: 0,
                            blocked_customers: 0,
                            not_blocked_customers: 0
                        };

                        state.next = action.payload.next;
                        state.previous = action.payload.previous;
                        state.count = action.payload.count;


                })

                .addCase(fetchCustomers.rejected, (state, action) => {
                    state.searchLoading = false;
                    state.error = action.payload;
                })


                // BLOCK / UNBLOCK CUSTOMER
                .addCase(customerBlock.pending, (state) => {
                    state.blockLoading = true;
                    state.error = null;
                })

                .addCase(customerBlock.fulfilled, (state, action) => {
                    state.blockLoading = false;

                    const updatedCustomer = action.payload.data;

                    const index = state.customers.findIndex(
                        (customer) => customer.id === updatedCustomer.id
                    );

                    if (index !== -1) {
                        state.customers[index].is_blocked =
                            updatedCustomer.is_blocked;
                    }
                })

                .addCase(customerBlock.rejected, (state, action) => {
                    state.blockLoading = false;
                    state.error = action.payload;
                });
        }

            
    
});

export const { clearCustomerError } = customerSlice.actions;

export default customerSlice.reducer;
