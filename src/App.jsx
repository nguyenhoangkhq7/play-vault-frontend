import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, NavLink } from "react-router-dom";
import HomePage from './pages/Home.jsx';
import Sidebar from "./components/home/sidebar";
import Footer from "./components/home/footer";
import Navbar from "./components/home/navbar";
import UserProfiles from "./pages/UserProfiles.jsx";
import Bought from "./pages/Bought.jsx";
import Favorite from "./pages/Favorite.jsx";
import Login from "./pages/Login.jsx";
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import GameDetail from './pages/GameDetail.jsx';
import ProductPages from './pages/ProductPages.jsx';
import CartPage from './pages/CartPage.jsx';
import AdminLayout from "./layouts/AdminLayout"
import Dashboard from "./pages/Dashboard"
import Users from "./pages/Users"
import Games from "./pages/Games"
import Approval from "./pages/Approval"
import Monitoring from "./pages/Monitoring"
import Reports from "./pages/Reports"
import AdminProfile from "./pages/AdminProfile"


// Layout component to wrap pages with Sidebar, Navbar, and Footer
function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-800 flex">
      {/* Fixed Sidebar on the left */}
      <div className="fixed top-0 left-0 h-full w-20 z-10">
        <Sidebar />
      </div>
      <div className="flex-1 ml-20 flex flex-col">
        {/* Fixed Navbar at the top */}
        <div className="fixed top-0 left-20 right-0 z-20">
          <Navbar />
        </div>
        {/* Add padding-top to avoid content being overlapped by Navbar */}
        <div className="container mx-auto p-4 flex-grow mt-24">
          <div className="bg-black/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 overflow-y-auto">
              <Outlet /> {/* Render child routes here */}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main layout for all pages except login, register, forgot-password, and admin */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPages />} />
          <Route path="/favorites" element={<Favorite />} />
          <Route path="/bought" element={<Bought />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/game/:id" element={<GameDetail />} />
        </Route>

        {/* Independent routes for login, register, and forgot-password */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin routes nested under AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="games" element={<Games />} />
          <Route path="approval/*" element={<Approval />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
