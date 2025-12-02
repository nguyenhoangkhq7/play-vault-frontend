import { Routes, Route } from "react-router-dom";
// Lưu ý: Kiểm tra xem GamePage/GameDetailPage export default hay export thường
// Nếu export default GamePage thì bỏ dấu {} đi: import GamePage from ...
import GamePage from '../components/admin/GamePage'; 
import { GameDetailPage } from "../components/admin/GameDetailPage";

export default function Games() {
  return (
    <Routes>
      {/* Đường dẫn gốc của cụm này. 
        Ví dụ cha là "/admin/games" thì đây là trang danh sách 
      */}
      <Route path="/" element={<GamePage />} />

      {/* SỬA: Đổi "games/:id" thành ":id"
        Lý do: Nếu cha đã là "/admin/games", để ":id" thì URL sẽ là "/admin/games/123".
        Nếu để "games/:id" thì URL sẽ thành "/admin/games/games/123" (bị thừa).
      */}
      <Route path=":id" element={<GameDetailPage />} />
    </Routes>
  );
}