# API Endpoints - Backend Real Implementation

## 1. 🛒 Thanh Toán Các Item Đã Chọn (SELECTED)

### Endpoint

```
POST /api/orders/checkout/selected
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "itemIds": [1, 2, 3]
}
```

### Response Success (200) - CartResponse

```json
{
  "id": "cart123",
  "userId": 5,
  "items": [],
  "totalPrice": 0,
  "createdAt": "2025-11-26T10:30:00Z"
}
```

**Giải thích:**

- `items`: Mảng item còn lại sau khi xóa các item thanh toán
- `totalPrice`: Tổng giá của các item còn lại
- Backend sẽ:
  1. Kiểm tra balance user
  2. Tính tổng tiền của các cartItem trong itemIds
  3. Nếu balance không đủ → Throw exception (400)
  4. Nếu đủ:
     - Trừ balance user
     - Tạo Purchase/Order cho mỗi game
     - Xóa các CartItem
     - Trả về CartResponse mới (items đã xóa)

### Response Error - Balance Not Enough (400)

```json
{
  "message": "Số dư không đủ"
}
```

---

## 2. 🛒 Thanh Toán Toàn Bộ Giỏ Hàng (ALL)

### Endpoint

```
POST /api/orders/checkout/all
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```
(NO BODY - Không cần gửi body)
```

### Response Success (200) - CartResponse

```json
{
  "id": "cart123",
  "userId": 5,
  "items": [],
  "totalPrice": 0,
  "createdAt": "2025-11-26T10:30:00Z"
}
```

**Giải thích:**

- Backend sẽ:
  1. Lấy tất cả item trong giỏ hàng của user
  2. Kiểm tra balance user
  3. Tính tổng tiền
  4. Nếu balance không đủ → Throw exception (400)
  5. Nếu đủ:
     - Trừ balance user
     - Tạo Purchase/Order cho mỗi game
     - Xóa toàn bộ CartItem
     - Trả về CartResponse mới (items = [])

### Response Error - Balance Not Enough (400)

```json
{
  "message": "Số dư không đủ"
}
```

---

## 3. 💰 Nạp Tiền G-Coin

### Endpoint

```
POST /api/wallet/deposit
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "amount": 100000,
  "method": "BANK"
}
```

### Response Success (200)

```json
{
  "success": true,
  "newBalance": 150000,
  "amount": 100000,
  "transactionId": "TXN20251126001"
}
```

**Giải thích:**

- Backend sẽ:
  1. Cộng amount vào user.balance
  2. Tạo transaction log
  3. Trả về newBalance

---

## 4. ✅ Kiểm Tra Game Đã Mua

### Endpoint

```
GET /api/purchases/check/{gameId}
Authorization: Bearer {token}
```

### Response Success (200)

```json
{
  "isOwned": true,
  "ownedAt": "2025-11-26T10:30:00Z"
}
```

### Response Not Owned (200)

```json
{
  "isOwned": false
}
```

**Giải thích:**

- Backend sẽ:
  1. Kiểm tra xem user có Purchase record cho gameId này không
  2. Trả về isOwned: true/false

---

## 5. 🎁 Mua Game Miễn Phí

### Endpoint

```
POST /api/orders/free
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "gameId": 123
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Đã thêm game vào thư viện"
}
```

### Response Error - Already Owned (400)

```json
{
  "error": "Bạn đã sở hữu game này"
}
```

**Giải thích:**

- Backend sẽ:
  1. Kiểm tra xem user đã có game này không
  2. Nếu có → Throw 400 error
  3. Nếu không:
     - Tạo Purchase record
     - Trả về success

---

## Frontend Implementation

### CartPage.jsx - handleConfirmPayment()

```javascript
const handleConfirmPayment = async () => {
  try {
    // 0. Lấy danh sách gameId TRƯỚC khi API call
    const purchasedGameIds = (cart?.items || [])
      .filter((item) => selectedItems.includes(String(item.cartItemId)))
      .map((item) => item.gameId);

    // 1. Gọi API tuỳ vào mode
    let endpoint = "";
    let requestBody = null;

    if (checkoutMode === "all") {
      endpoint = "/api/orders/checkout/all";
      // Không cần body
    } else {
      endpoint = "/api/orders/checkout/selected";
      const cartItemIds = selectedItems.map((id) => Number(id));
      requestBody = { itemIds: cartItemIds };
    }

    const response = await api.post(endpoint, requestBody, setAccessToken);
    const data = response.data; // CartResponse

    // 2. Cập nhật balance (backend trừ rồi)
    // Lưu ý: Backend không trả newBalance, frontend tính lại từ balance - pendingAmount
    setLocalBalance((prev) => prev - pendingAmount);

    // 3. Cập nhật cart (backend trả CartResponse mới)
    setCart(data);
    setSelectedItems([]);

    toast.success(`Thanh toán thành công!`);

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

## Testing

### Test 1: Thanh Toán Selected Items

```bash
curl -X POST http://localhost:8080/api/orders/checkout/selected \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemIds": [1, 2]}'
```

### Test 2: Thanh Toán All Items

```bash
curl -X POST http://localhost:8080/api/orders/checkout/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Nạp Tiền

```bash
curl -X POST http://localhost:8080/api/wallet/deposit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100000, "method": "BANK"}'
```

### Test 4: Kiểm Tra Owned

```bash
curl -X GET http://localhost:8080/api/purchases/check/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **Balance Update:**

   - Backend không trả `newBalance` trong checkout response
   - Frontend tính: `newBalance = localBalance - pendingAmount`
   - Hoặc fetch lại user info từ `/api/users/me` nếu cần chắc chắn

2. **CartResponse:**

   - Backend trả `CartResponse` chứa:
     - `id`: Cart ID
     - `userId`: User ID
     - `items`: Mảng CartItem còn lại (đã xóa những item thanh toán)
     - `totalPrice`: Tổng giá còn lại
     - `createdAt`: Timestamp

3. **Error Handling:**

   - 400: Balance không đủ hoặc item không tồn tại
   - 401: Token hết hạn
   - 500: Server error

4. **Idempotency:**
   - Nếu user click 2 lần button, backend cần handle (không mua 2 lần)
   - Suggestion: Kiểm tra Purchase đã tồn tại hay chưa trước khi tạo
