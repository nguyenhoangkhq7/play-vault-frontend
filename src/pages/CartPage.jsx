// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Trash2, ShoppingCart, CheckCircle, XCircle } from "lucide-react";
// import { Button } from "../components/ui/Button";
// import { Toaster } from "../components/ui/sonner";
// import { toast } from "sonner";
// import { getGameById } from "../services/games";
// import {
//   getCart,
//   removeFromCart,
//   checkoutCart,
//   checkoutAllCart,
// } from "../services/cart";
// import PaymentModal from "../components/download/PaymentModal";

// function CartPage() {
//   const navigate = useNavigate();
//   const [cartItems, setCartItems] = useState([]);
//   const [games, setGames] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [user, setUser] = useState(null);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [checkoutMode, setCheckoutMode] = useState("selected"); // "selected" hoặc "all"

  
//   // ✅ Kiểm tra đăng nhập
//   useEffect(() => {
//     const checkLoggedIn = () => {
//       try {
//         const storedUser =
//           localStorage.getItem("user") || sessionStorage.getItem("user");
//         const accessToken =
//           localStorage.getItem("accessToken") ||
//           sessionStorage.getItem("accessToken");

//         if (storedUser && accessToken) {
//           setUser(JSON.parse(storedUser));
//         } else {
//           setUser(null);
//           setError("Vui lòng đăng nhập để xem giỏ hàng.");
//         }
//       } catch (err) {
//         console.error("Error checking user login:", err);
//         setError("Vui lòng đăng nhập để xem giỏ hàng.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkLoggedIn();
//     window.addEventListener("storage", checkLoggedIn);
//     return () => window.removeEventListener("storage", checkLoggedIn);
//   }, []);

//   // ✅ Tính tổng tiền
//   const totalPrice = cartItems
//     .filter((item) => item && item.id && selectedItems.includes(String(item.id)))
//     .reduce((sum, item) => {
//       const game = games.find((g) => String(g.id) === String(item.id));
//       return sum + (game ? game.price : 0);
//     }, 0);

//   // ✅ Lấy dữ liệu giỏ hàng
//   useEffect(() => {
//     const fetchCartData = async () => {
//       if (!user) return;
//       try {
//         const cart = await getCart(user.id);
//         const validCartItems = cart.filter(
//           (item) => item && typeof item === "object" && item.id && item.id > 0
//         );
//         setCartItems(validCartItems);

//         const gamePromises = validCartItems.map((item) => getGameById(item.id));
//         const fetchedGames = (await Promise.all(gamePromises)).filter(Boolean);
//         setGames(fetchedGames);

//         setSelectedItems(validCartItems.map((item) => String(item.id)));
//       } catch (err) {
//         console.error("Error fetching cart data:", err);
//         setError("Không thể tải dữ liệu giỏ hàng.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCartData();
//   }, [user]);

//   // ✅ Xóa game khỏi giỏ hàng
//   const handleRemoveFromCart = async (gameId) => {
//     try {
//       const updatedCart = await removeFromCart(user.id, gameId);
//       const validUpdatedCart = updatedCart.filter(
//         (item) => item && item.id && item.id > 0
//       );
//       setCartItems(validUpdatedCart);
//       setSelectedItems(selectedItems.filter((id) => id !== String(gameId)));
//       toast.success("Đã xóa game khỏi giỏ hàng.");
//     } catch (error) {
//       console.error("Error removing from cart:", error);
//       toast.error("Không thể xóa game khỏi giỏ hàng.");
//     }
//   };

//   // ✅ Chọn hoặc bỏ chọn sản phẩm
//   const handleToggleSelect = (gameId) => {
//     const normalizedId = String(gameId);
//     setSelectedItems((prev) =>
//       prev.includes(normalizedId)
//         ? prev.filter((id) => id !== normalizedId)
//         : [...prev, normalizedId]
//     );
//   };

//   // ✅ Thanh toán các mục đã chọn
//   const handleCheckoutSelected = () => {
//     if (selectedItems.length === 0) {
//       toast.error("Vui lòng chọn ít nhất một game để thanh toán!");
//       return;
//     }
//     setCheckoutMode("selected");
//     setShowPaymentModal(true);
//   };

//   // ✅ Thanh toán toàn bộ
//   const handleCheckoutAll = () => {
//     if (cartItems.length === 0) {
//       toast.error("Giỏ hàng trống!");
//       return;
//     }
//     setCheckoutMode("all");
//     setShowPaymentModal(true);
//   };

//   // ✅ Gọi khi nạp tiền thành công → tiến hành checkout thật
//   const handlePaymentSuccess = async () => {
//     try {
//       if (!user) return;
//       if (checkoutMode === "selected") {
//         await checkoutCart(user.id, selectedItems);
//       } else {
//         await checkoutAllCart(user.id);
//       }
//       toast.success("Thanh toán thành công!");
//       // Làm mới lại giỏ hàng sau khi thanh toán
//       const cart = await getCart(user.id);
//       const validCartItems = cart.filter((item) => item && item.id && item.id > 0);
//       setCartItems(validCartItems);
//       setSelectedItems(validCartItems.map((item) => String(item.id)));
//     } catch (error) {
//       console.error("Error during checkout:", error);
//       toast.error("Thanh toán thất bại.");
//     }
//   };

