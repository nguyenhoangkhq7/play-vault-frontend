"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, ThumbsUp, ThumbsDown, Clock, User, Star, Tag, Award, Zap, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import GameConfig from "../components/GameConfig"
import { Button } from "../components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { getGameById, getGames, getRalatedGameWithCategoryName, getReviewByGameId } from "../api/games.js"
import { getCommentsByGameIdWithUsers } from "../api/comments.js"
import { getWishlist, updateWishlist, createWishlist } from "../api/wishlist.js"
import { getCart, addToCart, removeFromCart } from "../api/cart.js"
import { Badge } from "../components/ui/badge"
import { useUser } from "../store/UserContext.jsx"
import { API_BASE_URL } from "../config/api.js"

function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [relatedGames, setRelatedGames] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([])
  // const [user, setUser] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const {user}= useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch game details
        const gameData = await getGameById(id)
        setGame(gameData)

        const reviewData= await getReviewByGameId(id);
        setReviews(reviewData);

        const relatedData= await getRalatedGameWithCategoryName(gameData.categoryName);
        const filteredRelated  = relatedData.filter(g => g.id !== gameData.id);
        setRelatedGames(filteredRelated.slice(0,4));

        // Fetch related games
        // const allGames = await getGames()
        // const filtered = allGames
        //   .filter((g) => g.id !== gameData.id && g.thumbnail_image)
        //   .filter((g) => g.tags.some((tag) => gameData.tags.includes(tag)))
        //   .slice(0, 4)
        // setRelatedGames(filtered)

        // Fetch wishlist và kiểm tra trạng thái favorite
        // if (user && user.customerId) {
        //   const wishlistData = await getWishlist()
        //   const userWishlist = wishlistData.find((item) => {
        //     const userId = user.customerId ? String(user.customerId) : null
        //     const itemUserId = item.user_id ? String(item.user_id) : item.userId ? String(item.userId) : null
        //     return userId && itemUserId && (itemUserId === userId || Number(itemUserId) === Number(userId))
        //   })

        //   if (userWishlist) {
        //     const favGameIds = userWishlist.fav_game_id || userWishlist.favGameId || []
        //     setIsFavorite(
        //       favGameIds.some(
        //         (favId) => Number(favId) === Number(gameData.id) || favId.toString() === gameData.id.toString(),
        //       ),
        //     )
        //   }

        //   // Fetch cart và kiểm tra trạng thái in cart
        //   const cartItems = await getCart(Number(user.customerId))
        //   setIsInCart(
        //     cartItems.some(
        //       (item) => Number(item.id) === Number(gameData.id) || item.id.toString() === gameData.id.toString(),
        //     ),
        //   )
        // }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load game details. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user, navigate])

  const handleFavoriteToggle = async () => {
    if (!user || !user.customerId) {
      alert("Vui lòng đăng nhập để thêm game vào danh sách yêu thích!")
      navigate("/login")
      return
    }

    try {
      setWishlistLoading(true)
      // const wishlistData = await getWishlist()
      let userWishlist = wishlistData.find((item) => {
        const userId = user.customerId ? String(user.customerId) : null
        const itemUserId = item.user_id ? String(item.user_id) : item.userId ? String(item.userId) : null
        return userId && itemUserId && (itemUserId === userId || Number(itemUserId) === Number(userId))
      })

      // Nếu không có wishlist cho người dùng, tạo mới
      if (!userWishlist) {
        userWishlist = {
          user_id: Number(user.customerId),
          fav_game_id: [Number(game.id)],
        }
        await createWishlist(userWishlist)
        setIsFavorite(true)
        alert(`${game.gameBasicInfos.name} đã được thêm vào danh sách yêu thích!`)
        window.dispatchEvent(new Event("wishlistUpdated"))
        setWishlistLoading(false)
        return
      }

      const favGameIds = userWishlist.fav_game_id || userWishlist.favGameId || []
      let updatedFavGameIds

      if (isFavorite) {
        // Xóa game khỏi wishlist
        updatedFavGameIds = favGameIds.filter(
          (favId) => Number(favId) !== Number(game.id) && favId.toString() !== game.id.toString(),
        )
        setIsFavorite(false)
        alert(`${game.gameBasicInfos.name} đã được xóa khỏi danh sách yêu thích!`)
      } else {
        // Thêm game vào wishlist
        updatedFavGameIds = [...favGameIds, Number(game.id)]
        setIsFavorite(true)
        alert(`${game.gameBasicInfos.name} đã được thêm vào danh sách yêu thích!`)
      }

      // Cập nhật wishlist qua API
      await updateWishlist(userWishlist.id, { ...userWishlist, fav_game_id: updatedFavGameIds })
      window.dispatchEvent(new Event("wishlistUpdated"))
      setWishlistLoading(false)
    } catch (err) {
      console.error("Error updating wishlist:", err)
      alert("Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.")
      setWishlistLoading(false)
    }
  }

  const handleBuyNow = () => {
    alert(`You have selected to buy ${game?.name}!`)
    // Implement actual purchase logic here
  }

  const handleToggleCart = async () => {
    if (!user || !user.customerId) {
      alert("Vui lòng đăng nhập để thêm game vào giỏ hàng!")
      navigate("/login")
      return
    }

    try {
      setCartLoading(true)
      if (isInCart) {
        // Xóa game khỏi giỏ hàng
        await removeFromCart(Number(user.customerId), Number(game.id))
        setIsInCart(false)
        alert(`${game.gameBasicInfos.name} đã được xóa khỏi giỏ hàng!`)
      } else {
        // Thêm game vào giỏ hàng
        await addToCart(Number(user.customerId), Number(game.id))
        setIsInCart(true)
        alert(`${game.gameBasicInfos.name} đã được thêm vào giỏ hàng!`)
      }
      setCartLoading(false)
    } catch (err) {
      console.error("Error toggling cart:", err)
      alert(err.message || "Không thể cập nhật giỏ hàng. Vui lòng thử lại sau.")
      setCartLoading(false)
    }
  }

  const getTagIcon = (tag) => {
    switch (tag.toLowerCase()) {
      case "action":
        return <Zap className="w-3 h-3 mr-1" />
      case "adventure":
        return <Award className="w-3 h-3 mr-1" />
      case "role-playing":
        return <Star className="w-3 h-3 mr-1" />
      case "fantasy":
        return <Sparkles className="w-3 h-3 mr-1" />
      default:
        return <Tag className="w-3 h-3 mr-1" />
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
            className="inline-block"
          >
            <Zap className="h-8 w-8 text-purple-300" />
          </motion.div>
          <p className="mt-4 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center">
        <div className="text-center bg-purple-900/50 p-10 rounded-xl border border-purple-700">
          <h3 className="text-2xl font-bold text-purple-200 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-purple-300 max-w-md mx-auto">{error}</p>
          <Button className="mt-4 bg-purple-800 hover:bg-purple-700 text-white" onClick={() => navigate("/")}>
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    )
  }

  // const releaseDate = new Date(game.details.published_date.$date).toLocaleDateString("vi-VN")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white pb-16">
      <div className="container mx-auto px-4 py-10">
        {/* Game Title with Gradient */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {game.gameBasicInfos.name}
        </motion.h1>

        {/* Main Content - Steam-like Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Carousel */}
          <div className="lg:col-span-2">
            {game.previewImages && game.previewImages.length > 0 && (
              <div className="relative rounded-xl overflow-hidden shadow-[0_5px_30px_rgba(109,40,217,0.5)]">
                <div className="relative h-[400px] md:h-[500px]">
                  {game.previewImages.map((image, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{
                        opacity: activeImageIndex === index ? 1 : 0,
                        scale: activeImageIndex === index ? 1 : 1.1,
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <img
                        // src={`${API_BASE_URL}${image}` || "/placeholder.svg"}
                         src={image || "/placeholder.svg"}
                        alt={`${game.gameBasicInfos.name} screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/50 via-purple-900/20 to-transparent"></div>
                </div>

                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-purple-900/60 hover:bg-purple-800 p-3 rounded-full text-white z-10 backdrop-blur-sm border border-purple-700/50 transition-colors"
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? game.previewImages.length - 1 : prev - 1))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-900/60 hover:bg-purple-800 p-3 rounded-full text-white z-10 backdrop-blur-sm border border-purple-700/50 transition-colors"
                  onClick={() => setActiveImageIndex((prev) => (prev === game.previewImages.length - 1 ? 0 : prev + 1))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {game.previewImages.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full ${activeImageIndex === idx ? "bg-white" : "bg-white/50"}`}
                      onClick={() => setActiveImageIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-5 gap-2 mt-2">
              {game.previewImages &&
                game.previewImages.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    className={`rounded-md overflow-hidden border-2 transition-all ${activeImageIndex === index
                        ? "border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        : "border-transparent hover:border-purple-500"
                      }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      // src={`${API_BASE_URL}${image}` || "/placeholder.svg"}
                      src={image|| "/placeholder.svg"}
                      alt={`${game.gameBasicInfos.name} thumbnail ${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* Right Column - Game Info */}
          <div className="bg-purple-950/40 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-800/50">
            {/* Game Description */}
            <div className="mb-6">
              <p className="text-purple-200">{game.gameBasicInfos.description}</p>
            </div>

            {/* Game Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center">
                <span className="text-purple-300 w-24">Publisher:</span>
                <span className="text-white font-medium">{game.publisherName}</span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-300 w-24">Release Date:</span>
                <span className="text-white font-medium">{game.releaseDate}</span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-300 w-24">Age Limit:</span>
                <Badge className="bg-black/60 text-white border border-purple-700/50 backdrop-blur-sm">
                  {game.requiredAge ? "18+" : "All Ages"}
                </Badge>
              </div>
              <div className="flex items-center">
                <span className="text-purple-300 w-24">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  <span
                      className="bg-purple-800/50 text-purple-200 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                      {getTagIcon(game.categoryName)}
                      {game.categoryName}
                    </span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/30">
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <span className="text-2xl font-bold">{game.avgRating}</span>
              </div>
              <div>
                <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(game.avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                    />
                  ))}
                </div>
                <p className="text-purple-300 text-sm">
                  <span className="font-medium text-white">{game.reviewCount}</span> reviews
                </p>
              </div>
            </div>

            {/* Price and Buttons */}
            <div className="border-t border-purple-700/30 pt-6">
              <div className="mb-4">
                {/* <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                  {game.price === 0 ? "Free" : `${formatPrice(game.price)} VND`}
                </p> */}
                
                <div>
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">${game.gameBasicInfos.price}</span>
                  {game.discount>0 && (
                  <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm line-through">${game.gameBasicInfos.price - game.discount}</span>
                    </div>
                  )}
                </div>

              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {game.price === 0 ? "Play Now" : "Buy Now"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    onClick={handleFavoriteToggle}
                    disabled={wishlistLoading}
                    aria-label={
                      isFavorite
                        ? `Xóa ${game.gameBasicInfos.name} khỏi danh sách yêu thích`
                        : `Thêm ${game.gameBasicInfos.name} vào danh sách yêu thích`
                    }
                    className={`flex items-center justify-center ${isFavorite
                        ? "bg-purple-800 hover:bg-purple-700 text-white"
                        : "border-purple-700/50 text-purple-200 hover:bg-purple-800/80 hover:text-white"
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-pink-500 text-pink-500" : ""} mr-2`} />
                    {wishlistLoading ? "Đang xử lý..." : isFavorite ? "Wishlisted" : "Wishlist"}
                  </Button>

                  <Button
                    variant={isInCart ? "default" : "outline"}
                    onClick={handleToggleCart}
                    disabled={cartLoading}
                    aria-label={isInCart ? `Xóa ${game.gameBasicInfos.name} khỏi giỏ hàng` : `Thêm ${game.gameBasicInfos.name} vào giỏ hàng`}
                    className={`flex items-center justify-center ${isInCart
                        ? "bg-purple-800 hover:bg-purple-700 text-white"
                        : "border-purple-700/50 text-purple-200 hover:bg-purple-800/80 hover:text-white"
                      }`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {cartLoading ? "Đang xử lý..." : isInCart ? "Xóa khỏi giỏ hàng" : "Thêm vào giỏ hàng"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Details, System Requirements, Reviews */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList className="bg-purple-900/30 p-1 rounded-t-xl border border-purple-800/50 border-b-0">
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg"
            >
              System Requirements
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="about"
            className="bg-purple-950/40 backdrop-blur-sm rounded-b-xl p-6 shadow-lg mt-0 border border-purple-800/50"
          >
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              About This Game
            </h3>
            <p className="text-purple-200 mb-4">{game.gameBasicInfos.shortDescription}</p>
            <p className="text-purple-200">
              {game.gameBasicInfos.description}
            </p>
          </TabsContent>

          <TabsContent
            value="system"
            className="bg-purple-950/40 backdrop-blur-sm rounded-b-xl shadow-lg mt-0 border border-purple-800/50"
          >
            <GameConfig recommended={game.systemRequirement} />
          </TabsContent>

          <TabsContent
            value="reviews"
            className="bg-purple-950/40 backdrop-blur-sm rounded-b-xl p-6 shadow-lg mt-0 border border-purple-800/50"
          >
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              User Reviews
            </h3>
            {reviews.length === 0 ? (
              <p className="text-purple-300">No reviews yet for this game.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    className="bg-purple-900/30 p-4 rounded-lg border border-purple-700/30 hover:border-purple-600/50 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-2 text-white">
                      <div className="bg-purple-800 rounded-full p-1.5 mr-2">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{review.customerName ? review.customerName : "Unknown User"}</span>
                      <div className="flex items-center ml-auto text-purple-300 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {review.createdAt 
                            ? new Date(review.createdAt).toLocaleDateString("vi-VN") 
                            : "Unknown Date"}
                        </span>
                      </div>
                    </div>
                    <p className="text-purple-200 mb-3 pl-8">{review.comment}</p>
                    <div className="flex items-center text-sm text-purple-300 pl-8">
                      <div
                        className={`flex items-center mr-4 ${review.rating>3  ? "text-green-400" : "text-red-400"}`}
                      >
                        {review.rating>3 ? (
                          <ThumbsUp className="w-4 h-4 mr-1" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 mr-1" />
                        )}
                        {review.rating>3 ? "Recommended" : "Not Recommended"}
                      </div>
                      <div className="flex items-center mr-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {/* {review.hoursPlayed && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {review.hoursPlayed} hours played
                        </div>
                      )} */}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Related Games */}
        {relatedGames.length > 0 && (
          <div className="bg-purple-950/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-800/50">
            <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              Related Games
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedGames.map((relatedGame) => (
                <motion.div
                  key={relatedGame.id}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (0.1 * Number.parseInt(relatedGame.id)) % 5 }}
                  whileHover={{ y: -5 }}
                >
                  <div
                    className="bg-purple-900/30 rounded-xl overflow-hidden border border-purple-700/50 hover:border-pink-500/80 transition-all duration-300 
                    hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
                    onClick={() => navigate(`/game/${relatedGame.id}`)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        // src={`${API_BASE_URL}/${relatedGame.gameBasicInfos.thumbnail}` || "http://localhost:8080/images/game.jpg"}
                        src={relatedGame.gameBasicInfos.thumbnail|| "http://localhost:8080/images/game.jpg"}
                        // src={"http://localhost:8080/images/game.jpg"}
                        alt={relatedGame.gameBasicInfos.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white text-lg line-clamp-1">{relatedGame.gameBasicInfos.name}</h4>
                      <p className="text-purple-300 text-sm">{relatedGame.publisherName}</p>
                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-40npm0 to-purple-300 mt-2">
                        {formatPrice(relatedGame.gameBasicInfos.price)} $
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameDetail
