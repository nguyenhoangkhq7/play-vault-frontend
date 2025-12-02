# Hướng Dẫn Setup Feature: Tải Xuống Game Sau Khi Mua

## Mô Tả

Tính năng này cho phép người dùng:

1. **Xem game chi tiết** - Tab "Tải xuống" sẽ bị khóa, hiển thị thông báo "Bạn chưa sở hữu game này"
2. **Mua game** - Thêm vào giỏ hàng → Thanh toán
3. **Tự động chuyển hướng** - Sau thanh toán thành công, tự động chuyển đến trang chi tiết game
4. **Mở tab Download** - Tab "Tải xuống" sẽ mở tự động
5. **Hiển thị nút Download** - Nút tải file game sẽ xuất hiện

## Backend API Cần Thiết

Bạn cần implement **4 endpoint** trên backend:

### 1. Kiểm tra game đã mua hay chưa

```
GET /api/purchases/check/{gameId}
```

**Response:**

```json
{
  "isOwned": true,
  "owned": true
}
```

### 2. ⭐ API Thanh Toán Game (YÊU CẦU)

```
POST /api/orders/checkout
```

**Request:**

```json
{
  "cartItemIds": [1, 2, 3]
}
```

**Response (QUAN TRỌNG):**

```json
{
  "success": true,
  "newBalance": 50000,
  "purchasedGameIds": [123, 456, 789],
  "cart": {
    "items": []
  }
}
```

**Logic Backend:**

1. Lấy danh sách cartItem từ cartItemIds
2. Tính tổng tiền (finalPrice)
3. **Kiểm tra balance user:**
   - ❌ Nếu `balance < totalPrice` → trả lỗi 400 "Số dư không đủ"
   - ✅ Nếu `balance >= totalPrice` → tiếp tục:
4. **Trừ balance:** `user.balance -= totalPrice`
5. **Tạo đơn hàng (Order)** cho mỗi game
6. **Xóa cartItem** từ giỏ hàng
7. **Trả về:** balance mới + danh sách gameId mua + giỏ hàng mới

### 3. API Nạp Tiền G-Coin

```
POST /api/wallet/deposit
```

**Request:**

```json
{
  "amount": 100000,
  "method": "BANK"
}
```

**Response:**

```json
{
  "success": true,
  "newBalance": 150000,
  "amount": 100000
}
```

**Logic Backend:**

1. **Cộng balance:** `user.balance += amount`
2. **Tạo transaction log** (để tracking)
3. **Trả về balance mới**

### 4. API Mua Game Miễn Phí

```
POST /api/orders/free
```

**Request:**

```json
{
  "gameId": 123
}
```

**Response:**

```json
{
  "success": true
}
```

## Các Tệp Đã Sửa

### 1. `src/store/UserContext.jsx`

- **Thay đổi:** Thêm function `updateUser()`
- **Mục đích:** Cập nhật user state và lưu vào localStorage
- **Hiệu ứng:** Balance tự động cập nhật trên tất cả components

### 2. `src/components/product/productDetail.jsx`

- **Thay đổi 1:** Kiểm tra `isOwned` trước khi hiển thị tab download
- **Thay đổi 2:** Gọi API `/api/purchases/check/{gameId}` khi mở tab download
- **Thay đổi 3:** Chỉ hiển thị nút Download nếu `isOwned === true`

### 3. `src/pages/CartPage.jsx` (ĐỦI CẬP NHẬT)

- **Thay đổi 1:** Hàm `handleCheckout()` - kiểm tra balance:
  - ✅ Balance đủ → mở ConfirmModal
  - ❌ Balance không đủ → mở PaymentModal (nạp tiền)
- **Thay đổi 2:** Hàm `handleConfirmPayment()` - gọi API thực:
  - Gọi `POST /api/orders/checkout`
  - **Trừ balance** (backend trả newBalance)
  - **Xóa game khỏi giỏ**
  - Tự động **redirect** đến trang game với `?tab=download`
- **Thay đổi 3:** Hàm `handlePaymentSuccess()` - nạp tiền xong:
  - Cập nhật balance mới
  - **Tự động mở ConfirmModal** nếu balance đã đủ thanh toán

## Kiểm Tra Chức Năng

### Test Case 1: Game chưa mua - Tab download bị khóa

