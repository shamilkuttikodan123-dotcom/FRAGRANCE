import React from 'react'
import UserRoutes from '../routes/UserRoutes'
import { Routes,Route } from 'react-router-dom'
//admin
import Dashboard from '../pages/admin/Dashboard/Dashboard'
import AdminLogin from '../pages/admin/adminAuthetication/AdminLogin'
import ForgotPassword from '../pages/admin/adminAuthetication/ForgotPassword'
import ResetPassword from '../pages/admin/adminAuthetication/ResetPassword'
import VerifyResetPassword from '../pages/admin/adminAuthetication/VerifyResetPassword'

import Products from '../pages/admin/Products/Products'
import Category from '../pages/admin/Category/Category'
import Referrals from '../pages/admin/Referrals/Referrals'
import Orders from '../pages/admin/Orders/Orders'
import Customers from '../pages/admin/Customers/Customers'
import Coupens from '../pages/admin/Coupens/Coupens'
import Returns from '../pages/admin/Returns/Returns'
import Reviews from '../pages/admin/Reviews/Reviews'
import SalesReport from '../pages/admin/Sales-Report/SalesReport'
import Settings from '../pages/admin/Settings/Settings'
import Signout from '../pages/admin/adminAuthetication/Signout'

import AdminGuestRoute from '../components/AdminSection/AdminGuestRoute'
import AdminLayout from '../components/AdminSection/AdminLayout'
import AdminProtectedRoute from '../components/AdminSection/AdminProtectedRoute'
function App() {
  return (
     <>
        <Routes>
            {/* User routes */}
            <Route path="/*" element={<UserRoutes />} />

            {/* Admin routes */}
            <Route element={<AdminGuestRoute/>}>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path='admin/forgot-password' element={<ForgotPassword/>}/>
            <Route path='/admin/verify-reset-password' element={<VerifyResetPassword/>}/>
            <Route path='/admin/reset-password' element={<ResetPassword/>}/>
            </Route>


            <Route element={<AdminProtectedRoute/>}>
            <Route element={<AdminLayout/>}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/category" element={<Category />} />
            <Route path="/admin/referrals" element={<Referrals />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/coupens" element={<Coupens />} />
            <Route path="/admin/returns" element={<Returns />} />
            <Route path="/admin/reviews" element={<Reviews />} />
            <Route path="/admin/sales-report" element={<SalesReport />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/signout" element={<Signout />} />
            </Route>
            </Route>


            <Route/>
        </Routes>
     </>



  )
}

export default App




