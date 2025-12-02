"use client";
import React, { useState, useEffect, useContext } from "react";
import { AlertCircle, Upload, CheckCircle2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronDown } from "lucide-react";
import reportApi from "../api/reports";
import { UserContext } from "../store/UserContext";

export default function Report() {
  const { user } = useContext(UserContext);
  
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    orderId: "",
  });

  // Lấy danh sách đơn hàng cho report
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const data = await reportApi.getMyOrdersForReport();
        console.log("Orders loaded:", data);
        // Xử lý trường hợp backend trả về undefined/null
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setOrdersError(err);
        console.error("Lỗi tải đơn hàng:", err);
        setOrders([]); // Đảm bảo orders luôn là array
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user]);
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Kiểm tra đăng nhập
  useEffect(() => {
    // Chờ UserContext load xong
    const timer = setTimeout(() => {
      if (!user) {
        window.location.href = "/login";
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [user]);

  // Hiển thị loading khi chưa có user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6B1BA8] via-[#8130CD] to-[#6B1BA8] flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }



  // 📂 Xử lý file
  const handleFileChange = (e) => {
    if (e.target.files) setAttachments(Array.from(e.target.files));
  };
  const removeFile = (index) => setAttachments(attachments.filter((_, i) => i !== index));

  // 📨 Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("orderId", formData.orderId);
      
      // Thêm files
      attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      await reportApi.createReport(formDataToSend);
      
      setIsSubmitted(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          title: "",
          description: "",
          orderId: "",
        });
        setAttachments([]);
      }, 3500);
    } catch (err) {
      setError(err.message || "Gửi báo cáo thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🧾 Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💌 Hiển thị trạng thái gửi thành công
  if (isSubmitted)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6B1BA8] to-[#8130CD] text-white"
      >
        <div className="bg-white/10 p-10 rounded-2xl text-center shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold mb-2">Báo cáo đã gửi thành công!</h2>
          <p className="text-purple-200">
            Cảm ơn bạn đã giúp chúng tôi cải thiện. Đội ngũ kỹ thuật sẽ xem xét sớm nhất có thể
          </p>
        </div>
      </motion.div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6B1BA8] via-[#8130CD] to-[#6B1BA8] py-12 px-4 text-white overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <AlertCircle className="w-12 h-12 mx-auto text-purple-100 drop-shadow-lg" />
          </motion.div>
          <h1 className="text-4xl font-bold mt-3 drop-shadow-md">
            Báo Cáo Lỗi Đơn Hàng
          </h1>
          <p className="text-purple-200 mt-2">
            Gặp vấn đề với đơn hàng của bạn? Hãy cho chúng tôi biết!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-center"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <FormSection title="1. Chọn đơn hàng bị lỗi">
            {ordersError && (
              <p className="text-red-300 text-sm mb-2">⚠️ Lỗi tải đơn hàng: {ordersError?.message || "Không thể kết nối server"}</p>
            )}
            {!ordersLoading && !ordersError && orders && orders.length === 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-2">
                <p className="text-yellow-200 text-sm">ℹ️ Bạn chưa có đơn hàng hoàn tất nào để báo cáo.</p>
                <p className="text-yellow-300/70 text-xs mt-1">Chỉ có thể báo cáo đơn hàng đã thanh toán thành công.</p>
              </div>
            )}
            <div className="relative">
              <select
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none appearance-none cursor-pointer text-white"
                required
                disabled={ordersLoading || orders.length === 0}
              >
                <option value="" disabled className="bg-gray-800 text-gray-400">
                  {ordersLoading ? "Đang tải..." : orders.length === 0 ? "Không có đơn hàng" : "Chọn đơn hàng"}
                </option>
                {orders && orders.map((order) => (
                  <option key={order.id} value={order.id} className="bg-gray-800 text-white">
                    {order.orderCode} - {order.createdAt} - {order.total?.toLocaleString('vi-VN')} VNĐ
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
            </div>
          </FormSection>

          <FormSection title="2. Tiêu đề vấn đề">
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ví dụ: Không nhận được key game"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none text-white"
              required
            />
          </FormSection>


          <FormSection title="3. Mô tả chi tiết" desc="Giải thích vấn đề bạn gặp phải">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ví dụ: Sau khi thanh toán xong thì không thấy game trong thư viện. Đã kiểm tra nhiều lần nhưng vẫn không có key game."
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none min-h-40 text-white"
              required
            />
          </FormSection>

          {/* Upload & Preview */}
          <FormSection title="4. File minh chứng (tùy chọn)" desc="Tải lên ảnh chụp màn hình để minh chứng">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
            >
              <Upload className="w-6 h-6 text-white/80" />
              <span className="text-sm text-purple-200">
                Nhấp để chọn hoặc kéo thả file (PNG, JPG, MP4)
              </span>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 grid md:grid-cols-3 gap-4"
                >
                  {attachments.map((file, i) => (
                    <div key={i} className="relative group">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="rounded-lg w-full h-32 object-cover border border-white/20"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          className="rounded-lg w-full h-32 object-cover border border-white/20"
                          controls
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </FormSection>



          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
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
            <button
              type="reset"
              onClick={() => {
                setFormData({
                  title: "",
                  description: "",
                  orderId: "",
                });
                setAttachments([]);
                setError("");
              }}
              className="px-6 py-3 rounded-lg font-semibold border border-white/30 hover:bg-white/10 transition-all"
            >
              Xóa
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function FormSection({ title, desc, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="p-6 bg-white/10 rounded-xl shadow-md backdrop-blur-sm border border-white/20 hover:border-purple-400/40 transition-all"
    >
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      {desc && <p className="text-purple-200 text-sm mb-4">{desc}</p>}
      {children}
    </motion.div>
  );
}
