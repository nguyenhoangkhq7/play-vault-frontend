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

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState("selected");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);

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
  const handleRemoveFromCart = async (cartItemId) => { // Thay đổi: Nhận cartItemId
    try {
      // 1. GỌI API: Dùng api.delete với endpoint của backend
      // Backend trả về CartResponse mới
      const response = await api.delete(`/api/cart/items/${cartItemId}`);

      // 2. ĐẨY LÊN GIAO DIỆN: Cập nhật state 'cart'
      setCart(response.data);
      
      // Xóa khỏi danh sách đang chọn
      setSelectedItems((prev) => prev.filter((id) => id !== String(cartItemId)));
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

    if (total === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán.");
      return;
    }

    // Kiểm tra balance
    if (total > localBalance) {
      // Balance không đủ → yêu cầu nạp tiền
      toast.warning(`Số dư không đủ! Cần thêm ${(total - localBalance).toLocaleString("vi-VN")} G-Coin`);
      setCheckoutMode(mode);
      setPendingAmount(total);
      setShowPaymentModal(false);
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
    toast.success(`Nạp tiền thành công! Số dư mới: ${newBalance.toLocaleString("vi-VN")} G-Coin`);
    
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
      toast.error(`Số dư không đủ! Vui lòng nạp thêm ${(pendingAmount - localBalance).toLocaleString("vi-VN")} G-Coin`);
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

    toast.success(data.message || `Thanh toán thành công ${pendingAmount.toLocaleString("vi-VN")} G-Coin!`);

    // 🔥 TRIGGER REFETCH trong PurchasedProducts
    window.dispatchEvent(new CustomEvent('purchasedGamesUpdated', {
      detail: { gameIds: purchasedGameIds }
    }));

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
      
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          checkoutMode={checkoutMode}
          userBalance={localBalance} // Thay đổi: dùng localBalance
          gamePrice={totalPrice} // Chỉ truyền tổng tiền của các mục đã chọn
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
              <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.4)] p-8 border border-purple-500/30">
                <h2 className="text-2xl font-bold mb-6 text-purple-100">
                  🎮 Sản Phẩm Trong Giỏ Hàng
                </h2>
                <div className="space-y-5">
                  {/* Thay đổi: Lặp qua cart.items */}
                  {cart.items.map((item) => (
                    <div
                      // Thay đổi: key là cartItemId
                      key={item.cartItemId} 
                      className="flex items-center bg-purple-800/30 hover:bg-purple-700/40 border border-purple-500/30 hover:border-purple-400/60 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <input
                        type="checkbox"
                        // Thay đổi: dùng cartItemId
                        checked={selectedItems.includes(String(item.cartItemId))}
                        onChange={() => handleToggleSelect(item.cartItemId)}
                        className="mr-4 h-5 w-5 accent-purple-500 cursor-pointer"
                      />
                      <img
                        // Thay đổi: Dùng thumbnail từ DTO
                        src={item.thumbnail || "/placeholder.jpg"} 
                        alt={item.gameName}
                        className="w-24 h-16 object-cover rounded-lg mr-4 shadow"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          {item.gameName} {/* Thay đổi: Dùng gameName từ DTO */}
                        </h3>
                        <p className="text-purple-300 text-sm">
                          {/* Thay đổi: Dùng finalPrice từ DTO */}
                          {item.finalPrice.toLocaleString("vi-VN")} GCoin
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-transparent border-red-400 text-red-300 hover:bg-red-600 hover:text-white transition-all"
                        // Thay đổi: dùng cartItemId
                        onClick={() => handleRemoveFromCart(item.cartItemId)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tóm tắt thanh toán */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.4)] p-8 border border-purple-500/30 sticky top-4">
                <h2 className="text-2xl font-bold mb-6 text-purple-100">
                  💎 Tóm Tắt Thanh Toán
                </h2>

                <div className="mb-6 space-y-2">
                  <p className="text-purple-300 flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    Số dư hiện tại:{" "}
                    <span className="text-green-400 font-bold ml-auto">
                      {/* Thay đổi: dùng localBalance */}
                      {localBalance.toLocaleString("vi-VN")} GCoin
                    </span>
                  </p>
                  <p className="text-purple-300">
                    Số lượng sản phẩm:{" "}
                    <span className="text-white font-medium">
                      {selectedItems.length}
                    </span>
                  </p>
                  <p className="text-purple-300">
                    Tổng tiền:{" "}
                    <span className="text-white font-bold text-xl">
                      {/* Thay đổi: Dùng biến totalPrice đã tính */}
                      {totalPrice.toLocaleString("vi-VN")} GCoin
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleCheckout("selected")}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-[0_0_10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all"
                  disabled={
                    selectedItems.length === 0 || totalPrice > localBalance
                  }
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Thanh Toán Game Đã Chọn
                </Button>

                <Button
                  onClick={handleCheckoutAll} // ✅ Dùng hàm mới
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-all"
                  disabled={
                    (cart?.items?.length === 0) ||
                    ((cart?.items || []).reduce((sum, item) => sum + (item.finalPrice || 0), 0) > localBalance)
                  }
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Thanh Toán Toàn Bộ
                </Button>

                <Button
                  variant="outline"
                  className="bg-transparent border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
                  onClick={() => navigate("/products")}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Tiếp Tục Mua Sắm
                </Button>
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