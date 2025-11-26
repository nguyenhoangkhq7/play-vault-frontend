# Code Changes Summary

## 📋 Tất Cả Những Gì Đã Sửa

### 1. `src/store/UserContext.jsx`

**Thay đổi:** Thêm function `updateUser()` để cập nhật user + localStorage

```javascript
const updateUser = (updatedUserData) => {
  const newUser = typeof updatedUserData === 'function'
    ? updatedUserData(user)
    : updatedUserData;
  setUser(newUser);
  localStorage.setItem("user", JSON.stringify(newUser));
};

// Export
value={{ user, accessToken, login, logout, setAccessToken, setUser: updateUser }}
```

**Effect:**

- ✅ Balance update tự động cập nhật localStorage
- ✅ Reload trang vẫn giữ balance mới
- ✅ Navbar, ProductDetail thấy balance mới ngay

---

### 2. `src/components/product/productDetail.jsx`

**Thay đổi 1:** Dùng chỉ một context - `UserContext`

```javascript
import { useUser } from "../../store/UserContext";

const { user, setAccessToken } = useUser();
const { addToCart } = useCart(); // Chỉ lấy function
```

**Thay đổi 2:** Kiểm tra game đã mua

```javascript
const [isOwned, setIsOwnedState] = useState(false);

const checkIfOwned = async (gameId) => {
  try {
    const response = await api.get(
      `/api/purchases/check/${gameId}`,
      setAccessToken
    );
    setIsOwnedState(response.data?.isOwned || response.data?.owned || false);
  } catch (error) {
    setIsOwnedState(false);
  }
};
```

**Thay đổi 3:** Gọi checkIfOwned khi mở tab download

```javascript
useEffect(() => {
  const tabFromUrl = searchParams.get("tab");
  if (tabFromUrl === "download") {
    setActiveTab("download");
    if (user && id) {
      checkIfOwned(id);
    }
  }
}, [searchParams, user, id]);
```

**Thay đổi 4:** Render tab download có điều kiện

```javascript
{
  activeTab === "download" && (
    <motion.div>
      {!isOwned ? (
        <div className="text-center py-10">
          <p>Bạn chưa sở hữu game này</p>
          <button onClick={handleBuyNow}>Mua ngay để tải xuống</button>
        </div>
      ) : (
        <div className="bg-green-600/20">
          <p>Chúc mừng! Bạn đã sở hữu game này</p>
          <a href={game.filePath} download>
            Download Full Speed
          </a>
        </div>
      )}
    </motion.div>
  );
}
```

---

### 3. `src/pages/CartPage.jsx` (THAY ĐỔI LỚN)

**Thay đổi 1:** `handleCheckout()` - Kiểm tra balance

```javascript
const handleCheckout = (mode) => {
  const totalForAll = (cart?.items || []).reduce(
    (sum, item) => sum + (item.finalPrice || 0),
    0
  );

  const total = mode === "all" ? totalForAll : totalPrice;

  if (total === 0) {
    toast.error("Vui lòng chọn sản phẩm để thanh toán.");
    return;
  }

  // ⭐ Kiểm tra balance
  if (total > localBalance) {
    // ❌ Không đủ → Nạp tiền
    toast.warning(
      `Số dư không đủ! Cần thêm ${(total - localBalance).toLocaleString(
        "vi-VN"
      )} G-Coin`
    );
    setCheckoutMode(mode);
    setPendingAmount(total);
    setShowPaymentModal(true);
  } else {
    // ✅ Đủ → Thanh toán
    setPendingAmount(total);
    setCheckoutMode(mode);
    setShowConfirmModal(true);
  }
};
```

**Thay đổi 2:** `handleConfirmPayment()` - Gọi API checkout thực

```javascript
const handleConfirmPayment = async () => {
  try {
    // 1. Gọi API checkout
    const cartItemIds = selectedItems.map((id) => Number(id));
    const response = await api.post(
      "/api/orders/checkout",
      { cartItemIds },
      setAccessToken
    );

    const data = response.data;

    // 2. Cập nhật balance
    const newBalance = data.newBalance || localBalance - pendingAmount;
    setLocalBalance(newBalance);

    // 3. Cập nhật giỏ hàng
    if (data.cart) {
      setCart(data.cart);
    } else {
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter(
          (item) => !selectedItems.includes(String(item.cartItemId))
        ),
      }));
    }
    setSelectedItems([]);

    toast.success(
      `Thanh toán thành công ${pendingAmount.toLocaleString("vi-VN")} G-Coin!`
    );

    // 4. Redirect
    const purchasedGameIds =
      data.purchasedGameIds ||
      (cart?.items || [])
        .filter((item) => selectedItems.includes(String(item.cartItemId)))
        .map((item) => item.gameId);

    if (purchasedGameIds.length === 1) {
      const gameId = purchasedGameIds[0];
      navigate(`/product/${gameId}?tab=download`);
    } else if (purchasedGameIds.length > 1) {
      navigate("/library");
    }

    setShowConfirmModal(false);
  } catch (error) {
    toast.error(error.response?.data?.message || "Thanh toán thất bại");
  }
};
```

