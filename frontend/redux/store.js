import { configureStore } from "@reduxjs/toolkit";
import bannerreducer from '../features/bannerSlice'
import authReducer from '../features/authSlice'
import profileReducer from '../features/profileSlice'
import addressReducer from '../features/addressSlice'

//admin
import adminAuthReducer from '../features/adminfeatures/adminAuthSlice'
import customerReducer from '../features/adminfeatures/customerSlice'
const store =configureStore({
    reducer:{
        banner:bannerreducer,
        auth:authReducer,
        profile:profileReducer,
        address:addressReducer,
        adminAuth:adminAuthReducer,
        customers:customerReducer

    }
})

export default store