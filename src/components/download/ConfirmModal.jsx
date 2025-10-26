// src/components/download/ConfirmModal.jsx
import React from "react";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

export default function ConfirmModal({ amount, onConfirm, onCancel, balance }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md rounded-2xl p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-700 shadow-[0_0_25px_rgba(168,85,247,0.6)] animate-pulse"
      >
        {/* Khung trong */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 p-8 text-center text-white shadow-xl">
          <XCircle
            onClick={onCancel}
            className="absolute right-4 top-4 text-purple-300 hover:text-white cursor-pointer transition"
            size={24}
          />

          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Xác Nhận Thanh Toán
          </h2>

          <p className="text-purple-200 mb-6">
            Bạn có chắc chắn muốn thanh toán{" "}
            <span className="text-pink-400 font-semibold">
                {amount.toLocaleString("vi-VN")} GCoin
            </span>{" "}
            không?
            </p>
            <p className="text-purple-300 text-sm mb-6">
            💰 Số dư hiện tại:{" "}
            <span className="text-green-400 font-semibold">
                {balance.toLocaleString("vi-VN")} GCoin
            </span>
            </p>


          <div className="flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-full border border-purple-400 text-purple-200 hover:bg-purple-700 transition"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 transition"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