**Thay đổi 3:** `handlePaymentSuccess()` - Nạp tiền xong

```javascript
const handlePaymentSuccess = (newBalance) => {
  // Cập nhật balance mới
  setLocalBalance(newBalance);
  setShowPaymentModal(false);
  toast.success(
    `Nạp tiền thành công! Số dư mới: ${newBalance.toLocaleString(
      "vi-VN"
    )} G-Coin`
  );

  // Tính tổng tiền
  const totalForAll = (cart?.items || []).reduce(
    (sum, item) => sum + (item.finalPrice || 0),
    0
  );
  const total = checkoutMode === "all" ? totalForAll : totalPrice;

  // Nếu balance đã đủ, tự động mở confirm modal
  if (newBalance >= total) {
    setTimeout(() => {
      setShowConfirmModal(true);
    }, 500);
  }
};
```

---

## 🔄 Flow Hoàn Chỉnh

```
┌─────────────────────────────────────────────────────────────┐
│ USER VIEW GAME DETAIL                                        │
│ isOwned = false → Tab Download bị khóa                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ USER CLICK "MUA NGAY"                                        │
│ → Thêm vào giỏ hàng                                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ USER VÀO CART PAGE                                           │
│ → Chọn game → Click "Thanh Toán"                            │
└─────────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │ KIỂM TRA BALANCE              │
        └───────────────────────────────┘
        ↓                               ↓
   ❌ KHÔNG ĐỦ                     ✅ ĐỦ
        ↓                               ↓
    NẠP TIỀN              CONFIRM MODAL
    (PaymentModal)        (ConfirmModal)
        ↓                               ↓
    NẠP XONG                      CLICK XÁC NHẬN
    ↓                                   ↓
    BALANCE +                    GỌII API CHECKOUT
    ↓                                   ↓
    TÍNH LẠI TOTAL         ┌───────────────────┐
    ↓                      │ BACKEND:          │
    THOẢ ĐỦ?        YES   │ 1. Trừ balance    │
    ↓                      │ 2. Xóa CartItem   │
    OPEN CONFIRM    ←──────│ 3. Tạo Purchase   │
                           │ 4. Return balance │
                           └───────────────────┘
                                   ↓
                        FRONTEND NHẬN
                        - newBalance
                        - purchasedGameIds
                                   ↓
                        REDIRECT:
                        /product/{gameId}?tab=download
                                   ↓
                        ProductDetail:
                        - Detect ?tab=download
                        - Call checkIfOwned()
                        - Get isOwned = true
                        - Show Download Button
                                   ↓
                        USER CAN DOWNLOAD ✅
```

---

## 🔍 Điểm Cần Chú Ý

1. **Balance luôn từ `localBalance` trong CartPage**

   - Cập nhật từ `user.balance` khi load
   - Cập nhật từ PaymentModal khi nạp
   - Cập nhật từ API response khi checkout

2. **UserContext là source of truth cho user data**

   - Navbar lấy balance từ `user.balance`
   - ProductDetail lấy user từ `useUser()`
   - Khi `setUser()` → tự động cập nhật localStorage

3. **API Response phải chứa**

   - ✅ `newBalance` - balance sau trừ tiền
   - ✅ `purchasedGameIds` - để redirect
   - ✅ `cart` - giỏ hàng mới (tuỳ chọn)

4. **Error handling**
   - Balance không đủ → Mở PaymentModal (không throw error)
   - API lỗi → Toast error + không navigate

---

## ✅ Test Checklist

- [ ] Test 1: View game chưa mua → Tab download bị khóa
- [ ] Test 2: Balance đủ → Thanh toán → Redirect + tab download
- [ ] Test 3: Balance không đủ → Nạp tiền → Tự động thanh toán
- [ ] Test 4: Mua game miễn phí → isOwned = true
- [ ] Test 5: Reload trang → Balance vẫn cập nhật
- [ ] Test 6: Nhiều game → Redirect /library
