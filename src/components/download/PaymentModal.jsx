import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Zap, Check } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "../../store/UserContext.jsx";

export default function PaymentModal({ isOpen = true, onClose }) {
  const { user, setUser } = useUser();
  const packages = [
    { amount: 10000, label: "10.000", gcoin: "10K G-Coin", bonus: 0 },
    { amount: 20000, label: "20.000", gcoin: "20K G-Coin", bonus: 0 },
    { amount: 50000, label: "50.000", gcoin: "50K G-Coin", bonus: 2500 },
    { amount: 100000, label: "100.000", gcoin: "100K G-Coin", bonus: 5000 },
    { amount: 200000, label: "200.000", gcoin: "200K G-Coin", bonus: 15000 },
    { amount: 500000, label: "500.000", gcoin: "500K G-Coin", bonus: 50000 },
  ];

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Lắng nghe kết quả trả về từ VNPay (redirect với query params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const responseCode =
      params.get("vnp_ResponseCode") || params.get("responseCode");
    const transactionStatus = params.get("vnp_TransactionStatus");
    const txnRef = params.get("vnp_TxnRef");
    const amount = params.get("amount") || params.get("vnp_Amount");

    if (responseCode || transactionStatus) {
      const success =
        responseCode === "00" &&
        (!transactionStatus || transactionStatus === "00");
      const message = success
        ? "Thanh toán thành công!"
        : "Thanh toán thất bại. Vui lòng thử lại.";

      setPaymentResult({
        status: success ? "success" : "error",
        message,
        txnRef,
        amount,
      });

      if (success) {
        toast.success(message);
        const addAmount = Number(amount);
        if (!Number.isNaN(addAmount) && setUser) {
          setUser((prev) => ({
            ...prev,
            balance: Number(prev?.balance || 0) + addAmount,
          }));
        }
      } else {
        toast.error(message);
      }

      // Loại bỏ query thanh toán khỏi URL để tránh hiển thị lại khi reload
      [
        "vnp_ResponseCode",
        "responseCode",
        "vnp_TransactionStatus",
        "vnp_TxnRef",
        "vnp_Amount",
        "vnp_OrderInfo",
        "amount",
      ].forEach((key) => params.delete(key));
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${
        newQuery ? `?${newQuery}` : ""
      }${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Xử lý thanh toán VNPay
  const handlePaymentVNPay = async () => {
    if (!selectedAmount || !selectedMethod) {
      toast.error("Vui lòng chọn mệnh giá và phương thức thanh toán!");
      return;
    }

    setLoading(true);

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        onClose();
        return;
      }

      if (selectedMethod === "vnpay") {
        // Gọi API mới của VNPay để lấy link thanh toán
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const customerId =
          user?.customerId ||
          parsedUser?.customerId ||
          user?.id ||
          parsedUser?.id;

        if (!customerId) {
          toast.error("Không tìm thấy Customer ID. Vui lòng đăng nhập lại!");
          return;
        }

        const { data } = await axios.get(
          "http://localhost:8080/api/payment/vn-pay",
          {
            params: { amount: selectedAmount, customerId },
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        const paymentUrl = data?.data?.paymentUrl || data?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          toast.error("Không thể tạo link thanh toán. Vui lòng thử lại!");
        }
        return;
      }

      // Mặc định giữ nguyên luồng cũ cho các phương thức khác (ví dụ Momo)
      const res = await axios.post(
        "https://f171cf5f7400.ngrok-free.app/api/wallet/vnpay-payment",
        null,
        {
          params: {
            amount: selectedAmount,
            method: selectedMethod.toUpperCase(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const data = res.data;

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Không thể tạo link thanh toán. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      let message = "Tạo link thanh toán thất bại. Vui lòng thử lại sau.";
      if (err.response) {
        if (err.response.status === 401)
          message = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!";
        else
          message =
            err.response.data?.error || err.response.data?.message || message;
      } else if (err.message.includes("timeout"))
        message = "Kết nối quá lâu. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white relative shadow-2xl border border-slate-700/50"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-700/30 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Nạp G-Coin
                </h2>
              </div>
              <p className="text-slate-400">
                Chọn mệnh giá và thanh toán qua VNPay
              </p>
            </div>

            {paymentResult && (
              <div
                className={`mb-6 p-4 rounded-xl border ${
                  paymentResult.status === "success"
                    ? "border-green-500/50 bg-green-900/20 text-green-200"
                    : "border-red-500/50 bg-red-900/20 text-red-200"
                }`}
              >
                <p className="font-semibold">
                  {paymentResult.status === "success"
                    ? "Thanh toán thành công!"
                    : "Thanh toán thất bại"}
                </p>
                <p className="text-sm mt-1 text-slate-200">
                  {paymentResult.message}
                  {paymentResult.amount
                    ? ` | Số tiền: ${paymentResult.amount}`
                    : ""}
                  {paymentResult.txnRef
                    ? ` | Mã GD: ${paymentResult.txnRef}`
                    : ""}
                </p>
              </div>
            )}

            {/* Packages Grid */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                Chọn mệnh giá
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {packages.map((pkg) => (
                  <motion.button
                    key={pkg.amount}
                    onClick={() => setSelectedAmount(pkg.amount)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
                      selectedAmount === pkg.amount
                        ? "border-blue-500 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 shadow-lg shadow-blue-500/20"
                        : "border-slate-600 bg-slate-700/20 hover:border-slate-500 hover:bg-slate-700/40"
                    }`}
                  >
                    {/* Background gradient animation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />

                    {/* Content */}
                    <div className="relative">
                      <p className="text-xl font-bold text-white">
                        {pkg.label}
                      </p>
                      <p className="text-sm text-slate-300 mt-1">{pkg.gcoin}</p>

                      {/* Bonus Badge */}
                      {pkg.bonus > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-400/50 rounded-full">
                          <Zap className="w-3 h-3 text-orange-400" />
                          <span className="text-xs font-semibold text-orange-400">
                            +{(pkg.bonus / 1000).toFixed(0)}K Bonus
                          </span>
                        </div>
                      )}

                      {/* Check Mark */}
                      {selectedAmount === pkg.amount && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 p-1 bg-blue-500 rounded-full"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            {selectedAmount && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg"
              >
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-blue-400">
                    Mệnh giá:{" "}
                  </span>
                  {selectedAmount.toLocaleString("vi-VN")} VNĐ
                  {packages.find((p) => p.amount === selectedAmount)?.bonus >
                    0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="font-semibold text-orange-400">
                        Nhận thêm{" "}
                        {packages
                          .find((p) => p.amount === selectedAmount)
                          .bonus.toLocaleString("vi-VN")}{" "}
                        G-Coin
                      </span>
                    </>
                  )}
                </p>
              </motion.div>
            )}

            {/* Payment Methods Info */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                Chọn phương thức thanh toán
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* VNPay */}
                <motion.button
                  onClick={() =>
                    setSelectedMethod(
                      selectedMethod === "vnpay" ? null : "vnpay"
                    )
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 h-32 rounded-xl border-2 transition-all duration-300 overflow-hidden group flex items-center justify-center ${
                    selectedMethod === "vnpay"
                      ? "border-blue-500 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 shadow-lg shadow-blue-500/20"
                      : "border-slate-600 bg-slate-700/20 hover:border-slate-500 hover:bg-slate-700/40"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />

                  <div className="relative w-24 h-16 flex items-center justify-center">
                    <img
                      src="https://yt3.googleusercontent.com/JM1m2wng0JQUgSg9ZSEvz7G4Rwo7pYb4QBYip4PAhvGRyf1D_YTbL2DdDjOy0qOXssJPdz2r7Q=s900-c-k-c0x00ffffff-no-rj"
                      alt="VNPay"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>

                  {/* Check Mark */}
                  {selectedMethod === "vnpay" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 p-1 bg-blue-500 rounded-full"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Momo */}
                <motion.button
                  onClick={() =>
                    setSelectedMethod(selectedMethod === "momo" ? null : "momo")
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 h-32 rounded-xl border-2 transition-all duration-300 overflow-hidden group flex items-center justify-center ${
                    selectedMethod === "momo"
                      ? "border-pink-500 bg-gradient-to-br from-pink-900/40 to-red-900/40 shadow-lg shadow-pink-500/20"
                      : "border-slate-600 bg-slate-700/20 hover:border-slate-500 hover:bg-slate-700/40"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-red-500/0 group-hover:from-pink-500/5 group-hover:to-red-500/5 transition-all duration-300" />

                  <div className="relative w-24 h-16 flex items-center justify-center">
                    <img
                      src="https://play-lh.googleusercontent.com/uCtnppeJ9ENYdJaSL5av-ZL1ZM1f3b35u9k8EOEjK3ZdyG509_2osbXGH5qzXVmoFv0"
                      alt="Momo"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>

                  {/* Check Mark */}
                  {selectedMethod === "momo" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 p-1 bg-pink-500 rounded-full"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Payment Button */}
            <motion.button
              onClick={handlePaymentVNPay}
              disabled={!selectedAmount || !selectedMethod || loading}
              whileHover={{
                scale: selectedAmount && selectedMethod && !loading ? 1.02 : 1,
              }}
              whileTap={{
                scale: selectedAmount && selectedMethod && !loading ? 0.98 : 1,
              }}
              className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                selectedAmount && selectedMethod && !loading
                  ? selectedMethod === "vnpay"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/40 active:scale-95 cursor-pointer"
                    : "bg-gradient-to-r from-pink-600 to-red-600 text-white hover:shadow-lg hover:shadow-pink-500/40 active:scale-95 cursor-pointer"
                  : "bg-slate-600 text-slate-400 cursor-not-allowed opacity-50"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Thanh toán với{" "}
                  {selectedMethod === "vnpay"
                    ? "VNPay"
                    : selectedMethod === "momo"
                    ? "Momo"
                    : "..."}
                </>
              )}
            </motion.button>

            {/* Footer Info */}
            <p className="text-xs text-slate-500 text-center mt-6">
              {!selectedAmount || !selectedMethod
                ? "Vui lòng chọn mệnh giá và phương thức thanh toán"
                : "Bạn sẽ được chuyển hướng để hoàn tất thanh toán"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
