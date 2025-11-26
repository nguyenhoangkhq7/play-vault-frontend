# API Endpoints - Chi Tiết Request/Response

## 1. 🛒 Thanh Toán Game (QUAN TRỌNG)

### Endpoint

```
POST /api/orders/checkout
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "cartItemIds": [1, 2, 3]
}
```

### Response Success (200)

```json
{
  "success": true,
  "newBalance": 95000,
  "purchasedGameIds": [101, 102, 103],
  "cart": {
    "items": []
  }
}
```

### Response Error - Balance Not Enough (400)

```json
{
  "error": "Số dư không đủ",
  "required": 100000,
  "balance": 50000,
  "shortage": 50000
}
```

### Response Error - Invalid CartItem (400)

```json
{
  "error": "CartItem không tồn tại hoặc đã bị xóa"
}
```

---

## 2. 💰 Nạp Tiền G-Coin

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

---

## 3. ✅ Kiểm Tra Game Đã Mua

### Endpoint

```
GET /api/purchases/check/123
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

---

## 4. 🎁 Mua Game Miễn Phí

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

---

## Frontend Implementation Checklist

### CartPage.jsx

- [ ] `handleCheckout()` - Kiểm tra balance:

  - [ ] Tính tổng tiền (totalPrice hoặc totalForAll)
  - [ ] So sánh với `localBalance`
  - [ ] Nếu không đủ: `setShowPaymentModal(true)` + `setPendingAmount(total)`
  - [ ] Nếu đủ: `setShowConfirmModal(true)`

- [ ] `handleConfirmPayment()` - Gọi API checkout:

  - [ ] Gọi `api.post("/api/orders/checkout", { cartItemIds })`
  - [ ] Lấy `newBalance` từ response
  - [ ] `setLocalBalance(newBalance)` - Cập nhật balance
  - [ ] Cập nhật cart state (xóa những item vừa mua)
  - [ ] Lấy `purchasedGameIds` từ response
  - [ ] Nếu 1 game: `navigate(/product/{gameId}?tab=download)`
  - [ ] Nếu nhiều game: `navigate(/library)`

- [ ] `handlePaymentSuccess()` - Sau nạp tiền:
  - [ ] Nhận `newBalance` từ PaymentModal callback
  - [ ] `setLocalBalance(newBalance)`
  - [ ] Tính lại `total` dựa trên `checkoutMode`
  - [ ] Nếu `newBalance >= total`: Tự động mở ConfirmModal

### ProductDetailPage.jsx

- [ ] `checkIfOwned()` - Gọi API kiểm tra:

  - [ ] `api.get(/api/purchases/check/{gameId})`
  - [ ] Set `isOwned` từ response

- [ ] useEffect - Khi mở tab download:

  - [ ] Detect `searchParams.get("tab") === "download"`
  - [ ] Gọi `checkIfOwned(gameId)`

- [ ] Tab Download:
  - [ ] Nếu `isOwned = false`: Hiển thị "Bạn chưa sở hữu"
  - [ ] Nếu `isOwned = true`: Hiển thị nút Download

---

## Testing dengan Postman/ThunderClient

### Test 1: Thanh toán (Balance đủ)

```
POST http://localhost:8080/api/orders/checkout
Header: Authorization: Bearer YOUR_TOKEN
Body:
{
  "cartItemIds": [1, 2]
}
```

### Test 2: Thanh toán (Balance không đủ)

```
POST http://localhost:8080/api/orders/checkout
Header: Authorization: Bearer YOUR_TOKEN
Body:
{
  "cartItemIds": [10]  // Giá game 100000, balance chỉ 50000
}
```

**Mong đợi:** Error 400 với message "Số dư không đủ"

### Test 3: Nạp tiền

```
POST http://localhost:8080/api/wallet/deposit
Header: Authorization: Bearer YOUR_TOKEN
Body:
{
  "amount": 200000,
  "method": "BANK"
}
```

**Mong đợi:** newBalance = balance cũ + 200000

### Test 4: Kiểm tra owned

```
GET http://localhost:8080/api/purchases/check/101
Header: Authorization: Bearer YOUR_TOKEN
```

**Mong đợi:**

- Nếu đã mua: `{"isOwned": true}`
- Nếu chưa mua: `{"isOwned": false}`

---

## Database Schema (Gợi Ý)

### Purchase Table

```sql
CREATE TABLE purchases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  gameId INT NOT NULL,
  purchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  price DECIMAL(12, 2),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (gameId) REFERENCES games(id)
);
```

### Update User Balance

```sql
UPDATE users SET balance = balance - ? WHERE id = ?;
```

### Check Purchase

```sql
SELECT * FROM purchases WHERE userId = ? AND gameId = ? LIMIT 1;
```

---

## Error Handling

### Gợi ý Message

```javascript
if (error.response?.status === 400) {
  // Balance không đủ hoặc invalid data
  if (error.response.data?.shortage) {
    // "Cần thêm X G-Coin"
  }
}
if (error.response?.status === 401) {
  // Token hết hạn - redirect login
}
if (error.response?.status === 500) {
  // Server error
}
```

---

## Notes

1. **Idempotency:** Nếu user click 2 lần button "Xác nhận", backend cần handle (không mua 2 lần)
2. **Transaction:** Nên dùng database transaction khi checkout
3. **Concurrency:** Nếu 2 user mua cùng lúc, cần lock hoặc kiểm tra balance trước trừ
