// Thay đổi: Import thêm 'api' từ authApi và 'useUser' từ UserContext
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, CheckCircle, XCircle, Coins } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import PaymentModal from "../components/download/PaymentModal";
import ConfirmModal from "../components/download/ConfirmModal";
import { api } from "../api/authApi"; // Thay đổi: Import api wrapper
import { useUser } from "../store/UserContext";
import { useCart } from "../store/CartContext"; // Thay đổi: Import context

function CartPage() {
  const navigate = useNavigate();
  // Thay đổi: Lấy user, setUser, setAccessToken từ Context
  const { user, setUser, setAccessToken } = useUser(); 
  
  // Thay đổi: 'cart' sẽ chứa toàn bộ DTO CartResponse từ backend
  const [cart, setCart] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Thay đổi: Lấy số dư từ 'user' trong context, và tạo state cục bộ
  // để cập nhật UI khi nạp tiền (vì user context không tự refresh)
  const [localBalance, setLocalBalance] = useState(0);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState("selected");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);
  
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [insufficientData, setInsufficientData] = useState(null);

  // Thay đổi: Cập nhật localBalance khi user thay đổi (VD: khi login)
  useEffect(() => {
    setLocalBalance(user?.balance || 0);
  }, [user]);

  // Thay đổi: Đây là luồng fetch dữ liệu thật từ backend
  // CartPage.jsx - Tìm và sửa hook useEffect này

  const handleCheckoutAll = () => {
  // ✅ Tự động bỏ chọn tất cả items trước khi thanh toán toàn bộ
  setSelectedItems([]);
  // Đợi một chút để state update rồi mới gọi checkout
  setTimeout(() => {
    handleCheckout("all");
  }, 0);
};

  useEffect(() => {
      // ... (Phần kiểm tra user và setLoading)
      if (user) {
          const fetchCart = async () => {
              setLoading(true);
              try {
                  const response = await api.get("/api/cart");
                  setCart(response.data); 

                  // Thay đổi QUAN TRỌNG TẠI ĐÂY:
                  // Cũ: setSelectedItems(allItemIds); // Tự động chọn tất cả
                  
                  // Mới: Khởi tạo là một mảng rỗng []
                  setSelectedItems([]); // Mặc định không chọn mục nào

              } catch (error) {
                  console.error("Error fetching cart:", error);
                  toast.error("Không thể tải giỏ hàng.");
              } finally {
                  setLoading(false);
              }
          };
          fetchCart();
      } else {
          setLoading(false);
      }
  }, [user, setAccessToken]);// Chạy lại khi user thay đổi


  // ✅ Tính tổng tiền (Đã cập nhật)
  // Tính toán dựa trên state 'cart' mới
  const totalPrice = (cart?.items || [])
    .filter((item) => selectedItems.includes(String(item.cartItemId))) // Thay đổi: dùng cartItemId
    .reduce((sum, item) => {
      // Thay đổi: dùng finalPrice từ CartItemResponse DTO
      return sum + (item.finalPrice || 0); 
    }, 0);

  // ✅ Xóa game khỏi giỏ hàng (Đã cập nhật)
  const handleRemoveFromCart = async () => {
    if (!deleteItemData) return;

    try {
      const response = await api.delete(`/api/cart/items/${deleteItemData.cartItemId}`);
      setCart(response.data);
      setSelectedItems((prev) => prev.filter((id) => id !== String(deleteItemData.cartItemId)));
      setShowDeleteConfirm(false);
      setDeleteItemData(null);
      toast.success("Đã xóa game khỏi giỏ hàng.");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Không thể xóa game khỏi giỏ hàng.");
    }
  };

  // ✅ Chọn hoặc bỏ chọn sản phẩm (Đã cập nhật)
  // Cho phép chọn nhiều game
  const handleToggleSelect = (cartItemId) => {
    const id = String(cartItemId);
    if (selectedItems.includes(id)) {
      // Nếu click lại game đã chọn → bỏ chọn
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    } else {
      // Chọn game mới, giữ lại các game khác
      setSelectedItems((prev) => [...prev, id]);
    }
  };


  // ✅ Xử lý thanh toán
  const handleCheckout = (mode) => {
    // Tính tổng tiền cho tất cả item (nếu cần)
    const totalForAll = (cart?.items || []).reduce(
      (sum, item) => sum + (item.finalPrice || 0),
      0
    );

    const total = (mode === "all") ? totalForAll : totalPrice;

    if (mode === "selected" && selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán.");
      return;
    }

    // Kiểm tra balance
    if (total > localBalance) {
      // Balance không đủ → hiển thị modal hỏi nạp tiền
      setInsufficientData({
        neededAmount: total - localBalance,
        totalPrice: total,
        mode: mode
      });
      setShowInsufficientModal(true);
    } else {
      // Balance đủ → hiển thị confirm modal
      setPendingAmount(total);
      setCheckoutMode(mode);
      setShowConfirmModal(true);
    }
  };

  // ✅ Xử lý nạp tiền thành công
  const handlePaymentSuccess = (newBalance) => {
    // Cập nhật localBalance
    setLocalBalance(newBalance);
    setShowPaymentModal(false);
    toast.success(`Nạp tiền thành công! Số dư mới: ${newBalance} G-Coin`);
    
    // Tính lại tổng tiền dựa trên checkout mode
    const totalForAll = (cart?.items || []).reduce(
      (sum, item) => sum + (item.finalPrice || 0),
      0
    );
    const total = (checkoutMode === "all") ? totalForAll : totalPrice;

    // Nếu balance đã đủ, tự động mở confirm modal
    if (newBalance >= total) {
      setTimeout(() => {
        setShowConfirmModal(true);
      }, 500);
    }
  };

  // ✅ Xử lý xác nhận thanh toán (Mock)
  // Backend của bạn chưa có API checkout, nên logic này vẫn là mock
  // nhưng nó sẽ cập nhật state 'cart' và 'localBalance' mới
  // Trong CartPage.jsx → Sửa hàm handleConfirmPayment

