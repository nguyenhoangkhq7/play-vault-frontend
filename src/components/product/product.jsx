// "use client"

// import { useState, useEffect } from "react"
// import { useNavigate, useLocation } from "react-router-dom"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import DownloadModal from "../download/DownloadModal"
// import {
//     ShoppingCart,
//     ChevronLeft,
//     ChevronRight,
//     Star,
//     Info,
//     Tag,
//     Trophy,
//     Award,
//     Heart,
//     Flame,
//     Box,
//     Eye,
//     Zap,
//     Sparkles,
//     Filter,
//     Search,
// } from "lucide-react"
// import { motion } from "framer-motion"
// import { getGames } from "../../services/games"
// import { getWishlist, createWishlist, updateWishlist } from "../../services/wishlist"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Slider } from "@/components/ui/slider"
// import { Checkbox } from "@/components/ui/checkbox"

// export default function ProductsPage() {
//     const [games, setGames] = useState([])
//     const [filteredGames, setFilteredGames] = useState([])
//     const [activeCategory, setActiveCategory] = useState("all")
//     const [activeSlide, setActiveSlide] = useState(0)
//     const [searchQuery, setSearchQuery] = useState("")
//     const navigate = useNavigate()
//     const location = useLocation()
//     const [featuredGame, setFeaturedGame] = useState(null)
//     const [hoveredGameId, setHoveredGameId] = useState(null)
//     const [isFavorite, setIsFavorite] = useState({})
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [wishlistError, setWishlistError] = useState(null)
//     const [wishlistLoading, setWishlistLoading] = useState(false)
//     const [user, setUser] = useState(null)
//     const [sortOption, setSortOption] = useState("featured")
//     const [priceRange, setPriceRange] = useState({ min: 0, max: 2000000 })
//     const [showFilters, setShowFilters] = useState(false)
//     const [selectedRatings, setSelectedRatings] = useState([])
//     const [selectedFeatures, setSelectedFeatures] = useState([])
//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [selectedGame, setSelectedGame] = useState(null)


//     const allCategories = [
//         { id: "all", name: "Tất cả", icon: <Tag size={14} /> },
//         { id: "action", name: "Action", icon: <Zap size={14} /> },
//         { id: "adventure", name: "Adventure", icon: <Award size={14} /> },
//         { id: "role-playing", name: "Role-Playing", icon: <Star size={14} /> },
//         { id: "sci-fi", name: "Sci-Fi", icon: <Box size={14} /> },
//         { id: "sports", name: "Sports", icon: <Trophy size={14} /> },
//         { id: "simulation", name: "Simulation", icon: <Box size={14} /> },
//         { id: "fantasy", name: "Fantasy", icon: <Sparkles size={14} /> },
//         { id: "stealth", name: "Stealth", icon: <Eye size={14} /> },
//         { id: "sandbox", name: "Sandbox", icon: <Box size={14} /> },
//         { id: "survival", name: "Survival", icon: <Flame size={14} /> },
//         { id: "exploration", name: "Exploration", icon: <Eye size={14} /> },
//         { id: "open-world", name: "Open World", icon: <Box size={14} /> },
//         { id: "shooter", name: "Shooter", icon: <Zap size={14} /> },
//         { id: "fps", name: "FPS", icon: <Eye size={14} /> },
//         { id: "horror", name: "Horror", icon: <Flame size={14} /> },
//         { id: "life-sim", name: "Life Sim", icon: <Box size={14} /> },
//         { id: "multiplayer", name: "Multiplayer", icon: <Box size={14} /> },
//         { id: "puzzle", name: "Puzzle", icon: <Box size={14} /> },
//         { id: "platformer", name: "Platformer", icon: <Award size={14} /> },
//         { id: "metroidvania", name: "Metroidvania", icon: <Zap size={14} /> },
//         { id: "mythology", name: "Mythology", icon: <Sparkles size={14} /> },
//         { id: "party", name: "Party", icon: <Sparkles size={14} /> },
//         { id: "social-deduction", name: "Social Deduction", icon: <Eye size={14} /> },
//         { id: "farming", name: "Farming", icon: <Box size={14} /> },
//         { id: "indie", name: "Indie", icon: <Award size={14} /> },
//         { id: "hack-and-slash", name: "Hack and Slash", icon: <Zap size={14} /> },
//         { id: "strategy", name: "Strategy", icon: <Box size={14} /> },
//         { id: "turn-based", name: "Turn-Based", icon: <Box size={14} /> },
//         { id: "racing", name: "Racing", icon: <Zap size={14} /> },
//         { id: "city-building", name: "City Building", icon: <Box size={14} /> },
//         { id: "roguelike", name: "Roguelike", icon: <Flame size={14} /> },
//         { id: "fighting", name: "Fighting", icon: <Zap size={14} /> },
//     ]

//     // Kiểm tra trạng thái đăng nhập
//     useEffect(() => {
//         const checkLoggedIn = () => {
//             try {
//                 const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")
//                 const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
//                 if (storedUser && accessToken) {
//                     const parsedUser = JSON.parse(storedUser)
//                     setUser(parsedUser)
//                 } else {
//                     setUser(null)
//                 }
//             } catch (err) {
//                 console.error("Error checking user login:", err)
//                 setUser(null)
//             }
//         }
//         checkLoggedIn()
//     }, [])

//     // Fetch games và wishlist
//     useEffect(() => {
//         const fetchData = async () => {
//             setIsLoading(true)
//             setError(null)
//             try {
//                 const gamesData = await getGames()
//                 const games = Array.isArray(gamesData) ? gamesData : gamesData.games || []
//                 if (!games.length) {
//                     throw new Error("Không có trò chơi nào được trả về từ server")
//                 }
//                 // Kiểm tra và lọc game hợp lệ
//                 const validGames = games
//                     .filter((game) => {
//                         const isValid =
//                             game &&
//                             game.id &&
//                             typeof game.name === "string" &&
//                             Array.isArray(game.tags) &&
//                             game.details &&
//                             typeof game.details.describe === "string" &&
//                             typeof game.price === "number"
//                         if (!isValid) {
//                             console.warn("Invalid game data:", game)
//                         }
//                         return isValid
//                     })
//                     .map((game) => ({
//                         ...game,
//                         rating: game.rating || Math.floor(Math.random() * 5) + 1,
//                         thumbnail_image: game.thumbnail_image || "/placeholder.svg",
//                         details: {
//                             ...game.details,
//                             publisher: game.details.publisher || "Unknown",
//                             describe: game.details.describe || "",
//                             "age-limit": game.details["age-limit"] || "N/A",
//                         },
//                         tags: game.tags || [],
//                         images: Array.isArray(game.images) ? game.images : ["/placeholder.svg"],
//                     }))
//                 console.log(
//                     "Fetched games:",
//                     validGames.map((g) => ({ id: g.id, name: g.name })),
//                 )
//                 setGames(validGames)
//                 setFilteredGames(validGames)

