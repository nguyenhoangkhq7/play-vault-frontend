"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle, Upload, CheckCircle2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronDown } from "lucide-react";

export default function Report() {
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
    severity: "",
    bugType: "",
    email: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 🧠 Gợi ý tự động (AI Suggestion)
  useEffect(() => {
    const lower = formData.summary.toLowerCase();
    if (lower.includes("thanh toán")) {
      setFormData((prev) => ({ ...prev, bugType: "payment", severity: "high" }));
    } else if (lower.includes("giao diện")) {
      setFormData((prev) => ({ ...prev, bugType: "ui", severity: "medium" }));
    } else if (lower.includes("chậm") || lower.includes("lag")) {
      setFormData((prev) => ({ ...prev, bugType: "performance", severity: "medium" }));
    }
  }, [formData.summary]);



  // 📂 Xử lý file
  const handleFileChange = (e) => {
    if (e.target.files) setAttachments(Array.from(e.target.files));
  };
  const removeFile = (index) => setAttachments(attachments.filter((_, i) => i !== index));

  // 📨 Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        summary: "",
        description: "",
        stepsToReproduce: "",
        expectedResult: "",
        actualResult: "",
        severity: "",
        bugType: "",
        email: "",
      });
      setAttachments([]);
    }, 3500);
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
            Báo Cáo Lỗi Hệ Thống
          </h1>
          <p className="text-purple-200 mt-2">
            Hãy giúp chúng tôi phát hiện và sửa lỗi nhanh hơn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection title="1. Tiêu đề lỗi" >
            <input
            name="summary"
            value={formData.summary}
            readOnly
            placeholder="Ví dụ: Lỗi khi thanh toán đơn hàng #ORD-003"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none cursor-not-allowed"
            required
            />
          </FormSection>


          <FormSection title="2. Mô tả chi tiết" desc="Giải thích điều gì đã xảy ra và bạn mong đợi điều gì">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ví dụ: Đơn hàng không cập nhật trạng thái dù đã thanh toán thành công."
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none min-h-32"
              required
            />
          </FormSection>
          <div className="grid md:grid-cols-2 gap-6">
            <FormSection title="3. Kết quả mong muốn">
              <textarea
                name="expectedResult"
                value={formData.expectedResult}
                onChange={handleInputChange}
                placeholder="Ví dụ: Đơn hàng chuyển sang trạng thái 'Hoàn thành'."
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none min-h-24"
              />
            </FormSection>

            <FormSection title="4. Kết quả thực tế">
              <textarea
                name="actualResult"
                value={formData.actualResult}
                onChange={handleInputChange}
                placeholder="Ví dụ: Trang bị đứng và không thay đổi trạng thái."
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none min-h-24"
              />
            </FormSection>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
          </div>

          {/* Upload & Preview */}
          <FormSection title="5. File minh họa" desc="Tải lên ảnh hoặc video để mô tả lỗi">
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

          {/* System Info */}

          {/* Email */}
          {/* <FormSection title="10. Email liên hệ"> // Phần này sẽ áp cứng email khi đăng nhập 
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#8130CD] outline-none"
              required
            />
          </FormSection> */}

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
                  summary: "",
                  description: "",
                  stepsToReproduce: "",
                  expectedResult: "",
                  actualResult: "",
                  severity: "",
                  bugType: "",
                  email: "",
                });
                setAttachments([]);
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
