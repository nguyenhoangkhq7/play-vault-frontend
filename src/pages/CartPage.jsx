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
  // Thay đổi: Lấy user và setAccessToken từ Context
  const { user, setAccessToken } = useUser(); 
  
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
  const handleToggleSelect = (cartItemId) => { // Thay đổi: Nhận cartItemId
    const id = String(cartItemId);
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ✅ Xử lý thanh toán (Đã cập nhật)
  // Logic này giữ nguyên, nhưng dùng localBalance thay vì state balance cũ
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

    // Thay đổi: Dùng localBalance
    if (total > localBalance) {
      setCheckoutMode(mode);
      setShowPaymentModal(true);
    } else {
      setPendingAmount(total);
      setShowConfirmModal(true);
    }
  };

  // ✅ Xử lý nạp tiền thành công (Đã cập nhật)
  const handlePaymentSuccess = (amount) => {
    // Thay đổi: Cập nhật localBalance
    setLocalBalance((prev) => prev + amount);
    setShowPaymentModal(false);
    // Modal SuccessModal sẽ tự hiển thị
  };

  // ✅ Xử lý xác nhận thanh toán (Mock)
  // Backend của bạn chưa có API checkout, nên logic này vẫn là mock
  // nhưng nó sẽ cập nhật state 'cart' và 'localBalance' mới
  // Trong CartPage.jsx → Sửa hàm handleConfirmPayment

const handleConfirmPayment = async () => {
  try {
    // 1. Gọi API thanh toán thật (khi backend có)
    // const response = await api.post("/api/orders/checkout", {
    //   // cartItemIds: selectedItems.map(id => Number(id))
    // });

    // 2. Cập nhật số dư
    setLocalBalance((prev) => prev - pendingAmount);

    // 3. Lấy danh sách gameId đã thanh toán thành công
    const purchasedGameIds = (cart?.items || [])
      .filter((item) => selectedItems.includes(String(item.cartItemId)))
      .map((item) => item.gameId); // ← quan trọng: gameId của game thật

    // 4. Xóa các game đã mua khỏi giỏ hàng
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => !selectedItems.includes(String(item.cartItemId))),
    }));
    setSelectedItems([]);

    toast.success(`Thanh toán thành công ${pendingAmount.toLocaleString()} GCoin!`);

    // 5. CHUYỂN HƯỚNG THÔNG MINH
    if (purchasedGameIds.length === 1) {
      // Nếu chỉ mua 1 game → chuyển thẳng đến trang chi tiết + mở tab download
      const gameId = purchasedGameIds[0];
      navigate(`/product/${gameId}?tab=download`);
    } else if (purchasedGameIds.length > 1) {
      // Nếu mua nhiều game → về trang thư viện hoặc thông báo
      toast.success("Đã thêm tất cả game vào thư viện của bạn!");
      navigate("/library"); // hoặc "/my-games"
    }

    setShowConfirmModal(false);
  } catch (error) {
    console.error("Lỗi thanh toán:", error);
    toast.error("Thanh toán thất bại. Vui lòng thử lại.");
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
                    disabled={selectedItems.length === 0} // Thêm disabled
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Thanh Toán Các Mục Đã Chọn
                  </Button>
                  <Button
                    onClick={() => handleCheckout("all")}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-all"
                    disabled={cart?.items?.length === 0} // Thêm disabled
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