```
1. Login
2. Vào trang chi tiết game (chưa mua)
3. Click tab "Tải xuống"
✅ Phải thấy:
   - "Bạn chưa sở hữu game này"
   - Nút "Mua ngay để tải xuống"
```

### Test Case 2: Balance đủ - Thanh toán thẳng

```
1. User có balance > giá game
2. Thêm game vào giỏ
3. Click "Thanh Toán Các Mục Đã Chọn"
✅ Phải thấy: ConfirmModal xác nhận
✅ Click "Xác nhận" → Thanh toán thành công
✅ Tự động redirect: /product/{gameId}?tab=download
✅ Tab download mở, nút Download xuất hiện
✅ Balance trừ đi giá game
✅ Game xóa khỏi giỏ hàng
```

### Test Case 3: Balance không đủ - Nạp tiền

```
1. User có balance < giá game
2. Thêm game vào giỏ
3. Click "Thanh Toán"
✅ Phải thấy: Toast cảnh báo "Số dư không đủ"
✅ PaymentModal mở để nạp tiền
✅ Nạp tiền thành công
✅ ConfirmModal tự động mở
✅ Click "Xác nhận" → Thanh toán thành công
✅ Redirect đến trang game + mở tab download
```

### Test Case 4: Mua game miễn phí

```
1. Vào trang game (price = 0)
2. Click "Mua ngay"
✅ Gọi API /api/orders/free
✅ Game được thêm vào library
✅ Tab download bị mở khóa ngay
```

### Test Case 5: Kiểm tra lại trạng thái sau mua

```
1. Sau khi mua xong, reload trang
2. Vào lại trang chi tiết game
3. Click tab "Tải xuống"
✅ Nút Download phải vẫn hiển thị
✅ isOwned phải vẫn = true
```

## Lưu Ý Quan Trọng

### Flow Thanh Toán Chi Tiết

```
Giỏ Hàng (CartPage)
    ↓
Kiểm tra balance
    ├─ ❌ Không đủ → Mở PaymentModal (nạp tiền)
    │  └─ Nạp xong → Tự động mở ConfirmModal
    │
    └─ ✅ Đủ → Mở ConfirmModal
         └─ Click xác nhận → Gọi API /api/orders/checkout
            ├─ Trừ balance
            ├─ Xóa item khỏi giỏ
            └─ Redirect: /product/{gameId}?tab=download
                 └─ ProductDetail gọi checkIfOwned()
                    └─ Hiển thị nút Download
```

### API Response Cần Chứa

1. **`newBalance`** - Balance mới sau trừ tiền
2. **`purchasedGameIds`** - Mảng gameId đã mua (để redirect)
3. **`cart`** - Giỏ hàng mới sau khi xóa item (tuỳ chọn)

### Frontend Sẽ Làm

1. ✅ Kiểm tra balance trước thanh toán
2. ✅ Hiển thị PaymentModal nếu không đủ
3. ✅ Gọi API checkout khi xác nhận
4. ✅ Cập nhật balance từ API response
5. ✅ Redirect đến trang game + tab download
6. ✅ ProductDetail sẽ tự động check xem game đã mua chưa

### Backend Phải Làm

1. ✅ Kiểm tra balance có đủ không
2. ✅ Trừ balance user
3. ✅ Tạo Purchase record
4. ✅ Xóa CartItem
5. ✅ Trả về newBalance + purchasedGameIds

## Troubleshooting

### Problem: Tab download vẫn khóa sau thanh toán

**Solution:**

- Kiểm tra backend có return `isOwned: true` không
- Kiểm tra `checkIfOwned()` được gọi khi mở tab download

### Problem: Không tự động chuyển đến trang download

**Solution:**

- Kiểm tra `CartPage.jsx` hàm `handleConfirmPayment()` có `navigate()` không
- URL phải là `/product/{gameId}?tab=download`

### Problem: Balance không cập nhật

**Solution:**

- Kiểm tra `PaymentModal` gọi `onSuccess(data.newBalance)` không
- Kiểm tra `navbar.jsx` hàm `handlePaymentSuccess()` có gọi `setUser()` không

## Dependencies

- React Router (navigate, useParams, useSearchParams)
- UserContext (user, setUser, setAccessToken)
- API wrapper (authApi.js)
- Sonner (toast notifications)
