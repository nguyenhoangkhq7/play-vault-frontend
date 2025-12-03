// src/components/UserProfile.jsx
import { useState, useEffect, useRef } from "react";
import { Save, Camera, User } from "lucide-react";
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
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateProfile, getProfileByUsername } from "../../api/profile.js";
import { uploadImageToCloudinary } from "../../api/uploadImage.js";

// Schema
const formSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, { message: "Số điện thoại phải có 10-11 chữ số" })
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

// Helper: ISO → Parts
function parseIsoDateToParts(iso) {
  if (!iso) return { day: "", month: "", year: "" };
  try {
    const [y, m, d] = iso.split("T")[0].split("-");
    return {
      day: String(Number(d)),    // "20"  -> "20"
      month: String(Number(m)),  // "05"  -> "5"  ✅ khớp Select
      year: y
    };
  } catch {
    return { day: "", month: "", year: "" };
  }
}

// Helper: Parts → ISO
function partsToIsoDate({ day, month, year }) {
  if (!day || !month || !year) return null;
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

export default function AdminProfileComponent() {
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=200&width=200");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const userIdRef = useRef(null);

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

  // Lấy userName từ localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const userName = storedUser.username;
  // Load profile khi mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!userName) {
        toast.error("Không tìm thấy thông tin người dùng");
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getProfileByUsername(userName);
        const data = profile?.data || profile;

        const dobParts = parseIsoDateToParts(data?.dateOfBirth || data?.dob);

        // LƯU ID
        userIdRef.current = data?.id ?? null;

        const mergedForStorage = { ...storedUser, id: data?.id };
        localStorage.setItem("user", JSON.stringify(mergedForStorage));

        form.reset({
          name: data?.fullName || data?.full_name || storedUser.fullName || "Unknown",
          phone: data?.phone || storedUser.phone || "",
          email: data?.email || storedUser.email || "",
          gender: data?.gender || storedUser.gender || "male",
          birthDay: dobParts.day,
          birthMonth: dobParts.month,
          birthYear: dobParts.year,
        });

        const avatar = data?.avatarUrl || data?.avatar_url || storedUser.avatar;
        if (avatar) setAvatarUrl(avatar);
        else if (data?.fullName) {
          setAvatarUrl(
            `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=9333ea&color=fff&size=200`
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, form]);

  // Avatar upload
  const handleAvatarUploadClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
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

      await updateProfile(userIdRef.current, { avatarUrl: url });

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

  // Submit form
  const onSubmit = async (values) => {
    console.log(">>> SUBMIT VALUES:", values);
    setIsSubmitting(true);
    try {
      if (!userName) {
        toast.error("Không tìm thấy người dùng. Vui lòng đăng nhập lại.");
        setIsSubmitting(false);
        return;
      }
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
        avatarUrl: avatarUrl.includes("ui-avatars") || avatarUrl.includes("placeholder") ? null : avatarUrl,
      };

      const result = await updateProfile(userIdRef.current, payload);
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
      const message = err?.message || (err?.body && JSON.stringify(err.body)) || "Cập nhật thất bại";
      toast.error(message);
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
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">Hồ sơ quản trị viên</h2>
            <p className="text-purple-300">Thông tin cá nhân</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex flex-col items-center md:shrink-0">
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10 pointer-events-auto">
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
                              <FormLabel className="text-purple-200">Số điện thoại</FormLabel>
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
                        <FormLabel className="text-purple-200">Ngày sinh</FormLabel>
                        <div className="grid grid-cols-3 gap-3">
                          <FormField control={form.control} name="birthDay" render={({ field }) => (
                            <FormItem>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                  <SelectValue placeholder="Ngày" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                    <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="birthMonth" render={({ field }) => (
                            <FormItem>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                  <SelectValue placeholder="Tháng" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="birthYear" render={({ field }) => (
                            <FormItem>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                  <SelectValue placeholder="Năm" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={() => console.log('>>> CLICK SUBMIT')}
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
        </CardContent>
      </Card>
    </div>
  );
}