"use client"

import { useState, useRef } from "react"
import { Save, Camera, User, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminProfile() {
    const [avatarUrl, setAvatarUrl] = useState("/admin-avatar.png")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("profile")
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        name: "Admin User",
        phone: "",
        email: "admin@example.com",
        gender: "male",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
        address: "",
    })

    const handleAvatarUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarUrl(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            alert("Cập nhật thành công!")
        }, 1000)
    }

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">Hồ sơ quản trị viên</h2>
                        <p className="text-purple-300">Quản lý thông tin cá nhân của bạn</p>
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
                                value="activity"
                                className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Hoạt động gần đây
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="mt-0">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Avatar section */}
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-4">
                                        <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                                            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Avatar" />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl">
                                                {formData.name?.charAt(0) || "A"}
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
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <Label className="text-purple-200">Họ và tên</Label>
                                            <Input
                                                placeholder="Nhập họ và tên"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white mt-2"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-purple-200">Email</Label>
                                                <Input
                                                    placeholder="Nhập email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white mt-2"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-purple-200">Số điện thoại</Label>
                                                <Input
                                                    placeholder="Nhập số điện thoại"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                                    className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white mt-2"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-purple-200">Giới tính</Label>
                                            <RadioGroup
                                                value={formData.gender}
                                                onValueChange={(value) => handleInputChange("gender", value)}
                                                className="flex space-x-4 mt-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="male" id="male" className="border-purple-500 text-purple-500" />
                                                    <Label htmlFor="male" className="text-purple-200">
                                                        Nam
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="female" id="female" className="border-purple-500 text-purple-500" />
                                                    <Label htmlFor="female" className="text-purple-200">
                                                        Nữ
                                                    </Label>
                                                </div>

                                            </RadioGroup>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-purple-200">Ngày sinh</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <Select
                                                    value={formData.birthDay}
                                                    onValueChange={(value) => handleInputChange("birthDay", value)}
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

                                                <Select
                                                    value={formData.birthMonth}
                                                    onValueChange={(value) => handleInputChange("birthMonth", value)}
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

                                                <Select
                                                    value={formData.birthYear}
                                                    onValueChange={(value) => handleInputChange("birthYear", value)}
                                                >
                                                    <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                                        <SelectValue placeholder="Năm" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                            <SelectItem key={year} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-purple-200">Địa chỉ</Label>
                                            <Input
                                                placeholder="Nhập địa chỉ"
                                                value={formData.address}
                                                onChange={(e) => handleInputChange("address", e.target.value)}
                                                className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white mt-2"
                                            />
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
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="activity" className="mt-0">
                            <div className="space-y-4">
                                <div className="text-center py-12">
                                    <ShoppingCart className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">Hoạt động gần đây</h3>
                                    <p className="text-purple-300">Các hoạt động quản trị của bạn sẽ hiển thị ở đây</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
