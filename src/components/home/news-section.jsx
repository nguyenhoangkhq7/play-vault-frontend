import Image from "next/image"

export default function NewsSection() {
  const news = [
    {
      id: 1,
      title: "New Season of Fortnite Launches Today",
      image: "/placeholder.svg?height=60&width=60",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Cyberpunk 2077 DLC Release Date Announced",
      image: "/placeholder.svg?height=60&width=60",
      time: "5 hours ago",
    },
    {
      id: 3,
      title: "PlayStation 6 Rumors: What We Know So Far",
      image: "/placeholder.svg?height=60&width=60",
      time: "1 day ago",
    },
  ]

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4">
      <h2 className="text-lg font-bold text-white mb-4">Latest News</h2>

      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="flex space-x-3">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              width={60}
              height={60}
              className="rounded-lg w-14 h-14 object-cover"
            />
            <div>
              <h3 className="text-white text-sm font-medium line-clamp-2">{item.title}</h3>
              <p className="text-gray-400 text-xs mt-1">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded-lg transition-colors">
        View All News
      </button>
    </div>
  )
}
