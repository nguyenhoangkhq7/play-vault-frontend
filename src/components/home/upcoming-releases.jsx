import { LazyLoadImage } from "react-lazy-load-image-component"
import { Calendar, Clock } from "lucide-react"

export default function UpcomingReleases() {
  const releases = [
    {
      id: 1,
      title: "GTA VI",
      image: "/placeholder.svg?height=120&width=200",
      releaseDate: "10/1/2025",
      daysLeft: 320,
      platforms: ["PlayStation", "Xbox"],
    },
    {
      id: 2,
      title: "The Elder Scrolls VI",
      image: "/placeholder.svg?height=120&width=200",
      releaseDate: "11/15/2025",
      daysLeft: 365,
      platforms: ["PC", "PlayStation", "Xbox"],
    },
    {
      id: 3,
      title: "Dragon Age: The Veilguard",
      image: "/placeholder.svg?height=120&width=200",
      releaseDate: "9/30/2024",
      daysLeft: 120,
      platforms: ["PC", "PlayStation", "Xbox"],
    },
    {
      id: 4,
      title: "Fable",
      image: "/placeholder.svg?height=120&width=200",
      releaseDate: "12/15/2024",
      daysLeft: 196,
      platforms: ["PC", "Xbox"],
    },
  ]

  return (
    <div className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Sản phẩm sắp ra mắt</h2>
        <button className="text-purple-300 hover:text-white transition-colors">View calendar</button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {releases.map((game) => (
          <div
            key={game.id}
            className="rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm group hover:bg-black/40 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
          >
            <div className="relative h-36">
              <LazyLoadImage
                src={game.image || "/placeholder.svg"}
                alt={game.title}
                width={200}
                height={120}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center space-x-1 group-hover:bg-black/90 transition-colors">
                <Clock className="w-3 h-3" />
                <span>{game.daysLeft} days</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 group-hover:from-purple-800 group-hover:to-indigo-800 transition-colors">
              <h3 className="text-white font-medium text-lg mb-1">{game.title}</h3>
              <div className="flex items-center space-x-2 text-xs text-gray-300 mb-2">
                <Calendar className="w-3 h-3" />
                <span>{game.releaseDate}</span>
              </div>
              <div className="flex mt-2 space-x-2">
                {game.platforms.map((platform, index) => (
                  <span
                    key={index}
                    className="bg-white/10 text-white text-xs px-2 py-1 rounded group-hover:bg-white/20 transition-colors"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
