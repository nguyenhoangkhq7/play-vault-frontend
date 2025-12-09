import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/Button";
import { MessageSquare, Trash2, Send } from "lucide-react";
// import io from "socket.io-client"; // ❌ TẮT socket.io nếu không dùng

// ❌ TẮT socket.io để tránh lỗi ERR_CONNECTION_REFUSED
// const socket = io("http://localhost:3001");
const socket = null; // ✅ Set null để tránh lỗi

function FeedbackManagement() {
  const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState("");
const [error, setError] = useState(null);
const messagesEndRef = useRef(null);

useEffect(() => {
  fetch("http://localhost:3001/api/messages")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const userMessages = data.message_to_admin || [];
      const uniqueUsers = [...new Set(userMessages.map((msg) => msg.user_id.toString()))];
      setUsers(uniqueUsers);
      const initialMessages = userMessages.flatMap((msg) =>
        msg.messages.map((m) => ({
          id: m.sent_time,
          user: msg.user_id === 1 ? "admin" : `user_${msg.user_id}`,
          message: m.content,
          date: m.sent_time,
          type: m.type,
        }))
      ).sort((a, b) => new Date(a.date) - new Date(b.date));
      setMessages(initialMessages);
      console.log("Fetched users:", uniqueUsers);
      console.log("Fetched messages:", initialMessages);
    })
    .catch((err) => setError(err.message));

  // ✅ Chỉ dùng socket nếu nó được enabled
  if (socket) {
    socket.on("connect", () => console.log("Connected to Socket.IO server"));
    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      setError(`Không thể kết nối tới server: ${err.message}`);
    });
    socket.on("userList", (userList) => {
      console.log("Received userList:", userList);
      setUsers(userList);
    });
    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      setMessages((prev) => [...prev, msg].sort((a, b) => new Date(a.date) - new Date(b.date)));
    });
    socket.on("messages", (msgs) => {
      console.log("Received messages:", msgs);
      setMessages(msgs.sort((a, b) => new Date(a.date) - new Date(b.date)));
    });

    socket.emit("join", "admin");
  }

  return () => {
    if (socket) {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("userList");
      socket.off("message");
      socket.off("messages");
      socket.disconnect();
    }
  };
}, []);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

const handleSendMessage = () => {
  if (!selectedUser) {
    setError("Vui lòng chọn một người dùng.");
    return;
  }
  if (!newMessage.trim()) {
    setError("Tin nhắn không được để trống.");
    return;
  }
  const userId = parseInt(selectedUser);
  const message = {
    user: "admin",
    message: newMessage,
    date: new Date().toISOString(),
    type: "admin_reply",
    to: userId,
  };
  if (socket) {
    socket.emit("sendMessage", message);
  }
  setMessages((prev) => [...prev, message].sort((a, b) => new Date(a.date) - new Date(b.date)));
  setNewMessage("");
  setError(null);
};

const handleDeleteMessage = (msgId) => {
  if (!selectedUser) {
    setError("Vui lòng chọn một người dùng.");
    return;
  }
  const updatedMessages = messages.filter((msg) => msg.id !== msgId);
  setMessages(updatedMessages);
  if (socket) {
    socket.emit("deleteMessage", { id: msgId, to: parseInt(selectedUser) });
  }
};

  return (
    <div className="container mx-auto flex h-screen">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="w-1/4 bg-purple-900/20 p-4 border-r border-purple-500/30">
        <h2 className="text-xl font-bold text-white mb-4">Danh Sách Người Dùng</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user}
              onClick={() => {
                setSelectedUser(user);
                if (socket) {
                  socket.emit("getMessages", user);
                }
              }}
              className={`cursor-pointer p-2 rounded-md ${
                selectedUser === user ? "bg-purple-700" : "hover:bg-purple-600"
              } text-white`}
            >
              {`User ${user}`}
            </div>
          ))}
        </div>
      </div>
      <div className="w-3/4 p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-white mb-6">Quản Lý Phản Hồi</h1>
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto bg-purple-900/20 rounded-xl p-4 mb-4 space-y-4">
              {messages
                .filter((msg) => msg.user === `user_${selectedUser}` || msg.user === "admin")
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.user === "admin" ? "bg-green-600 ml-auto" : "bg-purple-600"
                    } max-w-[70%] text-white`}
                  >
                    <p>{msg.message}</p>
                    <span className="text-xs text-gray-300">{new Date(msg.date).toLocaleTimeString()}</span>
                    {msg.user === "admin" && (
                      <Button
                        onClick={() => handleDeleteMessage(msg.id)}
                        variant="outline"
                        className="ml-2 border-red-400 text-red-200 hover:bg-red-700 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700 text-white">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-purple-300">Chọn một người dùng để bắt đầu trò chuyện.</p>
        )}
      </div>
    </div>
  );
}

export default FeedbackManagement;