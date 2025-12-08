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
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import ChatWidget from "./components/chatbot/ChatWidget.jsx";


function MainLayout() {
return (
  <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-800 flex">
    {/* Sidebar giữ nguyên */}
    <div className="fixed top-0 left-0 h-full w-24 z-10">
      <Sidebar />
    </div>

    <div className="flex-1 ml-24 flex flex-col">
      {/* Navbar giữ nguyên */}
      <div className="fixed top-0 left-24 right-0 z-20">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-4 flex-grow mt-16">
        
        {/* --- ĐÂY LÀ PHẦN ĐƯỢC THÊM LẠI ĐỂ TẠO VIỀN --- */}
        <div className="bg-black/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl min-h-[calc(100vh-8rem)]">
          {/* Thêm một lớp div p-4 hoặc p-6 ở đây để nội dung không dính sát mép viền */}
          <div className="p-6"> 
            <Outlet />
          </div>
        </div>
        {/* --------------------------------------------- */}

      </main>

      <Footer />
    </div>
          <ChatWidget />
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
          {/* ============================================================ */}
          {/* MAIN LAYOUT ROUTES (Sidebar + Navbar)                        */}
          {/* ============================================================ */}
          <Route element={<MainLayout />}>
            {/* --- Public Routes (Ai cũng xem được) --- */}
            <Route path="/" element={<HomeEntry />} />
            <Route path="/products" element={<ProductPages />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* --- Authenticated Routes (Phải đăng nhập mới xem được) --- */}
            {/* Cho phép Customer và Publisher truy cập các tính năng người dùng cơ bản */}
            <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
              <Route path="/favorites" element={<Favorite />} />
              <Route path="/bought" element={<Bought />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/report" element={<Report />} />
            </Route>

            {/* --- PUBLISHER Routes (Chỉ Publisher mới xem được) --- */}
            <Route element={<ProtectedRoute allowedRoles={["PUBLISHER"]} />}>
              <Route
                path="/promotions"
                element={<PublisherManagerDiscount />}
              />
              <Route path="/revenue" element={<PublisherManagerRevenue />} />
              <Route
                path="/publisher/games"
                element={<PublishserManageGame />}
              />
              <Route path="/publisher/profile" element={<PublisherProfile />} />
            </Route>
          </Route>

          {/* ============================================================ */}
          {/* PUBLISHER UPLOAD LAYOUT (Full screen, riêng biệt)            */}
          {/* ============================================================ */}
          <Route element={<ProtectedRoute allowedRoles={["PUBLISHER"]} />}>
            <Route path="/publisher/upload" element={<PublisherUpload />}>
              <Route index element={<PublisherInfo />} />
              <Route path="build" element={<PublisherBuild />} />
            </Route>
          </Route>

          {/* ============================================================ */}
          {/* ADMIN ROUTES (AdminLayout)                                   */}
          {/* ============================================================ */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
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
          </Route>

          {/* ============================================================ */}
          {/* AUTH ROUTES (Login/Register)                                 */}
          {/* ============================================================ */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/publisher-register" element={<PublisherRegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/publisher/register"
            element={<PublisherRegisterPage />}
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
