import { Activity, ServerCrash } from "lucide-react"

export default function SystemHealthTable({ data }) {
  return (
    <div className="bg-purple-800/50 backdrop-blur-md p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-pink-200">Tình trạng dịch vụ hệ thống</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-purple-700 text-white">
              <th className="p-2">Dịch vụ</th>
              <th className="p-2">Uptime (%)</th>
              <th className="p-2">Sự cố</th>
              <th className="p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.map((service, index) => (
              <tr key={index} className="border-b border-purple-600/40 hover:bg-purple-700/30">
                <td className="p-2 font-medium">{service.service}</td>
                <td className="p-2">{service.uptime}%</td>
                <td className="p-2">{service.incidents}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {service.uptime > 99.8 ? (
                      <span className="flex items-center text-green-400">
                        <Activity className="h-4 w-4 mr-1" /> Stable
                      </span>
                    ) : (
                      <span className="flex items-center text-red-400">
                        <ServerCrash className="h-4 w-4 mr-1" /> Degraded
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
