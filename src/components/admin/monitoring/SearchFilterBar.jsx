import { SearchIcon } from "lucide-react";


export default function SearchFilterBar({ searchTerm, setSearchTerm, filter, setFilter, counts }) {
  const { all, pending, confirmed, cancelled } = counts;

  return (
    <div className="bg-[#3D1778]/50 p-4 rounded-xl shadow-lg space-y-4 md:space-y-0 md:flex items-center justify-between">
      <div className="relative flex-grow">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo mã đơn, khách hàng, trạng thái..."
          className="w-full bg-transparent border-none rounded-lg py-2 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="relative">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-auto appearance-none bg-purple-600/50 hover:bg-purple-600/80 text-white font-semibold py-2 px-4 pr-8 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="Tất cả">Tất cả ({all})</option>
          <option value="Chờ xác nhận">Chờ xác nhận ({pending})</option>
          <option value="Đã xác nhận">Đã xác nhận ({confirmed})</option>
          <option value="Đã hủy">Đã hủy ({cancelled})</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
