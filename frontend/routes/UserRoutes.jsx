import React from 'react'
import {Route,Routes} from 'react-router-dom'
import Mens from '../pages/user/Mens'
import Womens from '../pages/user/Womens'
import Attars from '../pages/user/Attars'
import BodyMists from '../pages/user/BodyMists'
import GiftSets from '../pages/user/GiftSets'
import Unisex from '../pages/user/Unisex'
import LandingPage from '../pages/user/LandingPage'
import CustomerLayout from '../components/Home page/CustomerLayout'
import Signup from '../pages/user/Authentication/Signup'
import Login from '../pages/user/Authentication/Login'
import Otp from '../pages/user/Authentication/Otp'
import ForgotPassword from '../pages/user/Authentication/ForgotPassword'

import MyWishlist from '../pages/user/Wishlist/MyWishlist'
import MyOrders from '../pages/user/Orders/Myorders'

import AddressBook from '../pages/user/Address/AddressBook'
import CoupensReferrals from '../pages/user/CoupenReferral/CoupensReferrals'
import MyWallet from '../pages/user/Wallet/MyWallet'
import Signout from '../pages/user/Signout/Signout'
import MyProfile from '../pages/user/Profile/MyProfile'

import VerifyResetPassword from '../pages/user/Authentication/VerifyResetPassword'
import ResetPassword from '../pages/user/Authentication/ResetPassword'
import Cart from '../pages/user/Cart/Cart'
import UserProtectedRoute from '../components/Home page/UserProtectedRoute'
import UserGuestRoute from '../components/Home page/UserGuestRoute'
import AuthLayout from '../components/Home page/AuthLayout'
function UserRoutes() {
  return (
    <>
            <Routes>

            {/* show navabr and footer */}
           <Route element={<CustomerLayout />}> 

            <Route path="/" element={<LandingPage />} />
            <Route path="/mens" element={<Mens />} />
            <Route path="/womens" element={<Womens />} />
            <Route path="/unisex" element={<Unisex />} />
            <Route path="/attars" element={<Attars />} />
            <Route path="/body-mists" element={<BodyMists />} />
            <Route path="/gift-sets" element={<GiftSets />} />


              {/* protected-routes */}
             <Route element={<UserProtectedRoute />}>

             <Route path="/profile" element={<MyProfile />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/wishlist" element={<MyWishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wallet" element={<MyWallet />} />
            <Route path="/coupons-referral" element={<CoupensReferrals />} />
            <Route path="/address-book" element={<AddressBook />} />
            <Route path='/signout' element={<Signout/>}/>

            </Route>

            </Route>

            {/* navbar */}
            <Route element={<AuthLayout/>}>

              {/* guest-route */}
            <Route element={<UserGuestRoute />}>

             <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path='/verify-otp' element={<Otp/>}/>
            <Route path='/login/forgot-password' element={<ForgotPassword/>}/>
            <Route path='/login/verify-reset-password' element={<VerifyResetPassword/>}/>
            <Route path='/login/reset-password' element={<ResetPassword/>}/>

            </Route>
            </Route>


    

            

            </Routes>
    </>
  )
}

export default UserRoutes

