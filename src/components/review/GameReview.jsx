import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  Send,
  Filter,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { reviewApi } from "../../api/reviewApi"; // Sử dụng reviewApi thay vì gọi trực tiếp
import { useUser } from "../../store/UserContext";

const SORT_OPTIONS = {
  newest: "Mới nhất",
  oldest: "Cũ nhất",
};

export default function GameReviews({ gameId, isOwned, accessToken, userId }) {
  const { setAccessToken } = useUser();

  // State Form
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Dữ liệu & Phân trang
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // State Bộ lọc & Params
  const [ratingFilter, setRatingFilter] = useState(null); // null = All
  const [sortKey, setSortKey] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1); // UI bắt đầu từ 1

  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, sortKey]);

  // --- 1. Fetch dữ liệu từ Server (Sử dụng reviewApi) ---
  const fetchReviews = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    try {
      // Gọi API thông qua reviewApi, truyền params dưới dạng object gọn gàng
      const data = await reviewApi.getReviewsByGameId(
        gameId,
        {
          page: currentPage - 1, // Spring Boot page index bắt đầu từ 0
          size: 5,
          sort: sortKey,
          rating: ratingFilter,
        },
        setAccessToken
      );

      // Cập nhật state từ dữ liệu trả về (cấu trúc Page của Spring Boot)
      setReviews(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
      setReviews([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [gameId, currentPage, sortKey, ratingFilter, setAccessToken]);

  // Gọi fetchReviews khi các dependency thay đổi
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // --- 2. Xử lý Gửi đánh giá (Sử dụng reviewApi) ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) return toast.warning("Vui lòng đăng nhập.");
    if (newRating === 0 || newComment.trim().length < 10)
      return toast.error(
        "Vui lòng nhập số sao và bình luận (tối thiểu 10 ký tự)."
      );

    setIsSubmitting(true);
    try {
      // Gọi API thêm đánh giá
      await reviewApi.addReview(
        {
          gameId,
          rating: newRating,
          comment: newComment,
        },
        setAccessToken
      );

      toast.success("Đánh giá thành công!");
      setNewRating(0);
      setNewComment("");

      // Logic reload: Nếu đang ở trang 1 thì tải lại ngay, nếu không thì quay về trang 1
      if (currentPage === 1) {
        fetchReviews();
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      toast.error("Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. UI Helpers ---
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderStars = (rating) =>
    Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={18}
          className={
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-purple-700"
          }
          strokeWidth={i < rating ? 0 : 1.5}
        />
      ));

  const renderInputStars = () =>
    Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={24}
          className={`cursor-pointer transition-colors ${
            i < newRating
              ? "text-yellow-400 fill-yellow-400"
              : "text-purple-600 hover:text-purple-500"
          }`}
          onClick={() => setNewRating(i + 1)}
        />
      ));

  return (
    <div className="space-y-8 text-purple-100">
      <h3 className="text-2xl font-bold text-white">Đánh giá Người dùng</h3>

      {/* Form Input */}
      <div className="bg-purple-900/70 p-6 rounded-xl border border-purple-700">
        <h4 className="text-xl font-semibold text-white mb-4">
          Viết đánh giá của bạn
        </h4>

        {!isOwned && (
          <p className="text-sm text-pink-400 mb-4 italic">
            * Bạn cần sở hữu game này để có thể viết đánh giá.
          </p>
        )}

        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">Số sao:</span>
            <div className="flex gap-1">{renderInputStars()}</div>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Hãy chia sẻ cảm nghĩ của bạn về trò chơi (tối thiểu 10 ký tự)..."
            rows="3"
            className="w-full p-3 bg-purple-950 border border-purple-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500 outline-none placeholder-purple-400"
            disabled={!isOwned || isSubmitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isOwned || isSubmitting}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}{" "}
              Gửi Đánh Giá
            </button>
          </div>
        </form>
      </div>

      {/* Filter & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-700 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={20} className="text-pink-400" />
          <span className="text-white font-semibold mr-2">Lọc:</span>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  setRatingFilter(ratingFilter === i + 1 ? null : i + 1)
                }
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  ratingFilter === i + 1
                    ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                    : "bg-purple-800 text-purple-300 border-purple-700 hover:bg-purple-700"
                }`}
              >
                {i + 1}{" "}
                <Star
                  size={12}
                  className="inline-block mb-0.5"
                  fill="currentColor"
                />
              </button>
            ))}
          <button
            onClick={() => setRatingFilter(null)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              ratingFilter === null
                ? "bg-pink-500 text-white border-pink-500 font-bold"
                : "bg-purple-800 text-purple-300 border-purple-700 hover:bg-purple-700"
            }`}
          >
            Tất cả
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-pink-400" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-purple-900 border border-purple-700 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-pink-500"
          >
            {Object.entries(SORT_OPTIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh sách Reviews */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">
          Danh sách đánh giá ({totalElements})
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-purple-950/30 rounded-xl border border-purple-800 border-dashed">
            <p className="text-purple-300 text-lg">
              Chưa có đánh giá nào phù hợp.
            </p>
            <p className="text-sm text-purple-400 mt-2">
              Hãy là người đầu tiên đánh giá game này!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-purple-950/50 p-5 rounded-xl border border-purple-800 shadow-md hover:border-purple-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {/* Lấy chữ cái đầu tiên của tên user, mặc định là U */}
                    {(review.customerName || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-white text-lg">
                    {review.customerName || "Người dùng ẩn danh"}
                  </span>
                  <div className="flex gap-0.5 ml-2">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="text-xs text-purple-400 bg-purple-900/50 px-2 py-1 rounded">
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed pl-11">
                "{review.comment}"
              </p>
            </div>
          ))
        )}
      </div>

      {/* Thanh Phân trang */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-purple-800 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg font-bold transition ${
                    currentPage === page
                      ? "bg-pink-500 text-white shadow-lg transform scale-105"
                      : "bg-purple-900 text-purple-300 hover:bg-purple-800"
                  }`}
                >
                  {page}
                </button>
              ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-purple-800 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
