import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function ActivityChart({ data }) {
  return (
    <div className="bg-purple-800/50 backdrop-blur-md p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-pink-200">Lưu lượng người dùng theo giờ (Realtime)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <XAxis dataKey="time" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip contentStyle={{ backgroundColor: "#1f1f1f", color: "#fff" }} />
          <Area type="monotone" dataKey="users" stroke="#22c55e" fill="#86efac" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
