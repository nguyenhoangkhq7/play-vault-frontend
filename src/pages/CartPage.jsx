import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, CheckCircle, XCircle, Coins } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import PaymentModal from "../components/download/PaymentModal";
import ConfirmModal from "../components/download/ConfirmModal";
// Import các hàm API thật
import { getCart, clearCart, removeFromCart } from "../api/cart";

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]); // Sẽ chứa { cartItemId, gameId, gameName, ... }
  // const [games, setGames] = useState([]); // <-- KHÔNG CẦN STATE NÀY NỮA
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]); // Sẽ chứa mảng các cartItemId
  const [user, setUser] = useState(null); // Giữ lại để check login
  const [balance, setBalance] = useState(300000); // Giữ lại mock balance
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState("selected");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);

  // ✅ Lấy dữ liệu giỏ hàng từ API khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Nếu không có user, không fetch, báo lỗi và chuyển hướng
      toast.error("Vui lòng đăng nhập để xem giỏ hàng.");
      setLoading(false);
      navigate("/login");
      return;
    }

    async function fetchCartData() {
      setLoading(true);
      try {
        // Gọi API thật
        const cartData = await getCart(); 
        // cartData là object CartResponse { cartId, items: [...], totalItems, ... }
        setCartItems(cartData.items || []); // Cập nhật state với mảng items từ API
        setSelectedItems([]); // Reset danh sách chọn
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error(`Không thể tải giỏ hàng: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCartData();
  }, [navigate]); // Thêm navigate vào dependency array

  // ✅ Tính tổng tiền
  const totalPrice = cartItems
    // Lọc các item có cartItemId nằm trong danh sách selectedItems
    .filter((item) => selectedItems.includes(String(item.cartItemId)))
    .reduce((sum, item) => {
      // Lấy giá trực tiếp từ item (vì item đã có finalPrice)
      return sum + (item.finalPrice || 0);
    }, 0);

  // ✅ Xóa game khỏi giỏ hàng
  const handleRemoveFromCart = async (cartItemId) => {
    try {
      // Gọi API thật, truyền cartItemId
      const updatedCart = await removeFromCart(cartItemId);
      
      // API trả về CartResponse mới, cập nhật lại state
      setCartItems(updatedCart.items || []);
      
      // Xóa khỏi danh sách selected
      setSelectedItems((prev) => prev.filter((id) => id !== String(cartItemId)));
      toast.success("Đã xóa game khỏi giỏ hàng.");

    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(`Không thể xóa game: ${error.message}`);
    }
  };

  // ✅ Chọn hoặc bỏ chọn sản phẩm (dùng cartItemId)
  const handleToggleSelect = (cartItemId) => {
    const id = String(cartItemId);
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ✅ Xử lý thanh toán
  const handleCheckout = (mode) => {
    // Tính tổng tiền các mục đã chọn (đã có sẵn)
    const totalSelected = totalPrice; 
    
    // Tính tổng tiền TẤT CẢ item
    const totalAll = cartItems.reduce((sum, item) => {
      return sum + (item.finalPrice || 0);
    }, 0);

    const total = (mode === "all") ? totalAll : totalSelected;

    // Kiểm tra trước khi mở modal
    if (mode === 'selected' && selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một game để thanh toán!");
      return;
    }
    if (mode === 'all' && cartItems.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    if (total > balance) {
      setCheckoutMode(mode);
      setShowPaymentModal(true);
    } else {
      setPendingAmount(total);
      setShowConfirmModal(true);
    }
  };

  const handlePaymentSuccess = (amount) => {
    setBalance((prev) => prev + amount);
    setShowPaymentModal(false);
  };

  // ✅ Xử lý xác nhận thanh toán (gọi API)
  const handleConfirmPayment = async () => {
    setShowConfirmModal(false); // Đóng modal ngay

    try {
      if (checkoutMode === "all") {
        // --- CHẾ ĐỘ THANH TOÁN TẤT CẢ ---
        await clearCart(); // Gọi API xóa sạch giỏ hàng
        setCartItems([]); // Cập nhật UI
        setSelectedItems([]); // Cập nhật UI

      } else {
        // --- CHẾ ĐỘ THANH TOÁN ĐÃ CHỌN ---
        // Gọi API removeFromCart cho từng item đã chọn
        const removePromises = selectedItems.map(cartItemId => 
          removeFromCart(cartItemId)
        );
        
        // Chờ tất cả API call hoàn thành
        // Phản hồi cuối cùng (responses[responses.length - 1]) sẽ là trạng thái giỏ hàng mới nhất
        const responses = await Promise.all(removePromises);
        const finalCartState = responses[responses.length - 1];
        
        setCartItems(finalCartState.items || []); // Cập nhật UI
        setSelectedItems([]); // Cập nhật UI
      }

      // Logic trừ tiền (giữ nguyên)
      setBalance((prev) => prev - pendingAmount);
      toast.success(
        `Thanh toán thành công! Đã trừ ${pendingAmount.toLocaleString("vi-VN")} GCoin.`
      );

    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(`Thanh toán thất bại: ${error.message}`);
    }
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Render giao diện chính
  return (
    <>
      <Toaster richColors position="top-right" />
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          checkoutMode={checkoutMode}
          userBalance={balance}
          gamePrice={totalPrice} // Truyền tổng giá (của các mục đã chọn)
        />
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <ConfirmModal
          amount={pendingAmount}
          balance={balance}
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Container chính */}
      <div className={`container mx-auto py-10 ${showPaymentModal || showConfirmModal ? 'blur-sm pointer-events-none' : ''}`}>
        <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
          🛒 Giỏ Hàng Của Bạn
        </h1>

        {cartItems.length === 0 ? (
          // --- GIỎ HÀNG TRỐNG ---
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
                  {cartItems.map((item) => {
                    // KHÔNG CẦN game.find NỮA
                    return (
                      <div
                        key={item.cartItemId} // <-- Dùng cartItemId làm key
                        className="flex items-center bg-purple-800/30 hover:bg-purple-700/40 border border-purple-500/30 hover:border-purple-400/60 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <input
                          type="checkbox"
                          // Dùng cartItemId để check
                          checked={selectedItems.includes(String(item.cartItemId))}
                          // Dùng cartItemId để toggle
                          onChange={() => handleToggleSelect(item.cartItemId)}
                          className="mr-4 h-5 w-5 accent-purple-500 cursor-pointer"
                        />
                        <img
                          src={item.thumbnail} // <-- Dùng thumbnail từ item
                          alt={item.gameName} // <-- Dùng gameName từ item
                          className="w-24 h-16 object-cover rounded-lg mr-4 shadow"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {item.gameName} {/* <-- Dùng gameName từ item */}
                          </h3>
                          <p className="text-purple-300 text-sm">
                            {item.finalPrice.toLocaleString("vi-VN")} GCoin {/* <-- Dùng finalPrice */}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="bg-transparent border-red-400 text-red-300 hover:bg-red-600 hover:text-white transition-all"
                          // Dùng cartItemId để xóa
                          onClick={() => handleRemoveFromCart(item.cartItemId)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    );
                  })}
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
                      {balance.toLocaleString("vi-VN")} GCoin
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
                      {totalPrice.toLocaleString("vi-VN")} GCoin {/* totalPrice đã đúng */}
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
                    disabled={cartItems.length === 0} // Thêm disabled
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