import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "../../store/UserContext";

export default function PaymentModal({ isOpen, onClose, onSuccess }) {
  const { user, setUser } = useUser();

  const packages = [
    { amount: 10000, label: "10.000 G-Coin" },
    { amount: 20000, label: "20.000 G-Coin" },
    { amount: 50000, label: "50.000 G-Coin" },
    { amount: 100000, label: "100.000 G-Coin" },
    { amount: 200000, label: "200.000 G-Coin" },
    { amount: 500000, label: "500.000 G-Coin" },
  ];

  const MY_BANK = {
    BANK_ID: "MB",
    ACCOUNT_NO: "0962484103",
    ACCOUNT_NAME: "CAO THANH DONG",
    TEMPLATE: "compact"
  };

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null); // 'bank' hoặc 'momo'
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showIncrement, setShowIncrement] = useState(false);
  const [lastDeposit, setLastDeposit] = useState(null);

  // Tạo QR
  const generateQR = () => {
    if (!selectedAmount || !selectedMethod) {
      alert("Vui lòng chọn gói nạp và phương thức thanh toán!");
      return;
    }
    if (selectedMethod === "bank") {
      setQrImage(
        `https://img.vietqr.io/image/${MY_BANK.BANK_ID}-${MY_BANK.ACCOUNT_NO}-${MY_BANK.TEMPLATE}.png?amount=${selectedAmount}&addInfo=Nap ${selectedAmount} GCoin&accountName=${encodeURIComponent(MY_BANK.ACCOUNT_NAME)}`
      );
    } else {
      setQrImage(null);
    }
  };

  // Xác nhận đã chuyển khoản
  const confirmDeposit = async () => {
    if (!selectedAmount || !selectedMethod) {
      alert("Vui lòng chọn gói nạp và phương thức thanh toán!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        onClose();
        return;
      }

      const res = await axios.post(
        "http://localhost:8080/api/wallet/deposit",
        null,
        {
          params: { amount: selectedAmount, method: selectedMethod.toUpperCase() },
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      const data = res.data;

      // Cập nhật balance trong context
      if (setUser && data.newBalance !== undefined) {
        setUser(prev => ({ ...prev, balance: data.newBalance }));
      }

      // Hiệu ứng +G-Coin
      setLastDeposit({ amount: data.amount || selectedAmount });
      setShowIncrement(true);
      setTimeout(() => setShowIncrement(false), 2500);

      toast.success?.(`Nạp thành công ${selectedAmount.toLocaleString()} G-Coin!`);
      onClose();
      onSuccess?.(data.newBalance);

    } catch (err) {
      console.error("Lỗi nạp tiền:", err);
      let message = "Nạp tiền thất bại. Vui lòng thử lại sau.";
      if (err.response) {
        if (err.response.status === 401) message = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!";
        else message = err.response.data?.error || err.response.data || message;
      } else if (err.message.includes("timeout")) message = "Kết nối quá lâu. Vui lòng thử lại.";
      toast.error?.(message) || alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-[1200px] max-w-[95%] bg-[#1f1f24] rounded-2xl p-8 text-white relative shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-between items-start gap-10">
              {/* LEFT */}
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-3">1. Chọn gói nạp</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {packages.map(p => (
                    <button
                      key={p.amount}
                      onClick={() => setSelectedAmount(p.amount)}
                      className={`p-4 rounded-xl border text-left transition ${
                        selectedAmount === p.amount ? "bg-green-600 border-green-400" : "bg-[#25252c] border-[#444]"
                      }`}
                    >
                      <p className="font-bold text-lg">{p.label}</p>
                      <p className="text-orange-400 mt-1">Giá: {p.amount.toLocaleString("vi-VN")}đ</p>
                    </button>
                  ))}
                </div>

                <h3 className="text-lg font-bold mb-3">2. Phương thức thanh toán</h3>
                <div className="flex gap-4 mb-5">
                  <button
                    onClick={() => setSelectedMethod("bank")}
                    className={`flex-1 p-3 rounded-xl border text-center transition ${
                      selectedMethod === "bank" ? "bg-orange-500 text-white border-orange-400" : "bg-[#25252c] border-gray-600 text-gray-200"
                    }`}
                  >
                    Chuyển khoản Ngân hàng
                  </button>
                  <button
                    onClick={() => setSelectedMethod("momo")}
                    className={`flex-1 p-3 rounded-xl border text-center transition ${
                      selectedMethod === "momo" ? "bg-orange-500 text-white border-orange-400" : "bg-[#25252c] border-gray-600 text-gray-200"
                    }`}
                  >
                    Chuyển khoản Momo
                  </button>
                </div>

                <button
                  onClick={generateQR}
                  className="w-full py-3 mb-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Tạo QR
                </button>

                <button
                  onClick={confirmDeposit}
                  disabled={loading}
                  className="w-full py-3 bg-red-500 rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
                </button>
              </div>

              {/* RIGHT */}
              <div className="flex-1 flex flex-col items-center justify-center bg-[#25252c] rounded-xl p-6 border border-[#444] relative">
                <h3 className="text-center font-bold text-sm bg-orange-500 px-4 py-2 rounded-md mb-6 w-full">
                  QUÉT MÃ ĐỂ THANH TOÁN
                </h3>

                <div className="w-64 h-64 bg-white flex items-center justify-center rounded-xl overflow-hidden shadow-lg mb-4">
                  {qrImage ? (
                    <img src={qrImage} alt="VietQR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-500 p-4">
                      <p className="mb-2">Chưa có mã QR</p>
                      <p className="text-xs">Vui lòng chọn gói và nhấn nút tạo QR</p>
                    </div>
                  )}
                </div>

                {/* Animation +G-Coin */}
                <AnimatePresence>
                  {showIncrement && lastDeposit && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: -20 }}
                      exit={{ opacity: 0, y: -40 }}
                      className="absolute top-2 right-6 text-green-400 font-bold text-lg"
                    >
                      +{lastDeposit.amount.toLocaleString("vi-VN")} G-Coin
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
