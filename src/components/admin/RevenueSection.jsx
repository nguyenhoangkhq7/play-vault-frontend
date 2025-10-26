export default function RevenueSection({ dailyRevenue }) {
  return (
    <div className="bg-purple-800/50 backdrop-blur-md p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-pink-200 mb-2">Doanh thu hôm nay ({dailyRevenue.date})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-purple-700/60 p-4 rounded-lg">
          <p className="text-sm text-gray-200">Tổng doanh thu</p>
          <h3 className="text-2xl font-bold text-pink-300">{dailyRevenue.revenue?.toLocaleString()} VNĐ</h3>
        </div>
        <div className="bg-purple-700/60 p-4 rounded-lg">
          <p className="text-sm text-gray-200">Tổng giao dịch</p>
          <h3 className="text-2xl font-bold text-pink-300">{dailyRevenue.transactions}</h3>
        </div>
        <div className="bg-purple-700/60 p-4 rounded-lg">
          <p className="text-sm text-gray-200">Hoàn tiền</p>
          <h3 className="text-2xl font-bold text-pink-300">{dailyRevenue.refunds}</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-purple-700/40 p-3 rounded-lg">
          <p className="text-sm">Giá trị trung bình đơn hàng</p>
          <p className="font-semibold text-lg">{dailyRevenue.avgOrderValue?.toLocaleString()} VNĐ</p>
        </div>
        <div className="bg-purple-700/40 p-3 rounded-lg">
          <p className="text-sm">Giờ cao điểm</p>
          <p className="font-semibold text-lg">{dailyRevenue.peakHour}</p>
        </div>
      </div>
    </div>
  )
}
