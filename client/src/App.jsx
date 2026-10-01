import { useState } from "react";

import Advertisement from "./pages/Advertisement";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import './style/pagesCss/advertisement.css'
import './style/componentsCss/navbar.css'
import { Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/profile/Profile";
import Orders from "./pages/orders/Orders";
import OrderDetails from "./pages/orders/OredrDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupons";

const App = () => {
  const [showAdvertisement, setShowAdvertisement] = useState(true);

  const handleAdvertisementEnd = () => {
    setShowAdvertisement(false);
  };

  if (showAdvertisement) {
    return (
      <Advertisement
        onContinue={handleAdvertisementEnd}
      />
    );
  }

  return (
  <div className="app">
    <Header />

    <main className="app-main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products/>}/>
        <Route path="/products/:id" element={<ProductDetails/>}/>
        <Route path="/categories" element={<Categories/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/about" element={<About />} />

        <Route path="/checkout" element={<Checkout/>}/>

        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/verify-otp" element={<VerifyOtp/>}/>

        {/* profie */}
        <Route path="/profile" element={<Profile/>}/>

        {/* orders */}
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/orders/:id" element={<OrderDetails/>}/>


        {/* Admin dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="/admin/orders" element={<AdminOrders/>}/>
        <Route path="/admin/coupons" element={<AdminCoupons/>}/>
      </Routes>
    </main>

    <Footer />
  </div>
);
};

export default App;

