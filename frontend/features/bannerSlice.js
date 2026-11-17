
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "../redux/URL";
export const fetchBanners = createAsyncThunk(
    "banner/fetchBanners",
    async (_,thunkAPI) => {
        try {
            const response = await fetch(
                `${URL}/banners/main/`
            );

            const data =await response.json()

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data)
            }
            return data


        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


export const fetchCategoryBanners = createAsyncThunk(
    "banner/fetchCategoryBanners",
    async (_,thunkAPI) => {
        try {
            const response = await fetch(
                `${URL}/banners/other/`
            );

            const data =await response.json()

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data)
            }
            return data


        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);




const bannerSlice = createSlice({
    name: "banner",

    initialState: {
        banners: [],
        categoryBanner:[],
        loading: false,
        error: null,
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchBanners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.banners = action.payload;
            })

            .addCase(fetchBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchCategoryBanners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchCategoryBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.categoryBanner = action.payload;
            })

            .addCase(fetchCategoryBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    }
});

export default bannerSlice.reducer;
