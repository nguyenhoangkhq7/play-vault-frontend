import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import SuccessModal from "./SuccessModal";
import DownloadModal from "./DownloadModal";

// ScrollPane Component
const ScrollPane = ({ children, className = "" }) => {
  return (
    <div 
      className={`
        scroll-pane 
        overflow-y-auto 
        custom-scrollbar 
        scroll-smooth 
        rounded-xl 
        border 
        border-purple-500/20 
        bg-purple-900/10 
        p-4 
        ${className}
      `}
    >
      <style jsx>{`
        .scroll-pane {
          max-height: 60vh;
        }
        
        .scroll-pane::-webkit-scrollbar {
          width: 10px;
        }

        .scroll-pane::-webkit-scrollbar-track {
          background: rgba(30, 0, 60, 0.3);
          border-radius: 8px;
          margin: 4px 0;
          border: 1px solid rgba(168, 85, 247, 0.2);
        }

        .scroll-pane::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, 
            rgba(168, 85, 247, 0.8), 
            rgba(192, 132, 252, 0.8), 
            rgba(168, 85, 247, 0.8)
          );
          border-radius: 8px;
          border: 2px solid rgba(168, 85, 247, 0.3);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
        }

        .scroll-pane::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, 
            rgba(168, 85, 247, 1), 
            rgba(192, 132, 252, 1), 
            rgba(168, 85, 247, 1)
          );
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.8);
        }

        .scroll-pane::-webkit-scrollbar-corner {
          background: rgba(30, 0, 60, 0.3);
        }
      `}</style>
      {children}
    </div>
  );
};

