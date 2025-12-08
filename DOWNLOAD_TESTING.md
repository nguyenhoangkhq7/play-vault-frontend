# 🎮 Hướng dẫn Test Download Game với Cloudflare R2

## ✅ Đã hoàn thành

### Backend

- ✅ Endpoint: `GET /api/r2/download-game/{gameId}`
- ✅ Kiểm tra ownership với `GameService.checkOwnership(username, gameId)`
- ✅ Lấy R2 fileKey từ `GameService.getGameFileName(gameId)`
- ✅ Tạo presigned URL (valid 30 phút)
- ✅ Test trên Postman thành công

### Frontend

- ✅ API helper: `src/api/r2Games.js`
  - `downloadGameWithOwnership(gameId)` - Gọi endpoint backend
  - `triggerGameDownload(gameId, gameName)` - Auto download
- ✅ Component: `src/components/download/DownloadGameButton.jsx`
  - 3 variants: `full`, `compact`, `link-only`
  - Loading state
  - Error handling với toast
- ✅ Tích hợp vào:
  - `src/components/product/productDetail.jsx` - Trang chi tiết game
  - `src/components/bought/PurchasedProducts.jsx` - Trang game đã mua

## 🧪 Cách Test

### 1. Kiểm tra Frontend đang chạy

```bash
# Frontend đang chạy trên port 5174 (do 5173 bị chiếm)
http://localhost:5174
```

### 2. Test trên trang Game Detail (đã mua)

1. Đăng nhập vào hệ thống
2. Vào trang chi tiết một game đã mua: `http://localhost:5174/product/{gameId}`
3. Scroll xuống phần Download
4. Thấy 2 nút:
   - **Download Full Speed** (màu vàng) - Gọi API tạo presigned URL
   - **Link tải trực tiếp** (màu tím) - Mở endpoint backend trực tiếp

### 3. Test trên trang Bought (Library)

1. Vào `http://localhost:5174/bought`
2. Xem danh sách game đã mua
3. Mỗi game có 2 nút nhỏ:
   - **Tải game** (màu vàng) - Main download button
   - Icon **ExternalLink** (màu tím) - Direct link

### 4. Test Cases

#### ✅ Case 1: User đã mua game

**Steps:**

1. Login với user đã mua game
2. Click "Download Full Speed"
3. **Expected:**
   - Toast "Đang tạo link tải..."
   - Toast "Link tải hợp lệ trong 30 phút"
   - Mở tab mới với presigned URL
   - File download tự động

#### ✅ Case 2: User chưa mua game

**Steps:**

1. Login với user chưa mua
2. Vào trang game detail
3. **Expected:**
   - Không thấy phần download
   - Thấy nút "Mua ngay để tải xuống"

#### ✅ Case 3: Link tải trực tiếp

**Steps:**

1. Click "Link tải trực tiếp"
2. **Expected:**
   - Mở tab mới: `http://localhost:8080/api/r2/download-game/{gameId}`
   - Backend check ownership
   - Nếu OK: Redirect tới presigned URL
   - Nếu FAIL: Response JSON error

#### ⚠️ Case 4: User chưa login

**Steps:**

1. Logout
2. Try to access download link
3. **Expected:**
   - Toast "Vui lòng đăng nhập để tải game"

#### ⚠️ Case 5: Token hết hạn

**Steps:**

1. Login nhưng token đã expire
2. Click download
3. **Expected:**
   - Backend response 401
   - Toast "Token không hợp lệ hoặc đã hết hạn"

## 🔧 Troubleshooting

### Lỗi: "Vui lòng đăng nhập"

- **Nguyên nhân:** Không có accessToken trong localStorage
- **Fix:** Login lại

### Lỗi: "Bạn chưa mua game này"

- **Nguyên nhân:** Backend `checkOwnership()` return false
- **Fix:**
  1. Kiểm tra OrderRepository có data không
  2. Verify user đã có order COMPLETED với game này

### Lỗi: "Game này chưa có file tải về"

- **Nguyên nhân:** Game chưa có R2 fileKey trong database
- **Fix:**
  1. Check Game table có field `r2FileKey` không
  2. Upload game qua PublisherUpload page
  3. Verify R2 fileKey được save vào DB

### Lỗi: Network Error / 500

- **Nguyên nhân:** Backend không kết nối được R2
- **Fix:**
  1. Check application.yaml có config R2 đúng không
  2. Check R2UploadController init() thành công
  3. Check backend logs

## 📝 Backend Response Examples

### Success Response

```json
{
  "gameId": "1",
  "success": "true",
  "message": "Link tải hợp lệ trong 30 phút",
  "downloadUrl": "https://cec0ce0e12db70d665615052939de2f5.r2.cloudflarestorage.com/play-vault/1733652929-HT.rar?X-Amz-Algorithm=...",
  "expiresIn": "30 minutes"
}
```

### Error: Not Owned

```json
{
  "error": "Bạn chưa mua game này",
  "message": "Vui lòng mua game trước khi tải về"
}
```

### Error: Unauthorized

```json
{
  "error": "Vui lòng đăng nhập để tải game"
}
```

### Error: No File

```json
{
  "error": "Game này chưa có file tải về"
}
```

## 🎯 Features

### ✅ Security

- JWT Authentication required
- Ownership check before download
- Presigned URL expires after 30 minutes

### ✅ User Experience

- 2 download options (API + Direct link)
- Loading states with spinner
- Toast notifications for feedback
- Error handling with clear messages

### ✅ Component Reusability

- `DownloadGameButton` có 3 variants
- Dễ dàng tích hợp vào bất kỳ page nào
- Consistent UI/UX

## 🚀 Next Steps (Optional)

1. **Thêm download history**

   - Track số lần download
   - Log download time

2. **Rate limiting**

   - Giới hạn số lần download/ngày
   - Prevent abuse

3. **Download analytics**

   - Track popular games
   - Monitor bandwidth usage

4. **Resume support**

   - Support pause/resume download
   - Show download progress

5. **Multiple file versions**
   - Windows/Mac/Linux builds
   - Different languages