//   // ✅ Hiển thị Loading
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   // ✅ Hiển thị Error
//   if (error) {
//     return (
//       <div className="text-center py-10 text-red-300">
//         <p className="text-xl mb-4">{error}</p>
//         <Button
//           variant="outline"
//           className="bg-transparent border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
//           onClick={() => navigate("/login")}
//         >
//           Đăng nhập
//         </Button>
//       </div>
//     );
//   }

//   // ✅ Render giao diện chính
//   return (
//     <div className="container mx-auto py-10">
//       <Toaster richColors position="top-right" />
//       <h1 className="text-4xl font-bold mb-8 text-white">Giỏ Hàng</h1>

//       {/* Modal thanh toán */}
//       {showPaymentModal && (
//       <PaymentModal
//         onClose={() => setShowPaymentModal(false)}
//         onSuccess={handlePaymentSuccess}
//         checkoutMode={checkoutMode}
//         />
//       )}


//       {cartItems.length === 0 ? (
//         <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30 text-center">
//           <p className="text-purple-300 text-lg mb-4">
//             Giỏ hàng của bạn đang trống.
//           </p>
//           <Button
//             variant="outline"
//             className="bg-transparent border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
//             onClick={() => navigate("/products")}
//           >
//             Tiếp tục mua sắm
//           </Button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Danh sách sản phẩm */}
//           <div className="lg:col-span-3">
//             <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
//               <h2 className="text-2xl font-bold mb-4 text-white">
//                 Sản Phẩm Trong Giỏ Hàng
//               </h2>
//               <div className="space-y-4">
//                 {cartItems.map((item) => {
//                   const game = games.find(
//                     (g) => String(g.id) === String(item.id)
//                   );
//                   return (
//                     <div
//                       key={item.id}
//                       className="flex items-center bg-purple-800/30 p-4 rounded-lg border border-purple-500/20 hover:bg-purple-700/20"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selectedItems.includes(String(item.id))}
//                         onChange={() => handleToggleSelect(item.id)}
//                         className="mr-4 h-5 w-5 text-purple-600 focus:ring-purple-500 border-purple-400 rounded"
//                       />
//                       <img
//                         src={game?.thumbnail_image || "/placeholder.jpg"}
//                         alt={game?.name || "Unknown Game"}
//                         className="w-24 h-16 object-cover rounded mr-4"
//                       />
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-white">
//                           {game?.name || "Unknown Game"}
//                         </h3>
//                         <p className="text-purple-300 text-sm">
//                           {game?.price === 0
//                             ? "Miễn phí"
//                             : `${game?.price.toLocaleString("vi-VN")} VND`}
//                         </p>
//                       </div>
//                       <Button
//                         variant="outline"
//                         className="bg-transparent border-red-400 text-red-200 hover:bg-red-600 hover:text-white"
//                         onClick={() => handleRemoveFromCart(item.id)}
//                       >
//                         <Trash2 className="h-5 w-5" />
//                       </Button>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Tóm tắt thanh toán */}
//           <div className="lg:col-span-1">
//             <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30 sticky top-4">
//               <h2 className="text-2xl font-bold mb-4 text-white">
//                 Tóm Tắt Thanh Toán
//               </h2>
//               <div className="mb-6">
//                 <p className="text-purple-300">
//                   Số lượng sản phẩm:{" "}
//                   <span className="text-white font-medium">
//                     {selectedItems.length}
//                   </span>
//                 </p>
//                 <p className="text-purple-300">
//                   Tổng tiền:{" "}
//                   <span className="text-white font-bold text-xl">
//                     {totalPrice.toLocaleString("vi-VN")} VND
//                   </span>
//                 </p>
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Button
//                   onClick={handleCheckoutSelected}
//                   className="w-full bg-green-600 hover:bg-green-700 text-white"
//                   disabled={selectedItems.length === 0}
//                 >
//                   <ShoppingCart className="h-5 w-5 mr-2" />
//                   Thanh Toán Các Mục Đã Chọn
//                 </Button>
//                 <Button
//                   onClick={handleCheckoutAll}
//                   className="w-full bg-purple-600 hover:bg-purple-700 text-white"
//                 >
//                   <CheckCircle className="h-5 w-5 mr-2" />
//                   Thanh Toán Toàn Bộ
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="bg-transparent border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
//                   onClick={() => navigate("/products")}
//                 >
//                   <XCircle className="h-5 w-5 mr-2" />
//                   Tiếp Tục Mua Sắm
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CartPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, CheckCircle, XCircle, Coins } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import PaymentModal from "../components/download/PaymentModal";
import ConfirmModal from "../components/download/ConfirmModal";

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(300000);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState("selected");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);

  // 🧪 Mock dữ liệu
  useEffect(() => {
    setUser({ id: 1, name: "Test User" });

    const fakeCart = [{ id: 101 }, { id: 102 }, { id: 103 }];
    const fakeGames = [
      {
        id: 101,
        name: "Elden Ring",
        price: 1200000,
        thumbnail_image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
      },
      {
        id: 102,
        name: "Hollow Knight",
        price: 150000,
        thumbnail_image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
      },
      {
        id: 103,
        name: "Hades",
        price: 200000,
        thumbnail_image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg",
      },
    ];

    setCartItems(fakeCart);
    setGames(fakeGames);
    // setSelectedItems(fakeCart.map((item) => String(item.id)));
    setSelectedItems([]);
    setLoading(false);
  }, []);

  // ✅ Tính tổng tiền
  const totalPrice = cartItems
    .filter((item) => selectedItems.includes(String(item.id)))
    .reduce((sum, item) => {
      const game = games.find((g) => String(g.id) === String(item.id));
      return sum + (game ? game.price : 0);
    }, 0);

  // ✅ Xóa game khỏi giỏ hàng
  const handleRemoveFromCart = (gameId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== gameId));
    setSelectedItems((prev) => prev.filter((id) => id !== String(gameId)));
    toast.success("Đã xóa game khỏi giỏ hàng.");
  };

  // ✅ Chọn hoặc bỏ chọn sản phẩm
  const handleToggleSelect = (gameId) => {
    const id = String(gameId);
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ✅ Xử lý thanh toán
  const handleCheckout = (mode) => {
    const total =
      mode === "all"
        ? cartItems.reduce((sum, item) => {
            const game = games.find((g) => g.id === item.id);
            return sum + (game ? game.price : 0);
          }, 0)
        : cartItems
            .filter((item) => selectedItems.includes(String(item.id)))
            .reduce((sum, item) => {
              const game = games.find((g) => g.id === item.id);
              return sum + (game ? game.price : 0);
            }, 0);

    if (total > balance) {
      setCheckoutMode(mode);
      setShowPaymentModal(true);
      toast.error("Số dư không đủ, vui lòng nạp thêm GCoin!");
    } else {
      setPendingAmount(total);
      setShowConfirmModal(true);
    }
  };

  const handlePaymentSuccess = (amount) => {
    setBalance((prev) => prev + amount);
    toast.success(`Nạp thành công ${amount.toLocaleString("vi-VN")} GCoin!`);
    setShowPaymentModal(false);
  };

  const handleConfirmPayment = () => {
    setBalance((prev) => prev - pendingAmount);
    toast.success(
      `Thanh toán thành công! Đã trừ ${pendingAmount.toLocaleString("vi-VN")} GCoin.`
    );

    // Xóa các item đã thanh toán khỏi giỏ
    setCartItems((prev) =>
      prev.filter((item) => !selectedItems.includes(String(item.id)))
    );
    setSelectedItems([]);
    setShowConfirmModal(false);
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
      
      {/* Payment Modal - Đặt ở ngoài cùng */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          checkoutMode={checkoutMode}
          userBalance={balance}
          gamePrice={totalPrice}
        />
      )}

      {showConfirmModal && (
        <ConfirmModal
          amount={pendingAmount}
          balance={balance}
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Container chính với hiệu ứng blur khi modal mở */}
      <div className={`container mx-auto py-10 ${showPaymentModal || showConfirmModal ? 'blur-sm' : ''}`}>
        <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
          🛒 Giỏ Hàng Của Bạn
        </h1>

        {cartItems.length === 0 ? (
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.4)] p-8 border border-purple-500/30">
                <h2 className="text-2xl font-bold mb-6 text-purple-100">
                  🎮 Sản Phẩm Trong Giỏ Hàng
                </h2>
                <div className="space-y-5">
                  {cartItems.map((item) => {
                    const game = games.find(
                      (g) => String(g.id) === String(item.id)
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex items-center bg-purple-800/30 hover:bg-purple-700/40 border border-purple-500/30 hover:border-purple-400/60 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(String(item.id))}
                          onChange={() => handleToggleSelect(item.id)}
                          className="mr-4 h-5 w-5 accent-purple-500 cursor-pointer"
                        />
                        <img
                          src={game?.thumbnail_image}
                          alt={game?.name}
                          className="w-24 h-16 object-cover rounded-lg mr-4 shadow"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {game?.name}
                          </h3>
                          <p className="text-purple-300 text-sm">
                            {game?.price.toLocaleString("vi-VN")} GCoin
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="bg-transparent border-red-400 text-red-300 hover:bg-red-600 hover:text-white transition-all"
                          onClick={() => handleRemoveFromCart(item.id)}
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
                      {totalPrice.toLocaleString("vi-VN")} GCoin
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleCheckout("selected")}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-[0_0_10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Thanh Toán Các Mục Đã Chọn
                  </Button>
                  <Button
                    onClick={() => handleCheckout("all")}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-all"
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



