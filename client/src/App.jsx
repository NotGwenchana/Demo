import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Contacts from './components/Contacts';
import Order from './components/Order';
import Cart from './components/Cart';
import NavBar from './components/NavBar';
import AboutUs from './components/AboutUs';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Terms from './components/Terms';
import Franchise from './components/Franchise';
import Profile from './components/Profile';
import axios from 'axios';
import {Toaster} from 'react-hot-toast';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ADhome from './admin/ADhome';
import Checkout from './components/Checkout';
import EditMemberPoint from './admin/EditMemberPoint';
import TotalSales from './admin/TotalSales';
import { ProtectedAdminRoute } from './admin/ProtectedAdminRoute'; // Import the protection component

// Set your backend URL here
axios.defaults.baseURL = 'http://localhost:8000'; 
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <NavBar />
      <Toaster position='bottom-right' toastOptions={{duration: 2000}}/> 
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/orders" element={<Order />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/franchise" element={<Franchise />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <ADhome />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/editmemberpoints" element={
          <ProtectedAdminRoute>
            <EditMemberPoint />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/totalsales" element={
          <ProtectedAdminRoute>
            <TotalSales />
          </ProtectedAdminRoute>
        } />
      </Routes>
    </>
    )
}

export default App;