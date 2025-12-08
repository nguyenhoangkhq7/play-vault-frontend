"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { fetchRevenueTrend, fetchGameRevenue } from "../../api/report";

export default function RevenueAnalytics({ dateFilter }) {
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Gọi song song 2 API để tối ưu tốc độ
        const [trendRes, gameRes] = await Promise.all([
          fetchRevenueTrend(dateFilter.from, dateFilter.to),
          fetchGameRevenue(dateFilter.from, dateFilter.to),
        ]);

        // 1. Xử lý dữ liệu biểu đồ Trend (Format Date)
        const formattedTrend = trendRes.map((item) => ({
          ...item,
          displayDate: new Date(item.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
        }));
        setTrendData(formattedTrend);

        // 2. Xử lý dữ liệu biểu đồ Category (Nhóm game theo category)
        const catMap = {};
        gameRes.forEach((game) => {
          const cat = game.category || "Khác";
          if (!catMap[cat]) catMap[cat] = 0;
          catMap[cat] += game.revenue;
        });

        // Chuyển Map thành Array và tính %
        const totalRev = Object.values(catMap).reduce((a, b) => a + b, 0);
        const formattedCat = Object.keys(catMap)
          .map((cat) => ({
            category: cat,
            revenue: catMap[cat],
            percentage:
              totalRev > 0 ? ((catMap[cat] / totalRev) * 100).toFixed(1) : 0,
          }))
          .sort((a, b) => b.revenue - a.revenue); // Sort giảm dần

        setCategoryData(formattedCat);
      } catch (error) {
        console.error("Chart data error", error);
      } finally {
        setLoading(false);
      }
    };
    if (dateFilter.from && dateFilter.to) loadData();
  }, [dateFilter]);

  if (loading)
    return (
      <div className="text-white py-10 text-center animate-pulse">
        Đang vẽ biểu đồ phân tích...
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend Chart */}
      <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">
          Xu hướng doanh thu
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
            <XAxis dataKey="displayDate" stroke="#e9d5ff" fontSize={12} />
            <YAxis
              stroke="#e9d5ff"
              tickFormatter={(value) =>
                new Intl.NumberFormat("en", { notation: "compact" }).format(
                  value
                )
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#581c87",
                border: "1px solid #a855f7",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fdf4ff" }}
              formatter={(value) =>
                `${new Intl.NumberFormat("fr-FR").format(value)} GCoin`
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ec4899"
              fillOpacity={1}
              fill="url(#revenueGradient)"
              name="Tổng doanh thu"
            />
          </AreaChart>
        </ResponsiveContainer>
        {trendData.length === 0 && (
          <p className="text-center text-pink-200 mt-2 text-sm">
            Chưa có dữ liệu doanh thu trong khoảng này.
          </p>
        )}
      </div>

      {/* Category Revenue Chart */}
      <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">
          Doanh thu theo thể loại
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#4c1d95"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#e9d5ff"
              tickFormatter={(value) =>
                new Intl.NumberFormat("en", { notation: "compact" }).format(
                  value
                )
              }
            />
            <YAxis
              dataKey="category"
              type="category"
              stroke="#e9d5ff"
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#581c87",
                border: "1px solid #a855f7",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fdf4ff" }}
              formatter={(value) =>
                `${new Intl.NumberFormat("fr-FR").format(value)} GCoin`
              }
            />
            <Bar
              dataKey="revenue"
              fill="#ec4899"
              radius={[0, 4, 4, 0]}
              barSize={20}
              name="Tổng doanh thu"
            />
          </BarChart>
        </ResponsiveContainer>
        {categoryData.length === 0 && (
          <p className="text-center text-pink-200 mt-2 text-sm">
            Chưa có dữ liệu thể loại.
          </p>
        )}
      </div>
    </div>
  );
}
