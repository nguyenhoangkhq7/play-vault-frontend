"use client"

import GameCard from "./game-card"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function GameShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)

  const featuredGames = [
    {
      id: 1,
      title: "Ruined King",
      rating: 9.2,
      image: "/placeholder.svg?height=400&width=600",
      description:
        "There's a lot to learn about LoL, so we'll start with the essentials. Explore the guide below for an overview of the most popular game mode.",
      reviews: "3.4k",
      isFreeToPlay: true,
      genres: ["RPG", "Strategy", "Adventure"],
      platforms: ["PC", "PlayStation", "Xbox", "Switch"],
      releaseDate: "2023-05-15",
      developer: "Riot Games",
      publisher: "Riot Games",
    },
    {
      id: 2,
      title: "Fortnite",
      rating: 9.4,
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Battle. Build. Create. Fortnite is a free-to-play Battle Royale game with numerous game modes for every type of game player.",
      reviews: "10k",
      isFreeToPlay: true,
      genres: ["Battle Royale", "Shooter", "Survival"],
      platforms: ["PC", "PlayStation", "Xbox", "Switch", "Mobile"],
      releaseDate: "2017-07-25",
      developer: "Epic Games",
      publisher: "Epic Games",
    },
    {
      id: 3,
      title: "Cyberpunk 2077",
      rating: 8.7,
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.",
      reviews: "7.2k",
      isFreeToPlay: false,
      genres: ["RPG", "Action", "Open World"],
      platforms: ["PC", "PlayStation", "Xbox"],
      releaseDate: "2020-12-10",
      developer: "CD Projekt Red",
      publisher: "CD Projekt",
    },
  ]

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === featuredGames.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1))
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-6">
        <GameCard game={featuredGames[activeIndex]} />
        <GameCard game={featuredGames[(activeIndex + 1) % featuredGames.length]} />
      </div>

      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
        {featuredGames.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${index === activeIndex ? "bg-white w-6" : "bg-white/40"}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}
