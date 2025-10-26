import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function TopGamesChart({ data }) {
  return (
    <div className="bg-purple-800/50 backdrop-blur-md p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-pink-200">Top game doanh thu cao nhất</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip contentStyle={{ backgroundColor: "#1f1f1f", color: "#fff" }} />
          <Bar dataKey="sales" fill="#ec4899" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
