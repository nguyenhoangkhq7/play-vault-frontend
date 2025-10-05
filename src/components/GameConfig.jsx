function GameConfig({ minimum, recommended }) {
    return (
      <div className="grid md:grid-cols-2 gap-8 p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
            Minimum Configuration
          </h3>
          <ul className="space-y-2 text-purple-100">
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">OS:</span>
              <span>{minimum.os}</span>
            </li>
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">CPU:</span>
              <span>{minimum.cpu}</span>
            </li>
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">RAM:</span>
              <span>{minimum.ram}</span>
            </li>
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">GPU:</span>
              <span>{minimum.gpu}</span>
            </li>
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">Disk:</span>
              <span>{minimum.disk}</span>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
            Recommended Configuration
          </h3>
          <ul className="space-y-2 text-purple-100">
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">OS:</span>
              <span>{recommended.os}</span>
            </li>
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">CPU:</span>
              <span>{recommended.cpu}</span>
            </li>
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">RAM:</span>
              <span>{recommended.ram}</span>
            </li>
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">GPU:</span>
              <span>{recommended.gpu}</span>
            </li>
            <li className="flex">
              <span className="text-purple-300 font-medium w-20">Disk:</span>
              <span>{recommended.disk}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  
  export default GameConfig
  