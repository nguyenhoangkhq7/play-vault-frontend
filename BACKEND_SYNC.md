# ✅ Frontend Updated - Match Backend API

## 🔄 Backend API Change

Backend controller có **2 endpoints** thay vì 1:

### Old (Frontend Expected)

```
POST /api/orders/checkout
Body: { cartItemIds: [1, 2, 3] }
```

### New (Backend Actual)

```
POST /api/orders/checkout/selected
Body: { itemIds: [1, 2, 3] }

POST /api/orders/checkout/all
Body: (empty)
```

---

## 🔧 Frontend Changes (CartPage.jsx)

### File: `src/pages/CartPage.jsx`

**Function:** `handleConfirmPayment()`

**Changes:**

1. ✅ Lấy danh sách gameId **TRƯỚC** khi gọi API (vì sau sẽ mất dữ liệu)
2. ✅ Kiểm tra `checkoutMode` ("selected" hoặc "all")
3. ✅ Gọi endpoint khác nhau tuỳ vào mode:
   - `/api/orders/checkout/selected` - với body `{ itemIds }`
   - `/api/orders/checkout/all` - không cần body
4. ✅ Nhận `CartResponse` từ backend
5. ✅ Cập nhật cart state từ response
6. ✅ Redirect dựa trên `purchasedGameIds`

**Code:**

```javascript
const handleConfirmPayment = async () => {
  try {
    // 0. Lấy gameId TRƯỚC
    const purchasedGameIds = (cart?.items || [])
      .filter((item) => selectedItems.includes(String(item.cartItemId)))
      .map((item) => item.gameId);

    // 1. Chọn endpoint tuỳ vào mode
    let endpoint = "";
    let requestBody = null;

    if (checkoutMode === "all") {
      endpoint = "/api/orders/checkout/all";
    } else {
      endpoint = "/api/orders/checkout/selected";
      const cartItemIds = selectedItems.map((id) => Number(id));
      requestBody = { itemIds: cartItemIds };
    }

    // 2. Gọi API
    const response = await api.post(endpoint, requestBody, setAccessToken);
    const data = response.data; // CartResponse

    // 3. Cập nhật balance & cart
    setLocalBalance((prev) => prev - pendingAmount);
    setCart(data);
    setSelectedItems([]);

    // 4. Redirect
    if (purchasedGameIds.length === 1) {
      navigate(`/product/${purchasedGameIds[0]}?tab=download`);
    } else if (purchasedGameIds.length > 1) {
      navigate("/library");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Thanh toán thất bại");
  }
};
```

---

## 📊 API Response Change

### Old (Expected)

```json
{
  "success": true,
  "newBalance": 95000,
  "purchasedGameIds": [101, 102, 103],
  "cart": { "items": [] }
}
```

### New (Actual)

```json
{
  "id": "cart123",
  "userId": 5,
  "items": [],
  "totalPrice": 0,
  "createdAt": "2025-11-26T10:30:00Z"
}
```

**Changes:**

- ✅ Backend trả `CartResponse` (chứa items mới đã xóa)
- ❌ Không trả `newBalance` (frontend tính: `localBalance - pendingAmount`)
- ❌ Không trả `purchasedGameIds` (frontend lấy từ state trước API call)

---

## ✅ Test Cases

### Test 1: Thanh Toán 1 Game (Đủ Tiền)

```
1. Balance = 100,000
2. Game = 50,000
3. Click "Thanh Toán Các Mục Đã Chọn"
4. API gọi: POST /api/orders/checkout/selected
   Body: { itemIds: [1] }
5. Response: CartResponse (items = [])
6. Balance update: 100,000 - 50,000 = 50,000 ✅
7. Redirect: /product/101?tab=download ✅
```

### Test 2: Thanh Toán Toàn Bộ (Đủ Tiền)

```
1. Cart có 2 game: 30,000 + 20,000 = 50,000
2. Balance = 100,000
3. Click "Thanh Toán Toàn Bộ"
4. API gọi: POST /api/orders/checkout/all
   Body: (empty)
5. Response: CartResponse (items = [])
6. Balance update: 100,000 - 50,000 = 50,000 ✅
7. Redirect: /library ✅
```

### Test 3: Thanh Toán (Không Đủ Tiền)

```
1. Balance = 30,000
2. Game = 50,000
3. Click "Thanh Toán"
4. Toast: "Số dư không đủ! Cần thêm 20,000" ✅
5. PaymentModal mở ✅
6. Nạp 30,000 → Balance = 60,000
7. ConfirmModal tự động mở
8. Click xác nhận → Thanh toán thành công ✅
```

---

## 🎯 Flow Diagram

```
User Click "Thanh Toán"
    ↓
[handleCheckout]
├─ Tính total = sum(selectedItems.finalPrice)
├─ Check balance
│  ├─ ❌ < total: PaymentModal (nạp tiền)
│  └─ ✅ >= total: ConfirmModal
    ↓
[handleConfirmPayment]
├─ 0️⃣ Get purchasedGameIds (TRƯỚC API call)
├─ 1️⃣ Chọn endpoint:
│  ├─ all: POST /api/orders/checkout/all
│  └─ selected: POST /api/orders/checkout/selected
├─ 2️⃣ API call → CartResponse
├─ 3️⃣ Update:
│  ├─ balance = balance - pendingAmount
│  ├─ cart = response data
│  └─ selectedItems = []
└─ 4️⃣ Redirect:
   ├─ 1 game: /product/{gameId}?tab=download
   └─ multiple: /library
```

---

## 💡 Key Points

1. **Order of Operations:**

   - ✅ Lấy gameId trước API call
   - ✅ Call API
   - ✅ Update state
   - ✅ Redirect

2. **Balance Update:**

   - Backend không trả newBalance
   - Frontend tính: `newBalance = localBalance - pendingAmount`
   - Hoặc: `setLocalBalance(prev => prev - pendingAmount)`

3. **CartResponse:**

   - `items`: Mảng item còn lại (đã xóa những item thanh toán)
   - `totalPrice`: Tổng giá của items còn lại
   - Không cần parse gì cả, direct `setCart(data)`

4. **Error Handling:**
   - 400 + message "Số dư không đủ" → Toast error
   - Không navigate, user có thể nạp tiền và retry

---

## ✨ Benefits

✅ Cleaner backend code (2 endpoints rõ ràng)
✅ Frontend handles redirect logic
✅ CartResponse contains fresh data
✅ No newBalance needed (frontend can calculate)
✅ Error messages from backend

---

## 🚀 Status

**READY TO DEPLOY** ✅

All 3 requirements implemented:

1. ✅ Balance check (sufficient/insufficient)
2. ✅ Remove from cart + deduct G-Coin
3. ✅ Download lock/unlock based on purchase status
