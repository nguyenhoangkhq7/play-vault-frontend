import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import BarChart from "../components/BarChart";
import {
  calculateCurrentStatistics,
  getPreviousStatistics,
  autoSaveStatistics,
} from "../api/statistic.js";

function AdminDashboard() {
  const [currentStats, setCurrentStats] = useState({
    revenue: 0,
    num_of_user: 0,
    num_of_interaction: 0,
    avg_cus_spend: 0,
    top_purchased_games: [],
    top_commented_games: [],
    all_comments: [],
    time: '',
  });
  const [previousStats, setPreviousStats] = useState({
    revenue: 0,
    num_of_user: 0,
    num_of_interaction: 0,
    avg_cus_spend: 0,
    top_purchased_games: [],
    top_commented_games: [],
  });
  const [error, setError] = useState(null);

  // Fetch statistics and check for auto-save
  const fetchStatistics = async () => {
    try {
      const [current, previous] = await Promise.all([
        calculateCurrentStatistics(),
        getPreviousStatistics(),
      ]);
      setCurrentStats(current);
      setPreviousStats(previous);
      console.log('Current stats:', current);
      console.log('Previous stats:', previous);

      // Auto-save on the last day of the month
      await autoSaveStatistics();
      setError(null);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchStatistics();
    // Optionally, set up an interval to check periodically
    const interval = setInterval(fetchStatistics, 24 * 60 * 60 * 1000); // Check daily
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng Doanh Thu (Tháng)"
          value={`${currentStats.revenue.toLocaleString("vi-VN")} VND`}
          change={`${(
            previousStats.revenue
              ? ((currentStats.revenue - previousStats.revenue) / previousStats.revenue) * 100
              : 0
          ).toFixed(1)}%`}
          isPositive={currentStats.revenue >= previousStats.revenue}
        />
        <StatCard
          title="Người Dùng Mới (Tháng)"
          value={currentStats.num_of_user}
          change={`${(
            previousStats.num_of_user
              ? ((currentStats.num_of_user - previousStats.num_of_user) / previousStats.num_of_user) * 100
              : 0
          ).toFixed(1)}%`}
          isPositive={currentStats.num_of_user >= previousStats.num_of_user}
        />
        <StatCard
          title="Lượt Tương Tác (Tháng)"
          value={currentStats.num_of_interaction}
          change={`${(
            previousStats.num_of_interaction
              ? ((currentStats.num_of_interaction - previousStats.num_of_interaction) / previousStats.num_of_interaction) * 100
              : 0
          ).toFixed(1)}%`}
          isPositive={currentStats.num_of_interaction >= previousStats.num_of_interaction}
        />
        <StatCard
          title="Chi Tiêu TB (Khách)"
          value={`${currentStats.avg_cus_spend.toLocaleString("vi-VN")} VND`}
          change={`${(
            previousStats.avg_cus_spend
              ? ((currentStats.avg_cus_spend - previousStats.avg_cus_spend) / previousStats.avg_cus_spend) * 100
              : 0
          ).toFixed(1)}%`}
          isPositive={currentStats.avg_cus_spend >= previousStats.avg_cus_spend}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Top 5 Game Được Bình Luận Nhiều Nhất"
          data={{
            labels: currentStats.top_commented_games?.map((game) => game.name) || [],
            values: currentStats.top_commented_games?.map((game) => game.commentCount) || []
          }}
        />
        <BarChart
          title="Top 5 Game Bán Chạy Nhất"
          data={{
            labels: currentStats.top_purchased_games?.map((game) => game.name) || [],
            values: currentStats.top_purchased_games?.map((game) => game.purchaseCount) || []
          }}
        />
      </div>

      {/* All Comments */}
      <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
        <h2 className="text-xl font-semibold text-white mb-4">Tất Cả Bình Luận ({currentStats.time})</h2>
        {currentStats.all_comments?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-white">
              <thead>
                <tr className="bg-purple-800/30">
                  <th className="p-3">Game ID</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Bình Luận</th>
                  <th className="p-3">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {currentStats.all_comments.map((comment, idx) => (
                  <tr key={idx} className="border-b border-purple-500/20 hover:bg-purple-700/20">
                    <td className="p-3">{comment.game_id}</td>
                    <td className="p-3">{comment.user_id}</td>
                    <td className="p-3">{comment.rating}</td>
                    <td className="p-3">{comment.comment}</td>
                    <td className="p-3">
                      {new Date(
                        typeof comment.commented_date === 'object'
                          ? comment.commented_date.$date
                          : comment.commented_date
                      ).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-purple-300">Không có bình luận nào trong tháng này.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;