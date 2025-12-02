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
  const [error, setError] = useState(null)  // Thêm state cho error

  useEffect(() => {
    const updateData = async () => {
      try {
        setLoading(true)
        setError(null)
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
            date: new Date().toLocaleDateString('vi-VN'),  // 30/11/2025
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
          // Xử lý empty data: Set giá trị mặc định 0 cho stats/revenue, empty topGames
          console.warn('⚠️ Empty orderItems - Setting default empty state')
          const newAccountsToday = Array.isArray(accountsToday) ? accountsToday.length : (accountsToday || 0)

          setDailyRevenue({
            date: new Date().toLocaleDateString('vi-VN'),
            revenue: 0,
            transactions: 0,
            avgOrderValue: 0
          })

          setStats([
            { icon: Users, label: "New Accounts Today", value: newAccountsToday },
            { icon: Gamepad2, label: "Games Sold Today", value: 0 },
            { icon: ShoppingBag, label: "Orders Today", value: 0 },
            { icon: Activity, label: "Items Sold", value: 0 }
          ])

          setTopGames([])
        }
      } catch (error) {
        console.error("❌ API Error:", error)
        setError(error.message || "Lỗi khi tải dữ liệu dashboard. Vui lòng thử lại.")
        // Set giá trị mặc định cho empty/error state
        setDailyRevenue({
          date: new Date().toLocaleDateString('vi-VN'),
          revenue: 0,
          transactions: 0,
          avgOrderValue: 0
        })
        setStats([
          { icon: Users, label: "New Accounts Today", value: 0 },
          { icon: Gamepad2, label: "Games Sold Today", value: 0 },
          { icon: ShoppingBag, label: "Orders Today", value: 0 },
          { icon: Activity, label: "Items Sold", value: 0 }
        ])
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
      
      {error ? (
        // Giao diện error: Hiển thị thông báo lỗi với button retry
        <div className="bg-red-900/50 border border-red-700 rounded-xl p-8 text-center mb-8">
          <h3 className="text-xl font-semibold text-red-300 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}  // Hoặc gọi updateData nếu muốn async
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
        // Giao diện normal hoặc empty data: Luôn render components với dữ liệu (có thể 0)
        <>
          <StatsCards stats={stats} />
          <RevenueSection dailyRevenue={dailyRevenue} />
          {/* Chỉ hiển thị TopGamesChart nếu có dữ liệu (topGames.length > 0) */}
          {topGames.length > 0 && <TopGamesChart data={topGames} />}
          
          {/* Thêm empty state nếu tất cả dữ liệu là 0 (không có hoạt động hôm nay) */}
          {stats.every(stat => stat.value === 0) && topGames.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 text-center mt-8">
              <Gamepad2 className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Chưa có hoạt động hôm nay</h3>
              <p className="text-gray-400 mb-4">Hệ thống đang yên bình. Kiểm tra lại sau!</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Làm mới dữ liệu
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  )
}