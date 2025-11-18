import { useState, useEffect } from "react"
import StatsCards from "../components/admin/StatsCards"
import RevenueSection from "../components/admin/RevenueSection"
import TopGamesChart from "../components/admin/TopGamesChart"
import { Activity, Gamepad2, ShoppingBag, Users } from "lucide-react"
import { getDataToDay, getDataAccountCreateToday } from "../api/dashboardadmin"

export default function Dashboard() {
  const [stats, setStats] = useState([])
  const [dailyRevenue, setDailyRevenue] = useState({})
  const [topGames, setTopGames] = useState([])  // Top 5 games từ API, giữ float chính xác
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateData = async () => {
      try {
        console.log('🔄 Fetching data from API...')
        
        const [orderItems, accountsToday] = await Promise.all([
          getDataToDay(),  // Lấy orderItems (có thể 10+ items)
          getDataAccountCreateToday()
        ])
        
        console.log('✅ Order Items API data (length: ' + (orderItems?.length || 0) + '):', orderItems)

        if (orderItems && orderItems.length > 0) {
          // Derive dailyRevenue từ orderItems (giữ float)
          const uniqueOrders = new Set(orderItems.map(item => item.orderId))
          const transactions = uniqueOrders.size
          const revenue = orderItems.reduce((sum, item) => sum + (item.total || item.price || 0), 0)
          const avgOrderValue = transactions > 0 ? revenue / transactions : 0

          setDailyRevenue({
            date: new Date().toLocaleDateString('vi-VN'),  // 19/11/2025
            revenue: revenue,
            transactions: transactions,
            avgOrderValue: avgOrderValue
          })

          // Derive STATS (bao gồm new accounts)
          const uniqueGames = new Set(orderItems.map(item => item.gameId)).size
          const newAccountsToday = Array.isArray(accountsToday) ? accountsToday.length : (accountsToday || 0)

          setStats([
            { icon: Users, label: "New Accounts Today", value: newAccountsToday },
            { icon: Gamepad2, label: "Games Sold Today", value: uniqueGames },
            { icon: ShoppingBag, label: "Orders Today", value: transactions },
            { icon: Activity, label: "Items Sold", value: orderItems.length }
          ])

          // Derive TOP 5 GAMES từ orderItems – GROUP duplicate names, SUM total/price CHÍNH XÁC (float), SORT cao nhất, SLICE top 5
          const gamesMap = orderItems.reduce((acc, item) => {
            const key = item.gameTitle || `Game ${item.gameId}`  // Key: Tên game (duplicate → tổng hợp)
            if (!acc[key]) {
              acc[key] = { name: key, sales: 0 }  // sales = doanh thu tổng (float)
            }
            acc[key].sales += (item.total || item.price || 0)  // Sum chính xác từ API (e.g., 59.99)
            return acc
          }, {})

          const topGamesFromApi = Object.values(gamesMap)
            .sort((a, b) => b.sales - a.sales)  // Sort descending: cao nhất trước
            .slice(0, 5)  // Lấy top 5
            .map(game => ({ 
              ...game, 
              sales: game.sales  // GIỮ NGUYÊN float từ API, không round!
            }))
          
          setTopGames(topGamesFromApi)
          console.log('🎮 Top 5 Games from API (sorted by sales, float chính xác):', topGamesFromApi)  // Log: e.g., sales: 59.99
        } else {
          console.warn('⚠️ Empty orderItems')
          setTopGames([])
        }
      } catch (error) {
        console.error("❌ API Error:", error)
        setStats([])
        setDailyRevenue({})
        setTopGames([])
      } finally {
        setLoading(false)
      }
    }

    updateData()
    const interval = setInterval(updateData, 50000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="text-center p-8">Đang tải...</div>

  return (
    <>
      <h2 className="text-3xl font-bold text-pink-300 mb-4">Trang chủ</h2>
      <StatsCards stats={stats} />
      <RevenueSection dailyRevenue={dailyRevenue} />
      <TopGamesChart data={topGames} />  {/* Sales chính xác từ API, e.g., 59.99 */}
    </>
  )
}