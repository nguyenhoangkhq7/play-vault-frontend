"use client"

import { useState } from "react"
import { LazyLoadImage } from "react-lazy-load-image-component"
import { ArrowLeft, Heart, Share2, Users, ExternalLink, ChevronRight, ShoppingCart, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function GameDetail({ game, onBack }) {
    const [showFullDescription, setShowFullDescription] = useState(false)

    // Status badge color and text
    const getStatusBadge = () => {
        switch (game.status) {
            case "not_purchased":
                return { color: "border-blue-500 text-blue-400 bg-blue-500/10", text: "Chưa mua" }
            case "purchased":
                return { color: "border-green-500 text-green-400 bg-green-500/10", text: "Đã mua" }
            default:
                return { color: "border-gray-500 text-gray-400", text: "Không xác định" }
        }
    }

    // Action button based on status
    const getActionButton = () => {
        switch (game.status) {
            case "not_purchased":
                return (
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg border border-blue-500/30 group">
                        <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Mua ngay - {game.price}
                    </Button>
                )
            case "purchased":
                return (
                    <Button className="bg-green-600 hover:bg-green-700 gap-2 shadow-lg border border-green-500/30 group">
                        <CheckCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Đã mua
                    </Button>
                )
            default:
                return <Button>Không xác định</Button>
        }
    }

    return (
        <div className="space-y-8 bg-gradient-to-b from-zinc-900/50 to-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-zinc-800/50">
            {/* Back button */}
            <Button variant="ghost" onClick={onBack} className="mb-4 hover:bg-zinc-800 hover:text-zinc-200 group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-2px] transition-transform" />
                Quay lại
            </Button>

            {/* Game title and actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">{game.name}</h1>
                        <Badge className={`${getStatusBadge().color} px-3 py-1 text-sm font-medium`}>{getStatusBadge().text}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {game.tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className={`${tag === "Hành động"
                                    ? "border-red-500/50 text-red-400 bg-red-500/10"
                                    : tag === "Nhập vai"
                                        ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                                        : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                                    }`}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 hover:bg-zinc-700 hover:text-zinc-200 group">
                        <Heart className="h-4 w-4 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
                        Đã ưa thích
                    </Button>
                    <Button variant="outline" className="gap-2 hover:bg-zinc-700 hover:text-zinc-200 group">
                        <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Chia sẻ
                    </Button>
                    {getActionButton()}
                </div>
            </div>

            {/* Price information for not purchased items */}
            {game.status === "not_purchased" && (
                <div className="bg-zinc-800/50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-white">{game.price}</div>
                    </div>
                    <div className="text-zinc-400">
                        Giá có thể thay đổi. Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
                    </div>
                </div>
            )}

            {/* Image carousel */}
            <div className="relative">
                <Carousel className="w-full">
                    <CarouselContent>
                        {game.images.map((image, index) => (
                            <CarouselItem key={index}>
                                <div className="relative aspect-video overflow-hidden rounded-xl shadow-xl border border-zinc-700/30">
                                    <LazyLoadImage
                                        src={image || "/placeholder.svg"}
                                        alt={`${game.name} screenshot ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 hover:bg-zinc-700 hover:text-zinc-200 bg-black/50 backdrop-blur-sm border-zinc-700/30" />
                    <CarouselNext className="right-2 hover:bg-zinc-700 hover:text-zinc-200 bg-black/50 backdrop-blur-sm border-zinc-700/30" />
                </Carousel>
            </div>

            {/* Game details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Description and info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-zinc-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-zinc-700/30">
                        <h2 className="text-xl font-bold mb-4">Mô tả</h2>
                        <p className={`text-zinc-300 ${!showFullDescription && "line-clamp-3"}`}>{game.description}</p>
                        <Button
                            variant="link"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="mt-2 p-0 h-auto text-zinc-400 hover:text-zinc-200"
                        >
                            {showFullDescription ? "Thu gọn" : "Xem thêm"}
                        </Button>
                    </div>

                    {/* Basic info */}
                    <div className="bg-zinc-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-zinc-700/30">
                        <h2 className="text-xl font-bold mb-4">Thông tin cơ bản</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-zinc-400">Nhà phát hành</p>
                                <p className="text-white">{game.publisher}</p>
                            </div>
                            <div>
                                <p className="text-zinc-400">Ngày phát hành</p>
                                <p className="text-white">{game.releaseDate}</p>
                            </div>
                            <div>
                                <p className="text-zinc-400">Giới hạn độ tuổi</p>
                                <p className="text-white">{game.ageRating}</p>
                            </div>
                            <div>
                                <p className="text-zinc-400">Trạng thái</p>
                                <p className="text-white">{getStatusBadge().text}</p>
                            </div>
                        </div>
                    </div>

                    {/* System requirements */}
                    <div className="bg-zinc-800/50 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Cấu hình yêu cầu</h2>
                        <Tabs defaultValue="min">
                            <TabsList className="grid w-full grid-cols-2 bg-zinc-700">
                                <TabsTrigger value="min" className="hover:text-zinc-200">
                                    Tối thiểu
                                </TabsTrigger>
                                <TabsTrigger value="rec" className="hover:text-zinc-200">
                                    Đề nghị
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="min" className="mt-4 space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-zinc-400">Hệ điều hành</p>
                                        <p className="text-white">{game.minRequirements.os}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400">CPU</p>
                                        <p className="text-white">{game.minRequirements.cpu}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400">RAM</p>
                                        <p className="text-white">{game.minRequirements.ram}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400">GPU</p>
                                        <p className="text-white">{game.minRequirements.gpu}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400">Dung lượng</p>
                                        <p className="text-white">{game.minRequirements.storage}</p>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="rec" className="mt-4 space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-zinc-400">Hệ điều hành</p>
                                        <p className="text-white">{game.recRequirements.os}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400">CPU</p>
                                        <p className="text-white">{game.recRequirements.cpu}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400">RAM</p>
                                        <p className="text-white">{game.recRequirements.ram}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400">GPU</p>
                                        <p className="text-white">{game.recRequirements.gpu}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400">Dung lượng</p>
                                        <p className="text-white">{game.recRequirements.storage}</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Right column - Stats and community */}
                <div className="space-y-6">
                    {/* Purchase info for not purchased items */}
                    {game.status === "not_purchased" && (
                        <div className="bg-zinc-800/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Thông tin mua hàng</h2>
                            <div className="space-y-4">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Mua ngay
                                </Button>
                                <Button variant="outline" className="w-full hover:bg-zinc-700 hover:text-zinc-200">
                                    Thêm vào giỏ hàng
                                </Button>
                                <p className="text-sm text-zinc-400 mt-2">
                                    Mua game này để thêm vào thư viện của bạn. Sau khi mua, bạn có thể tải xuống và chơi ngay lập tức.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="bg-zinc-800/50 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Thống kê</h2>
                        <div className="space-y-4">
                            {game.status === "purchased" && (
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <p className="text-zinc-400">Thời gian chơi</p>
                                        <p className="text-white">{game.playTime}</p>
                                    </div>
                                </div>
                            )}
                            {game.status === "purchased" && (
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <p className="text-zinc-400">Tiến độ cốt truyện</p>
                                        <p className="text-white">{game.progress}</p>
                                    </div>
                                    <Progress value={20} className="h-2" />
                                </div>
                            )}
                            <div>
                                <div className="flex justify-between mb-1">
                                    <p className="text-zinc-400">Thành tích</p>
                                    <p className="text-white">
                                        {game.achievements.completed}/{game.achievements.total}
                                    </p>
                                </div>
                                <Progress value={(game.achievements.completed / game.achievements.total) * 100} className="h-2" />
                            </div>
                        </div>
                    </div>

                    {/* Community */}
                    <div className="bg-zinc-800/50 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Bạn bè đang chơi</h2>
                        <div className="space-y-4">
                            {game.friends.map((friend, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{friend.name}</p>
                                        <p className="text-zinc-400 text-sm">{friend.activity}</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="hover:bg-zinc-700 hover:text-zinc-200">
                                        Tham gia
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4 gap-2 hover:bg-zinc-700 hover:text-zinc-200">
                            <Users className="h-4 w-4" />
                            Xem cộng đồng
                        </Button>
                    </div>

                    {/* External links */}
                    <div className="bg-zinc-800/50 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Liên kết</h2>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-between hover:bg-zinc-700 hover:text-zinc-200">
                                <span className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Trang chủ chính thức
                                </span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" className="w-full justify-between hover:bg-zinc-700 hover:text-zinc-200">
                                <span className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Diễn đàn cộng đồng
                                </span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
