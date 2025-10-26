import React from "react";

export default function EmailModal({
  isOpen,
  isLoading,
  account,
  generatedEmail,
  copySuccess,
  onClose,
  onCopy,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#4a0e74] to-[#2a0242] rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 transform transition-all duration-300 scale-95 animate-scale-in border border-purple-500/50">
        <h2 className="text-2xl font-bold text-white mb-4">
          Soạn Email cho:{" "}
          <span className="text-pink-400">{account?.name}</span>
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center h-56">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div>
            <textarea
              readOnly
              value={generatedEmail}
              className="w-full h-56 bg-[#3D1778]/80 border border-purple-500/50 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />

            <div className="flex justify-end items-center gap-4 mt-6">
              <span className="text-green-400 transition-opacity duration-300">
                {copySuccess}
              </span>
              <button
                onClick={onCopy}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Sao chép
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