//                 const gta = validGames.find((game) => game.name.toLowerCase().includes("grand theft auto"))
//                 setFeaturedGame(gta || validGames[0] || null)

//                 if (user && user.id) {
//                     const wishlistData = await getWishlist()
//                     const userWishlist = wishlistData.find((item) => {
//                         const userId = user.id ? String(user.id) : null
//                         const itemUserId = item.user_id ? String(item.user_id) : item.userId ? String(item.userId) : null
//                         return userId && itemUserId && (itemUserId === userId || Number(itemUserId) === Number(userId))
//                     })

//                     if (userWishlist) {
//                         const favGameIds = userWishlist.fav_game_id || userWishlist.favGameId || []
//                         const favoriteMap = {}
//                         validGames.forEach((game) => {
//                             favoriteMap[game.id] = favGameIds.some(
//                                 (favId) => Number(favId) === Number(game.id) || favId.toString() === game.id.toString(),
//                             )
//                         })
//                         setIsFavorite(favoriteMap)
//                     }
//                 }
//             } catch (error) {
//                 console.error("Lỗi khi tải dữ liệu:", error)
//                 setError(error.message || "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại sau.")
//             } finally {
//                 setIsLoading(false)
//             }
//         }
//         fetchData()
//     }, [user])

//     // Xử lý search query và category từ URL
//     useEffect(() => {
//         const params = new URLSearchParams(location.search)
//         const search = params.get("search")?.toLowerCase() || ""
//         const category = params.get("category")?.toLowerCase() || "all"

//         const matchedCategory = allCategories.find(
//             (cat) => cat.name.toLowerCase() === category || cat.id.toLowerCase() === category,
//         )
//         const categoryId = matchedCategory ? matchedCategory.id : "all"

//         // Chỉ áp dụng bộ lọc nếu searchQuery hoặc category thay đổi
//         if (search !== searchQuery || categoryId !== activeCategory) {
//             setSearchQuery(decodeURIComponent(search))
//             setActiveCategory(categoryId)
//             applyFilters(categoryId, priceRange, selectedRatings, selectedFeatures, search)
//         }
//     }, [location.search])

//     // Hàm lọc game
//     const applyFilters = (
//         category = activeCategory,
//         range = priceRange,
//         ratings = selectedRatings,
//         features = selectedFeatures,
//         search = searchQuery,
//     ) => {
//         console.log(
//             `Applying filters: category=${category}, priceRange=${range.min}-${range.max}, ratings=${ratings}, features=${features}, search=${search}`,
//         )
//         console.log("Total games before filtering:", games.length)

//         // Bắt đầu với tất cả game
//         let filtered = [...games]

//         // Log tất cả tên game để debug
//         console.log(
//             "All game names:",
//             filtered.map((game) => game.name),
//         )

//         // Áp dụng tìm kiếm theo tên (ưu tiên cao nhất)
//         if (search && search.trim()) {
//             const searchTerm = search.trim().toLowerCase()
//             console.log("Searching for term:", searchTerm)

//             filtered = filtered.filter((game) => {
//                 if (!game) {
//                     console.log("Found null game object")
//                     return false
//                 }

//                 // Log tên game để debug
//                 console.log(`Checking game: ${game.id} - ${game.name}`)

//                 try {
//                     // Kiểm tra tên game
//                     if (typeof game.name === "string") {
//                         const gameName = game.name.toLowerCase()
//                         const nameMatch = gameName.includes(searchTerm)

//                         // Log kết quả so sánh
//                         console.log(`Game: ${game.name}, Search: ${searchTerm}, Match: ${nameMatch}`)

//                         if (nameMatch) {
//                             console.log(`Found match: ${game.name}`)
//                             return true
//                         }

//                         // Nếu không tìm thấy theo tên, thử tìm trong tags
//                         if (Array.isArray(game.tags)) {
//                             const tagMatch = game.tags.some(
//                                 (tag) => tag && typeof tag === "string" && tag.toLowerCase().includes(searchTerm),
//                             )

//                             if (tagMatch) {
//                                 console.log(`Found tag match in game: ${game.name}`)
//                                 return true
//                             }
//                         }

//                         // Thử tìm trong mô tả
//                         if (game.details && typeof game.details.describe === "string") {
//                             const descMatch = game.details.describe.toLowerCase().includes(searchTerm)
//                             if (descMatch) {
//                                 console.log(`Found description match in game: ${game.name}`)
//                                 return true
//                             }
//                         }

//                         return false
//                     } else {
//                         console.log(`Game name is not a string: ${typeof game.name}`)
//                         return false
//                     }
//                 } catch (err) {
//                     console.error("Error filtering game:", game.id, err)
//                     return false
//                 }
//             })
//         }

//         console.log("Games after search filtering:", filtered.length)

//         // Áp dụng lọc theo danh mục
//         if (category !== "all") {
//             console.log(`Filtering by category: ${category}`)

//             filtered = filtered.filter((game) => {
//                 if (!game || !game.tags || !Array.isArray(game.tags)) {
//                     console.log(`Game ${game?.id} has invalid tags`)
//                     return false
//                 }

//                 // Log tất cả tags của game để debug
//                 console.log(`Game ${game.id} - ${game.name} has tags:`, game.tags)

//                 // Kiểm tra xem có tag nào khớp với category không
//                 const hasMatchingTag = game.tags.some((tag) => {
//                     if (!tag) return false

//                     const normalizedTag = tag.toLowerCase().trim()
//                     const normalizedCategory = category.toLowerCase().trim()

//                     // So sánh chính xác
//                     const exactMatch = normalizedTag === normalizedCategory

//                     // So sánh một phần (nếu tag chứa category hoặc ngược lại)
//                     const partialMatch = normalizedTag.includes(normalizedCategory) || normalizedCategory.includes(normalizedTag)

//                     // Log kết quả so sánh
//                     if (exactMatch || partialMatch) {
//                         console.log(`Match found: Game tag "${tag}" matches category "${category}"`)
//                     }

