import { XIcon } from "lucide-react";

export default function ErrorModal({ error, onClose }) {
  if (!error) return null;

  const isVideo = error.file?.match(/\.(mp4|webm|ogg)$/i);
  const isImage = error.file?.match(/\.(jpg|jpeg|png|gif)$/i);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#4a0e74] to-[#2a0242] rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 animate-scale-in border border-purple-500/50">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Chi tiết lỗi: <span className="text-pink-400">{error.id}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Nội dung lỗi và minh họa */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
          {/* Thông tin lỗi */}
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-gray-400">Tiêu đề lỗi:</p>
              <p className="text-white">{error.title}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-400">Người báo lỗi:</p>
              <p className="text-white">{error.customerName}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-400">Email:</p>
              <p className="text-gray-300">{error.customerEmail}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-400">Thời gian:</p>
              <p className="text-white">{error.time}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-400">Nội dung lỗi:</p>
              <p className="text-white">{error.content}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-400">Kết quả mong đợi:</p>
              <p className="text-white">{error.expectedResult}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-400">Kết quả thực tế:</p>
              <p className="text-white">{error.actualResult}</p>
            </div>
          </div>

          {/* File minh họa */}
          <div className="flex justify-center items-center border border-purple-500/30 rounded-xl p-2 bg-black/20">
            {error.file ? (
              isImage ? (
                <img src={error.file} alt="minh họa lỗi" className="max-h-64 object-contain rounded-lg" />
              ) : isVideo ? (
                <video controls className="max-h-64 rounded-lg">
                  <source src={error.file} type={`video/${error.file.split('.').pop()}`} />
                  Trình duyệt không hỗ trợ video.
                </video>
              ) : (
                <p className="text-gray-300">File không hỗ trợ xem trực tiếp</p>
              )
            ) : (
              <p className="text-gray-300">Không có file minh họa</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="bg-purple-600/50 hover:bg-purple-600/80 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
