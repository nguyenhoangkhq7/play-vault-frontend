import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmModal from "../download/ConfirmModal";
import DownloadModal from "./DownloadModal";

export default function PaymentModal({ isOpen, onClose, totalAmount, balance, onSuccess }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const handleConfirm = () => {
    if (totalAmount > balance) return;
    onSuccess(totalAmount);
    setShowConfirm(false);
    setShowDownload(true); // Auto mở tab download
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {!showConfirm && !showDownload && (
            <div className="bg-purple-900/80 p-8 rounded-xl shadow-lg text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Thanh Toán GCoin</h2>
              <p className="mb-4">Tổng cần thanh toán: {totalAmount.toLocaleString("vi-VN")} GCoin</p>
              <button
                onClick={() => setShowConfirm(true)}
                className="px-6 py-2 bg-green-500 rounded-full font-bold hover:bg-green-600"
              >
                Thanh toán
              </button>
              <button
                onClick={onClose}
                className="ml-4 px-6 py-2 bg-purple-700 rounded-full font-bold hover:bg-purple-800"
              >
                Hủy
              </button>
            </div>
          )}

          {showConfirm && (
            <ConfirmModal
              amount={totalAmount}
              balance={balance}
              onCancel={() => setShowConfirm(false)}
              onConfirm={handleConfirm}
            />
          )}

          {showDownload && (
            <DownloadModal
              isOpen={true}
              onClose={() => {
                setShowDownload(false);
                onClose();
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