const handleConfirmPayment = async () => {
  try {
    // 0. Lấy danh sách gameId TRƯỚC khi cập nhật cart
    // (vì sau này ta sẽ không biết item nào đã được xóa)
    const purchasedGameIds = (cart?.items || [])
      .filter((item) => selectedItems.includes(String(item.cartItemId)))
      .map((item) => item.gameId);

    // ✅ KIỂM TRA BALANCE TRƯỚC KHI THANH TOÁN
    if (pendingAmount > localBalance) {
      toast.error(`Số dư không đủ! Vui lòng nạp thêm ${(pendingAmount - localBalance)} G-Coin`);
      return;
    }

    // 1. Gọi API thanh toán - tuỳ vào mode (selected/all)
    let endpoint = "";
    let requestBody = null;

    if (checkoutMode === "all") {
      // Thanh toán toàn bộ giỏ hàng
      endpoint = "/api/orders/checkout/all";
      // Không cần body
    } else {
      // Thanh toán các item đã chọn
      endpoint = "/api/orders/checkout/selected";
      const cartItemIds = selectedItems.map(id => Number(id));
      requestBody = { itemIds: cartItemIds }; // Backend expect "itemIds"
    }

    const response = await api.post(
      endpoint,
      requestBody,
      setAccessToken
    );

    const data = response.data; // CheckoutResponseDto { success, message, newBalance, cart }

    // 2. Kiểm tra response thành công
    if (!data.success) {
      toast.error(data.message || "Thanh toán thất bại");
      return;
    }

    // 3. Cập nhật số dư từ newBalance (backend trả chính xác)
    if (data.newBalance !== null && data.newBalance !== undefined) {
      setLocalBalance(data.newBalance);
      // 🔥 QUAN TRỌNG: Cập nhật UserContext để navbar hiển thị balance mới
      setUser(prev => ({ ...prev, balance: data.newBalance }));
      console.log("Checkout response:", data);
    } else {
      // Fallback nếu backend không trả newBalance
      const newBalance = localBalance - pendingAmount;
      setLocalBalance(newBalance);
      setUser(prev => ({ ...prev, balance: newBalance }));
    }

    // 4. Cập nhật cart từ response
    if (data.cart) {
      setCart(data.cart); // Backend trả CartResponse mới
    }
    
    setSelectedItems([]);

    toast.success(data.message || `Thanh toán thành công ${pendingAmount} G-Coin!`);

    // 🔥 TRIGGER REFETCH trong PurchasedProducts
    window.dispatchEvent(new Event('purchasedGamesUpdated'));

    // 5. CHUYỂN HƯỚNG THÔNG MINH
    // Trong handleConfirmPayment, thay đoạn chuyển hướng cuối cùng thành:
    if (purchasedGameIds.length === 1) {
      toast.success("Mua thành công! Đang chuyển đến trang tải game...");
      setTimeout(() => {
        navigate(`/product/${purchasedGameIds[0]}`, { state: { purchaseSuccess: true } }); // ✅ THÊM state
      }, 1000);
    } else {
      toast.success(`Đã mua thành công ${purchasedGameIds.length} game! Đang chuyển đến thư viện...`);
      navigate("/bought", { state: { purchaseSuccess: true } }); // ✅ THÊM state
      
      // Đảm bảo refetch ngay cả khi đã ở /library
      setTimeout(() => {
        window.dispatchEvent(new Event('purchasedGamesUpdated'));
      }, 800);
    }

    setShowConfirmModal(false);
  } catch (error) {
    console.error("Lỗi thanh toán:", error);
    let message = "Thanh toán thất bại. Vui lòng thử lại.";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.status === 400) {
      message = "Số dư không đủ hoặc sản phẩm không khả dụng";
    }
    toast.error(message);
  }
};

  // Thay đổi: Xử lý khi chưa đăng nhập
  if (!user && !loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          🛒 Giỏ Hàng
        </h1>
        <div className="bg-purple-900/30 backdrop-blur-md rounded-2xl p-10 border border-purple-500/30">
          <p className="text-purple-200 text-lg mb-6">
            Vui lòng đăng nhập để xem giỏ hàng của bạn.
          </p>
          <Button
            variant="outline"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
            onClick={() => navigate("/login")}
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  // ✅ Render giao diện chính
  return (
    <>
      <Toaster richColors position="top-right" />
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteItemData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-purple-950/95 rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 border border-purple-500/40 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 bg-red-500/20 rounded-full border border-red-500/50">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-center text-white mb-2">
              Xác Nhận Xóa
            </h3>
            
            <p className="text-center text-purple-300 mb-6">
              Bạn có chắc chắn muốn xóa <span className="font-semibold text-pink-300">"{deleteItemData.gameName}"</span> khỏi giỏ hàng không?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteItemData(null);
                }}
                className="flex-1 px-4 py-3 bg-purple-700/50 hover:bg-purple-600/70 border border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleRemoveFromCart}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Balance Modal */}
      {showInsufficientModal && insufficientData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-purple-950/95 rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 border border-purple-500/40 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 bg-yellow-500/20 rounded-full border border-yellow-500/50">
              <Coins className="w-6 h-6 text-yellow-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-center text-white mb-2">
              Số Dư Không Đủ
            </h3>
            
            <p className="text-center text-purple-300 mb-6">
              Bạn cần thêm <span className="font-semibold text-yellow-400">{insufficientData.neededAmount.toLocaleString("vi-VN")}</span> G-Coin để thanh toán <span className="font-semibold text-pink-300">{insufficientData.totalPrice.toLocaleString("vi-VN")}</span> G-Coin
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInsufficientModal(false);
                  setInsufficientData(null);
                }}
                className="flex-1 px-4 py-3 bg-purple-700/50 hover:bg-purple-600/70 border border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowInsufficientModal(false);
                  setInsufficientData(null);
                  setCheckoutMode(insufficientData.mode);
                  setPendingAmount(insufficientData.totalPrice);
                  setShowPaymentModal(true);
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Coins className="w-5 h-5" />
                Nạp Tiền
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showPaymentModal && (
        <PaymentModal
          isOpen={true}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <ConfirmModal
          amount={pendingAmount}
          balance={localBalance} // Thay đổi: dùng localBalance
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <div className={`container mx-auto py-10 ${showPaymentModal || showConfirmModal ? 'blur-sm pointer-events-none' : ''}`}>
        <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
          🛒 Giỏ Hàng Của Bạn
        </h1>

        {/* Thay đổi: Kiểm tra cart.items */}
        {!cart || cart.items.length === 0 ? (
          <div className="bg-purple-900/30 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.3)] p-10 border border-purple-500/30 text-center">
            <p className="text-purple-200 text-lg mb-6">
              Giỏ hàng của bạn đang trống.
            </p>
            <Button
              variant="outline"
              className="bg-transparent border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white transition-all duration-300"
              onClick={() => navigate("/products")}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          // --- GIỎ HÀNG CÓ HÀNG ---
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-purple-950/80 backdrop-blur-xl rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.5)] p-8 border border-purple-500/40">
                <h2 className="text-3xl font-bold mb-8 text-white">
                  🎮 Sản Phẩm Trong Giỏ Hàng ({cart.items.length})
                </h2>
                <div className="space-y-4">
                  {/* Thay đổi: Lặp qua cart.items */}
                  {cart.items.map((item) => (
                    <div
                      // Thay đổi: key là cartItemId
                      key={item.cartItemId} 
                      className="group relative overflow-hidden bg-gradient-to-r from-purple-800/40 to-purple-900/40 hover:from-purple-700/60 hover:to-purple-800/60 border-2 border-purple-500/30 hover:border-purple-400/60 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
{/* Hover effect background (Từ nhánh main) */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-500/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative flex items-center gap-4">
                        {/* Modern Checkbox (Giao diện main + Logic ID của hoangthanh) */}
                        <div className="flex-shrink-0">
                          <label className="flex items-center cursor-pointer group/checkbox">
                            <input
                              type="checkbox"
                              // Logic: dùng cartItemId từ nhánh hoangthanh
                              checked={selectedItems.includes(String(item.cartItemId))}
                              onChange={() => handleToggleSelect(item.cartItemId)}
                              className="sr-only"
                            />
                            <div className="relative w-7 h-7 bg-gradient-to-br from-purple-500/40 to-pink-500/40 border-2 border-purple-400 rounded-lg group-hover/checkbox:from-purple-400/60 group-hover/checkbox:to-pink-400/60 group-hover/checkbox:border-pink-300 group-hover/checkbox:shadow-lg group-hover/checkbox:shadow-pink-500/50 transition-all duration-300 flex items-center justify-center hover:scale-110">
                              {selectedItems.includes(String(item.cartItemId)) && (
                                <svg className="w-5 h-5 text-pink-300 animate-in fade-in duration-200" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </label>
                        </div>

                        {/* Game Image (Giao diện main + Dữ liệu thumbnail) */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.thumbnail || "/placeholder.jpg"} 
                            alt={item.gameName}
                            className="w-28 h-20 object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-all"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 rounded-xl transition-all" />
                        </div>

                        {/* Game Info & Price (Kết hợp logic hiển thị giảm giá của hoangthanh vào layout của main) */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                            {item.gameName}
                          </h3>
                          
                          {/* Logic hiển thị giá từ nhánh hoangthanh được format lại cho đẹp */}
                          {item.discount > 0 ? (
                            <div className="flex items-center gap-2 mt-1">
                              {/* Giá sau giảm */}
                              <p className="text-pink-400 font-bold text-base">
                                {item.finalPrice.toLocaleString("vi-VN")} GCoin
                              </p>
                              {/* Badge % giảm */}
                              <span className="bg-pink-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                                -{Math.round((item.discount / item.originalPrice) * 100)}%
                              </span>
                              {/* Giá gốc gạch ngang */}
                              <p className="text-gray-400 text-sm line-through">
                                {item.originalPrice.toLocaleString("vi-VN")} GCoin
                              </p>
                            </div>
                          ) : (
                            <p className="text-purple-300 text-sm mt-1">
                              Giá: <span className="font-semibold text-pink-400">{item.finalPrice.toLocaleString("vi-VN")} GCoin</span>
                            </p>
                          )}
                        </div>

                        {/* Delete Button (Giữ nguyên từ nhánh main vì đẹp hơn) */}
                        <button
                          onClick={() => {
                            setDeleteItemData({ cartItemId: item.cartItemId, gameName: item.gameName });
                            setShowDeleteConfirm(true);
                          }}
                          className="flex-shrink-0 p-3 bg-red-500/10 hover:bg-red-600/30 border border-red-500/50 hover:border-red-400 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Xóa khỏi giỏ hàng"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tóm tắt thanh toán */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-purple-950/80 backdrop-blur-xl rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.5)] p-8 border border-purple-500/40 sticky top-4">
                <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-2 text-center justify-center">
                 Tóm Tắt Thanh Toán
                </h2>

{/* Thông tin chi tiết - Hợp nhất UI của Main và Data của Hoangthanh */}
                <div className="bg-purple-900/50 rounded-2xl p-6 mb-8 space-y-4 border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    
                    {/* Icon và Label */}
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-400" />
                      <span className="text-purple-300 font-medium">
                        Số dư hiện tại: {/* Lấy text chi tiết từ nhánh hoangthanh */}
                      </span>
                    </div>

                    {/* Hiển thị số dư */}
                    <span className="text-green-400 font-bold text-lg ml-auto">
                      {/* Logic: Dùng localBalance (hoangthanh) + Format số (main) + Đơn vị GCoin (hoangthanh) */}
                      {localBalance ? localBalance.toLocaleString("vi-VN") : 0} GCoin
                    </span>
                  </div>
                </div>
                    </span>
                  </div>

                  <div className="border-t border-purple-700/50" />

                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-medium">Số lượng:</span>
                    <span className="bg-pink-500/30 text-pink-300 px-3 py-1 rounded-lg font-semibold border border-pink-500/50">
                      {selectedItems.length} game
                    </span>
{/* Divider từ nhánh Main - tạo sự ngăn cách rõ ràng */}
                  <div className="border-t border-purple-700/50 my-4" />

                  {/* Layout Flex từ nhánh Main để căn chỉnh 2 bên đẹp hơn */}
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-medium">
                      Tổng tiền:
                    </span>
                    
                    {/* Styling text to (2xl) và màu hồng nổi bật từ Main */}
                    <span className="text-2xl font-bold text-pink-400">
                      {/* Logic: Format số (Main) + Đơn vị GCoin (Hoangthanh) */}
                      {totalPrice.toLocaleString("vi-VN")} GCoin
                    </span>
                  </div>
                    </span>
                  </div>

                  {/* Thông báo balance */}
                  {totalPrice > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-700/50">
                      {totalPrice > localBalance ? (
                        <div className="space-y-3">
                          <p className="text-red-400 text-sm font-semibold">
                            ⚠️ Thiếu: {(totalPrice - localBalance).toLocaleString("vi-VN")} GCoin
                          </p>
                          <button
                            onClick={() => {
                              setInsufficientData({
                                neededAmount: totalPrice - localBalance,
                                totalPrice: totalPrice,
                                mode: "selected"
                              });
                              setShowInsufficientModal(true);
                            }}
                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                          >
                            <Coins className="w-4 h-4" />
                            Nạp G-Coin
                          </button>
                        </div>
                      ) : (
                        <p className="text-green-400 text-sm font-semibold">
                          ✅ Đủ tiền để thanh toán
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Nút thanh toán */}
                <div className="flex flex-col gap-3">
<div className="space-y-4">
                    {/* Nút 1: Thanh toán các game ĐÃ CHỌN (checkbox) */}
                    <button
                      onClick={() => handleCheckout("selected")}
                      // Logic Disabled: Không có gì chọn HOẶC Tổng tiền chọn > Số dư (kết hợp cả 2 nhánh)
                      disabled={selectedItems.length === 0 || (totalPrice > 0 && totalPrice > localBalance)}
                      // Class CSS: Dùng style đẹp của MAIN (gradient, shadow, hover scale)
                      className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-3 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      Thanh Toán Đã Chọn
                    </button>

                    {/* Nút 2: Thanh toán TOÀN BỘ giỏ hàng */}
                    <button
                      onClick={handleCheckoutAll}
                      // Logic Disabled: Giỏ hàng rỗng HOẶC Tổng tiền giỏ > Số dư
                      disabled={
                        (cart?.items?.length === 0) ||
                        (() => {
                          const totalAll = (cart?.items || []).reduce((sum, item) => sum + (item.finalPrice || 0), 0);
                          return totalAll > 0 && totalAll > localBalance;
                        })()
                      }
                      // Class CSS: Style tím hồng đẹp của MAIN
                      className="w-full bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 hover:from-purple-600 hover:via-pink-500 hover:to-purple-600 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-3 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                    >
                      <CheckCircle className="h-6 w-6" />
                      Thanh Toán Toàn Bộ
                    </button>

                    {/* Nút 3: Tiếp tục mua sắm */}
                    <button
                      onClick={() => navigate("/products")}
                      // Class CSS: Style trong suốt (outline) đẹp của MAIN
                      className="w-full bg-transparent hover:bg-white/10 border-2 border-purple-500/60 hover:border-purple-400/80 text-purple-200 hover:text-white font-bold text-lg py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-6 w-6" />
                      Tiếp Tục Mua Sắm
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartPage;