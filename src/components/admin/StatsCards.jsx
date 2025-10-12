export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-500 p-4 rounded-xl shadow-md flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-200">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          </div>
          <stat.icon className="h-8 w-8 text-white opacity-90" />
        </div>
      ))}
    </div>
  )
}