//                     // Ưu tiên so sánh chính xác, nếu không có thì dùng so sánh một phần
//                     return exactMatch || partialMatch
//                 })

//                 return hasMatchingTag
//             })

//             console.log("Games after category filtering:", filtered.length)
//         }

//         // Áp dụng lọc theo khoảng giá
//         filtered = filtered.filter((game) => {
//             if (!game || typeof game.price !== "number") return false
//             return game.price >= range.min && game.price <= range.max
//         })
//         console.log("Games after price filtering:", filtered.length)

//         // Áp dụng lọc theo đánh giá
//         if (ratings.length > 0) {
//             filtered = filtered.filter((game) => {
//                 if (!game || typeof game.rating !== "number") return false
//                 return ratings.includes(game.rating)
//             })
//             console.log("Games after rating filtering:", filtered.length)
//         }

//         // Áp dụng lọc theo tính năng
//         if (features.length > 0) {
//             filtered = filtered.filter((game) => {
//                 if (!game) return false
//                 return features.every((feature) => {
//                     if (feature === "sale") {
//                         return game.price < 100000
//                     }
//                     return (
//                         game.tags &&
//                         Array.isArray(game.tags) &&
//                         game.tags.some((tag) => tag && tag.toLowerCase() === feature.toLowerCase())
//                     )
//                 })
//             })
//             console.log("Games after features filtering:", filtered.length)
//         }

//         console.log(
//             "Final filtered games:",
//             filtered.map((game) => game.name),
//         )
//         setFilteredGames(filtered)

//         // Áp dụng sắp xếp nếu cần
//         if (sortOption !== "featured") {
//             handleSortChange(sortOption)
//         }
//     }

//     const filterByCategory = (category) => {
//         console.log(`Setting active category to: ${category}`)
//         setActiveCategory(category)

//         // Áp dụng bộ lọc trực tiếp trước khi cập nhật URL
//         applyFilters(category, priceRange, selectedRatings, selectedFeatures, searchQuery)

//         // Sau đó cập nhật URL
//         navigate(`/products?category=${category}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`, {
//             replace: true,
//         })
//     }

//     const handleSortChange = (option) => {
//         setSortOption(option)
//         const sortedGames = [...filteredGames]
//         switch (option) {
//             case "price-asc":
//                 sortedGames.sort((a, b) => a.price - b.price)
//                 break
//             case "price-desc":
//                 sortedGames.sort((a, b) => b.price - b.price)
//                 break
//             case "name-asc":
//                 sortedGames.sort((a, b) => a.name.localeCompare(b.name))
//                 break
//             case "name-desc":
//                 sortedGames.sort((a, b) => b.name.localeCompare(b.name))
//                 break
//             case "newest":
//                 sortedGames.sort((a, b) => new Date(b.details.releaseDate || 0) - new Date(a.details.releaseDate || 0))
//                 break
//             case "featured":
//             default:
//                 break
//         }
//         setFilteredGames(sortedGames)
//     }

//     const handlePriceRangeChange = (range) => {
//         setPriceRange({ min: range[0], max: range[1] })
//         applyFilters(activeCategory, { min: range[0], max: range[1] }, selectedRatings, selectedFeatures, searchQuery)
//     }

//     const handleOpenDownloadModal = (game) => {
//         setSelectedGame(game)
//         setIsModalOpen(true)
//     }


//     const handleRatingChange = (rating) => {
//         const newRatings = selectedRatings.includes(rating)
//             ? selectedRatings.filter((r) => r !== rating)
//             : [...selectedRatings, rating]
//         setSelectedRatings(newRatings)
//         applyFilters(activeCategory, priceRange, newRatings, selectedFeatures, searchQuery)
//     }

//     const handleFeatureChange = (feature) => {
//         const newFeatures = selectedFeatures.includes(feature)
//             ? selectedFeatures.filter((f) => f !== feature)
//             : [...selectedFeatures, feature]
//         setSelectedFeatures(newFeatures)
//         applyFilters(activeCategory, priceRange, selectedRatings, newFeatures, searchQuery)
//     }

//     const resetFilters = () => {
//         setPriceRange({ min: 0, max: 2000000 })
//         setActiveCategory("all")
//         setSelectedRatings([])
//         setSelectedFeatures([])
//         setSearchQuery("")
//         navigate("/products", { replace: true })
//         applyFilters("all", { min: 0, max: 2000000 }, [], [], "")
//     }

//     const handleSearch = (e) => {
//         e.preventDefault()
//         const trimmedQuery = searchQuery.trim()
//         console.log("Submitting search for:", trimmedQuery)

//         // Thực hiện tìm kiếm trực tiếp trước
//         applyFilters(activeCategory, priceRange, selectedRatings, selectedFeatures, trimmedQuery)

//         // Sau đó cập nhật URL (nếu cần)
//         if (trimmedQuery) {
//             const encodedQuery = encodeURIComponent(trimmedQuery)
//             navigate(`/products?search=${encodedQuery}${activeCategory !== "all" ? `&category=${activeCategory}` : ""}`, {
//                 replace: true,
//             })
//         } else {
//             // Nếu ô tìm kiếm trống, xóa tham số tìm kiếm khỏi URL
//             navigate(`/products${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`, { replace: true })
//         }
//     }

//     // Thêm hàm mới để xử lý tìm kiếm trực tiếp (không qua URL)
//     // Cập nhật hàm handleSearchInputChange để hỗ trợ tìm kiếm khi gõ
//     const handleSearchInputChange = (e) => {
//         setSearchQuery(e.target.value)

//         // Tùy chọn: Tìm kiếm ngay khi gõ (uncomment nếu muốn)
//         // if (e.target.value.trim().length >= 3 || e.target.value.trim().length === 0) {
//         //   handleDirectSearch()
//         // }
//     }

//     const navigateToGameDetail = (game, event) => {
//         if (event) event.preventDefault()
//         if (!game || !game.id) {
//             console.error("Invalid game or game ID:", game)
//             alert("Không thể xem chi tiết game. Dữ liệu game không hợp lệ.")
//             return
//         }
//         console.log(`Navigating to game detail: /game/${game.id} (Game: ${game.name})`)
//         try {
//             navigate(`/game/${game.id}`)
//         } catch (err) {
//             console.error("Navigation error:", err)
//             alert("Lỗi khi chuyển đến trang chi tiết game. Vui lòng thử lại.")
//         }
//     }

//     const handleFavoriteToggle = async (game, event) => {
//         if (event) event.stopPropagation()
//         if (!user || !user.id) {
//             alert("Vui lòng đăng nhập để thêm game vào danh sách yêu thích!")
//             navigate("/login")
//             return
//         }
//         try {
//             setWishlistLoading(true)
//             setWishlistError(null)
//             const wishlistData = await getWishlist()
//             let userWishlist = wishlistData.find((item) => {
//                 const userId = user.id ? String(user.id) : null
//                 const itemUserId = item.user_id ? String(item.user_id) : item.userId ? String(item.userId) : null
//                 return userId && itemUserId && (itemUserId === userId || Number(itemUserId) === Number(userId))
//             })

//             if (!userWishlist) {
//                 userWishlist = { user_id: Number(user.id), fav_game_id: [Number(game.id)] }
//                 await createWishlist(userWishlist)
//                 setIsFavorite({ ...isFavorite, [game.id]: true })
//                 alert(`${game.name} đã được thêm vào danh sách yêu thích!`)
//                 window.dispatchEvent(new Event("wishlistUpdated"))
//                 setWishlistLoading(false)
//                 return
//             }

//             const favGameIds = userWishlist.fav_game_id || userWishlist.favGameId || []
//             let updatedFavGameIds
//             if (isFavorite[game.id]) {
//                 updatedFavGameIds = favGameIds.filter(
//                     (favId) => Number(favId) !== Number(game.id) && favId.toString() !== game.id.toString(),
//                 )
//                 setIsFavorite({ ...isFavorite, [game.id]: false })
//                 alert(`${game.name} đã được xóa khỏi danh sách yêu thích!`)
//             } else {
//                 updatedFavGameIds = [...favGameIds, Number(game.id)]
//                 setIsFavorite({ ...isFavorite, [game.id]: true })
//                 alert(`${game.name} đã được thêm vào danh sách yêu thích!`)
//             }

//             await updateWishlist(userWishlist.id, { ...userWishlist, fav_game_id: updatedFavGameIds })
//             window.dispatchEvent(new Event("wishlistUpdated"))
//             setWishlistLoading(false)
//         } catch (err) {
//             console.error(" gehele wishlist:", err)
//             setWishlistError("Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.")
//             setWishlistLoading(false)
//         }
//     }

//     const formatPrice = (price) => {
//         return new Intl.NumberFormat("vi-VN").format(price || 0)
//     }

//     const nextSlide = () => {
//         if (featuredGame && Array.isArray(featuredGame.images)) {
//             setActiveSlide((prev) => (prev === featuredGame.images.length - 1 ? 0 : prev + 1))
//         }
//     }

//     const prevSlide = () => {
//         if (featuredGame && Array.isArray(featuredGame.images)) {
//             setActiveSlide((prev) => (prev === 0 ? featuredGame.images.length - 1 : prev - 1))
//         }
//     }

//     const getTagIcon = (tag) => {
//         if (!tag) return null
//         switch (tag.toLowerCase()) {
//             case "action":
//                 return (
//                     <span className="bg-red-500/20 text-red-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Zap className="w-3 h-3 mr-1" /> Action
//                     </span>
//                 )
//             case "adventure":
//                 return (
//                     <span className="bg-green-500/20 text-green-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Award className="w-3 h-3 mr-1" /> Adventure
//                     </span>
//                 )
//             case "role-playing":
//                 return (
//                     <span className="bg-blue-500/20 text-blue-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Star className="w-3 h-3 mr-1" /> Role-Playing
//                     </span>
//                 )
//             case "sports":
//                 return (
//                     <span className="bg-orange-500/20 text-orange-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Trophy className="w-3 h-3 mr-1" /> Sports
//                     </span>
//                 )
//             case "simulation":
//                 return (
//                     <span className="bg-pink-500/20 text-pink-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Box className="w-3 h-3 mr-1" /> Simulation
//                     </span>
//                 )
//             case "sci-fi":
//                 return (
//                     <span className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Box className="w-3 h-3 mr-1" /> Sci-Fi
//                     </span>
//                 )
//             case "fantasy":
//                 return (
//                     <span className="bg-purple-500/20 text-purple-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Sparkles className="w-3 h-3 mr-1" /> Fantasy
//                     </span>
//                 )
//             case "stealth":
//                 return (
//                     <span className="bg-gray-500/20 text-gray-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Eye className="w-3 h-3 mr-1" /> Stealth
//                     </span>
//                 )
//             case "sandbox":
//                 return (
//                     <span className="bg-yellow-500/20 text-yellow-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Box className="w-3 h-3 mr-1" /> Sandbox
//                     </span>
//                 )
//             case "survival":
//                 return (
//                     <span className="bg-teal-500/20 text-teal-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Flame className="w-3 h-3 mr-1" /> Survival
//                     </span>
//                 )
//             case "fps":
//                 return (
//                     <span className="bg-red-600/20 text-red-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Eye className="w-3 h-3 mr-1" /> FPS
//                     </span>
//                 )
//             case "open-world":
//                 return (
//                     <span className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Box className="w-3 h-3 mr-1" /> Open World
//                     </span>
//                 )
//             case "multiplayer":
//                 return (
//                     <span className="bg-blue-600/20 text-blue-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Tag className="w-3 h-3 mr-1" /> Multiplayer
//                     </span>
//                 )
//             case "racing":
//                 return (
//                     <span className="bg-amber-500/20 text-amber-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Zap className="w-3 h-3 mr-1" /> Racing
//                     </span>
//                 )
//             case "indie":
//                 return (
//                     <span className="bg-violet-500/20 text-violet-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Sparkles className="w-3 h-3 mr-1" /> Indie
//                     </span>
//                 )
//             case "strategy":
//                 return (
//                     <span className="bg-cyan-500/20 text-cyan-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Box className="w-3 h-3 mr-1" /> Strategy
//                     </span>
//                 )
//             default:
//                 return (
//                     <span className="bg-gray-500/20 text-gray-400 p-1.5 rounded-md text-xs flex items-center">
//                         <Tag className="w-3 h-3 mr-1" /> {tag}
//                     </span>
//                 )
//         }
//     }

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center">
//                 <div className="text-center">
//                     <motion.div
//                         animate={{ rotate: 360 }}
//                         transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
//                         className="inline-block"
//                     >
//                         <Zap className="h-8 w-8 text-purple-300" />
//                     </motion.div>
//                     <p className="mt-4 text-lg">Đang tải dữ liệu...</p>
//                 </div>
//             </div>
//         )
//     }

