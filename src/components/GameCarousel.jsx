"use client"

import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"

function GameCarousel({ images, gameName }) {
  const [api, setApi] = useState(null)
  const [current, setCurrent] = useState(0)

  // Set up auto-transition every 1.5 seconds
  useEffect(() => {
    if (!api) return

    // Update current slide index when it changes
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }
    api.on("select", onSelect)

    // Set up auto-transition interval
    const autoPlayInterval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0)
      }
    }, 1500) // 1.5 seconds

    // Clean up
    return () => {
      api.off("select", onSelect)
      clearInterval(autoPlayInterval)
    }
  }, [api])

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative overflow-hidden rounded-xl aspect-video">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${gameName} screenshot ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent pointer-events-none"></div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows positioned inside the carousel */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-purple-600/80 hover:bg-purple-700 text-white border-none" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-purple-600/80 hover:bg-purple-700 text-white border-none" />
      </Carousel>

      {/* Indicators to show which image is active */}
      <div className="flex justify-center gap-1 mt-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              current === index ? "bg-purple-600 w-4" : "bg-purple-300"
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default GameCarousel
