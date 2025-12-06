import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  NavLink,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/Home.jsx";
import Sidebar from "./components/home/sidebar";
import Footer from "./components/home/footer";
import Navbar from "./components/home/navbar";
import UserProfiles from "./pages/UserProfiles.jsx";
import Bought from "./pages/Bought.jsx";
import Favorite from "./pages/Favorite.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import GameDetail from "./pages/GameDetail.jsx";
import ProductPages from "./pages/ProductPages.jsx";
import ProductDetailPage from "./pages/ProductDetailPages.jsx";
import CartPage from "./pages/CartPage.jsx";
import FeedbackManagement from "./pages/FeedbackManagement.jsx";
import GameManagement from "./pages/GameManagement.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PublisherManagerDiscount from "./pages/PublisherManagerDiscount.jsx";
import PublisherManagerRevenue from "./pages/PublisherManagerRevenue.jsx";
import Report from "./pages/ReportPage.jsx";
import PublisherUpload from "./pages/PublisherUpLoad.jsx";
import PublisherInfo from "./components/publisher/PublisherInfo.jsx";
import PublisherBuild from "./components/publisher/PublisherBuild.jsx";
import PublisherStore from "./components/publisher/PublisherStore.jsx";
import PublishserManageGame from "./pages/PublishserManageGame.jsx";
import { Toaster } from "@/components/ui/sonner";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Games from "./pages/Games";
import Approval from "./pages/Approval";
import Monitoring from "./pages/Monitoring";
import Reports from "./pages/Reports";
import AdminProfile from "./pages/AdminProfiles.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import PublisherRegisterPage from "./pages/PublisherRegisterPage.jsx";
import { CartProvider } from "./store/CartContext";
import PublisherProfile from "./components/userprofile/PublisherProfile.jsx";
import { useUser } from "./store/UserContext";
// Layout component to wrap pages with Sidebar, Navbar, and Footer
function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-800 flex">
      {/* Sidebar Width: w-24 (Giữ nguyên từ bước trước hoặc chỉnh về w-24 nếu chưa có) */}
      <div className="fixed top-0 left-0 h-full w-24 z-10">
        <Sidebar />
      </div>

      <div className="flex-1 ml-24 flex flex-col">
        {/* Navbar Height đã giảm, vị trí fixed vẫn thế */}
        <div className="fixed top-0 left-24 right-0 z-20">
          <Navbar />
        </div>

        {/* THAY ĐỔI: mt-20 -> mt-16 (Khớp với chiều cao Navbar mới) */}
        <div className="container mx-auto p-4 flex-grow mt-16">
          <div className="bg-black/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// Redirect admin khỏi trang "/" sang "/admin"
function HomeEntry() {
  const { user } = useUser();

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <HomePage />;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Main layout for all pages except login, register, forgot-password, and admin */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeEntry />} />
            <Route path="/products" element={<ProductPages />} />
            <Route path="/favorites" element={<Favorite />} />
            <Route path="/bought" element={<Bought />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/promotions" element={<PublisherManagerDiscount />} />
            <Route path="/revenue" element={<PublisherManagerRevenue />} />
            <Route path="/report" element={<Report />} />
            <Route path="/publisher/games" element={<PublishserManageGame />} />
            <Route path="/publisher/profile" element={<PublisherProfile />} />
          </Route>
          {/* Publisher upload uses its own fullscreen layout, don't wrap with MainLayout */}
          <Route path="/publisher/upload" element={<PublisherUpload />}>
            <Route index element={<PublisherInfo />} />
            <Route path="build" element={<PublisherBuild />} />
            <Route path="store" element={<PublisherStore />} />
          </Route>
          {/* Independent routes for login, register, and forgot-password */} */
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/publisher-register" element={<PublisherRegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Admin routes nested under AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="games/*" element={<Games />} />
            <Route path="approval/*" element={<Approval />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
