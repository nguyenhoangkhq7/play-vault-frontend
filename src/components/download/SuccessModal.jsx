export default function SuccessModal({
  isOpen = true,
  onClose,
  amount = "200.000đ",
  onSuccess,
}) {
  if (!isOpen) return null;

  const handleBack = () => {
    const numericValue = parseInt(amount.replace(/\D/g, "")) || 0;
    if (onSuccess) onSuccess(numericValue);

    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 rounded-full bg-green-300"></div>
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30 50 L45 65 L75 30"
                stroke="#16a34a"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">
          Bạn đã nạp {amount} thành công!
        </h2>
        <p className="mb-8 text-base text-white/90">
          Chúc bạn mua sắm vui vẻ ^^
        </p>
        <button
          onClick={handleBack}
          className="w-full rounded-full bg-green-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-700"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}