export default function PaymentModal({
  onClose,
  onSuccess,
  checkoutMode,
  userBalance = 0,
  gamePrice = 0,
}) {
  const [selectedAmount, setSelectedAmount] = useState("100000");
  const [selectedMethod, setSelectedMethod] = useState("credit");
  const [selectedBank, setSelectedBank] = useState("VCB");
  const [modalStage, setModalStage] = useState("payment");
  const [showBalanceWarning, setShowBalanceWarning] = useState(true); // Hiển thị cảnh báo số dư không đủ

  const amounts = ["10000", "20000", "50000", "100000", "200000"];
  const banks = [
    "BIDV",
    "Vietcombank", 
    "TPBank",
    "Techcombank",
    "ACB",
    "MB",
    "Sacombank",
    "VPBank",
    "VIB",
  ];

  const handlePayment = () => {
    setModalStage("success");
  };

  const handleSuccessClose = async (addedAmount) => {
    if (onSuccess) await onSuccess(parseInt(selectedAmount));
    setModalStage("payment");
    onClose?.();
  };

  const handleDownloadClose = () => {
    setModalStage("payment");
    if (onClose) onClose();
  };

  return (
    <>
      <style jsx global>{`
        .payment-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(168, 85, 247, 0.5) rgba(30, 0, 60, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 0, 60, 0.3);
          border-radius: 10px;
          margin: 4px 0;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(168, 85, 247, 0.8), rgba(192, 132, 252, 0.8));
          border-radius: 10px;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(168, 85, 247, 1), rgba(192, 132, 252, 1));
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }

        .selected-glow {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
        }

        @keyframes borderGlow {
          0% { border-color: rgba(168, 85, 247, 0.5); }
          50% { border-color: rgba(192, 132, 252, 0.8); }
          100% { border-color: rgba(168, 85, 247, 0.5); }
        }

        .animate-border-glow {
          animation: borderGlow 2s ease-in-out infinite;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {/* PAYMENT MODAL - FULLSCREEN WITH SCROLLPANE */}
        {modalStage === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="payment-modal-overlay bg-gradient-to-br from-purple-900 via-purple-800 to-black"
          >
            {/* Header */}
            <div className="border-b border-purple-500/30 bg-purple-900/20 backdrop-blur-md sticky top-0 z-10 shadow-lg">
              <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                    🎮 Thanh Toán GCoin
                  </h1>
                  <button
                    onClick={onClose}
                    className="text-purple-300 hover:text-white transition-all p-3 hover:bg-purple-700/50 rounded-xl border border-purple-500/30 hover:border-purple-400/60 hover:scale-110"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8 h-[calc(100vh-80px)]">
              <div className="max-w-6xl mx-auto h-full flex flex-col">
                {/* Thông tin tổng quan */}
                <div className="bg-purple-800/30 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 mb-8 animate-border-glow">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    {checkoutMode === "all"
                      ? "🎯 Thanh Toán Toàn Bộ Giỏ Hàng"
                      : "🎯 Thanh Toán Các Mục Đã Chọn"}
                  </h2>
                  
                  {/* Cảnh báo số dư không đủ - HIỂN THỊ BÊN TRONG MODAL */}
                  {showBalanceWarning && gamePrice > userBalance && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-2 text-red-300">
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="font-semibold">⚠️ Số dư không đủ!</span>
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-red-200 mt-2">
                        Bạn cần nạp thêm <span className="font-bold text-yellow-300">{(gamePrice - userBalance).toLocaleString("vi-VN")} GCoin</span> để thanh toán.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-700/30 to-pink-600/20 p-6 rounded-xl border border-purple-500/30 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-purple-200 text-lg font-semibold">💰 Số dư hiện tại</p>
                      </div>
                      <p className="text-4xl font-bold text-green-400 text-center">
                        {userBalance.toLocaleString("vi-VN")} GCoin
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-700/30 to-yellow-600/20 p-6 rounded-xl border border-purple-500/30 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        <p className="text-purple-200 text-lg font-semibold">🎮 Tổng tiền cần thanh toán</p>
                      </div>
                      <p className="text-4xl font-bold text-yellow-300 text-center">
                        {gamePrice.toLocaleString("vi-VN")} GCoin
                      </p>
                    </div>
                  </div>
                </div>

                {/* SCROLLPANE CHÍNH */}
                <ScrollPane className="flex-1">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Cột trái: Chọn gói nạp */}
                    <div className="bg-purple-800/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-xl">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                        💎 Chọn Gói Nạp
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {amounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setSelectedAmount(amount)}
                            className={`p-5 rounded-2xl border-2 transition-all duration-300 text-white font-bold text-lg transform hover:scale-105 ${
                              selectedAmount === amount
                                ? "bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 selected-glow scale-105"
                                : "bg-purple-700/40 border-purple-600 hover:bg-purple-600/50 hover:border-purple-400"
                            }`}
                          >
                            <div className="text-xl">
                              {parseInt(amount).toLocaleString("vi-VN")}đ
                            </div>
                            <div className="text-sm text-purple-200 mt-2 font-normal">
                              ⚡ = {parseInt(amount).toLocaleString("vi-VN")} GCoin
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Gói tùy chọn */}
                      <div className="bg-purple-700/20 p-4 rounded-xl border border-purple-500/20">
                        <label className="block text-purple-200 mb-3 font-semibold text-lg">
                          💡 Hoặc nhập số tiền khác:
                        </label>
                        <input
                          type="number"
                          placeholder="Nhập số tiền..."
                          className="w-full p-4 rounded-xl bg-purple-900/40 text-white border-2 border-purple-500/40 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg placeholder-purple-300"
                          onChange={(e) => setSelectedAmount(e.target.value)}
                          value={selectedAmount}
                        />
                        <div className="text-purple-300 text-sm mt-2">
                          Số GCoin nhận được: <span className="text-green-400 font-bold">{parseInt(selectedAmount || 0).toLocaleString("vi-VN")} GCoin</span>
                        </div>
                      </div>
                    </div>

                    {/* Cột phải: Phương thức thanh toán */}
                    <div className="bg-purple-800/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-xl">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                        🏦 Phương Thức Thanh Toán
                      </h3>

                      <div className="space-y-4 mb-8">
                        {[
                          { id: "credit", label: "Thẻ tín dụng / Ghi nợ", icon: "💳", desc: "Thanh toán nhanh với thẻ Visa/Mastercard" },
                          { id: "momo", label: "Ví MoMo", icon: "📱", desc: "Thanh toán qua ứng dụng MoMo" },
                          { id: "bank", label: "Chuyển khoản ngân hàng", icon: "🏦", desc: "Chuyển khoản trực tiếp" },
                        ].map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                              selectedMethod === method.id
                                ? "bg-gradient-to-r from-purple-600/40 to-pink-600/20 border-purple-400 selected-glow"
                                : "bg-purple-700/20 border-purple-600 hover:bg-purple-600/30"
                            }`}
                          >
                            <input
                              type="radio"
                              value={method.id}
                              checked={selectedMethod === method.id}
                              onChange={() => setSelectedMethod(method.id)}
                              className="accent-purple-500 w-5 h-5 mt-1 flex-shrink-0"
                            />
                            <span className="text-3xl flex-shrink-0">{method.icon}</span>
                            <div className="flex-1">
                              <span className="text-white font-bold text-lg block">
                                {method.label}
                              </span>
                              <span className="text-purple-300 text-sm block mt-1">
                                {method.desc}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Chọn ngân hàng nếu chọn phương thức bank */}
                      {selectedMethod === "bank" && (
                        <div className="bg-purple-700/20 p-4 rounded-xl border border-purple-500/20">
                          <label className="block text-purple-200 mb-3 font-semibold text-lg">
                            🏢 Chọn ngân hàng:
                          </label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full p-4 rounded-xl bg-purple-900/40 text-white border-2 border-purple-500/40 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg"
                          >
                            {banks.map((bank) => (
                              <option key={bank} value={bank}>
                                {bank}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollPane>

                {/* Nút hành động - Fixed at bottom */}
                <div className="sticky bottom-0 bg-gradient-to-t from-purple-900 via-purple-900/95 to-transparent pt-6 pb-4 -mx-6 px-6 mt-6 border-t border-purple-500/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
                    <Button
                      onClick={handlePayment}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-emerald-400/30"
                    >
                      ⚡ Nạp Ngay {parseInt(selectedAmount).toLocaleString("vi-VN")} GCoin
                    </Button>
                    
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="w-full bg-gradient-to-r from-purple-700/40 to-pink-700/40 border-2 border-purple-400/50 text-purple-100 hover:bg-purple-600 hover:text-white font-bold text-xl py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:border-purple-300"
                    >
                      ↩️ Quay Lại Giỏ Hàng
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUCCESS MODAL */}
        {modalStage === "success" && (
          <SuccessModal
            isOpen={true}
            amount={`${parseInt(selectedAmount).toLocaleString("vi-VN")}đ`}
            onClose={() => setModalStage("payment")}
            onSuccess={handleSuccessClose}
          />
        )}

        {/* DOWNLOAD MODAL */}
        {modalStage === "download" && (
          <DownloadModal isOpen={true} onClose={handleDownloadClose} />
        )}
      </AnimatePresence>
    </>
  );
}