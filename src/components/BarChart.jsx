import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

function BarChartComponent({ title, data }) {
  // Kiểm tra nếu data.labels hoặc data.values không hợp lệ
  if (!data || !data.labels || !data.values || data.labels.length === 0) {
    return (
      <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-purple-300 text-center">Đang tải dữ liệu...</p>
      </div>
    )
  }

  // Chuyển đổi dữ liệu thành định dạng Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
  }))

  return (
    <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <BarChart
        width={500}
        height={300}
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" stroke="#fff" />
        <YAxis stroke="#fff" />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(76, 29, 149, 0.8)",
            border: "1px solid rgba(139, 92, 246, 0.5)",
            color: "#fff",
          }}
        />
        <Legend wrapperStyle={{ color: "#fff" }} />
        <Bar dataKey="value" fill="rgba(139, 92, 246, 0.6)" />
      </BarChart>
    </div>
  )
}

export default BarChartComponent