import { API_BASE_URL, REFRESH_TOKEN_URL } from "../config/api";

export function streamChatMessage(userMessage, onChunk, onError, onDone) {
  const controller = new AbortController();
  let hasRetried = false;

  const startStream = async () => {
    let token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/stream?request=${encodeURIComponent(userMessage)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          credentials: "include",
          signal: controller.signal,
        }
      );

      // --- LOGIC REFRESH TOKEN ---
      if (response.status === 401 && !hasRetried) {
        hasRetried = true;
        try {
          const refreshRes = await fetch(REFRESH_TOKEN_URL, {
            method: "POST",
            credentials: "include",
          });
          if (!refreshRes.ok) throw new Error("Refresh failed");
          const data = await refreshRes.json();
          if (data.token) {
            localStorage.setItem("accessToken", data.token);
            return startStream();
          }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          onError?.("Phiên đăng nhập hết hạn");
          return;
        }
      }

      if (!response.ok) {
        onError?.("Vui lòng mô tả chi tiết hơn nữa!!");
        onDone?.();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      // QUAN TRỌNG: Biến buffer để lưu mảnh vỡ chưa hoàn thiện
      let buffer = ""; 

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onDone?.();
          break;
        }

        // 1. Nối dữ liệu mới vào buffer cũ
        buffer += decoder.decode(value, { stream: true });

        // 2. Tách theo dòng mới
        const lines = buffer.split("\n");

        // 3. Giữ lại dòng cuối cùng (vì có thể nó chưa tải xong) để vòng lặp sau xử lý
        buffer = lines.pop(); 

        // 4. Xử lý các dòng ĐÃ HOÀN THIỆN
        for (const line of lines) {
          if (line.startsWith("data:")) {
            // Xóa "data:" ở đầu, giữ nguyên khoảng trắng phía sau
            const data = line.replace(/^data:/, ""); 
            
            if (data && !data.includes("[DONE]")) {
               onChunk(data);
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Stream Error:", err);
        onError?.("Mất kết nối");
      }
      onDone?.();
    }
  };

  startStream();
  return () => controller.abort();
}