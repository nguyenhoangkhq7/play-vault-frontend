
import { useState, useEffect } from "react"
import StatsCards from "../components/admin/StatsCards"
import RevenueSection from "../components/admin/RevenueSection"
import ActivityChart from "../components/admin/ActivityChart"
import TopGamesChart from "../components/admin/TopGamesChart"
import SystemHealthTable from "../components/admin/SystemHealthTable"
import AlertBanner from "../components/admin/AlertBanner"
import { generateMockData } from "../lib/admin-data"

export default function Dashboard() {
  const [stats, setStats] = useState([])
  const [dailyRevenue, setDailyRevenue] = useState({})
  const [topGames, setTopGames] = useState([])
  const [systemHealth, setSystemHealth] = useState([])
  const [realtimeActivity, setRealtimeActivity] = useState([])

  useEffect(() => {
    const updateData = () => {
      const data = generateMockData()
      setStats(data.stats)
      setDailyRevenue(data.dailyRevenue)
      setTopGames(data.topGames)
      setRealtimeActivity(data.realtimeActivity)
      setSystemHealth(data.systemHealth)
    }

    updateData()
    const interval = setInterval(updateData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <h2 className="text-3xl font-bold text-pink-300 mb-4">Trang chủ</h2>
      <StatsCards stats={stats} />
      <RevenueSection dailyRevenue={dailyRevenue} />
      <ActivityChart data={realtimeActivity} />
      <TopGamesChart data={topGames} />
      <SystemHealthTable data={systemHealth} />
      <AlertBanner />
    </>
  )
}
