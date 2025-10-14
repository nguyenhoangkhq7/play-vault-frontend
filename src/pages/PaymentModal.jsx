import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import SuccessModal from "./SuccessModal";
import DownloadModal from "./DownloadModal";

export default function PaymentModal({ onClose, onSuccess, checkoutMode }) {
  const [selectedAmount, setSelectedAmount] = useState(100000);
  const [selectedMethod, setSelectedMethod] = useState("credit");
  const [selectedBank, setSelectedBank] = useState("VCB");
  const [modalStage, setModalStage] = useState("payment"); 
  // "payment" → "success" → "download"

  const amounts = ["10.000đ", "20.000đ", "50.000đ", "100.000đ", "200.000đ"];
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

  const handleSuccessClose = async () => {
    if (onSuccess) await onSuccess();
    setModalStage("download");
  };

  const handleDownloadClose = () => {
    setModalStage("payment");
    if (onClose) onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {modalStage === "payment" && (
        <motion.div
          key="payment"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-purple-900/90 border border-purple-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-purple-300 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              {checkoutMode === "all"
                ? "Thanh Toán Toàn Bộ Giỏ Hàng"
                : "Thanh Toán Các Mục Đã Chọn"}
            </h2>

            {/* Chọn số tiền nạp */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-200 mb-2">Chọn gói nạp:</h3>
              <div className="grid grid-cols-2 gap-3">
                {amounts.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`${
                      selectedAmount === amount
                        ? "bg-purple-600 text-white"
                        : "bg-purple-800/50 text-purple-300"
                    } hover:bg-purple-700 transition-all`}
                  >
                    {amount.toLocaleString("vi-VN")} VND
                  </Button>
                ))}
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-200 mb-2">
                Chọn phương thức thanh toán:
              </h3>
              <div className="flex flex-col gap-2">
                {["credit", "momo", "bank"].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                      selectedMethod === method
                        ? "bg-purple-700/60 text-white"
                        : "bg-purple-800/40 text-purple-300 hover:bg-purple-700/40"
                    }`}
                  >
                    <input
                      type="radio"
                      value={method}
                      checked={selectedMethod === method}
                      onChange={() => setSelectedMethod(method)}
                    />
                    {method === "credit"
                      ? "Thẻ tín dụng / ghi nợ"
                      : method === "momo"
                      ? "Ví MoMo"
                      : "Chuyển khoản ngân hàng"}
                  </label>
                ))}
              </div>
            </div>

            {/* Nếu chọn ngân hàng */}
            {selectedMethod === "bank" && (
              <div className="mb-6">
                <h3 className="text-lg text-purple-200 mb-2">Chọn ngân hàng:</h3>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full p-2 rounded-lg bg-purple-800/50 text-white border border-purple-500/30"
                >
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nút nạp tiền */}
            <Button
              onClick={handlePayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-3 rounded-xl"
            >
              Nạp tiền
            </Button>
          </motion.div>
        </motion.div>
      )}

      {modalStage === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <SuccessModal onClose={handleSuccessClose} />
        </motion.div>
      )}

      {modalStage === "download" && (
        <motion.div
          key="download"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <DownloadModal isOpen={true} onClose={handleDownloadClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
