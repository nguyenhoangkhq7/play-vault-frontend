# 🔧 Hướng dẫn Fix Backend - Thêm Game vào Library Sau Checkout

## ⚠️ Vấn đề Hiện Tại

Frontend thành công:

- ✅ Balance bị trừ
- ✅ Cart items bị xóa
- ✅ Toast "Thanh toán thành công"

Nhưng Backend:

- ❌ Orders table không có dữ liệu mới
- ❌ Game không được thêm vào `customer.library`
- ❌ PurchasedProducts không thấy game mới mua

---

## 🎯 Giải Pháp: Sửa CheckoutService.java

### Bước 1: Mở file `CheckoutService.java`

Tìm phương thức `processCheckout()` hoặc `checkoutSelectedItems()`:

```java
@Transactional(rollbackFor = Exception.class)
public CheckoutResponseDto checkoutSelectedItems(String username, List<Long> cartItemIds) {
    return processCheckout(username, cartItemIds);
}

private CheckoutResponseDto processCheckout(String username, List<Long> cartItemIds) {
    // ... hiện tại code ở đây
}
```

### Bước 2: Tìm dòng `orderRepository.save(order);`

Tại đó, **thêm code để add game vào library** ngay sau:

```java
// ✅ SAVE: Cascade CascadeType.ALL sẽ tự save orderItems
orderRepository.save(order);
System.out.println("✅ Order saved with " + order.getOrderItems().size() + " items");

// 🔥 QUAN TRỌNG: Thêm game vào library của customer
for (OrderItem orderItem : order.getOrderItems()) {
    Game game = orderItem.getGame();
    if (game != null && !customer.getLibrary().contains(game)) {
        customer.getLibrary().add(game);
        System.out.println("✅ Added game to library: " + game.getName());
    }
}

// Lưu lại customer với library mới
customerRepository.save(customer);
System.out.println("✅ Customer library updated. Total games: " + customer.getLibrary().size());
```

### Bước 3: Full Example

Sau khi `orderRepository.save(order)`, code should look like:

```java
// TRƯỚC (Cũ):
orderRepository.save(order);

// THÊM VÀO (Mới):
orderRepository.save(order);

// 🔥 AFTER CHECKOUT: Add games to customer library
if (!order.getOrderItems().isEmpty()) {
    for (OrderItem item : order.getOrderItems()) {
        if (item.getGame() != null) {
            // Kiểm tra xem game đã có trong library chưa
            if (!customer.getLibrary().contains(item.getGame())) {
                customer.getLibrary().add(item.getGame());
            }
        }
    }
    // Save customer với library mới
    customerRepository.save(customer);
}
```

---

## 🧪 Kiểm Tra

Sau khi sửa backend:

1. **Restart Spring Boot server**
2. **Xóa trắng giỏ hàng**
3. **Mua 1 game từ CartPage**
4. **Kiểm tra:**
   - ✅ orders table có record mới?
   - ✅ order_items table có record mới?
   - ✅ Vào `/library` page (PurchasedProducts) → Thấy game mới?

---

## 🔍 Debug Logs

Nếu vẫn có vấn đề, thêm logs này vào `processCheckout()`:

```java
// Trước save
System.out.println("Before save - Orders count: " +
    customerRepository.findByAccount_Username(username).get().getOrders().size());

orderRepository.save(order);

// Sau save
System.out.println("After save - Orders count: " +
    customerRepository.findByAccount_Username(username).get().getOrders().size());

// Kiểm tra library
System.out.println("Library size: " + customer.getLibrary().size());
for (Game g : customer.getLibrary()) {
    System.out.println("  - " + g.getName());
}
```

---

## ❓ Nếu vẫn không hoạt động

**Khả năng 1:** Order entity không có cascade đúng

- Kiểm tra Order.java: `@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)`
- Nếu thiếu `cascade = CascadeType.ALL` → Thêm vào

**Khả năng 2:** Customer.library không phải ManyToMany

- Kiểm tra Customer.java có `@ManyToMany` trên field `library`
- Kiểm tra có `@JoinTable` định nghĩa tên bảng không

**Khả năng 3:** Transaction scope

- Đảm bảo method `processCheckout()` nằm trong `@Transactional` scope
- Nếu không, thêm `@Transactional(rollbackFor = Exception.class)` vào method này

---

## ✅ Expected Result

Sau fix, flow sẽ như sau:

```
Frontend: POST /api/orders/checkout/selected { itemIds: [1,2,3] }
    ↓
Backend CheckoutService.processCheckout():
    1. Get customer & validate
    2. Deduct balance → customerRepository.save()  ✅
    3. Create Order with OrderItems
    4. orderRepository.save(order)  ✅ NOW WORKS
    5. **Add games to customer.library** ✨ NEW
    6. **customerRepository.save(customer)** ✨ NEW
    7. Remove cart items
    8. Return CheckoutResponseDto(success=true)
    ↓
Frontend: Receive success → Dispatch purchasedGamesUpdated event
    ↓
PurchasedProducts.jsx: Refetch /api/library/my-games
    ↓
Database returns: New games từ customer.library
    ↓
UI: Shows newly purchased games ✨
```
