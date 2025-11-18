import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, ChevronDown, Loader2, Heart, ShoppingCart } from "lucide-react"; // Đã thêm Heart, ShoppingCart
import { motion, AnimatePresence } from "framer-motion";
import searchApi from "../../api/searchApi"; // Đảm bảo import đúng đường dẫn
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  // State giao diện
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("about");
  const [expandedFaq, setExpandedFaq] = useState(-1);

  // --- 1. GỌI API LẤY CHI TIẾT ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await searchApi.getGameDetail(id);
        setGame(response); 
      } catch (error) {
        console.error("Lỗi tải game:", error);
        // Nếu lỗi 404/500 thì set game null để hiện thông báo
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // --- 2. CHUẨN BỊ DỮ LIỆU UI ---
  
  // Ảnh Thumbnail & Slides (Nếu API trả về list ảnh thì dùng, không thì fake bằng thumbnail)
  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";
  const slides = game ? [
     { id: 1, image: game.thumbnail },
     { id: 2, image: game.thumbnail }, // Lặp lại để test slider
     { id: 3, image: game.thumbnail },
  ] : [];

  // List Game liên quan (Tạm thời hardcode hoặc lấy từ API nếu có)
  const relatedGames = [
    { id: 1, title: "Pro Evo 4", image: "/pro-evolution-soccer.jpg" },
    { id: 2, title: "The Sims 4", image: "/the-sims-4.jpg" },
    { id: 3, title: "Rocket League", image: "/rocket-league.jpg" },
    { id: 4, title: "Clash Royale", image: "/clash-royale.jpg" },
  ];

  // Câu hỏi thường gặp
  const faqs = [
    { question: "Làm sao để tải game?", answer: "Sau khi thanh toán, key game sẽ được gửi về email và mục 'Đã mua'." },
    { question: "Cấu hình tối thiểu là gì?", answer: "Vui lòng xem tab 'System Requirements' để biết chi tiết." },
  ];

  // Handlers Slider
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);


  // --- 3. LOADING STATE ---
  if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 flex justify-center items-center text-white">
            <Loader2 className="animate-spin w-8 h-8 mr-2" /> Đang tải dữ liệu...
        </div>
      );
  }

  if (!game) {
      return (
        <div className="min-h-screen bg-purple-900 flex justify-center items-center text-white">
            Không tìm thấy thông tin game. <Link to="/products" className="ml-2 text-pink-400 underline">Quay lại</Link>
        </div>
      );
  }

  // --- 4. RENDER GIAO DIỆN ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= LEFT SECTION ================= */}
          <div className="lg:col-span-2">
            
            {/* Tên Game Dynamic */}
            <h1 className="text-4xl font-bold text-white mb-6">{game.name}</h1>

            {/* SLIDESHOW (Giữ nguyên cấu trúc cũ) */}
            <div className="relative bg-purple-950 rounded-xl overflow-hidden mb-6 shadow-lg h-[400px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={slides[currentSlide]?.image || fallbackImage}
                  alt={`Screenshot ${currentSlide + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => e.currentTarget.src = fallbackImage}
                />
              </AnimatePresence>
              
              {/* Nút chuyển ảnh */}
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* INDICATORS (Dấu chấm tròn) */}
            <div className="flex justify-center gap-2 py-4 bg-purple-950 rounded-lg mb-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition ${
                    i === currentSlide ? "bg-pink-500" : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            {/* TABS NAVIGATION (Giữ nguyên style cũ) */}
            <div className="border-b border-purple-700 mb-6">
              <div className="flex gap-4 flex-wrap">
                {[
                  { id: "about", label: "Giới thiệu" },
                  { id: "requirements", label: "Cấu hình" },
                  { id: "reviews", label: `Đánh giá (${game.reviewCount || 0})` },
                  { id: "download", label: "Tải xuống" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 font-semibold rounded-t-md transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-pink-500 text-white shadow-md shadow-pink-400/30"
                        : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT DYNAMIC */}
            <div className="min-h-[200px]">
              <AnimatePresence mode="wait">
                
                {/* 1. TAB ABOUT */}
                {activeTab === "about" && (
                    <motion.div 
                        key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="text-purple-100 leading-relaxed whitespace-pre-line"
                    >
                        <h3 className="text-2xl font-bold text-white mb-4">Về trò chơi này</h3>
                        <p>{game.description || "Chưa có mô tả chi tiết."}</p>
                    </motion.div>
                )}

                {/* 2. TAB REQUIREMENTS (Dữ liệu thật từ API) */}
                {activeTab === "requirements" && (
                    <motion.div key="requirements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h3 className="text-2xl font-bold text-white mb-4">Cấu hình yêu cầu</h3>
                        <div className="bg-purple-900/50 p-6 rounded-xl border border-purple-700">
                            <ul className="space-y-3 text-sm text-purple-200">
                                <li><strong className="text-white">Hệ điều hành:</strong> {game.os || 'Windows 10'}</li>
                                <li><strong className="text-white">CPU:</strong> {game.cpu || 'Core i3'}</li>
                                <li><strong className="text-white">RAM:</strong> {game.ram || '8 GB'}</li>
                                <li><strong className="text-white">Card đồ họa:</strong> {game.gpu || 'GTX 1050'}</li>
                                <li><strong className="text-white">Dung lượng:</strong> {game.storage || '50 GB'}</li>
                            </ul>
                        </div>
                    </motion.div>
                )}

                {/* 3. TAB REVIEWS (Dữ liệu thật từ list reviewsList trong DTO) */}
                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">Người chơi đánh giá</h3>
                    
                    {/* Nếu có review thì map ra, không thì báo trống */}
                    {game.reviewsList && game.reviewsList.length > 0 ? (
                        game.reviewsList.map((review, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            className="bg-purple-900/60 p-5 rounded-xl border border-purple-700 shadow-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-white font-semibold">{review.authorName}</p>
                                <p className="text-purple-300 text-xs">{review.date}</p>
                              </div>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={`${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-purple-600"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-purple-100 text-sm leading-relaxed">{review.comment}</p>
                          </motion.div>
                        ))
                    ) : (
                        <p className="text-slate-400 italic">Chưa có đánh giá nào cho game này.</p>
                    )}
                  </motion.div>
                )}

                {/* 4. TAB DOWNLOAD (Giữ nguyên giao diện cũ) */}
                {activeTab === "download" && (
                  <motion.div
                    key="download"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">Tải xuống</h3>
                    <div>
                      <h4 className="text-xl text-yellow-400 font-semibold mb-2">Link tải (Demo)</h4>
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-2 rounded-full transition shadow-lg">
                        Download Full Speed
                      </button>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-white mb-4">Câu hỏi thường gặp:</h3>
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-gray-800/60 rounded-lg mb-2">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-700/60 transition"
                          >
                            <span className="text-white font-semibold text-left">{faq.question}</span>
                            <ChevronDown size={20} className={`text-white transition-transform ${expandedFaq === idx ? "rotate-180" : ""}`}/>
                          </button>
                          <AnimatePresence>
                            {expandedFaq === idx && (
                              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden px-4 pb-4 text-purple-200 text-sm">
                                {faq.answer}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR (INFO & BUY) ================= */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Description Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-purple-900/50 rounded-lg p-6 border border-purple-700"
            >
              <p className="text-purple-100 text-sm leading-relaxed line-clamp-4">
                {game.shortDescription || game.description}
              </p>
            </motion.div>

            {/* Rating Box */}
            <div className="flex items-center gap-4">
              <div className="bg-pink-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">{game.rating || 0}</span>
              </div>
              <div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className={i < Math.floor(game.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"} />
                  ))}
                </div>
                <p className="text-purple-200 text-sm mt-1">{game.reviewCount || 0} ratings</p>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="bg-purple-950/50 p-4 rounded-xl space-y-3 text-sm text-purple-200 border border-purple-800">
              <div className="flex justify-between">
                <span>Nhà phát hành:</span> <span className="font-semibold text-white">{game.publisherName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày phát hành:</span> <span className="font-semibold text-white">{game.releaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Thể loại:</span> <span className="font-semibold text-white">{game.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span>Giới hạn tuổi:</span> <span className="font-semibold text-white">18+</span>
              </div>
            </div>
            
            {/* Nút Mua / Giá */}
            <div className="space-y-3 pt-4 border-t border-purple-700">
                <div className="text-center mb-2">
                    <span className="text-3xl font-bold text-white">{game.price > 0 ? `${game.price.toLocaleString()} đ` : 'Miễn Phí'}</span>
                </div>
                <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2">
                    <ShoppingCart size={20} /> Mua Ngay
                </button>
                <button className="w-full bg-transparent hover:bg-purple-800 text-white font-semibold py-3 rounded-lg border border-purple-600 transition flex items-center justify-center gap-2">
                    <Heart size={20} /> Yêu Thích
                </button>
            </div>

            {/* Related Games (Có thể giữ static hoặc gọi API top rate) */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Game liên quan</h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedGames.map((g) => (
                  <motion.div
                    key={g.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-purple-900/50 rounded-lg overflow-hidden cursor-pointer border border-purple-800"
                  >
                    <img src={g.image} alt={g.title} className="w-full h-24 object-cover" onError={(e)=>e.currentTarget.src=fallbackImage}/>
                    <p className="text-white text-xs font-semibold p-2 text-center truncate">{g.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}