import { useState, useEffect, useRef } from "react";
import { Save, Upload, Camera, User, ShoppingCart } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import users API
import { getPurchases } from "../../api/purchases.js"; // Import games and purchases API
import { getGames } from "../../api/games.js"; // Import games API
import { API_BASE_URL } from "../../config/api";
import { updateProfile, getProfile} from "../../api/profile.js";
import { getOrderHistory} from "../../api/order.js";
import { uploadImageToCloudinary } from "../../api/uploadImage.js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers, updateUser } from "../../api/users.js"; // Import users API
import { api } from "../../api/authApi.js"; // Import api wrapper
import { useUser } from "../../store/UserContext.jsx"; // Import user context
import { getPurchases } from "../../api/purchases.js"; // Import games and purchases API
import { getGames } from "../../api/games.js"; // Import games API
import { API_BASE_URL } from "../../config/api";
import { getProfile, updateProfile } from "../../api/profile.js";
import { getOrderHistory } from "../../api/order.js";

// 🧪 Dữ liệu mẫu đơn hàng để test giao diện

// Define the form schema with validation rules
const formSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, {
        message: "Số điện thoại phải có 10-11 chữ số",
      })
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email({ message: "Email không hợp lệ" })
      .optional()
      .or(z.literal("")),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Vui lòng chọn giới tính",
    }),
    birthDay: z.string().optional(),
    birthMonth: z.string().optional(),
    birthYear: z.string().optional(),
    address: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.birthDay || data.birthMonth || data.birthYear) {
        return data.birthDay && data.birthMonth && data.birthYear;
      }
      return true;
    },
    {
      message: "Vui lòng chọn đầy đủ ngày tháng năm sinh",
      path: ["birthDay"],
    }
  );

    // Chuyển "YYYY-MM-DD" -> { day: "1", month: "2", year: "2000" } (string)
function parseIsoDateToParts(iso) {
  if (!iso) return { day: "", month: "", year: "" };
  try {
    // nếu iso có thời gian, chỉ lấy phần ngày
    const dateOnly = iso.split("T")[0];
    const [y, m, d] = dateOnly.split("-");
    if (!y || !m || !d) return { day: "", month: "", year: "" };
    return { day: String(Number(d)), month: String(Number(m)), year: String(Number(y)) };
  } catch {
    return { day: "", month: "", year: "" };
  }
}