//     if (error) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center">
//                 <div className="text-center bg-purple-900/50 p-10 rounded-xl border border-purple-700">
//                     <h3 className="text-2xl font-bold text-purple-200 mb-2">Lỗi tải dữ liệu</h3>
//                     <p className="text-purple-300 max-w-md mx-auto">{error}</p>
//                     <Button
//                         className="mt-4 bg-purple-800 hover:bg-purple-700 text-white"
//                         onClick={() => window.location.reload()}
//                     >
//                         Thử lại
//                     </Button>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white pb-16">
//             {wishlistError && (
//                 <div className="fixed top-4 right-4 bg-red-600/90 text-white p-4 rounded-lg shadow-lg">
//                     <p>{wishlistError}</p>
//                     <Button className="mt-2 bg-red-700 hover:bg-red-800" onClick={() => setWishlistError(null)}>
//                         Đóng
//                     </Button>
//                 </div>
//             )}
//             <main className="container mx-auto px-4 pt-8">
//                 <motion.h1
//                     className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 text-center"
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5 }}
//                 >
//                     {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : "Khám Phá Các Tựa Game Hấp Dẫn"}
//                 </motion.h1>

//                 {/* Thay thế phần thanh tìm kiếm hiện tại bằng phiên bản cải tiến */}
//                 <div className="mb-8">
//                     <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 value={searchQuery}
//                                 onChange={handleSearchInputChange}
//                                 placeholder="Tìm kiếm game theo tên..."
//                                 className="w-full bg-purple-900/40 border border-purple-700/50 rounded-full py-3 pl-5 pr-12 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
//                                 aria-label="Tìm kiếm game"
//                             />
//                             <div className="absolute right-1 top-1/2 -translate-y-1/2 flex">
//                                 {searchQuery && (
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setSearchQuery("")
//                                             if (location.search) {
//                                                 navigate(`/products${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`)
//                                             }
//                                             // Áp dụng tìm kiếm trống
//                                             applyFilters(activeCategory, priceRange, selectedRatings, selectedFeatures, "")
//                                         }}
//                                         className="p-2 text-purple-300 hover:text-white"
//                                         aria-label="Xóa tìm kiếm"
//                                     >
//                                         <svg
//                                             xmlns="http://www.w3.org/2000/svg"
//                                             width="18"
//                                             height="18"
//                                             viewBox="0 0 24 24"
//                                             fill="none"
//                                             stroke="currentColor"
//                                             strokeWidth="2"
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                         >
//                                             <line x1="18" y1="6" x2="6" y2="18"></line>
//                                             <line x1="6" y1="6" x2="18" y2="18"></line>
//                                         </svg>
//                                     </button>
//                                 )}
//                                 <button
//                                     type="submit"
//                                     className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 p-2 rounded-full text-white transition-colors"
//                                     aria-label="Tìm kiếm"
//                                 >
//                                     <Search className="h-5 w-5" />
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="text-center mt-2 text-purple-300 text-sm">
//                             <span>Tìm kiếm theo tên game chính xác để có kết quả tốt nhất</span>
//                         </div>
//                     </form>
//                 </div>

//                 {featuredGame && !searchQuery && (
//                     <motion.div
//                         className="relative rounded-2xl overflow-hidden mb-12 shadow-[0_5px_30px_rgba(109,40,217,0.7)]"
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.2 }}
//                     >
//                         <div className="relative h-[400px] md:h-[500px]">
//                             <div className="absolute inset-0">
//                                 {featuredGame.images.map((image, index) => (
//                                     <motion.div
//                                         key={index}
//                                         className="absolute inset-0"
//                                         initial={{ opacity: 0, scale: 1.1 }}
//                                         animate={{
//                                             opacity: activeSlide === index ? 1 : 0,
//                                             scale: activeSlide === index ? 1 : 1.1,
//                                         }}
//                                         transition={{ duration: 0.8 }}
//                                     >
//                                         <img
//                                             src={image || "/placeholder.svg"}
//                                             alt={featuredGame.name}
//                                             className="w-full h-full object-cover"
//                                         />
//                                     </motion.div>
//                                 ))}
//                                 <div className="absolute inset-0 bg-gradient-to-t from-purple-950/95 via-purple-900/70 to-transparent"></div>
//                             </div>

//                             <button
//                                 className="absolute left-4 top-1/2 -translate-y-1/2 bg-purple-900/60 hover:bg-purple-800 p-3 rounded-full text-white z-10 backdrop-blur-sm border border-purple-700/50 transition-colors"
//                                 onClick={prevSlide}
//                             >
//                                 <ChevronLeft size={24} />
//                             </button>
//                             <button
//                                 className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-900/60 hover:bg-purple-800 p-3 rounded-full text-white z-10 backdrop-blur-sm border border-purple-700/50 transition-colors"
//                                 onClick={nextSlide}
//                             >
//                                 <ChevronRight size={24} />
//                             </button>

//                             <div className="absolute top-4 left-4 z-10">
//                                 <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white uppercase tracking-wide px-3 py-1">
//                                     <Sparkles className="h-4 w-4 mr-1" /> Nổi bật
//                                 </Badge>
//                             </div>

//                             <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
//                                 <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
//                                     <div>
//                                         <div className="flex items-center space-x-2 mb-3">
//                                             <Badge className="bg-purple-600 text-white">{featuredGame.details.publisher}</Badge>
//                                             <div className="flex items-center text-yellow-400 text-sm">
//                                                 <Star className="h-4 w-4 mr-1 fill-current" />
//                                                 <span>{featuredGame.rating || 4.8}</span>
//                                             </div>
//                                         </div>
//                                         <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{featuredGame.name}</h1>
//                                         <p className="text-gray-300 mb-4 max-w-2xl line-clamp-2">
//                                             {featuredGame.details.describe.substring(0, 150)}...
//                                         </p>
//                                         <div className="flex flex-wrap gap-2 mb-4">
//                                             {featuredGame.tags.map((tag, idx) => (
//                                                 <span key={idx} className="mr-2">
//                                                     {getTagIcon(tag)}
//                                                 </span>
//                                             ))}
//                                         </div>
//                                     </div>
//                                     <div className="flex flex-col items-end mt-4 md:mt-0">
//                                         <p className="text-2xl font-bold text-white mb-2">{formatPrice(featuredGame.price)} ₫</p>
//                                         <div className="flex space-x-3">
//                                             <Button
//                                                 className="bg-purple-800/80 hover:bg-purple-700 border border-purple-600 text-white"
//                                                 onClick={(e) => navigateToGameDetail(featuredGame, e)}
//                                             >
//                                                 Xem Chi Tiết
//                                             </Button>
//                                             <Button
//                                                 className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
//                                                 onClick={(e) => navigateToGameDetail(featuredGame, e)}
//                                             >
//                                                 Mua Ngay
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
//                                 {featuredGame.images.map((_, idx) => (
//                                     <button
//                                         key={idx}
//                                         className={`w-2 h-2 rounded-full ${activeSlide === idx ? "bg-white" : "bg-white/50"}`}
//                                         onClick={() => setActiveSlide(idx)}
//                                     />
//                                 ))}
//                             </div>
//                         </div>
//                     </motion.div>
//                 )}

