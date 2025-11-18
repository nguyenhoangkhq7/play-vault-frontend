# Library API - Game đã mua

## Mô tả

API này dùng để lấy danh sách game đã mua của user hiện tại từ backend.

## Endpoint

```
GET http://localhost:8080/api/library/my-games
```

## Cách sử dụng

### 1. Import API và UserContext

```jsx
import { getMyPurchasedGames } from "../../api/library.js";
import { useUser } from "../../store/UserContext.jsx";
```

### 2. Lấy user và setAccessToken từ UserContext

```jsx
const { user, setAccessToken } = useUser();
```

### 3. Gọi API

```jsx
// Lấy tất cả game đã mua
const games = await getMyPurchasedGames(setAccessToken);

// Lấy game đã mua với filter
const filteredGames = await getMyPurchasedGames(setAccessToken, {
  name: "GTA", // Tìm theo tên game
  category: "action", // Lọc theo thể loại
  minPrice: 100000, // Giá tối thiểu
  maxPrice: 500000, // Giá tối đa
});
```

## Params hỗ trợ

| Param      | Type   | Mô tả                                               |
| ---------- | ------ | --------------------------------------------------- |
| `name`     | string | Tìm kiếm theo tên game (không phân biệt hoa thường) |
| `category` | string | Lọc theo tên thể loại (không phân biệt hoa thường)  |
| `minPrice` | number | Giá tối thiểu                                       |
| `maxPrice` | number | Giá tối đa                                          |

## Response Format

Backend trả về mảng các object GameCardDto:

```json
[
  {
    "id": 1,
    "name": "Grand Theft Auto V",
    "thumbnail": "https://example.com/image.jpg",
    "price": 299000,
    "categoryName": "Action",
    "publisherName": "Rockstar Games"
  }
]
```

## Transform sang Frontend Format

Component tự động transform data từ backend sang format phù hợp:

```javascript
const transformedProducts = purchasedGames.map((game) => ({
  id: game.id,
  name: game.name || "Unknown Game",
  price: game.price || 0,
  thumbnail_image: game.thumbnail || "default-image-url",
  purchaseDate: new Date(),
  status: "delivered",
  tags: game.categoryName ? [game.categoryName] : [],
  details: {
    publisher: game.publisherName || "Unknown Publisher",
  },
}));
```

## Authentication

API này yêu cầu user phải đăng nhập. Token được tự động gửi kèm qua `authApi.js`:

- Token được lấy từ `localStorage.getItem("accessToken")`
- Nếu token hết hạn (401), tự động refresh token
- Nếu refresh thất bại, redirect về trang login

## Ví dụ hoàn chỉnh trong Component

```jsx
import { useState, useEffect } from "react";
import { getMyPurchasedGames } from "../../api/library.js";
import { useUser } from "../../store/UserContext.jsx";

export default function MyLibrary() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setAccessToken } = useUser();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await getMyPurchasedGames(setAccessToken, {
          category: "action",
          minPrice: 0,
          maxPrice: 500000,
        });
        setGames(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [user, setAccessToken]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {games.map((game) => (
            <div key={game.id}>{game.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Error Handling

API tự động xử lý lỗi:

1. **401 Unauthorized**: Tự động refresh token và retry
2. **Refresh thất bại**: Xóa token và redirect về `/login`
3. **Các lỗi khác**: Throw error để component xử lý

```jsx
try {
  const games = await getMyPurchasedGames(setAccessToken);
} catch (error) {
  console.error("Error fetching games:", error);
  // Hiển thị thông báo lỗi cho user
}
```

## Backend Requirements

Backend phải implement endpoint theo cấu trúc:

- **Path**: `/api/library/my-games`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Query Params**: name, category, minPrice, maxPrice
- **Response**: Array of GameCardDto

## Notes

- API tự động thêm `Authorization` header với Bearer token
- Cookie `refreshToken` được gửi tự động (withCredentials: true)
- Tất cả query params đều optional
- Backend sẽ validate `minPrice <= maxPrice`
