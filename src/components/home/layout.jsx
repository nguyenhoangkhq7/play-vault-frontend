"use client"

import { useEffect } from "react"

export default function Layout({ children }) {
  useEffect(() => {
    // Function to handle scrolling and keep the sidebar visible
    const handleScroll = () => {
      const sidebar = document.querySelector(".sidebar")
      if (sidebar) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        sidebar.style.top = `${scrollTop}px`
      }
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return <>{children}</>
}
