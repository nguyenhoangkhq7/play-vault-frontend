import { Server } from "socket.io";
import http from "http";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFilePath = path.join(__dirname, "../data/games_data.json");

const app = express();

// Kích hoạt CORS cho tất cả các route
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Ghi log để kiểm tra yêu cầu
app.use((req, res, next) => {
  console.log(`Yêu cầu nhận được: ${req.method} ${req.url}`);
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5174");
  next();
});

// Xử lý yêu cầu preflight OPTIONS
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5174");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.static("public"));

// API để lấy tin nhắn
app.get("/api/messages", (req, res) => {
  console.log("Đang lấy tin nhắn từ /api/messages");
  try {
    const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    res.json(data);
  } catch (error) {
    console.error("Lỗi khi tải tin nhắn:", error);
    res.status(500).json({ error: "Lỗi khi tải tin nhắn" });
  }
});

// Tải dữ liệu JSON
let gameData = {};
const loadJsonData = () => {
  try {
    gameData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    return gameData;
  } catch (error) {
    console.error("Lỗi khi tải JSON:", error);
    return {};
  }
};

// Lưu dữ liệu JSON
const saveJsonData = (data) => {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Lỗi khi lưu JSON:", error);
  }
};

// Khởi tạo dữ liệu
loadJsonData();

io.on("connection", (socket) => {
  console.log("Client kết nối:", socket.id);

  socket.on("join", (role) => {
    if (role === "admin") {
      socket.join("admin");
      const users = [
        ...new Set(
          gameData.message_to_admin?.map((m) => m.user_id.toString()) || []
        ),
      ];
      socket.emit("userList", users);
    }
  });

  socket.on("sendMessage", (message) => {
    const { user, message: msg, date, type, to } = message;
    if (!msg || !to) {
      socket.emit("error", "Tin nhắn hoặc người nhận không hợp lệ");
      return;
    }

    const msgId = date;
    const userIdx = gameData.message_to_admin?.findIndex(
      (m) => m.user_id === to
    );
    const msgData = { sent_time: date, type, content: msg };

    if (userIdx >= 0) {
      gameData.message_to_admin[userIdx].messages.push(msgData);
    } else {
      gameData.message_to_admin = gameData.message_to_admin || [];
      gameData.message_to_admin.push({
        id: (gameData.message_to_admin.length + 1).toString(),
        user_id: to,
        messages: [msgData],
      });
    }

    saveJsonData(gameData);

    io.to("admin").emit("message", {
      id: msgId,
      user,
      message: msg,
      date,
      type,
    });
    socket.broadcast.to(to.toString()).emit("message", {
      id: msgId,
      user,
      message: msg,
      date,
      type,
    });
  });

  socket.on("getMessages", (userId) => {
    const userMsg =
      gameData.message_to_admin?.find((m) => m.user_id.toString() === userId) || {
        messages: [],
      };
    const formattedMessages = userMsg.messages.map((m) => ({
      id: m.sent_time,
      user: userId === "1" ? "admin" : `user_${userId}`,
      message: m.content,
      date: m.sent_time,
      type: m.type,
    }));
    socket.emit("messages", formattedMessages);
  });

  socket.on("deleteMessage", ({ id, to }) => {
    const userIdx = gameData.message_to_admin?.findIndex(
      (m) => m.user_id === parseInt(to)
    );
    if (userIdx >= 0) {
      gameData.message_to_admin[userIdx].messages = gameData.message_to_admin[
        userIdx
      ].messages.filter((m) => m.sent_time !== id);
      if (gameData.message_to_admin[userIdx].messages.length === 0) {
        gameData.message_to_admin.splice(userIdx, 1);
      }
      saveJsonData(gameData);
      const updatedMessages = gameData.message_to_admin[userIdx]?.messages.map(
        (m) => ({
          id: m.sent_time,
          user: to === "1" ? "admin" : `user_${to}`,
          message: m.content,
          date: m.sent_time,
          type: m.type,
        })
      ) || [];
      io.to("admin").emit("messages", updatedMessages);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client ngắt kết nối:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("✅ Server đang chạy trên cổng 3001");
});