// Gộp {day,month,year} -> "YYYY-MM-DD" (UTC-safe)
function partsToIsoDate({ day, month, year }) {
  if (!day || !month || !year) return null;
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function UserProfile() {
    const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=200&width=200");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const fileInputRef = useRef(null);

    // Initialize the form
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            gender: "male",
            birthDay: "",
            birthMonth: "",
            birthYear: "",
            address: "",
        },
    });

    // Load user data from API and storage on mount
    useEffect(() => {
  let mounted = true;

  const fetchByUsername = async () => {
    setIsLoading(true);
    try {
      const storedRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!storedRaw) throw new Error("User chưa đăng nhập (localStorage.user trống)");

      const storedUser = JSON.parse(storedRaw);
      const username = storedUser.username;
      if (!username) throw new Error("storedUser.username trống");

      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";
      console.log("DEBUG: token exists?", !!token);
      console.log("DEBUG: fetching profile by username:", username);

      const url = `${API_BASE_URL}/api/users/by-username/${encodeURIComponent(username)}/profile`;
      console.log("DEBUG: request url:", url);

      const resp = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        // credentials: "include" // only if your backend uses cookies/session
      });

      console.log("DEBUG: fetch response status:", resp.status, resp.statusText);
      // attempt to read body (safe)
      let bodyText = null;
      try {
        bodyText = await resp.text();
        console.log("DEBUG: raw body text:", bodyText);
      } catch (e) {
        console.warn("Could not read body text:", e);
      }

      if (resp.status === 401) {
        // token invalid/expired or server rejected Authorization header (CORS)
        toast.error("Không được phép (401). Vui lòng đăng nhập lại.");
        // optional: redirect to login
        return;
      }

      if (!resp.ok) {
        throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`);
      }

      // parse JSON (nếu bodyText non-empty)
      const data = bodyText ? JSON.parse(bodyText) : null;
      // nếu API trả wrapper { data: {...} } điều chỉnh bên dưới
      const cust = data?.data || data;
      console.log("DEBUG: parsed customer:", cust);

      // map -> final
      const profile = cust ? {
        id: cust.id,
        fullName: cust.fullName || cust.full_name,
        avatarUrl: cust.avatarUrl || cust.avatar_url,
        dateOfBirth: cust.dateOfBirth || cust.date_of_birth,
        email: cust.email,
        phone: cust.phone
      } : null;

      if (!mounted) return;

      const birthParts = parseIsoDateToParts(profile.dateOfBirth || storedUser.dob || storedUser.dateOfBirth);
      if (profile) {
        // cập nhật form + storage giống logic trước
        form.reset({
            name: profile.fullName || "Unknown",
            phone: profile.phone || storedUser.phone || "",
            email: profile.email || storedUser.email || "",
            gender: profile.gender || storedUser.gender || "male",
            address: profile.address || storedUser.address || "",
            birthDay: birthParts.day,
            birthMonth: birthParts.month,
            birthYear: birthParts.year,
        });
        // cập nhật localStorage (lưu luôn dateOfBirth iso để lần sau dễ dùng)
        const merged = {
            ...storedUser,
            id: profile.id,
            fullName: profile.fullName,
            avatar: profile.avatarUrl,
            dateOfBirth: profile.dateOfBirth || storedUser.dateOfBirth || storedUser.dob,
            email: profile.email || storedUser.email,
            phone: profile.phone || storedUser.phone,
        };
        localStorage.setItem("user", JSON.stringify(merged));
    if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
      } else {
        console.warn("No profile returned, fallback to storedUser");
  const [avatarUrl, setAvatarUrl] = useState(
    "/placeholder.svg?height=200&width=200"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);

  // Lấy user và setAccessToken từ Context
  const { user, setAccessToken } = useUser();

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      gender: "male",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      address: "",
    },
  });

  // Load user data from API and storage on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storedRaw =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!storedRaw) throw new Error("User chưa đăng nhập");

        const storedUser = JSON.parse(storedRaw);
        // Lấy id ưu tiên
        const userId =
          storedUser.id ||
          storedUser.customerId ||
          storedUser.customer_id ||
          null;

        let profile = null;
        if (userId) {
          try {
            profile = await getProfile(userId);
          } catch (e) {
            console.warn("Không lấy được profile theo id:", userId, e);
          }
        } else if (storedUser.username) {
          // fallback: tìm bằng username (nếu bạn có getUsers trả array)
          try {
            const all = await getUsers();
            const matched = all.find(
              (u) =>
                u.username === storedUser.username ||
                u.accountUsername === storedUser.username
            );
            const idFound =
              matched?.customerId || matched?.id || matched?.userId || null;
            if (idFound) {
              profile = await getProfile(idFound);
              storedUser.id = idFound; // lưu id để lần sau khỏi tìm
            }
          } catch (e) {
            console.warn("Fallback tìm user bằng username thất bại:", e);
          }
        }

        // Nếu không có profile từ API thì dùng dữ liệu localStorage
        const final = {
          username: storedUser.username,
          email: (profile && profile.email) || storedUser.email || null,
          phone: (profile && profile.phone) || storedUser.phone || null,
          fullName:
            (profile && (profile.fullName || profile.full_name)) ||
            storedUser.fullName ||
            storedUser.f_name ||
            "",
          avatar:
            (profile &&
              (profile.avatarUrl || profile.avatar_url || profile.avatar)) ||
            storedUser.avatar ||
            storedUser.avatarUrl ||
            null,
          address: (profile && profile.address) || storedUser.address || null,
          gender: (profile && profile.gender) || storedUser.gender || "male",
          dob:
            (profile &&
              (profile.dateOfBirth || profile.date_of_birth || profile.dob)) ||
            storedUser.dob ||
            null,
          id: userId || storedUser.id || storedUser.customerId || null,
        };

        // parse dateOfBirth (API trả "YYYY-MM-DD")
        let birthDay = "",
          birthMonth = "",
          birthYear = "";
        if (final.dob) {
          // dob có thể là "1999-05-12" hoặc object {$date: "..."}
          let iso = null;
          if (typeof final.dob === "string") iso = final.dob;
          else if (typeof final.dob === "object" && final.dob.$date)
            iso = final.dob.$date;

          if (iso) {
            const d = new Date(iso);
            if (!isNaN(d.getTime())) {
              birthDay = String(d.getUTCDate());
              birthMonth = String(d.getUTCMonth() + 1);
              birthYear = String(d.getUTCFullYear());
            }
          }
        }

        // reset form values
        form.reset({
          name: final.fullName || "Unknown",
          phone: final.phone || "",
          email: final.email || "",
          gender: final.gender || "male",
          address: final.address || "",
          birthDay,
          birthMonth,
          birthYear,
        });

        // set avatar
        if (final.avatar) setAvatarUrl(final.avatar);
        else {
          const fn =
            final.fullName || storedUser.f_name || storedUser.l_name || "";
          if (fn)
            setAvatarUrl(
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fn
              )}&background=9333ea&color=ffffff&size=200`
            );
        }

        // cập nhật localStorage merged
        const merged = {
          ...storedUser,
          id: final.id,
          fullName: final.fullName,
          avatar: final.avatar,
          address: final.address,
          gender: final.gender,
          dob: final.dob,
          email: final.email,
          phone: final.phone,
        };
        localStorage.setItem("user", JSON.stringify(merged));
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu người dùng:", err);
        toast.error("Lỗi", {
          description: "Không thể tải dữ liệu người dùng.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    } catch (err) {
      console.error("Fetch customer by username failed:", err);
      toast.error("Không thể lấy dữ liệu người dùng. Kiểm tra console/network.");
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  fetchByUsername();
  return () => { mounted = false; };
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// khi user chuyển tab sang orders sẽ load
useEffect(() => {
  if (activeTab === "orders") {
    fetchOrderHistory();
    }
}, [activeTab]);

// fetch order history tối ưu: ưu tiên endpoint /api/users/{id}/orders (getOrderHistory)
// nếu không có hàm đó thì fallback sang getPurchases() hiện có
const fetchOrderHistory = async (page = 0, size = 20) => {
  setOrdersLoading(true);
  try {
    const storedRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedRaw) throw new Error("Thông tin người dùng không tồn tại");
    const storedUser = JSON.parse(storedRaw);
    const userId = storedUser.id || storedUser.customerId || storedUser._id || null;
    if (!userId) throw new Error("ID người dùng không tồn tại");

    // --- try server pageable orders endpoint if available (recommended) ---
    let ordersResponse = null;
    try {
      // try dynamic import / API helper if you created src/api/orders.js with getOrderHistory
      if (typeof getOrderHistory === "function") {
        ordersResponse = await getOrderHistory(userId, page, size);
      } else {
    fetchData();
  }, []);

  // thay thế useEffect + fetchOrderHistory cũ bằng đoạn này

  // khi user chuyển tab sang orders sẽ load
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrderHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // fetch order history tối ưu: ưu tiên endpoint /api/users/{id}/orders (getOrderHistory)
  // nếu không có hàm đó thì fallback sang getPurchases() hiện có
  const fetchOrderHistory = async (page = 0, size = 20) => {
    setOrdersLoading(true);
    try {
      const storedRaw =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!storedRaw) throw new Error("Thông tin người dùng không tồn tại");
      const storedUser = JSON.parse(storedRaw);
      const userId =
        storedUser.id || storedUser.customerId || storedUser._id || null;
      if (!userId) throw new Error("ID người dùng không tồn tại");

      // --- try server pageable orders endpoint if available (recommended) ---
      let ordersResponse = null;
      try {
        // try dynamic import / API helper if you created src/api/orders.js with getOrderHistory
        // eslint-disable-next-line no-undef
        if (typeof getOrderHistory === "function") {
          ordersResponse = await getOrderHistory(userId, page, size);
        } else {
          ordersResponse = null;
        }
      } catch (e) {
        console.warn(
          "getOrderHistory unavailable or failed, fallback to purchases endpoint:",
          e
        );
        ordersResponse = null;
      }

      // --- fallback: use existing purchases endpoint (getPurchases) ---
      let purchasesData = null;
      if (!ordersResponse) {
        // getPurchases should return array of purchase objects; you already import it at top
        purchasesData = await getPurchases().catch((e) => {
          console.warn("getPurchases failed:", e);
          return null;
        });
      }

      // Normalize into an array of order items to show in UI
      let content = [];
      if (Array.isArray(ordersResponse)) {
        content = ordersResponse;
      } else if (ordersResponse && Array.isArray(ordersResponse.content)) {
        // Spring Page<T>
        content = ordersResponse.content;
      } else if (purchasesData) {
        // purchasesData structure: array of purchase groups per user. find current user's purchases
        const userPurchaseGroup = purchasesData.find(
          (item) =>
            item.user_id?.toString() === userId?.toString() ||
            item.userId?.toString() === userId?.toString() ||
            item.user_id === Number(userId)
        );
        if (
          userPurchaseGroup &&
          Array.isArray(userPurchaseGroup.games_purchased)
        ) {
          // convert each purchased game into a pseudo-order (same logic as cũ)
          content = userPurchaseGroup.games_purchased.map((p, idx) => ({
            id: `${userPurchaseGroup.id || "PUR"}-${p.game_id}-${idx + 1}`,
            createdAt: p.purchased_at?.$date || new Date().toISOString(),
            total: p.price || 0,
            status: "Đã giao",
            items: [
              {
                game_id: p.game_id,
                price: p.price,
                // additional fields missing -> map later with gamesResponse
                raw: p,
              },
            ],
          }));
        } else {
          content = []; // nothing for user
        }
      } else {
        content = [];
      }

      // If you need game metadata (name, thumbnail) try to fetch games (optional)
      let gamesResponse = [];
      try {
        gamesResponse = await getGames().catch(() => []);
      } catch {
        gamesResponse = [];
      }

      // Map content -> processedOrders for your UI
      const processedOrders = (content || []).map((o, idx) => {
        // try to find first item / game id
        const firstItem =
          (o.items && o.items[0]) ||
          (o.raw && o.raw.games_purchased && o.raw.games_purchased[0]) ||
          null;
        const gid =
          firstItem?.game_id || firstItem?.gameId || firstItem?.game || null;

        // try to find game metadata
        const game = gamesResponse.find(
          (g) =>
            String(g.id) === String(gid) || String(g.game_id) === String(gid)
        );

        // parse date
        const dateIso =
          o.createdAt ||
          o.created_at ||
          firstItem?.purchased_at?.$date ||
          new Date().toISOString();
        const dateStr = dateIso
          ? new Date(dateIso).toLocaleDateString("vi-VN")
          : "";

        const price = o.total || firstItem?.price || 0;
        const priceFormatted = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price);

        return {
          id: o.id || `ORD-${idx}`,
          date: dateStr,
          status: o.status || o.orderStatus || "Đã giao",
          price,
          priceFormatted,
          name:
            game?.name || firstItem?.title || firstItem?.name || "Unknown Game",
          image:
            game?.thumbnail_image ||
            game?.imageUrl ||
            firstItem?.thumbnail ||
            "https://placehold.co/100x100/3a1a5e/ffffff?text=Game",
          raw: o,
        };
      });

      // sort newest first
      processedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

      setUserOrders(processedOrders);
      localStorage.setItem("user_orders", JSON.stringify(processedOrders));
    } catch (err) {
      console.error("Error fetching order history:", err);
      toast.error("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
      const saved = localStorage.getItem("user_orders");
      if (saved) setUserOrders(JSON.parse(saved));
    } finally {
      setOrdersLoading(false);
    }
  };

  // Handle avatar upload click
  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle avatar file change
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target.result);

        // TODO: Cần gọi API upload ảnh
        // Hiện tại chỉ đang lưu Base64 vào localStorage

    // Handle avatar file change
    const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // validate
  const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
  if (!allowed.includes(file.type)) { toast.error("Chỉ JPG/PNG/WEBP/GIF"); return; }
  if (file.size > 5*1024*1024) { toast.error("Ảnh quá lớn (>5MB)"); return; }

  // preview local quick
  const reader = new FileReader();
  reader.onload = (e) => setAvatarUrl(e.target.result); // preview base64, temporary
  reader.readAsDataURL(file);

  toast.loading("Đang upload...");
  try {
    const result = await uploadImageToCloudinary(file);
    console.log("Cloudinary result:", result);
    const url = result?.secure_url || result?.url;
    if (!url) throw new Error("Cloudinary không trả secure_url");

    if (url.length > 255) {
      // optional: do not send to server if too long
      toast.error("URL ảnh quá dài, không thể lưu");
      return;
    }

    // gọi updateProfile chỉ với URL (KHÔNG gửi base64)
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id;
    await updateProfile(userId, { avatarUrl: url });

    // update localStorage & UI
    const updatedUser = { ...storedUser, avatar: url, avatarUrl: url };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setAvatarUrl(url);

    toast.success("Cập nhật ảnh đại diện thành công");
  } catch (err) {
    console.error("Error in handleAvatarChange:", err);
    // nếu Cloudinary trả 'Invalid folder', bạn đã fix preset / remove folder
    toast.error("Upload thất bại. Kiểm tra console/network.");
  } finally {
    toast.dismiss();
  }
};

    
// Handle form submission
async function onSubmit(values) {
  setIsSubmitting(true);
  try {
    // lấy stored user
    const storedRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedRaw) {
      toast.error("User ID không tồn tại. Vui lòng đăng nhập lại.");
      return;
    }
    const storedUser = JSON.parse(storedRaw);
    const userId = storedUser.id || storedUser.customerId || storedUser._id;
    if (!userId) {
      toast.error("User ID không tồn tại. Vui lòng đăng nhập lại.");
      return;
        const storedUser = JSON.parse(
          localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
        );
        const updatedUser = {
          ...storedUser,
          avatar: e.target.result, // Sửa: Dùng avatarUrl
        };

        const storage = localStorage.getItem("user")
          ? localStorage
          : sessionStorage;
        storage.setItem("user", JSON.stringify(updatedUser));

        toast.success("Cập nhật ảnh đại diện thành công");
      };
      reader.readAsDataURL(file);
    }
  };

    // chuẩn bị payload từ form
    const fullName = (values.name || storedUser.fullName || "Unknown").trim();
    const dateIso = partsToIsoDate({
      day: values.birthDay,
      month: values.birthMonth,
      year: values.birthYear
    });
    const dateOfBirth = dateIso || null;
    const avatarToSend = avatarUrl || storedUser.avatarUrl || storedUser.avatar || null;

    const payload = {
      fullName,
      gender: values.gender,
      dateOfBirth,
      avatarUrl: avatarToSend,
      address: values.address || storedUser.address || null
    };

    // --- 0) optional: optimistic update UI ngay (cảm giác phản hồi nhanh) ---
    const optimisticStored = {
      ...storedUser,
      fullName: payload.fullName,
      avatar: payload.avatarUrl,
      avatarUrl: payload.avatarUrl,
      address: payload.address,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender
    };
    // cập nhật tạm vào localStorage và UI ngay
    localStorage.setItem("user", JSON.stringify(optimisticStored));
    setAvatarUrl(optimisticStored.avatarUrl || optimisticStored.avatar);
    form.reset({
      name: optimisticStored.fullName,
      phone: optimisticStored.phone || "",
      email: optimisticStored.email || "",
      gender: optimisticStored.gender || "male",
      address: optimisticStored.address || "",
      birthDay: values.birthDay,
      birthMonth: values.birthMonth,
      birthYear: values.birthYear
    });

    // --- 1) gọi API cập nhật
    let updatedDto = null;
    try {
      updatedDto = await updateProfile(userId, payload); // updateProfile ném lỗi nếu !resp.ok
    } catch (err) {
      console.error("updateProfile error:", err);
      // rollback optimistic nếu thất bại (lấy lại dữ liệu cũ từ storedUser)
      localStorage.setItem("user", JSON.stringify(storedUser));
      setAvatarUrl(storedUser.avatarUrl || storedUser.avatar || "/placeholder.svg?height=200&width=200");
      form.reset({
        name: storedUser.fullName || "",
        phone: storedUser.phone || "",
        email: storedUser.email || "",
        gender: storedUser.gender || "male",
        address: storedUser.address || "",
        birthDay: values.birthDay,
        birthMonth: values.birthMonth,
        birthYear: values.birthYear
      });

      if (err.status === 401 || (err.message && err.message.includes("401"))) {
        toast.error("Phiên đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
        return;
      }
      toast.error("Lỗi khi cập nhật hồ sơ. Kiểm tra console.");
      return;
    }

    // --- 2) Nếu server trả body cập nhật thì dùng nó, còn không gọi getProfile để lấy dữ liệu chính thức ---
    let finalProfile = null;
    if (updatedDto && Object.keys(updatedDto).length > 0) {
      // nếu API trả wrapper { data: {...} } thì lấy data
      finalProfile = updatedDto?.data || updatedDto;
    } else {
      // một số API có thể trả 204 No Content -> phải fetch lại
      try {
        const resp = await getProfile(userId); // your helper that GET /api/users/{id}/profile
        finalProfile = resp?.data || resp;
      } catch (e) {
        console.warn("Không lấy được profile sau khi update, sẽ dùng payload đã gửi", e);
        // fallback: dùng payload (đã optimistic)
        finalProfile = {
          id: userId,
          fullName: payload.fullName,
          avatarUrl: payload.avatarUrl,
          dateOfBirth: payload.dateOfBirth,
          gender: payload.gender,
          address: payload.address,
          email: storedUser.email,
          phone: storedUser.phone
        };
      }
    }

    // --- 3) chuẩn hoá và cập nhật localStorage + UI theo finalProfile ---
    const serverDob = finalProfile?.dateOfBirth || finalProfile?.date_of_birth || finalProfile?.dob || payload.dateOfBirth;
    const serverAvatar = finalProfile?.avatarUrl || finalProfile?.avatar_url || finalProfile?.avatar || avatarToSend;
    const serverFullName = finalProfile?.fullName || finalProfile?.full_name || payload.fullName;
    const serverGender = finalProfile?.gender || payload.gender;
    const serverAddress = finalProfile?.address || payload.address;
    const serverEmail = finalProfile?.email || storedUser.email;
    const serverPhone = finalProfile?.phone || storedUser.phone;

    const newStored = {
      ...storedUser,
      id: userId,
      fullName: serverFullName,
      avatar: serverAvatar,
      avatarUrl: serverAvatar,
      address: serverAddress,
      dateOfBirth: serverDob || null,
      gender: serverGender || storedUser.gender || "male",
      email: serverEmail,
      phone: serverPhone
    };

    localStorage.setItem("user", JSON.stringify(newStored));
    if (serverAvatar) setAvatarUrl(serverAvatar);

    // reset form hiển thị theo dữ liệu server
    const parts = parseIsoDateToParts(serverDob);
    form.reset({
      name: newStored.fullName,
      phone: newStored.phone,
      email: newStored.email,
      gender: newStored.gender || "male",
      address: newStored.address || "",
      birthDay: parts.day,
      birthMonth: parts.month,
      birthYear: parts.year
    });

    toast.success("Cập nhật hồ sơ thành công");
  } catch (err) {
    console.error("Lỗi when saving profile:", err);
    toast.error("Lỗi khi lưu hồ sơ", { description: err?.message || "Unknown error" });
  } finally {
    setIsSubmitting(false);
  }
}
  // Handle form submission
  // Handle form submission
  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      const storedRaw =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!storedRaw) {
        toast.error("User ID không tồn tại. Vui lòng đăng nhập lại.");
        return;
      }
      const storedUser = JSON.parse(storedRaw);
      const userId = storedUser.id || storedUser.customerId || storedUser._id;
      if (!userId) {
        toast.error("User ID không tồn tại. Vui lòng đăng nhập lại.");
        return;
      }

      const fullName = (values.name || storedUser.fullName || "Unknown").trim();
      let dateOfBirth = null;
      if (values.birthDay && values.birthMonth && values.birthYear) {
        const d = new Date(
          Date.UTC(
            parseInt(values.birthYear, 10),
            parseInt(values.birthMonth, 10) - 1,
            parseInt(values.birthDay, 10)
          )
        );
        if (!isNaN(d.getTime())) {
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(d.getUTCDate()).padStart(2, "0");
          dateOfBirth = `${yyyy}-${mm}-${dd}`;
        }
      }

      const payload = {
        fullName,
        gender: values.gender,
        dateOfBirth,
        avatarUrl:
          avatarUrl || storedUser.avatarUrl || storedUser.avatar || null,
        address: values.address || storedUser.address || null,
      };

      // gọi API updateProfile (trả về JSON DTO)
      const updatedDto = await updateProfile(userId, payload);

      // cập nhật storage & UI với dữ liệu server trả về (fallback về payload nếu thiếu)
      const newStored = {
        ...storedUser,
        fullName: updatedDto.fullName || payload.fullName,
        avatar: updatedDto.avatarUrl || payload.avatarUrl,
        address: updatedDto.address || payload.address,
        dateOfBirth: updatedDto.dateOfBirth || payload.dateOfBirth,
        gender: updatedDto.gender || payload.gender,
        email: updatedDto.email || storedUser.email,
        phone: updatedDto.phone || storedUser.phone,
      };

      localStorage.setItem("user", JSON.stringify(newStored));

      // reset form hiển thị
      form.reset({
        name: newStored.fullName,
        phone: newStored.phone,
        email: newStored.email,
        gender: newStored.gender || "male",
        address: newStored.address || "",
        birthDay: values.birthDay,
        birthMonth: values.birthMonth,
        birthYear: values.birthYear,
      });

      toast.success("Cập nhật hồ sơ thành công");
    } catch (err) {
      console.error("Lỗi when saving profile:", err);
      toast.error("Lỗi khi lưu hồ sơ", {
        description: err.message || "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-2xl p-16 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-purple-800/50 mb-4"></div>
            <div className="h-6 w-48 bg-purple-800/50 rounded-md mb-3"></div>
            <div className="h-4 w-72 bg-purple-800/50 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Hồ sơ người dùng</h2>
            <p className="text-purple-300">
              Quản lý thông tin cá nhân và theo dõi đơn hàng của bạn
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-purple-900/40 mb-8">
              <TabsTrigger
                value="profile"
                className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Lịch sử đơn hàng
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar section */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                      <AvatarImage src={avatarUrl} alt="Avatar" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl">
                        {form.watch("name")?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                      onClick={handleAvatarUploadClick}
                    >
                      <Camera className="h-5 w-5" />
                    </Button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <p className="text-purple-300 text-sm text-center max-w-[180px]">
                    Nhấp vào biểu tượng máy ảnh để thay đổi ảnh đại diện
                  </p>
                </div>

                {/* Form section */}
                <div className="flex-1">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-purple-200">
                              Họ và tên
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập họ và tên"
                                {...field}
                                className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-purple-200">
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập email"
                                  {...field}
                                  className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-purple-200">
                                Số điện thoại
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập số điện thoại"
                                  {...field}
                                  className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel className="text-purple-200">
                          Ngày sinh
                        </FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          <FormField
                            control={form.control}
                            name="birthDay"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                    <SelectValue placeholder="Ngày" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from(
                                      { length: 31 },
                                      (_, i) => i + 1
                                    ).map((day) => (
                                      <SelectItem
                                        key={day}
                                        value={day.toString()}
                                      >
                                        {day}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="birthMonth"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                    <SelectValue placeholder="Tháng" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from(
                                      { length: 12 },
                                      (_, i) => i + 1
                                    ).map((month) => (
                                      <SelectItem
                                        key={month}
                                        value={month.toString()}
                                      >
                                        {month}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="birthYear"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                    <SelectValue placeholder="Năm" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from(
                                      { length: 100 },
                                      (_, i) => new Date().getFullYear() - i
                                    ).map((year) => (
                                      <SelectItem
                                        key={year}
                                        value={year.toString()}
                                      >
                                        {year}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Đang cập nhật...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thông tin
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <div className="space-y-6">
                {ordersLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      Chưa có đơn hàng nào
                    </h3>
                    <p className="text-purple-300">Bạn chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-purple-700/40">
                          <th className="text-left py-3 px-4 text-purple-300 font-medium">
                            Mã đơn hàng
                          </th>
                          <th className="text-left py-3 px-4 text-purple-300 font-medium">
                            Trò chơi
                          </th>
                          <th className="text-left py-3 px-4 text-purple-300 font-medium">
                            Ngày mua
                          </th>
                          <th className="text-left py-3 px-4 text-purple-300 font-medium">
                            Trạng thái
                          </th>
                          <th className="text-right py-3 px-4 text-purple-300 font-medium">
                            Giá tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.map((order, index) => (
                          <tr
                            key={`${order.id}-${index}`} // Sửa: Key duy nhất
                            className={`border-b border-purple-700/20 hover:bg-purple-800/10 transition-colors ${
                              index > 0 &&
                              userOrders[index - 1].date === order.date
                                ? ""
                                : "border-t-4 border-t-purple-800"
                            }`}
                          >
                            <td className="py-4 px-4 text-white font-medium">
                              {order.id}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                {order.image && (
                                  <div className="w-10 h-10 rounded overflow-hidden">
                                    <img
                                      src={order.image}
                                      alt={order.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="text-purple-200 font-medium">
                                    {order.name}
                                  </span>
                                  {order.publisher && (
                                    <span className="text-purple-300 text-xs mt-1">
                                      <span className="font-medium">
                                        Nhà phát hành:
                                      </span>{" "}
                                      {order.publisher}
                                    </span>
                                  )}
                                  {order.tags && order.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {order.tags.map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 bg-purple-700/40 text-purple-200 text-xs rounded-full"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {order.age_limit && (
                                    <span className="text-purple-300 text-xs mt-1">
                                      <span className="font-medium">
                                        Độ tuổi:
                                      </span>{" "}
                                      {order.age_limit}
                                    </span>
                                  )}
                                </div>

                                {/* Form section */}
                                <div className="flex-1">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-purple-200">Họ và tên</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Nhập họ và tên"
                                                                {...field}
                                                                className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-purple-200">Email</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Nhập email"
                                                                    {...field}
                                                                    className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-purple-200">Số điện thoại</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Nhập số điện thoại"
                                                                    {...field}
                                                                    className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <FormLabel className="text-purple-200">Ngày sinh:</FormLabel>
                                                <div className="grid grid-cols-3 gap-4 mr-75">
                                                    <FormField
                                                        control={form.control}
                                                        name="birthDay"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                                                        <SelectValue placeholder="Ngày" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                                            <SelectItem key={day} value={day.toString()}>
                                                                                {day}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="birthMonth"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                                                        <SelectValue placeholder="Tháng" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                                            <SelectItem key={month} value={month.toString()}>
                                                                                {month}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="birthYear"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                                                        <SelectValue placeholder="Năm" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from(
                                                                            { length: 100 },
                                                                            (_, i) => new Date().getFullYear() - i
                                                                        ).map((year) => (
                                                                            <SelectItem key={year} value={year.toString()}>
                                                                                {year}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Đang cập nhật...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Lưu thông tin
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders" className="mt-0">
                            <div className="space-y-6">
                                {ordersLoading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : userOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                                        <h3 className="text-xl font-medium text-white mb-2">Chưa có đơn hàng nào</h3>
                                        <p className="text-purple-300">Bạn chưa có đơn hàng nào</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-purple-700/40">
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Mã đơn hàng</th>
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Trò chơi</th>
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Ngày mua</th>
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Trạng thái</th>
                                                    <th className="text-right py-3 px-4 text-purple-300 font-medium">Giá tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userOrders.map((order, index) => (
                                                    <tr
                                                        key={`${order.id}-${index}`} // Sửa: Key duy nhất
                                                        className={`border-b border-purple-700/20 hover:bg-purple-800/10 transition-colors ${index > 0 && userOrders[index - 1].date === order.date ? '' : 'border-t-4 border-t-purple-800'}`}
                                                    >
                                                        <td className="py-4 px-4 text-white font-medium">{order.id}</td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                {order.image && (
                                                                    <div className="w-10 h-10 rounded overflow-hidden">
                                                                        <img
                                                                            src={order.image}
                                                                            alt={order.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span className="text-purple-200 font-medium">{order.name}</span>
                                                                    {order.publisher && (
                                                                        <span className="text-purple-300 text-xs mt-1">
                                                                            <span className="font-medium">Nhà phát hành:</span> {order.publisher}
                                                                        </span>
                                                                    )}
                                                                    {order.tags && order.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {order.tags.map((tag, idx) => (
                                                                                <span key={idx} className="px-2 py-0.5 bg-purple-700/40 text-purple-200 text-xs rounded-full">
                                                                                    {tag}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {order.age_limit && (
                                                                        <span className="text-purple-300 text-xs mt-1">
                                                                            <span className="font-medium">Độ tuổi:</span> {order.age_limit}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-purple-200">{order.date}</td>
                                                        <td className="py-4 px-4">
                                                            {/* Sửa: Hiển thị Status từ backend */}
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                                                                order.status === 'COMPLETED' 
                                                                    ? 'bg-green-500/20 text-green-300' 
                                                                    : order.status === 'PENDING' 
                                                                    ? 'bg-yellow-500/20 text-yellow-300'
                                                                    : 'bg-red-500/20 text-red-300'
                                                            }`}>
                                                                {order.status === 'COMPLETED' ? 'Hoàn thành' 
                                                                : order.status === 'PENDING' ? 'Đang xử lý'
                                                                : 'Bị hủy'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-right text-white font-medium">
                                                            {order.priceFormatted}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-purple-200">
                              {order.date}
                            </td>
                            <td className="py-4 px-4">
                              {/* Sửa: Hiển thị Status từ backend */}
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs ${
                                  order.status === "COMPLETED"
                                    ? "bg-green-500/20 text-green-300"
                                    : order.status === "PENDING"
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {order.status === "COMPLETED"
                                  ? "Hoàn thành"
                                  : order.status === "PENDING"
                                  ? "Đang xử lý"
                                  : "Bị hủy"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right text-white font-medium">
                              {order.priceFormatted}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
