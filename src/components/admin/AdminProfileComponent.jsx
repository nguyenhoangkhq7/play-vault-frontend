import { useState, useEffect, useRef } from "react";
import { Save, Camera, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getUsers, updateUser } from "../../api/users.js";

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, { message: "Số điện thoại phải có 10-11 chữ số" })
      .optional()
      .or(z.literal("")),
    email: z.string().email({ message: "Email không hợp lệ" }).optional().or(z.literal("")),
    gender: z.enum(["male", "female", "other"], { required_error: "Vui lòng chọn giới tính" }),
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
    },
  );

export default function AdminProfileComponent() {
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=200&width=200");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userId = userData.id || userData._id;

          if (userId) {
            try {
              const userFromApi = await getUsers();
              const matchedUser = userFromApi.find(user => user.id === userId || user._id === userId);
              if (matchedUser) Object.assign(userData, matchedUser);
            } catch (apiError) {
              console.warn("Không thể lấy dữ liệu người dùng từ API:", apiError);
            }
          }

          if (userData.avatar) {
            setAvatarUrl(userData.avatar);
          } else {
            const fullName = `${userData.f_name || ""} ${userData.l_name || ""}`.trim();
            if (fullName) {
              setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=9333ea&color=ffffff&size=200`);
            }
          }

          let birthDay = "", birthMonth = "", birthYear = "";
          if (userData.dob?.$date) {
            const date = new Date(userData.dob.$date);
            if (!isNaN(date.getTime())) {
              birthDay = date.getUTCDate().toString();
              birthMonth = (date.getUTCMonth() + 1).toString();
              birthYear = date.getUTCFullYear().toString();
            }
          }

          form.reset({
            name: `${userData.f_name || ""} ${userData.l_name || ""}`.trim() || "Unknown",
            phone: userData.phone || "",
            email: userData.email || "",
            gender: userData.gender || "male",
            address: userData.address || "",
            birthDay,
            birthMonth,
            birthYear,
          });

          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu người dùng:", error);
        toast.error("Không thể tải dữ liệu người dùng.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [form]);

  const handleAvatarUploadClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target.result);
        const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
        const updatedUser = { ...storedUser, avatar: e.target.result };
        const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Cập nhật ảnh đại diện thành công");
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      const nameParts = values.name.trim().split(" ");
      const f_name = nameParts[0] || "Unknown";
      const l_name = nameParts.slice(1).join(" ") || "";
      let dob = null;

      if (values.birthDay && values.birthMonth && values.birthYear) {
        const date = new Date(Date.UTC(+values.birthYear, +values.birthMonth - 1, +values.birthDay));
        if (!isNaN(date.getTime())) dob = { $date: date.toISOString() };
        else throw new Error("Ngày không hợp lệ");
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
      const userId = storedUser.id || storedUser._id;

      const updatedUser = {
        f_name,
        l_name,
        phone: values.phone || storedUser.phone,
        email: values.email || storedUser.email,
        gender: values.gender || storedUser.gender,
        address: values.address || storedUser.address,
        dob: dob || storedUser.dob || null,
        avatar: avatarUrl,
        username: storedUser.username,
        password: storedUser.password,
        role: storedUser.role,
        status: storedUser.status,
        created_at: storedUser.created_at,
        last_login: storedUser.last_login,
      };

      const response = await updateUser(userId, updatedUser);
      if (!response.ok) throw new Error(`Không thể cập nhật dữ liệu: ${response.statusText}`);

      const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Hồ sơ đã được cập nhật thành công.");
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
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
            <h2 className="text-2xl font-bold text-white">Hồ sơ quản trị viên</h2>
            <p className="text-purple-300">Cập nhật thông tin cá nhân của bạn</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar section */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl">
                    {form.watch("name")?.charAt(0) || "A"}
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
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </div>
              <p className="text-purple-300 text-sm text-center max-w-[180px]">
                Nhấp vào biểu tượng máy ảnh để thay đổi ảnh đại diện
              </p>
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

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-200">Giới tính</FormLabel>
                        <FormControl>
                          <RadioGroup defaultValue={field.value} onValueChange={field.onChange} className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" className="border-purple-500 text-purple-500" />
                              <Label htmlFor="male" className="text-purple-200">Nam</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" className="border-purple-500 text-purple-500" />
                              <Label htmlFor="female" className="text-purple-200">Nữ</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel className="text-purple-200">Ngày sinh</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {["birthDay", "birthMonth", "birthYear"].map((key, index) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name={key}
                          render={({ field }) => (
                            <FormItem>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                  <SelectValue placeholder={["Ngày", "Tháng", "Năm"][index]} />
                                </SelectTrigger>
                                <SelectContent>
                                  {index === 0 &&
                                    Array.from({ length: 31 }, (_, i) => i + 1).map((v) => (
                                      <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                                    ))}
                                  {index === 1 &&
                                    Array.from({ length: 12 }, (_, i) => i + 1).map((v) => (
                                      <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                                    ))}
                                  {index === 2 &&
                                    Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((v) => (
                                      <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-200">Địa chỉ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập địa chỉ"
                            {...field}
                            className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
        </CardContent>
      </Card>
    </div>
  );
}
