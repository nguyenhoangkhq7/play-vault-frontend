import { Activity, Gamepad2, ShoppingBag, Users } from "lucide-react"

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2)

export function generateMockData() {
  const currentDate = new Date().toISOString().split("T")[0]

  const stats = [
    { icon: Users, label: "Active Users", value: randomInt(2000, 3000) },
    { icon: Gamepad2, label: "Games Uploaded", value: randomInt(150, 200) },
    { icon: ShoppingBag, label: "Orders Today", value: randomInt(60, 120) },
    { icon: Activity, label: "Online Now", value: randomInt(40, 100) },
  ]

  const dailyRevenue = {
    date: currentDate,
    revenue: randomInt(3000000, 12000000),
    transactions: randomInt(100, 300),
    refunds: randomInt(0, 20),
    avgOrderValue: randomInt(80000, 150000),
    peakHour: `${randomInt(10, 22)}:00`,
  }

  const topGames = [
    { name: "CyberWar", sales: randomInt(2000, 4000) },
    { name: "Mystic Quest", sales: randomInt(1800, 3000) },
    { name: "Dragon Arena", sales: randomInt(1000, 2500) },
    { name: "Alien Siege", sales: randomInt(800, 2000) },
  ]

  const realtimeActivity = ["00h", "04h", "08h", "12h", "16h", "20h"].map((t) => ({
    time: t,
    users: randomInt(100, 900),
  }))

  const systemHealth = [
    {
      service: "Payments",
      uptime: Number.parseFloat(randomFloat(99.7, 100)),
      incidents: randomInt(0, 3),
    },
    {
      service: "API Gateway",
      uptime: Number.parseFloat(randomFloat(99.5, 99.9)),
      incidents: randomInt(0, 4),
    },
    { service: "CDN", uptime: 100.0, incidents: 0 },
    {
      service: "Database",
      uptime: Number.parseFloat(randomFloat(99.6, 99.9)),
      incidents: randomInt(0, 5),
    },
  ]

  return {
    stats,
    dailyRevenue,
    topGames,
    realtimeActivity,
    systemHealth,
  }
}