//                 <div className="mb-10">
//                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//                         <h2 className="text-2xl font-bold text-white flex items-center">
//                             <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
//                                 Danh mục sản phẩm
//                             </span>
//                         </h2>
//                         <div className="flex items-center space-x-4 mt-4 md:mt-0">
//                             <Button
//                                 onClick={() => setShowFilters(!showFilters)}
//                                 className={`${showFilters
//                                         ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
//                                         : "bg-purple-800/70 hover:bg-purple-700"
//                                     } text-white transition-all duration-300`}
//                             >
//                                 <Filter className="h-4 w-4 mr-2" />
//                                 {showFilters ? "Đang lọc" : "Bộ lọc"}
//                             </Button>
//                             <div className="relative">
//                                 <Select value={sortOption} onValueChange={handleSortChange}>
//                                     <SelectTrigger className="w-[180px] bg-purple-900/60 border-purple-700/50 text-white hover:border-pink-500/50 transition-colors">
//                                         <SelectValue placeholder="Sắp xếp theo" />
//                                     </SelectTrigger>
//                                     <SelectContent className="bg-purple-900 border-purple-700 text-white">
//                                         <SelectItem value="featured">Nổi bật</SelectItem>
//                                         <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
//                                         <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
//                                         <SelectItem value="name-asc">Tên: A-Z</SelectItem>
//                                         <SelectItem value="name-desc">Tên: Z-A</SelectItem>
//                                         <SelectItem value="newest">Mới nhất</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>
//                     </div>

//                     {showFilters && (
//                         <motion.div
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: "auto" }}
//                             exit={{ opacity: 0, height: 0 }}
//                             className="bg-purple-950/40 backdrop-blur-sm p-6 rounded-xl border border-purple-800/50 shadow-lg mb-6"
//                         >
//                             <div className="flex justify-between items-center mb-4 pb-3 border-b border-purple-800/30">
//                                 <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
//                                     Bộ lọc nâng cao
//                                 </h3>
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() => setShowFilters(false)}
//                                     className="text-purple-300 hover:text-white hover:bg-purple-800/50"
//                                 >
//                                     Đóng
//                                 </Button>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800/30">
//                                     <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                                         <Tag className="h-4 w-4 mr-2 text-pink-400" />
//                                         Khoảng giá
//                                     </h3>
//                                     <div className="px-2">
//                                         <Slider
//                                             defaultValue={[priceRange.min, priceRange.max]}
//                                             max={2000000}
//                                             step={50000}
//                                             onValueChange={(values) => handlePriceRangeChange(values)}
//                                             className="mb-6"
//                                         />
//                                         <div className="flex justify-between items-center">
//                                             <div className="bg-purple-900/60 px-3 py-1.5 rounded-md text-sm text-purple-200 border border-purple-700/50">
//                                                 {formatPrice(priceRange.min)} ₫
//                                             </div>
//                                             <div className="h-[1px] flex-1 mx-2 bg-purple-700/30"></div>
//                                             <div className="bg-purple-900/60 px-3 py-1.5 rounded-md text-sm text-purple-200 border border-purple-700/50">
//                                                 {formatPrice(priceRange.max)} ₫
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800/30">
//                                     <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                                         <Star className="h-4 w-4 mr-2 text-yellow-400" />
//                                         Đánh giá
//                                     </h3>
//                                     <div className="space-y-2">
//                                         {[5, 4, 3, 2, 1].map((rating) => (
//                                             <div
//                                                 key={rating}
//                                                 className="flex items-center p-1.5 hover:bg-purple-800/30 rounded-md transition-colors"
//                                             >
//                                                 <Checkbox
//                                                     id={`rating-${rating}`}
//                                                     className="border-purple-600"
//                                                     checked={selectedRatings.includes(rating)}
//                                                     onCheckedChange={() => handleRatingChange(rating)}
//                                                 />
//                                                 <label
//                                                     htmlFor={`rating-${rating}`}
//                                                     className="ml-2 text-purple-200 flex items-center cursor-pointer flex-1"
//                                                 >
//                                                     {Array(rating)
//                                                         .fill(0)
//                                                         .map((_, i) => (
//                                                             <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
//                                                         ))}
//                                                     {Array(5 - rating)
//                                                         .fill(0)
//                                                         .map((_, i) => (
//                                                             <Star key={i} className="h-4 w-4 text-gray-500" />
//                                                         ))}
//                                                     <span className="ml-2">và cao hơn</span>
//                                                 </label>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800/30">
//                                     <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                                         <Filter className="h-4 w-4 mr-2 text-purple-400" />
//                                         Tùy chọn khác
//                                     </h3>
//                                     <div className="space-y-3">
//                                         {[
//                                             { id: "multiplayer", label: "Multiplayer" },
//                                             { id: "singleplayer", label: "Singleplayer" },
//                                             { id: "controller-support", label: "Hỗ trợ tay cầm" },
//                                             { id: "sale", label: "Đang giảm giá" },
//                                         ].map((feature) => (
//                                             <div
//                                                 key={feature.id}
//                                                 className="flex items-center p-1.5 hover:bg-purple-800/30 rounded-md transition-colors"
//                                             >
//                                                 <Checkbox
//                                                     id={feature.id}
//                                                     className="border-purple-600"
//                                                     checked={selectedFeatures.includes(feature.id)}
//                                                     onCheckedChange={() => handleFeatureChange(feature.id)}
//                                                 />
//                                                 <label htmlFor={feature.id} className="ml-2 text-purple-200 cursor-pointer">
//                                                     {feature.label}
//                                                 </label>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="mt-6 flex justify-end space-x-3 pt-3 border-t border-purple-800/30">
//                                 <Button
//                                     variant="outline"
//                                     className="border-purple-700 text-purple-300 hover:bg-purple-800 hover:text-white"
//                                     onClick={resetFilters}
//                                 >
//                                     Đặt lại
//                                 </Button>
//                                 <Button
//                                     className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
//                                     onClick={() =>
//                                         applyFilters(activeCategory, priceRange, selectedRatings, selectedFeatures, searchQuery)
//                                     }
//                                 >
//                                     Áp dụng bộ lọc
//                                 </Button>
//                             </div>
//                         </motion.div>
//                     )}

