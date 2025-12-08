import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamChatMessage } from "../../api/chatApi";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const cancelStreamRef = useRef(null); // ← Dùng để hủy stream

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", content: "" }]);

    // Hủy stream cũ nếu đang chạy
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }

    // Gọi API stream mới (tự động thêm token + refresh nếu 401)
    const cancel = streamChatMessage(
      userMessage.content,
      (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      },
      (errorMsg) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: msg.content + `\n\nLỗi: ${errorMsg}` }
              : msg
          )
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    // Lưu lại để hủy khi cần
    cancelStreamRef.current = cancel;
  };

  // Dọn dẹp khi đóng chat hoặc unmount
  useEffect(() => {
    return () => {
      if (cancelStreamRef.current) {
        cancelStreamRef.current();
      }
    };
  }, []);

  return (
    <>
      {/* Nút mở chat */}
      {!isOpen && (
        <button
  onClick={() => setIsOpen(true)}
  className="fixed bottom-8 right-8 z-[9999] flex h-14 w-14 items-center justify-center rounded-full 
             bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
             shadow-[0_0_20px_rgba(6,182,212,0.6)] border-2 border-cyan-200/50
             hover:scale-110 transform transition-all duration-200 hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]"
>
  <MessageCircle size={32} strokeWidth={2.5} />
</button>
      )}

      {/* Khung chat */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-[9998] w-96 h-[640px] rounded-3xl bg-white shadow-2xl border border-gray-200 
                        overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-5 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">PlayVault Assistant</h2>
                  <p className="text-xs opacity-90">Đang trực tuyến • Phản hồi tức thì</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/20 transition backdrop-blur"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 && (
              <div className="text-center mt-20 text-gray-500">
                <div className="text-6xl mb-4">Xin chào!</div>
                <p className="text-lg">Mình là trợ lý AI của PlayVault</p>
                <p className="text-sm mt-2">Hỏi mình bất cứ điều gì nhé!</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse gap-3" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                  ${msg.role === "ai" ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white" : "bg-gray-700 text-white"}`}
                >
                  {msg.role === "ai" ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* Tin nhắn */}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-md text-sm leading-relaxed overflow-hidden
                    ${msg.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                    }`}
                >
                  {msg.role === "ai" && msg.content === "" && loading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  ) : (
                    <Markdown
  remarkPlugins={[remarkGfm]}
  components={{
    // --- KHẮC PHỤC LỖI DÍNH CHỮ TẠI ĐÂY ---
    p: ({ children }) => (
      <p className="mb-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
        {children}
      </p>
    ),
    // --------------------------------------

    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="ml-4 break-words">{children}</li>,
    
    // Code inline (ví dụ `const a = 1`)
    code: ({ inline, children }) =>
      inline ? (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-violet-700 break-words">
          {children}
        </code>
      ) : (
        // Code block (khối code lớn)
        <div className="overflow-x-auto my-3 rounded-lg border border-gray-200">
          <pre className="block bg-gray-900 text-gray-100 p-4 min-w-full">
            <code className="text-xs font-mono whitespace-pre">{children}</code>
          </pre>
        </div>
      ),
      
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-violet-500 pl-4 italic text-gray-600 my-3 break-words">
        {children}
      </blockquote>
    ),
    
    // Bảng biểu
    table: ({ children }) => (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 my-4 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="bg-gray-100 border border-gray-300 px-3 py-2 text-left text-xs font-bold whitespace-nowrap">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-3 py-2 text-sm break-words">{children}</td>
    ),
    
    a: ({ children, href }) => (
      <a 
        href={href} 
        className="text-violet-600 underline hover:text-violet-800 break-all" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    h1: ({ children }) => <h1 className="text-xl font-bold mt-5 mb-3 break-words">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2 break-words">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-2 break-words">{children}</h3>,
  }}
>
  {msg.content}
</Markdown>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-inner border">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="text-violet-600 hover:text-violet-700 disabled:opacity-40 transition"
              >
                <Send size={22} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Nhấn Enter để gửi • Shift + Enter để xuống dòng
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;