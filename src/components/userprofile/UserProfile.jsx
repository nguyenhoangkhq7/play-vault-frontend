// src/components/UserProfile.jsx
import { useState, useEffect, useRef } from "react";
import { Save, Camera, User, ShoppingCart } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserOrdersList from "../bought/UserOrdersList.jsx";
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

import { API_BASE_URL } from "../../config/api";
import { updateProfile, getProfile } from "../../api/profile.js";
import { uploadImageToCloudinary } from "../../api/uploadImage.js";
import { getMyPurchasedGames } from "../../api/library.js"; // ✅ Thêm import này
import { useUser } from "../../store/UserContext.jsx"; // ✅ Thêm import này

// Schema (giữ nguyên)
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
    { message: "Vui lòng chọn đầy đủ ngày tháng năm sinh", path: ["birthDay"] }
  );

// Helper functions (giữ nguyên)
function parseIsoDateToParts(iso) {
  if (!iso) return { day: "", month: "", year: "" };
  const dateStr = String(iso).trim();
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { day: "", month: "", year: "" };
  const [, year, month, day] = match;
  return {
    day: day.replace(/^0/, ""),
    month: month.replace(/^0/, ""),
    year,
  };
}

function partsToIsoDate({ day, month, year }) {
  if (!day || !month || !year) return null;
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

export default function UserProfile() {
  const [avatarUrl, setAvatarUrl] = useState(
    "/placeholder.svg?height=200&width=200"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [purchasedGames, setPurchasedGames] = useState([]); // ✅ State mới cho game đã mua
  const [isOrdersLoading, setIsOrdersLoading] = useState(false); // ✅ State loading cho orders
  const [ordersError, setOrdersError] = useState(null); // ✅ State error cho orders
  const fileInputRef = useRef(null);

  // ✅ Lấy setAccessToken từ UserContext
  const { setAccessToken } = useUser();

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

  // Lấy userId từ localStorage
  const storedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
  );
  const userId = storedUser.id || storedUser.customerId || storedUser._id;

  // ✅ Hàm fetch purchased games
  const fetchPurchasedGames = async () => {
    if (!userId) {
      setOrdersError("Không tìm thấy thông tin người dùng");
      return;
    }

    setIsOrdersLoading(true);
    setOrdersError(null);

    try {
      console.log("🔄 Fetching purchased games for user:", userId);
      const games = await getMyPurchasedGames(setAccessToken);
      
      console.log("📚 Purchased games from API:", games);

      // Transform data từ API library sang format phù hợp với UserOrdersList
      let transformedGames = [];
      
      if (games && games.data && Array.isArray(games.data)) {
        transformedGames = games.data;
      } else if (Array.isArray(games)) {
        transformedGames = games;
      }

      // Trong UserProfile.jsx - sửa phần transform data
      const formattedGames = transformedGames.map(game => ({
        id: game.id || game.gameId,
        name: game.name || "Unknown Game",
        price: game.price || 0,
        // ✅ Tối ưu URL ảnh - thêm params chất lượng nếu API hỗ trợ
        image: game.thumbnail 
          ? `${game.thumbnail}?w=200&h=200&q=80&fit=crop` // Thêm params optimize
          : game.thumbnail_image 
          ? `${game.thumbnail_image}?w=200&h=200&q=80&fit=crop`
          : 'https://placehold.co/200x200/3a1a5e/ffffff?text=Game+Image',
        date: game.purchaseDate || new Date().toISOString(),
        status: "delivered",
        categoryName: game.categoryName || "Unknown Category"
      }));

      console.log("✅ Formatted games for UserOrdersList:", formattedGames);
      setPurchasedGames(formattedGames);
    } catch (err) {
      console.error("❌ Error fetching purchased games:", err);
      setOrdersError(err.message || "Không thể tải danh sách game đã mua");
      setPurchasedGames([]);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // ✅ Fetch purchased games khi tab orders được active
  useEffect(() => {
    if (activeTab === "orders" && userId) {
      fetchPurchasedGames();
    }
  }, [activeTab, userId]);

  // ✅ Listen to purchase event từ CartPage (giữ nguyên từ PurchasedProducts)
  useEffect(() => {
    const handlePurchaseUpdate = () => {
      console.log("Game mua thành công → Refetch thư viện!");
      if (activeTab === "orders") {
        fetchPurchasedGames();
      }
    };

    window.addEventListener('purchasedGamesUpdated', handlePurchaseUpdate);

    return () => {
      window.removeEventListener('purchasedGamesUpdated', handlePurchaseUpdate);
    };
  }, [activeTab]);

  // Load profile khi mount (giữ nguyên)
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        toast.error("Không tìm thấy thông tin người dùng");
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getProfile(userId);
        const data = profile?.data || profile;

        const dobParts = parseIsoDateToParts(data?.dateOfBirth);

        form.reset({
          name: data?.fullName || storedUser.fullName || "Unknown",
          phone: data?.phone || storedUser.phone || "",
          email: data?.email || storedUser.email || "",
          gender: storedUser.gender || "male",
          address: storedUser.address || "",
          birthDay: dobParts.day || "",
          birthMonth: dobParts.month || "",
          birthYear: dobParts.year || "",
        });

        const avatar =
          data?.avatarUrl || storedUser.avatarUrl || storedUser.avatar;
        if (
          avatar &&
          !avatar.includes("ui-avatars") &&
          !avatar.includes("placeholder")
        ) {
          setAvatarUrl(avatar);
        } else if (data?.fullName || storedUser.fullName) {
          const name = (data?.fullName || storedUser.fullName || "U").trim();
          setAvatarUrl(
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name
            )}&background=9333ea&color=fff&size=200`
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, form]);

  // Avatar upload (giữ nguyên)
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
      if (!url) throw new Error("Không nhận được URL");

      await updateProfile(userId, { avatarUrl: url });

      const updatedUser = { ...storedUser, avatar: url, avatarUrl: url };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setAvatarUrl(url);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      toast.error("Upload ảnh thất bại");
      console.error(err);
    } finally {
      toast.dismiss();
    }
  };

  // Submit form (giữ nguyên)
  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const dateOfBirth = partsToIsoDate({
        day: values.birthDay,
        month: values.birthMonth,
        year: values.birthYear,
      });

      const payload = {
        fullName: values.name.trim(),
        gender: values.gender,
        dateOfBirth,
        address: values.address || null,
        avatarUrl:
          avatarUrl.includes("ui-avatars") || avatarUrl.includes("placeholder")
            ? null
            : avatarUrl,
      };

      const result = await updateProfile(userId, payload);
      const data = result?.data || result || payload;

      const merged = {
        ...storedUser,
        fullName: data.fullName || payload.fullName,
        avatarUrl: data.avatarUrl || payload.avatarUrl,
        address: data.address || payload.address,
        dateOfBirth: data.dateOfBirth || dateOfBirth,
        gender: data.gender || payload.gender,
      };

      localStorage.setItem("user", JSON.stringify(merged));
      setAvatarUrl(merged.avatarUrl || avatarUrl);

      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 rounded-2xl p-16">
          <div className="flex justify-center">
            <div className="animate-pulse text-center">
              <div className="h-20 w-20 rounded-full bg-purple-800/50 mx-auto mb-4"></div>
              <div className="h-6 w-48 bg-purple-800/50 rounded-md mx-auto"></div>
            </div>
          </div>
        </Card>
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
              Quản lý thông tin cá nhân và theo dõi đơn hàng
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

            {/* TAB PROFILE (giữ nguyên) */}
            <TabsContent value="profile" className="mt-0">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                      <AvatarImage src={avatarUrl} alt="Avatar" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl">
                        {form.watch("name")?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
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

                <div className="flex-1">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Form fields giữ nguyên */}
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
                                  placeholder="email@example.com"
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
                                  placeholder="0123456789"
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
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                      >
                        {isSubmitting ? (
                          <>Đang lưu...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thông tin
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </TabsContent>

            {/* TAB ORDERS - Sử dụng API getMyPurchasedGames */}
            <TabsContent value="orders" className="mt-0">
              <div className="space-y-6">
                <UserOrdersList
                  orders={purchasedGames} // ✅ Data từ API library
                  isLoading={isOrdersLoading} // ✅ Loading state mới
                  isError={ordersError} // ✅ Error state mới
                  refetch={fetchPurchasedGames} // ✅ Hàm fetchPurchasedGames
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}