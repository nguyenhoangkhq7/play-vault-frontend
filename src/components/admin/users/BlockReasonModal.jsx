import React, { useState } from "react";

export default function BlockReasonModal({ isOpen, onClose, onConfirm }) {
  const predefinedReasons = [
    "Vi phạm quy tắc cộng đồng",
    "Nội dung không phù hợp",
    "Hoạt động đáng ngờ",
    "Khác"
  ];

  const [selectedReason, setSelectedReason] = useState(predefinedReasons[0]);
  const [customReason, setCustomReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    let finalReason = selectedReason;
    if (selectedReason === "Khác") {
      if (customReason.trim() === "") return;
      finalReason = customReason;
    }
    onConfirm(finalReason);
    setSelectedReason(predefinedReasons[0]);
    setCustomReason("");
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#4a0e74] to-[#2a0242] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Lý do chặn tài khoản</h2>

        <select
          className="w-full bg-[#3D1778]/80 border border-purple-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
        >
          {predefinedReasons.map((reason, idx) => (
            <option key={idx} value={reason}>{reason}</option>
          ))}
        </select>

        {selectedReason === "Khác" && (
          <textarea
            className="w-full h-24 bg-[#3D1778]/80 border border-purple-500/50 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none mt-3"
            placeholder="Nhập lý do khác..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            onClick={() => { setSelectedReason(predefinedReasons[0]); setCustomReason(""); onClose(); }}
          >
            Hủy
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            onClick={handleConfirm}
          >
            Chặn
          </button>
        </div>
      </div>
    </div>
  );
}
