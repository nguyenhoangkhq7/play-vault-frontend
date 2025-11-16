import { useState, useEffect, useRef } from "react";
import { Save, Upload, Camera, User, ShoppingCart } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers, updateUser } from "../../api/users.js"; // Import users API
import { getPurchases } from "../../api/purchases.js"; // Import games and purchases API
import { getGames } from "../../api/games.js"; // Import games API


// 🧪 Dữ liệu mẫu đơn hàng để test giao diện


// Define the form schema with validation rules
const formSchema = z
    .object({
        name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
        phone: z
            .string()
            .regex(/^[0-9]{10,11}$/, { message: "Số điện thoại phải có 10-11 chữ số" })
            .optional()
            .or(z.literal("")),
        email: z.string().email({ message: "Email không hợp lệ" }).optional().or(z.literal("")),
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
        },
    );

export default function UserProfile() {
    const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=200&width=200");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const fileInputRef = useRef(null);
    useEffect(() => {
    // 🧩 Dữ liệu mẫu
    const sampleOrders = [
      {
        id: "ORD-001",
        name: "Cyberpunk 2077",
        publisher: "CD Projekt Red",
        date: "15/10/2025",
        status: "Hoàn thành",
        statusColor: "bg-green-500/20 text-green-300 border border-green-500/40",
        statusIcon: "✓",
        price: 1200000,
        priceFormatted: "1.200.000 ₫",
        image: "https://placehold.co/100x100/008000/FFFFFF?text=Cyberpunk",
        tags: ["Hành động", "Thế giới mở"],
        age_limit: "18+",
      },
      {
        id: "ORD-002",
        name: "Elden Ring",
        publisher: "FromSoftware",
        date: "10/10/2025",
        status: "Đang xử lý",
        statusColor: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
        statusIcon: "⏳",
        price: 1500000,
        priceFormatted: "1.500.000 ₫",
        image: "https://placehold.co/100x100/FFA500/FFFFFF?text=Elden+Ring",
        tags: ["Phiêu lưu", "Hành động"],
        age_limit: "16+",
      },
      {
        id: "ORD-003",
        name: "Baldur’s Gate 3",
        publisher: "Larian Studios",
        date: "05/10/2025",
        status: "Bị lỗi",
        statusColor: "bg-red-500/20 text-red-300 border border-red-500/40",
        statusIcon: "⚠️",
        price: 990000,
        priceFormatted: "990.000 ₫",
        image: "https://placehold.co/100x100/FF0000/FFFFFF?text=Baldur",
        tags: ["Chiến thuật", "Nhập vai"],
        age_limit: "18+",
      },
      {
        id: "ORD-004",
        name: "Stardew Valley",
        publisher: "ConcernedApe",
        date: "01/10/2025",
        status: "Hoàn thành",
        statusColor: "bg-green-500/20 text-green-300 border border-green-500/40",
        statusIcon: "✓",
        price: 250000,
        priceFormatted: "250.000 ₫",
        image: "https://placehold.co/100x100/228B22/FFFFFF?text=Stardew",
        tags: ["Giả lập", "Nông trại"],
        age_limit: "Mọi lứa tuổi",
      },
    ]

    // 🧠 Giả lập loading và gán dữ liệu
    setTimeout(() => {
      setUserOrders(sampleOrders)
      setOrdersLoading(false)
    }, 800)
  }, [])

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
    // Load user data from API and storage on mount
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

                            if (matchedUser) {
                                userData.f_name = matchedUser.f_name || userData.f_name;
                                userData.l_name = matchedUser.l_name || userData.l_name;
                                userData.avatar = matchedUser.avatar || userData.avatar;
                                userData.email = matchedUser.email || userData.email;
                                userData.phone = matchedUser.phone || userData.phone;
                                userData.gender = matchedUser.gender || userData.gender;
                                userData.address = matchedUser.address || userData.address;
                                userData.dob = matchedUser.dob || userData.dob;
                            }
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

                    let birthDay = "";
                    let birthMonth = "";
                    let birthYear = "";
                    if (userData.dob && userData.dob.$date) {
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

                    // Lưu dữ liệu cập nhật vào localStorage
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu người dùng:", error);
                toast.error("Lỗi", {
                    description: "Không thể tải dữ liệu người dùng.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [form]);

    // Handle form submission
    async function onSubmit(values) {
        setIsSubmitting(true);
        try {
            const nameParts = values.name.trim().split(" ");
            const f_name = nameParts[0] || "Unknown";
            const l_name = nameParts.slice(1).join(" ") || "";

            let dob = null;
            if (values.birthDay && values.birthMonth && values.birthYear) {
                const date = new Date(
                    Date.UTC(
                        parseInt(values.birthYear),
                        parseInt(values.birthMonth) - 1,
                        parseInt(values.birthDay),
                    ),
                );
                if (!isNaN(date.getTime())) {
                    dob = { $date: date.toISOString() };
                } else {
                    throw new Error("Ngày không hợp lệ");
                }
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

            // Cập nhật dữ liệu lên server
            const response = await updateUser(userId, updatedUser);

            if (!response.ok) {
                throw new Error(`Không thể cập nhật dữ liệu: ${response.statusText}`);
            }

            // Lưu dữ liệu vào localStorage
            const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
            storage.setItem("user", JSON.stringify(updatedUser));

            toast.success("Thành công", {
                description: "Hồ sơ đã được cập nhật thành công.",
            });
        } catch (error) {
            console.error("Lỗi khi lưu hồ sơ:", error);
            toast.error("Lỗi", {
                description: "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Fetch order history when tab changes to orders
    useEffect(() => {
        if (activeTab === "orders") {
            fetchOrderHistory();
        }
    }, [activeTab]);

    // Fetch order history from API
    const fetchOrderHistory = async () => {
        setOrdersLoading(true);
        try {
            const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (!storedUser) {
                throw new Error('Thông tin người dùng không tồn tại');
            }

            const userData = JSON.parse(storedUser);
            const userId = userData.id || userData._id;

            if (!userId) {
                throw new Error('ID người dùng không tồn tại');
            }

            // Fetch games and purchases in parallel
            const [gamesResponse, purchasesResponse] = await Promise.all([
                getGames(),
                getPurchases()
            ]);

            console.log("Dữ liệu đơn hàng:", purchasesResponse);
            console.log("Dữ liệu games:", gamesResponse);

            // Find user's purchases
            const userPurchase = purchasesResponse.find(item =>
                item.user_id?.toString() === userId?.toString() ||
                item.user_id === Number(userId) ||
                item.userId === userId
            );

            console.log("Đơn hàng của người dùng:", userPurchase);

            if (!userPurchase || !userPurchase.games_purchased || userPurchase.games_purchased.length === 0) {
                console.log("Không tìm thấy đơn hàng cho người dùng");
                setUserOrders([]);
                setOrdersLoading(false);
                return;
            }

            // Process each purchased game into an order
            const processedOrders = userPurchase.games_purchased.map((purchase, index) => {
                const game = gamesResponse.find(g =>
                    g.id.toString() === purchase.game_id.toString() ||
                    g.id === Number(purchase.game_id)
                );

                // Generate unique order ID
                const orderId = `${userPurchase.id}-${purchase.game_id}-${index + 1}`;

                // Format purchase date
                const purchaseDate = purchase.purchased_at?.$date
                    ? new Date(purchase.purchased_at.$date).toLocaleDateString("vi-VN")
                    : new Date().toLocaleDateString("vi-VN");

                // Default status
                const status = "Đã giao";

                // Use price from purchase
                const price = purchase.price || 0;
                const priceFormatted = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(price);

                return {
                    id: orderId,
                    date: purchaseDate,
                    status,
                    price,
                    priceFormatted,
                    name: game?.name || "Unknown Game",
                    image: game?.thumbnail_image || game?.imageUrl || game?.img || "https://placehold.co/100x100/3a1a5e/ffffff?text=Game",
                    gameId: purchase.game_id,
                    tags: game?.tags || [],
                    publisher: game?.details?.publisher || game?.publisher || "Unknown Publisher",
                    published_date: game?.details?.published_date?.$date || game?.published_date || "",
                    age_limit: game?.details?.["age-limit"] || game?.age_limit || ""
                };
            });

            // Sort orders by date (newest first)
            processedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

            console.log("Đơn hàng đã xử lý:", processedOrders);

            setUserOrders(processedOrders);

            // Save to localStorage for offline use
            localStorage.setItem('user_orders', JSON.stringify(processedOrders));
        } catch (error) {
            console.error("Error fetching order history:", error);
            toast.error("Lỗi", {
                description: "Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.",
            });
            const savedOrders = localStorage.getItem('user_orders');
            if (savedOrders) {
                setUserOrders(JSON.parse(savedOrders));
            }
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

                const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
                const updatedUser = {
                    ...storedUser,
                    avatar: e.target.result
                };

                const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
                storage.setItem("user", JSON.stringify(updatedUser));

                toast.success("Cập nhật ảnh đại diện thành công");
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    async function onSubmit(values) {
        setIsSubmitting(true);
        try {
            const nameParts = values.name.trim().split(" ");
            const f_name = nameParts[0] || "Unknown";
            const l_name = nameParts.slice(1).join(" ") || "";

            let dob = null;
            if (values.birthDay && values.birthMonth && values.birthYear) {
                const date = new Date(
                    Date.UTC(
                        parseInt(values.birthYear),
                        parseInt(values.birthMonth) - 1,
                        parseInt(values.birthDay),
                    ),
                );
                if (!isNaN(date.getTime())) {
                    dob = { $date: date.toISOString() };
                } else {
                    throw new Error("Ngày không hợp lệ");
                }
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

            // Gọi API để cập nhật dữ liệu
            const response = await updateUser(userId, updatedUser);

            if (!response.ok) {
                throw new Error(`Không thể cập nhật dữ liệu: ${response.statusText}`);
            }

            // Lưu dữ liệu vào localStorage
            const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
            storage.setItem("user", JSON.stringify(updatedUser));

            toast.success("Thành công", {
                description: "Hồ sơ đã được cập nhật thành công.",
            });
        } catch (error) {
            console.error("Lỗi khi lưu hồ sơ:", error);
            toast.error("Lỗi", {
                description: "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
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
                        <p className="text-purple-300">Quản lý thông tin cá nhân và theo dõi đơn hàng của bạn</p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                                            <RadioGroup
                                                                defaultValue={field.value}
                                                                onValueChange={field.onChange}
                                                                className="flex space-x-4"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="male" id="male" className="border-purple-500 text-purple-500" />
                                                                    <Label htmlFor="male" className="text-purple-200">Nam</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="female" id="female" className="border-purple-500 text-purple-500" />
                                                                    <Label htmlFor="female" className="text-purple-200">Nữ</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="other" id="other" className="border-purple-500 text-purple-500" />
                                                                    <Label htmlFor="other" className="text-purple-200">Khác</Label>
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
                                                        key={order.id}
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
                                                            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                                                                {order.status}
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