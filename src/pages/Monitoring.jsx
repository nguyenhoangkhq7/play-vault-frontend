
import { useState, useEffect } from "react"
import StatsCards from "@/components/admin/StatsCards"
import ActivityChart from "@/components/admin/ActivityChart"
import SystemHealthTable from "@/components/admin/SystemHealthTable"
import AlertBanner from "@/components/admin/AlertBanner"
import { generateMockData } from "@/lib/admin-data"

export default function MonitoringPage() {
  const [stats, setStats] = useState([])
  const [systemHealth, setSystemHealth] = useState([])
  const [realtimeActivity, setRealtimeActivity] = useState([])

  useEffect(() => {
    const updateData = () => {
      const data = generateMockData()
      setStats(data.stats)
      setRealtimeActivity(data.realtimeActivity)
      setSystemHealth(data.systemHealth)
    }

    updateData()
    const interval = setInterval(updateData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <h2 className="text-3xl font-bold text-pink-300 mb-4">Giám sát hệ thống</h2>
      <StatsCards stats={stats} />
      <ActivityChart data={realtimeActivity} />
      <SystemHealthTable data={systemHealth} />
      <AlertBanner />
    </>
  )
}
