import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Star } from "lucide-react"
import { getCommentsByGameIdWithUsers } from "../api/comments.js"

function GameCard({ game }) {
  const [rating, setRating] = useState(0)

  useEffect(() => {
    // Fetch comments for the game to calculate average rating
    getCommentsByGameIdWithUsers(game.id)
      .then((comments) => {
        if (comments.length > 0) {
          const averageRating = (
            comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length
          ).toFixed(1)
          setRating(averageRating)
        } else {
          setRating(0) // Default to 0 if no comments
        }
      })
      .catch((error) => {
        console.error(`Error fetching comments for game ${game.id}:`, error)
        setRating(0) // Fallback to 0 on error
      })
  }, [game.id])

  return (
    <Link to={`/game/${game.id}`}>
      <div className="relative overflow-hidden rounded-lg group h-64">
        {/* Image with zoom effect */}
        <img
          src={game.thumbnail_image || "/placeholder.svg"}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Rating badge - always visible */}
        <div className="absolute top-3 left-3 bg-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold z-10">
          {rating}
        </div>

        {/* Free tag - always visible */}
        {game.price === 0 && (
          <div className="absolute top-3 right-3 bg-teal-500 text-white text-sm px-3 py-1 rounded-md z-10">
            Free to play
          </div>
        )}

        {/* Overlay that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-800/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-xl font-bold text-white truncate mb-1">{game.name}</h3>

          <div className="flex items-center justify-between">
            <p className="font-semibold text-white">
              {game.price === 0 ? "Free" : `${game.price.toLocaleString("vi-VN")} VND`}
            </p>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default GameCard