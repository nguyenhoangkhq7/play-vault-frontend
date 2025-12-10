"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { toast } from 'react-toastify';
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
  AlertCircle,
  Briefcase // Icon for Publisher tab
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import publisherApi from "../../api/publisherApi";

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

// ... InputField component remains the same ...
const InputField = ({ 
  label, 
  name, 
  type = "text", 
  icon: Icon, 
  placeholder, 
  required = true, 
  value, 
  onChange, 
  error 
}) => (
  <div>
    <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-purple-100">
      {Icon && <Icon className="w-4 h-4 text-purple-400" />} {label} {required && <span className="text-pink-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-purple-500 bg-purple-900/40 text-white placeholder-purple-300 hover:bg-purple-900/60 transition-colors ${
        error ? "border-pink-500 focus:ring-pink-500/30" : "border-purple-700/50"
      }`}
    />
    {error && (
      <p className="text-pink-400 text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

export default function PublisherRegister() {
  const navigate = useNavigate(); // Initialize navigation
  const [currentStep, setCurrentStep] = useState("studio");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // ... Validation functions (validateStudio, validatePayment, validateAccount) remain the same ...
  const validateStudio = () => {
    const errors = {};
    if (!formData.studioName.trim()) errors.studioName = "Tên Studio không được để trống";
    else if (formData.studioName.length < 3) errors.studioName = "Tên Studio phải có ít nhất 3 ký tự";

    if (!formData.description.trim()) errors.description = "Mô tả không được để trống";
    else if (formData.description.length < 10) errors.description = "Mô tả quá ngắn (tối thiểu 10 ký tự)";

    if (formData.website && formData.website.trim() !== "") {
        const urlPattern = new RegExp(
          '^(https?:\\/\\/)?' + 
          '(' +
            'localhost|' + 
            '(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + 
            '((\\d{1,3}\\.){3}\\d{1,3})' + 
          ')' +
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + 
          '(\\?[;&a-z\\d%_.~+=-]*)?' + 
          '(\\#[-a-z\\d_]*)?$', 'i' 
        );

        if(!urlPattern.test(formData.website)) {
            errors.website = "Địa chỉ website không hợp lệ";
        }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    const errors = {};
    if (!formData.paymentMethod) errors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
    
    if (!formData.accountName.trim()) errors.accountName = "Tên chủ tài khoản là bắt buộc";
    else if (/\d/.test(formData.accountName)) errors.accountName = "Tên chủ tài khoản không được chứa số";

    if (!formData.accountNumber.trim()) errors.accountNumber = "Số tài khoản là bắt buộc";
    else if (!/^\d+$/.test(formData.accountNumber)) errors.accountNumber = "Số tài khoản chỉ được chứa ký tự số";

    // Chỉ validate Bank Name nếu phương thức là BANK
    if (formData.paymentMethod === 'BANK' && !formData.bankName.trim()) {
        errors.bankName = "Tên ngân hàng là bắt buộc";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAccount = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = "Tên đăng nhập là bắt buộc";
    else if (/\s/.test(formData.username)) errors.username = "Tên đăng nhập không được chứa khoảng trắng";
    else if (formData.username.length < 4) errors.username = "Tên đăng nhập tối thiểu 4 ký tự";

    if (!formData.password) errors.password = "Mật khẩu là bắt buộc";
    else if (formData.password.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) errors.email = "Email là bắt buộc";
    else if (!emailRegex.test(formData.email)) errors.email = "Email không đúng định dạng";

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!formData.phone) errors.phone = "Số điện thoại là bắt buộc";
    else if (!phoneRegex.test(formData.phone)) errors.phone = "Số điện thoại không hợp lệ (VN)";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
        const newData = { ...prev, [name]: value };

        // Logic đặc biệt cho Payment Method
        if (name === "paymentMethod") {
            if (value === "MOMO") {
                newData.bankName = "MoMo"; // Tự động điền
            } else if (value === "ZALOPAY") {
                newData.bankName = "ZaloPay"; // Tự động điền
            } else if (value === "BANK") {
                newData.bankName = ""; // Reset để người dùng nhập
            }
        }
        return newData;
    });

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const handleNext = () => {
    if (currentStep === "studio") {
      if (validateStudio()) setCurrentStep("payment");
    } else if (currentStep === "payment") {
      if (validatePayment()) setCurrentStep("account");
    }
  };

  const handlePrev = () => {
    if (currentStep === "payment") setCurrentStep("studio");
    else if (currentStep === "account") setCurrentStep("payment");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    const isStudioValid = validateStudio();
    const isPaymentValid = validatePayment();
    const isAccountValid = validateAccount();

    if (!isStudioValid) {
      setCurrentStep("studio");
      setApiError("Vui lòng kiểm tra lại thông tin Studio.");
      setLoading(false);
      return;
    }
    if (!isPaymentValid) {
      setCurrentStep("payment");
      setApiError("Vui lòng kiểm tra lại thông tin Thanh toán.");
      setLoading(false);
      return;
    }
    if (!isAccountValid) {
      setApiError("Vui lòng kiểm tra lại thông tin Tài khoản.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        userName: formData.username,
        website: formData.website || "",
      };

      await publisherApi.register(payload);
      
      toast.success("🎉 Đăng ký thành công! Vui lòng chờ Admin duyệt hồ sơ.");
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep("studio");
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      let errorMessage = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
       if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          if (data.includes("Duplicate entry") && data.includes("email")) {
            errorMessage = "Email này đã được sử dụng. Vui lòng chọn email khác.";
          } else if (data.includes("Duplicate entry") && data.includes("username")) {
            errorMessage = "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
          } else {
            errorMessage = data;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 py-10 px-4">
      
      <div className="w-full max-w-2xl">
        {/* --- Card Wrapper --- */}
        <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="p-8">

              {/* --- Header Title --- */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-200 bg-clip-text text-transparent">
                        Đăng Ký Tài Khoản
                    </h1>
                </div>
                {/* --- 1. TAB SWITCHER (NGƯỜI DÙNG / NHÀ PHÁT HÀNH) --- */}
                <div className="flex bg-purple-900/40 p-1 rounded-xl mb-8 border border-purple-700/50">
                    <button
                        type="button"
                        onClick={() => navigate("/register")} // Chuyển sang trang đăng ký User
                        className="w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/50 cursor-pointer transition-all duration-200 text-sm font-medium"
                    >
                        <User size={18} />
                        Người dùng
                    </button>
                    <button
                        type="button"
                        className="w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium shadow-lg shadow-purple-900/20 cursor-default transition-all text-sm"
                    >
                        <Briefcase size={18} />
                        Nhà phát hành
                    </button>
                </div>

                

                {/* --- Progress Bar --- */}
                <div className="flex gap-2 mb-8">
                    {["studio", "payment", "account"].map((step, index) => (
                        <div key={step} className="flex items-center gap-2 flex-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all shadow-lg ${
                                currentStep === step
                                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white border border-pink-400"
                                    : ["studio", "payment", "account"].indexOf(currentStep) > index
                                    ? "bg-purple-800 text-purple-200 border border-purple-600"
                                    : "bg-purple-900/50 text-purple-500 border border-purple-800"
                                }`}
                            >
                                {index + 1}
                            </div>
                            {index < 2 && (
                                <div
                                className={`flex-1 h-1 rounded-full transition-all ${
                                    ["studio", "payment", "account"].indexOf(currentStep) > index
                                    ? "bg-gradient-to-r from-pink-600 to-purple-600"
                                    : "bg-purple-900"
                                }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* --- FORM --- */}
                <form onSubmit={handleSubmit}>
                    {apiError && (
                    <div className="mb-6 p-4 bg-red-500/20 text-red-200 rounded-xl text-sm border border-red-500/50 flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {apiError}
                    </div>
                    )}

                    {/* STEP 1: STUDIO */}
                    {currentStep === "studio" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-pink-400" />
                            Thông Tin Studio
                        </h2>
                        <div className="space-y-4">
                            <InputField label="Tên Studio" name="studioName" value={formData.studioName} onChange={handleInputChange} error={fieldErrors.studioName} />
                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-purple-100">
                                    <FileText className="w-4 h-4 text-purple-400" /> Mô Tả <span className="text-pink-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-purple-500 bg-purple-900/40 text-white placeholder-purple-300 hover:bg-purple-900/60 min-h-24 resize-none transition-colors ${
                                    fieldErrors.description ? "border-pink-500" : "border-purple-700/50"
                                    }`}
                                />
                                {fieldErrors.description && (
                                    <p className="text-pink-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.description}
                                    </p>
                                )}
                            </div>
                            <InputField label="Website" name="website" icon={Globe} placeholder="https://your-site.com" required={false} value={formData.website} onChange={handleInputChange} error={fieldErrors.website} />
                        </div>
                    </div>
                    )}

                    {/* STEP 2: PAYMENT */}
                    {currentStep === "payment" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-pink-400" />
                            Thông Tin Thanh Toán
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-purple-100">
                                Phương Thức Thanh Toán <span className="text-pink-500">*</span>
                                </label>
                                <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-purple-500 bg-purple-900/40 text-white hover:bg-purple-900/60 transition-colors [&>option]:bg-purple-900 [&>option]:text-white ${
                                    fieldErrors.paymentMethod ? "border-pink-500" : "border-purple-700/50"
                                }`}
                                >
                                <option value="">Chọn phương thức thanh toán</option>
                                <option value="BANK">Chuyển khoản ngân hàng (BANK)</option>
                                <option value="MOMO">Ví MoMo</option>
                                <option value="ZALOPAY">ZaloPay</option>
                                </select>
                                {fieldErrors.paymentMethod && <p className="text-pink-400 text-xs mt-1">{fieldErrors.paymentMethod}</p>}
                            </div>
                            
                            <InputField label="Tên Chủ Tài Khoản" name="accountName" placeholder="NGUYEN VAN A" value={formData.accountName} onChange={handleInputChange} error={fieldErrors.accountName} />
                            
                            <InputField 
                                label="Số Tài Khoản / Số Điện Thoại Ví" 
                                name="accountNumber" 
                                type="number" 
                                placeholder={formData.paymentMethod === 'BANK' ? "0123456789" : "SĐT đăng ký ví"} 
                                value={formData.accountNumber} 
                                onChange={handleInputChange} 
                                error={fieldErrors.accountNumber} 
                            />
                            
                            {/* Input Tên Ngân Hàng: Disable nếu không phải BANK */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${formData.paymentMethod !== 'BANK' ? 'text-purple-400' : 'text-purple-100'}`}>
                                    Tên Ngân Hàng {formData.paymentMethod === 'BANK' && <span className="text-pink-500">*</span>}
                                </label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleInputChange}
                                    placeholder={formData.paymentMethod === 'BANK' ? "Vietcombank, Techcombank..." : (formData.paymentMethod || "Tên ngân hàng")}
                                    disabled={formData.paymentMethod !== 'BANK'} // Khóa ô nhập
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-purple-500 bg-purple-900/40 text-white placeholder-purple-300 transition-colors ${
                                        formData.paymentMethod !== 'BANK' ? "opacity-50 cursor-not-allowed bg-purple-900/20" : "hover:bg-purple-900/60"
                                    } ${fieldErrors.bankName ? "border-pink-500" : "border-purple-700/50"}`}
                                />
                                {fieldErrors.bankName && (
                                    <p className="text-pink-400 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {fieldErrors.bankName}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* STEP 3: ACCOUNT */}
                    {currentStep === "account" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-pink-400" />
                            Thông Tin Tài Khoản
                        </h2>
                        <div className="space-y-4">
                            <InputField label="Tên Đăng Nhập" name="username" placeholder="publisher123" value={formData.username} onChange={handleInputChange} error={fieldErrors.username} />
                            <InputField label="Mật Khẩu" name="password" type="password" icon={Lock} value={formData.password} onChange={handleInputChange} error={fieldErrors.password} />
                            <InputField label="Email" name="email" type="email" icon={Mail} placeholder="contact@studio.com" value={formData.email} onChange={handleInputChange} error={fieldErrors.email} />
                            <InputField label="Số Điện Thoại" name="phone" type="tel" icon={Phone} placeholder="0901234567" value={formData.phone} onChange={handleInputChange} error={fieldErrors.phone} />
                        </div>
                    </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 mt-8 pt-6 border-t border-purple-700/50">
                        <Button
                            type="button"
                            onClick={handlePrev}
                            disabled={currentStep === "studio" || loading}
                            className="flex items-center gap-2 px-6 py-3 text-purple-200 bg-purple-900/50 hover:bg-purple-800 border border-purple-700 disabled:opacity-50 disabled:bg-purple-950 rounded-xl transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Quay Lại
                        </Button>

                        {currentStep !== "account" ? (
                            <Button
                            type="button"
                            onClick={handleNext}
                            className="ml-auto flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-900/30 transform active:scale-95 transition-all"
                            >
                            Tiếp Tục
                            <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                            type="submit"
                            disabled={loading}
                            className="ml-auto flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-900/30 transform active:scale-95 transition-all disabled:opacity-70"
                            >
                            {loading ? (
                                <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang xử lý...
                                </>
                            ) : (
                                "Đăng Ký"
                            )}
                            </Button>
                        )}
                    </div>
                </form>

                {/* --- 2. LINK ĐĂNG NHẬP --- */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-purple-300">
                        Đã có tài khoản?{" "}
                        <a 
                            href="/login" 
                            className="text-pink-400 font-medium hover:text-pink-300 hover:underline transition-colors cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/login');
                            }}
                        >
                            Đăng nhập
                        </a>
                    </p>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}