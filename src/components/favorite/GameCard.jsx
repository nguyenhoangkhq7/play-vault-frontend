"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingCart, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function GameCard({ game, onClick, viewMode }) {
    const [isHovered, setIsHovered] = useState(false)

    // Status badge color and text
    const getStatusBadge = () => {
        switch (game.status) {
            case "not_purchased":
                return { color: "border-blue-500 text-blue-400", text: "Chưa mua" }
            case "purchased":
                return { color: "border-green-500 text-green-400", text: "Đã mua" }
            default:
                return { color: "border-gray-500 text-gray-400", text: "Không xác định" }
        }
    }

    // Action button based on status
    const getActionButton = () => {
        switch (game.status) {
            case "not_purchased":
                return (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg border border-blue-500/30">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Mua ngay
                    </Button>
                )
            case "purchased":
                return (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-lg border border-green-500/30">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Đã mua
                    </Button>
                )
            default:
                return (
                    <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg">
                        Không xác định
                    </Button>
                )
        }
    }

    if (viewMode === "list") {
        return (
            <motion.div
                className="relative bg-gradient-to-r from-zinc-800/90 to-zinc-900/90 rounded-xl overflow-hidden shadow-xl border border-zinc-700/30 cursor-pointer group flex"
                onClick={onClick}
                whileHover={{ scale: 1.01, y: -3 }}
                transition={{ duration: 0.2 }}
            >
                <div className="relative w-[180px] h-[100px]">
                    <Image src={game.thumbnailImage || "/placeholder.svg"} alt={game.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                    <div className="absolute top-2 right-2">
                        <motion.div
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-black/30 p-1 rounded-full backdrop-blur-sm"
                        >
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        </motion.div>
                    </div>
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{game.name}</h3>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {game.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className={`${tag === "Hành động"
                                                    ? "border-red-500/50 text-red-400 bg-red-500/10"
                                                    : tag === "Nhập vai"
                                                        ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                                                        : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                                                } backdrop-blur-sm`}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                    <Badge variant="outline" className={`${getStatusBadge().color} backdrop-blur-sm`}>
                                        {getStatusBadge().text}
                                    </Badge>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-white font-bold">{game.price}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-zinc-400">
                            {game.publisher} • {game.releaseDate}
                        </span>
                        {getActionButton()}
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            className="relative bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 rounded-xl overflow-hidden shadow-xl border border-zinc-700/30 cursor-pointer group"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <div className="relative aspect-video">
                <Image src={game.thumbnailImage || "/placeholder.svg"} alt={game.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-3 left-3">
                    <Badge
                        variant="outline"
                        className={`${getStatusBadge().color} backdrop-blur-sm shadow-lg px-3 py-1 font-medium`}
                    >
                        {getStatusBadge().text}
                    </Badge>
                </div>

                {/* Wishlist icon */}
                <div className="absolute top-3 right-3">
                    <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-black/30 p-1.5 rounded-full backdrop-blur-sm"
                    >
                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1 truncate">{game.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {game.tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className={`${tag === "Hành động"
                                        ? "border-red-500/50 text-red-400 bg-red-500/10"
                                        : tag === "Nhập vai"
                                            ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                                            : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                                    } backdrop-blur-sm`}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">{game.price}</span>
                        </div>
                        {getActionButton()}
                    </div>
                </div>
            </div>

            {/* Description overlay on hover (desktop only) */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black/95 to-black/80 p-5 flex flex-col justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"} pointer-events-none backdrop-blur-sm`}
            >
                <p className="text-zinc-300 text-sm line-clamp-6">{game.description}</p>
                <div className="mt-4">
                    <span className="text-zinc-400 text-sm">Nhà phát hành: {game.publisher}</span>
                </div>
            </div>
        </motion.div>
    )
}
