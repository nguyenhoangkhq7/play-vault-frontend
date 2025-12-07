"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { submitReport, checkOrderExists } from "../api/report.js";
import { useUser } from "../store/UserContext";
import { useSearchParams } from "react-router-dom";

export default function ReportPage() {
  const { setAccessToken } = useUser();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    orderId: searchParams.get("orderId") || "",
    title: "",
    description: "",
    transactionCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [isValidatingOrder, setIsValidatingOrder] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear order error when user starts typing
    if (name === "orderId" && orderError) {
      setOrderError("");
    }
  };

  const validateOrderId = async (orderId) => {
    if (!orderId.trim()) return;

    setIsValidatingOrder(true);
    try {
      const exists = await checkOrderExists(orderId, setAccessToken);
      if (!exists) {
        setOrderError(
          "Đơn hàng không tồn tại. Vui lòng kiểm tra lại mã đơn hàng."
        );
      } else {
        setOrderError("");
      }
    } catch (err) {
      console.error("Error validating order:", err);
      // Nếu có lỗi khi kiểm tra, cho phép submit (để tránh block user)
      setOrderError("");
    } finally {
      setIsValidatingOrder(false);
    }
  };

  const handleOrderIdBlur = () => {
    if (formData.orderId.trim()) {
      validateOrderId(formData.orderId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate order exists before submitting
    if (formData.orderId && !isValidatingOrder) {
      const exists = await checkOrderExists(formData.orderId, setAccessToken);
      if (!exists) {
        setOrderError(
          "Đơn hàng không tồn tại. Vui lòng kiểm tra lại mã đơn hàng."
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await submitReport(formData, setAccessToken);
      setIsSubmitted(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          orderId: "",
          title: "",
          description: "",
          transactionCode: "",
        });
        setOrderError("");
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gửi báo cáo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6B1BA8] to-[#8130CD] text-white"
      >
        <div className="bg-white/10 p-10 rounded-2xl text-center shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold mb-2">
            Báo cáo đã gửi thành công!
          </h2>
          <p className="text-purple-200">
            Cảm ơn bạn đã gửi báo cáo. Chúng tôi sẽ xem xét sớm nhất có thể.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6B1BA8] via-[#8130CD] to-[#6B1BA8] py-12 px-4 text-white overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <AlertCircle className="w-12 h-12 mx-auto text-purple-100 drop-shadow-lg" />
          </motion.div>
          <h1 className="text-4xl font-bold mt-3 drop-shadow-md">
            Báo Cáo Đơn Hàng
          </h1>
          <p className="text-purple-200 mt-2">
            Hãy gửi báo cáo nếu có vấn đề với đơn hàng của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection title="Mã đơn hàng">
            <input
              type="text"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              onBlur={handleOrderIdBlur}
              placeholder="Ví dụ: ORD-12345"
              className={`w-full p-3 rounded-lg bg-white/10 border ${
                orderError ? "border-red-500" : "border-white/20"
              } focus:ring-2 focus:ring-[#8130CD] outline-none`}
              required
            />
            {orderError && (
              <p className="text-red-400 text-sm mt-1">{orderError}</p>
            )}
            {isValidatingOrder && (
              <p className="text-yellow-400 text-sm mt-1 flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang kiểm tra đơn hàng...
              </p>
            )}
          </FormSection>

          <FormSection title="Tiêu đề báo cáo">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ví dụ: Thanh toán không thành công nhưng bị trừ tiền"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none"
              required
            />
          </FormSection>

          <FormSection title="Mô tả chi tiết">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả vấn đề bạn gặp phải..."
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none min-h-32"
              required
            />
          </FormSection>

          <FormSection title="Mã giao dịch">
            <input
              type="text"
              name="transactionCode"
              value={formData.transactionCode}
              onChange={handleInputChange}
              placeholder="Là mã giao dịch từ ngân hàng/ví điện tử (nếu có)"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none"
              required
            />
          </FormSection>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !!orderError || isValidatingOrder}
              className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-[#6B1BA8] to-[#8130CD] hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                </span>
              ) : (
                "Gửi Báo Cáo"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="p-6 bg-white/10 rounded-xl shadow-md backdrop-blur-sm border border-white/20 hover:border-purple-400/40 transition-all"
    >
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}