//                     <div className="bg-purple-950/40 backdrop-blur-sm p-5 rounded-xl border border-purple-800/50 shadow-lg">
//                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
//                             {allCategories.map((category) => (
//                                 <button
//                                     key={category.id}
//                                     className={`px-4 py-2.5 rounded-full transition-all duration-300 flex items-center justify-center w-full ${activeCategory === category.id
//                                             ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium shadow-md"
//                                             : "bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/50"
//                                         }`}
//                                     onClick={() => filterByCategory(category.id)}
//                                 >
//                                     <span className="mr-1.5">{category.icon}</span>
//                                     <span className="truncate">{category.name}</span>
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                     {filteredGames &&
//                         filteredGames.map((game) => (
//                             <motion.div
//                                 key={game.id}
//                                 className="group"
//                                 initial={{ opacity: 0, y: 20 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 transition={{ delay: (0.1 * Number.parseInt(game.id)) % 5 }}
//                                 onHoverStart={() => setHoveredGameId(game.id)}
//                                 onHoverEnd={() => setHoveredGameId(null)}
//                             >
//                                 <Card
//                                     className="bg-purple-950/60 backdrop-blur-sm border border-purple-700/50 hover:border-pink-500/80 overflow-hidden transition-all duration-300 
//                                 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-xl transform hover:-translate-y-1"
//                                 >
//                                     <div className="relative h-52 overflow-hidden">
//                                         <img
//                                             src={game.thumbnail_image || "/placeholder.svg"}
//                                             alt={game.name}
//                                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                                         />
//                                         <div
//                                             className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 
//                                         flex items-end justify-center pb-6"
//                                         >
//                                             <div className="flex space-x-2">
//                                                 <Button
//                                                     size="sm"
//                                                     variant="secondary"
//                                                     className="bg-purple-800/90 hover:bg-purple-700 text-white border border-purple-500 rounded-full px-4"
//                                                     onClick={(e) => navigateToGameDetail(game, e)}
//                                                 >
//                                                     <Info className="h-4 w-4 mr-1" />
//                                                     Chi tiết
//                                                 </Button>
//                                                 <Button
//                                                     size="sm"
//                                                     className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-full"
//                                                     onClick={(e) => navigateToGameDetail(game, e)}
//                                                 >
//                                                     <ShoppingCart className="h-4 w-4 mr-1" />
//                                                     Mua ngay
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                         <div className="absolute top-2 right-2">
//                                             <Badge className="bg-black/60 text-white border border-purple-700/50 backdrop-blur-sm">
//                                                 {game.details["age-limit"]}
//                                             </Badge>
//                                         </div>
//                                         <button
//                                             className="absolute top-2 left-2 bg-black/40 p-1.5 rounded-full backdrop-blur-sm border border-purple-700/50
//                                             hover:bg-pink-600/30 hover:border-pink-500 transition-colors duration-300"
//                                             onClick={(e) => handleFavoriteToggle(game, e)}
//                                             disabled={wishlistLoading}
//                                         >
//                                             <Heart
//                                                 className={`h-4 w-4 ${isFavorite[game.id] ? "text-pink-500 fill-pink-500" : "text-white"}`}
//                                             />
//                                         </button>
//                                     </div>
//                                     <CardContent className="p-5">
//                                         <motion.div
//                                             className="flex flex-col space-y-3"
//                                             animate={{ y: hoveredGameId === game.id ? -5 : 0 }}
//                                             transition={{ duration: 0.2 }}
//                                         >
//                                             <div>
//                                                 <h3 className="font-semibold text-white text-lg line-clamp-1">{game.name}</h3>
//                                                 <p className="text-purple-300 text-sm">{game.details.publisher}</p>
//                                             </div>
//                                             <div className="flex flex-wrap gap-1.5">
//                                                 {game.tags.slice(0, 2).map((tag, idx) => (
//                                                     <span key={idx} className="text-xs">
//                                                         {getTagIcon(tag)}
//                                                     </span>
//                                                 ))}
//                                                 {game.tags.length > 2 && (
//                                                     <span className="text-xs bg-purple-800/40 text-purple-300 p-1.5 rounded-md flex items-center">
//                                                         <Tag className="w-3 h-3 mr-1" />+{game.tags.length - 2}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                             <div className="flex items-center justify-between pt-2">
//                                                 <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
//                                                     {formatPrice(game.price)} ₫
//                                                 </p>
//                                                 <div className="flex items-center space-x-2">
//                                                     <Button
//                                                         size="sm"
//                                                         className="bg-purple-800/70 hover:bg-purple-700 text-white rounded-full h-8 w-8 p-0"
//                                                         onClick={(e) => handleFavoriteToggle(game, e)}
//                                                         disabled={wishlistLoading}
//                                                     >
//                                                         <Heart
//                                                             className={`h-4 w-4 ${isFavorite[game.id] ? "text-pink-500 fill-pink-500" : "text-white"}`}
//                                                         />
//                                                     </Button>
//                                                     <Button
//                                                         size="sm"
//                                                         className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-full h-8 w-8 p-0"
//                                                         onClick={(e) => navigateToGameDetail(game, e)}
//                                                     >
//                                                         <ShoppingCart className="h-4 w-4" />
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         </motion.div>
//                                     </CardContent>
//                                 </Card>
//                             </motion.div>
//                         ))}
//                 </div>

//                 {filteredGames.length === 0 && !isLoading && (
//                     <div className="flex flex-col items-center justify-center py-16 text-center">
//                         <div className="bg-purple-900/50 p-10 rounded-xl border border-purple-700">
//                             <h3 className="text-2xl font-bold text-purple-200 mb-2">Không tìm thấy sản phẩm</h3>
//                             <p className="text-purple-300 max-w-md mx-auto">
//                                 Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với từ khóa khác.
//                             </p>
//                             <Button className="mt-4 bg-purple-800 hover:bg-purple-700 text-white" onClick={resetFilters}>
//                                 Đặt lại bộ lọc
//                             </Button>
//                         </div>
//                     </div>
//                 )}
//             </main>
//             {isModalOpen && (
//             <DownloadModal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 game={selectedGame}
//             />
//             )}

//         </div>
//     )
// }

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("about");
  const [expandedFaq, setExpandedFaq] = useState(-1);

  const slides = [
    { id: 1, title: "FIFA 23 screenshot 1" },
    { id: 2, title: "FIFA 23 screenshot 2" },
    { id: 3, title: "FIFA 23 screenshot 3" },
    { id: 4, title: "FIFA 23 screenshot 4" },
    { id: 5, title: "FIFA 23 screenshot 5" },
  ];

  const relatedGames = [
    { id: 1, title: "Pro Evo 4", image: "/pro-evolution-soccer.jpg" },
    { id: 2, title: "Shadow Wifey", image: "/shadow-wifey-game.jpg" },
    { id: 3, title: "The Sims 4", image: "/the-sims-4.jpg" },
    { id: 4, title: "Sandbox Wifey", image: "/sandbox-wifey.jpg" },
    { id: 5, title: "Rocket League", image: "/rocket-league.jpg" },
    { id: 6, title: "Clash Royale", image: "/clash-royale.jpg" },
  ];

  const comments = [
    {
      id: 1,
      author: "Nguyễn Văn A",
      rating: 5,
      text: "Game rất hay, đồ họa đẹp và gameplay mượt mà. Tôi rất thích!",
      date: "2 ngày trước",
    },
    {
      id: 2,
      author: "Trần Thị B",
      rating: 4,
      text: "Tuyệt vời nhưng hơi nặng máy. Cần cấu hình khá cao để chơi mượt.",
      date: "1 tuần trước",
    },
    {
      id: 3,
      author: "Lê Minh C",
      rating: 5,
      text: "Phiên bản tốt nhất của FIFA cho đến nay. Các tính năng mới rất hay!",
      date: "2 tuần trước",
    },
  ];

  const faqs = [
    {
      question: "Bao lâu nữa thì bản được 1 lý gọi mẻ?",
      answer: "Em bán kem đánh răng.",
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-6">FIFA 23</h1>

            {/* SLIDES */}
            <div className="relative bg-purple-950 rounded-xl overflow-hidden mb-6 shadow-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={`/fifa-23-game-screenshot-.jpg?query=${currentSlide + 1}`}
                  alt={`FIFA 23 screenshot ${currentSlide + 1}`}
                  className="w-full h-[400px] object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* INDICATORS */}
            <div className="flex justify-center gap-2 py-4 bg-purple-950 rounded-lg">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition ${
                    i === currentSlide ? "bg-pink-500" : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            {/* TABS */}
            <div className="mt-8 border-b border-purple-700">
              <div className="flex gap-4 flex-wrap">
                {[
                  { id: "about", label: "About" },
                  { id: "requirements", label: "System Requirements" },
                  { id: "reviews", label: "Reviews" },
                  { id: "download", label: "Download" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 font-semibold rounded-t-md transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-pink-500 text-white shadow-md shadow-pink-400/30"
                        : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="mt-6">
              <AnimatePresence mode="wait">
                {/* REVIEWS TAB (GỘP COMMENT) */}
                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">Người chơi đánh giá</h3>
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-purple-900/60 p-5 rounded-xl border border-purple-700 shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-semibold">{comment.author}</p>
                            <p className="text-purple-300 text-xs">{comment.date}</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={`${
                                  i < comment.rating ? "fill-yellow-400 text-yellow-400" : "text-purple-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-purple-100 text-sm leading-relaxed">{comment.text}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* DOWNLOAD TAB */}
                {activeTab === "download" && (
                  <motion.div
                    key="download"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">Tải xuống</h3>

                    <div>
                      <h4 className="text-xl text-yellow-400 font-semibold mb-2">Google Drive</h4>
                      <div className="flex gap-3 flex-wrap">
                        {["Part 1", "Part 2", "Part 3", "Part 4"].map((part, idx) => (
                          <button
                            key={idx}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-full transition"
                          >
                            {part}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl text-yellow-400 font-semibold mb-2">MediaFire</h4>
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-2 rounded-full transition">
                        Full
                      </button>
                    </div>

                    <div>
                      <h4 className="text-xl text-yellow-400 font-semibold mb-2">Mega</h4>
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-2 rounded-full transition">
                        Full
                      </button>
                    </div>

                    {/* FAQ */}
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-white mb-4">Câu hỏi thường gặp:</h3>
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-gray-800/60 rounded-lg mb-2">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-700/60 transition"
                          >
                            <span className="text-white font-semibold text-left">{faq.question}</span>
                            <ChevronDown
                              size={20}
                              className={`text-white transition-transform ${
                                expandedFaq === idx ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {expandedFaq === idx && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-4 pb-4 text-purple-200"
                              >
                                {faq.answer}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-purple-900/50 rounded-lg p-6"
            >
              <p className="text-purple-100 text-sm leading-relaxed">
                FIFA 23 là tựa game bóng đá nổi tiếng nhất từ EA Sports, mang đến trải nghiệm chơi game tuyệt vời với
                những cải tiến đáng kể...
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="bg-pink-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">5.0</span>
              </div>
              <div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-purple-200 text-sm mt-1">1 ratings</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-purple-200">
              <div className="flex justify-between">
                <span>Publisher:</span> <span className="font-semibold text-white">EA Sports</span>
              </div>
              <div className="flex justify-between">
                <span>Release Date:</span> <span className="font-semibold text-white">30/9/2022</span>
              </div>
              <div className="flex justify-between">
                <span>Age Limit:</span> <span className="font-semibold text-white">3+</span>
              </div>
              <div className="flex justify-between">
                <span>Tags:</span>
                <div className="flex gap-2">
                  <span className="bg-purple-700 text-white px-3 py-1 rounded text-xs">Sports</span>
                  <span className="bg-purple-700 text-white px-3 py-1 rounded text-xs">Simulation</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">Related Games</h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedGames.map((game) => (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-purple-900/50 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <img src={game.image} alt={game.title} className="w-full h-24 object-cover" />
                    <p className="text-white text-xs font-semibold p-2 text-center">{game.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




