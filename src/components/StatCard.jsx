function StatCard({ title, value, change, isPositive }) {
    return (
      <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
        <h3 className="text-lg font-semibold text-purple-100">{title}</h3>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        <p
          className={`text-sm mt-2 ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {isPositive ? "+" : "-"}
          {change} so với tháng trước
        </p>
      </div>
    )
  }
  
  export default StatCard