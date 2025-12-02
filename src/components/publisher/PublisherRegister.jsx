"use client";

import React, { useState } from "react";
import {
  Building2,
  FileText,
  Globe,
  CreditCard,
  User,
  Lock,
  Mail,
  Phone,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import publisherApi from "../../api/publisherApi";

// 1. Khai báo giá trị mặc định bên ngoài để dễ reset
const INITIAL_FORM_DATA = {
  studioName: "",
  description: "",
  website: "",
  paymentMethod: "",
  accountName: "",
  accountNumber: "",
  bankName: "",
  username: "",
  password: "",
  email: "",
  phone: "",
};

export default function PublisherRegister() {
  const [currentStep, setCurrentStep] = useState("studio");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. Sử dụng INITIAL_FORM_DATA cho state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleNext = () => {
    if (currentStep === "studio") setCurrentStep("payment");
    else if (currentStep === "payment") setCurrentStep("account");
  };

  const handlePrev = () => {
    if (currentStep === "payment") setCurrentStep("studio");
    else if (currentStep === "account") setCurrentStep("payment");
  };

  // --- HÀM XỬ LÝ ĐĂNG KÝ (ĐÃ SỬA) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        userName: formData.username, // Map username -> userName (Backend yêu cầu)
        website: formData.website || "",
      };

      await publisherApi.register(payload);
      
      // 3. Thông báo thành công
      alert("Đăng ký thành công! Vui lòng chờ Admin duyệt hồ sơ.");

      // 4. Reset form về trạng thái ban đầu
      setFormData(INITIAL_FORM_DATA);

      // 5. Quay về bước 1
      setCurrentStep("studio");

      // 6. Cuộn lên đầu trang
      window.scrollTo({ top: 0, behavior: "smooth" });

      // KHÔNG navigate đi đâu cả

    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      const errorMessage = err.response?.data || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="gradient-purple-pink rounded-t-2xl p-8 text-white mb-0 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Thông Tin Tài Khoản Publisher</h1>
        <p className="text-purple-100 text-sm">Hoàn tất hồ sơ đăng ký của bạn</p>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 px-8 pt-6 pb-4 bg-white">
        {["studio", "payment", "account"].map((step, index) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                currentStep === step
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                  : ["studio", "payment", "account"].indexOf(currentStep) > index
                  ? "bg-purple-200 text-purple-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>

            {index < 2 && (
              <div
                className={`flex-1 h-1 rounded-full transition-all ${
                  ["studio", "payment", "account"].indexOf(currentStep) > index
                    ? "bg-gradient-to-r from-purple-600 to-pink-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <Card className="rounded-none border-t rounded-b-2xl bg-white shadow-xl">
        <form onSubmit={handleSubmit} className="p-8">
          
          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* STEP 1: STUDIO */}
          {currentStep === "studio" && (
            <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Thông Tin Studio
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên Studio</label>
                    <input type="text" name="studioName" value={formData.studioName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 hover:bg-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Mô Tả</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 hover:bg-white min-h-24 resize-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Globe className="w-4 h-4" /> Website</label>
                    <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 hover:bg-white" placeholder="https://your-website.com" />
                  </div>
                </div>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {currentStep === "payment" && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Thông Tin Thanh Toán
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phương Thức Thanh Toán
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 hover:bg-white"
                    required
                  >
                    <option value="">Chọn phương thức thanh toán</option>
                    <option value="BANK">Chuyển khoản ngân hàng (BANK)</option>
                    <option value="MOMO">Ví MoMo</option>
                    <option value="ZALOPAY">ZaloPay</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Chủ Tài Khoản</label>
                  <input type="text" name="accountName" value={formData.accountName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-2">Số Tài Khoản</label>
                   <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-2">Tên Ngân Hàng</label>
                   <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACCOUNT */}
          {currentStep === "account" && (
            <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Thông Tin Tài Khoản
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên Đăng Nhập</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Lock className="w-4 h-4" /> Mật Khẩu</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Phone className="w-4 h-4" /> Số Điện Thoại</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                  </div>
                </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === "studio" || loading}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay Lại
            </Button>

            {currentStep !== "account" ? (
              <Button
                type="button"
                onClick={handleNext}
                className="ml-auto flex items-center gap-2 px-8 py-3 gradient-button text-white rounded-xl shadow-md"
              >
                Tiếp Tục
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="ml-auto flex items-center gap-2 px-8 py-3 gradient-button text-white rounded-xl shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Hoàn Thành Đăng Ký"
                )}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}