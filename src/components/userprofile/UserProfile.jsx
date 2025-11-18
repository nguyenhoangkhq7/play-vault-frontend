import { useState, useEffect, useRef } from "react";
import { Save, Upload, Camera, User, ShoppingCart } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// API Imports
import { getPurchases } from "../../api/purchases.js";
import { getGames } from "../../api/games.js";
import { API_BASE_URL } from "../../config/api";
import { updateProfile, getProfile } from "../../api/profile.js";
import { getOrderHistory } from "../../api/order.js";
import { uploadImageToCloudinary } from "../../api/uploadImage.js";
import { useUser } from "../../store/UserContext.jsx";

// Zod Schema
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

// Helper: ISO -> Parts
function parseIsoDateToParts(iso) {
  if (!iso) return { day: "", month: "", year: "" };
  try {
    const dateOnly = iso.split("T")[0];
    const [y, m, d] = dateOnly.split("-");
    return {
      day: String(Number(d)),
      month: String(Number(m)),
      year: String(Number(y)),
    };
  } catch {
    return { day: "", month: "", year: "" };
  }
}

// Helper: Parts -> ISO
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
  const [avatarUrl, setAvatarUrl] = useState(
    "/placeholder.svg?height=200&width=200"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);

  const { user: contextUser } = useUser();

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

  // Load profile
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storedRaw =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!storedRaw) throw new Error("User chưa đăng nhập");

        const storedUser = JSON.parse(storedRaw);
        const userId = storedUser.id || storedUser.customerId || storedUser._id;

        let profile = null;
        if (userId) {
          profile = await getProfile(userId).catch(() => null);
        }

        const final = {
          fullName:
            profile?.fullName ||
            profile?.full_name ||
            storedUser.fullName ||
            "Unknown",
          email: profile?.email || storedUser.email || "",
          phone: profile?.phone || storedUser.phone || "",
          avatar:
            profile?.avatarUrl ||
            profile?.avatar_url ||
            storedUser.avatar ||
            null,
          address: profile?.address || storedUser.address || "",
          gender: profile?.gender || storedUser.gender || "male",
          dob:
            profile?.dateOfBirth ||
            profile?.date_of_birth ||
            storedUser.dob ||
            null,
        };

        const parts = parseIsoDateToParts(final.dob);

        form.reset({
          name: final.fullName,
          phone: final.phone,
          email: final.email,
          gender: final.gender,
          address: final.address,
          birthDay: parts.day,
          birthMonth: parts.month,
          birthYear: parts.year,
        });

        if (final.avatar) {
          setAvatarUrl(final.avatar);
        } else if (final.fullName) {
          setAvatarUrl(
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              final.fullName
            )}&background=9333ea&color=fff&size=200`
          );
        }

        // Update localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, ...final })
        );
      } catch (err) {
        console.error("Lỗi tải profile:", err);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load orders when tab changes
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrderHistory();
    }
  }, [activeTab]);

  const fetchOrderHistory = async () => {
    setOrdersLoading(true);
    try {
      const storedRaw = localStorage.getItem("user");
      if (!storedRaw) throw new Error("Không tìm thấy user");
      const storedUser = JSON.parse(storedRaw);
      const userId = storedUser.id || storedUser.customerId;

      let rawOrders = [];
      if (typeof getOrderHistory === "function") {
        rawOrders = await getOrderHistory(userId);
      } else {
        const purchases = await getPurchases();
        const userPurchase = purchases.find(
          (p) => String(p.user_id || p.userId) === String(userId)
        );
        if (userPurchase?.games_purchased) {
          rawOrders = userPurchase.games_purchased.map((p, i) => ({
            id: `P-${i + 1}`,
            createdAt: p.purchased_at?.$date || new Date().toISOString(),
            total: p.price || 0,
            items: [{ game_id: p.game_id, price: p.price }],
          }));
        }
      }

      const games = await getGames();
      const processed = rawOrders
        .map((order) => {
          const item = order.items?.[0] || {};
          const game = games.find((g) => String(g.id) === String(item.game_id));
          const date = new Date(
            order.createdAt || item.purchased_at?.$date
          ).toLocaleDateString("vi-VN");

          return {
            id: order.id || `ORD-${Date.now()}-${Math.random()}`,
            name: game?.name || "Unknown Game",
            image:
              game?.thumbnail_image ||
              "https://placehold.co/100x100/3a1a5e/fff?text=G",
            date,
            status: order.status || "COMPLETED",
            price: order.total || item.price || 0,
            priceFormatted: new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(order.total || item.price || 0),
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setUserOrders(processed);
      localStorage.setItem("user_orders", JSON.stringify(processed));
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      toast.error("Không thể tải lịch sử đơn hàng");
      const cached = localStorage.getItem("user_orders");
      if (cached) setUserOrders(JSON.parse(cached));
    } finally {
      setOrdersLoading(false);
    }
  };

  // Avatar Upload
  const handleAvatarUploadClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type
      )
    ) {
      toast.error("Chỉ hỗ trợ JPG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target.result);
    reader.readAsDataURL(file);

    toast.loading("Đang tải ảnh lên...");

    try {
      const result = await uploadImageToCloudinary(file);
      const url = result?.secure_url || result?.url;
      if (!url) throw new Error("Không nhận được URL ảnh");

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      await updateProfile(storedUser.id, { avatarUrl: url });

      const updated = { ...storedUser, avatar: url, avatarUrl: url };
      localStorage.setItem("user", JSON.stringify(updated));
      setAvatarUrl(url);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      toast.error("Upload thất bại. Vui lòng thử lại.");
      console.error(err);
    } finally {
      toast.dismiss();
    }
  };

  // Form Submit
  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const storedRaw = localStorage.getItem("user");
      if (!storedRaw) throw new Error("Không tìm thấy thông tin user");
      const storedUser = JSON.parse(storedRaw);
      const userId = storedUser.id;

      const dateOfBirth = partsToIsoDate({
        day: values.birthDay,
        month: values.birthMonth,
        year: values.birthYear,
      });

      const payload = {
        fullName: values.name.trim(),
        gender: values.gender,
        dateOfBirth,
        avatarUrl: avatarUrl.includes("ui-avatars") ? null : avatarUrl,
        address: values.address || null,
      };

      const updated = await updateProfile(userId, payload);

      const merged = {
        ...storedUser,
        fullName: updated.fullName || payload.fullName,
        avatarUrl: updated.avatarUrl || payload.avatarUrl,
        address: updated.address || payload.address,
        dateOfBirth: updated.dateOfBirth || dateOfBirth,
        gender: updated.gender || payload.gender,
      };

      localStorage.setItem("user", JSON.stringify(merged));
      setAvatarUrl(merged.avatarUrl || avatarUrl);

      const parts = parseIsoDateToParts(merged.dateOfBirth);
      form.reset({
        ...values,
        name: merged.fullName,
        address: merged.address,
        birthDay: parts.day,
        birthMonth: parts.month,
        birthYear: parts.year,
      });

      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 rounded-2xl p-16 flex justify-center">
          <div className="animate-pulse text-center">
            <div className="h-20 w-20 rounded-full bg-purple-800/50 mx-auto mb-4"></div>
            <div className="h-6 w-48 bg-purple-800/50 rounded-md mx-auto"></div>
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
              Quản lý thông tin và theo dõi đơn hàng
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-purple-900/40 mb-8">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"
              >
                <User className="h-4 w-4 mr-2" /> Thông tin
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"
              >
                <ShoppingCart className="h-4 w-4 mr-2" /> Đơn hàng
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-3xl">
                        {form.watch("name")?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full bg-purple-600 hover:bg-purple-700"
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
                  <p className="text-purple-300 text-sm text-center">
                    Nhấp để đổi ảnh
                  </p>
                </div>

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
                                placeholder="Nhập họ tên"
                                {...field}
                                className="bg-purple-900/40 border-purple-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
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
                                  placeholder="email@example.com"
                                  {...field}
                                  className="bg-purple-900/40 border-purple-600 text-white"
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
                                  placeholder="0123456789"
                                  {...field}
                                  className="bg-purple-900/40 border-purple-600 text-white"
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
                        <div className="grid grid-cols-3 gap-3">
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
                                    ).map((d) => (
                                      <SelectItem key={d} value={String(d)}>
                                        {d}
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
                                    ).map((m) => (
                                      <SelectItem key={m} value={String(m)}>
                                        {m}
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
                                    ).map((y) => (
                                      <SelectItem key={y} value={String(y)}>
                                        {y}
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
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>Đang lưu...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Lưu thông tin
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto h-16 w-16 text-purple-400 mb-4" />
                  <p className="text-xl text-white">Chưa có đơn hàng nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-700/40 text-left text-purple-300">
                        <th className="py-3 px-4">Mã đơn</th>
                        <th className="py-3 px-4">Trò chơi</th>
                        <th className="py-3 px-4">Ngày mua</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-purple-700/20 hover:bg-purple-800/10"
                        >
                          <td className="py-4 px-4 text-white font-medium">
                            {order.id}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={order.image}
                                alt=""
                                className="w-10 h-10 rounded object-cover"
                              />
                              <span className="text-purple-200">
                                {order.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-purple-200">
                            {order.date}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                order.status === "COMPLETED"
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                              }`}
                            >
                              {order.status === "COMPLETED"
                                ? "Hoàn thành"
                                : "Đang xử lý"}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
