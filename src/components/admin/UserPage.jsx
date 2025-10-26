"use client"

import { Search, ChevronRight } from "lucide-react"
import { useState } from "react"
import Footer from "../home/footer";
export default function UserPage() {
  const [activeTab, setActiveTab] = useState("publisher")
  const [searchQuery, setSearchQuery] = useState("")

  const publishers = [
    {
      id: "P-10111",
      name: "GameDev Studio X",
      email: "contact@x.com",
      createdDate: "20-10-2024",
      gameCount: 12,
      status: "active",
    },
    {
      id: "P-10111",
      name: "GameDev Studio X",
      email: "contact@x.com",
      createdDate: "20-10-2024",
      gameCount: 12,
      status: "banned",
    },
    {
      id: "P-10111",
      name: "GameDev Studio X",
      email: "contact@x.com",
      createdDate: "20-10-2024",
      gameCount: 12,
      status: "pending",
    },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex w-32 items-center justify-center rounded-full bg-green-600/50 px-4 py-1.5 text-sm font-medium text-white">
            Active
          </span>
        )
      case "banned":
        return (
          <span className="inline-flex w-32 items-center justify-center rounded-full bg-orange-600/50 px-4 py-1.5 text-sm font-medium text-white">
            Banned
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex w-32 flex-col items-center justify-center rounded-full border-2 border-purple-400 bg-purple-600/50 px-4 py-2 text-sm font-medium leading-tight text-purple-200">
            <span>Pending</span>
            <span>preview</span>
          </span>
        )
    }
  }

  const getActionButton = (status) => {
    if (status === "active") {
      return (
        <button className="w-28 rounded-lg bg-red-600/50 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600/70">
          Chặn
        </button>
      )
    }
    return (
      <button className="w-28 rounded-lg bg-green-600/50 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600/70">
        Kích hoạt
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="border-b-2 border-white pb-2 text-left text-3xl font-bold text-white">
            Admin quản lí tài khoản
          </h1>
        </div>

        <div className="mb-6 flex gap-0">
          <button
            onClick={() => setActiveTab("user")}
            className={`rounded-tl-lg rounded-tr-lg px-8 py-3 text-base font-medium transition-colors ${
              activeTab === "user"
                ? "bg-purple-600 text-white"
                : "bg-purple-900/60 text-purple-200 hover:bg-purple-800/50"
            }`}
          >
            Người dùng (User)
          </button>
          <button
            onClick={() => setActiveTab("publisher")}
            className={`rounded-tl-lg rounded-tr-lg px-8 py-3 text-base font-medium transition-colors ${
              activeTab === "publisher"
                ? "bg-purple-600 text-white"
                : "bg-purple-900/60 text-purple-200 hover:bg-purple-800/50"
            }`}
          >
            Nhà phát hành (Publisher)
          </button>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Tìm theo ID, Tên, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-purple-800/50 py-3 pl-12 pr-4 text-white placeholder-purple-300 outline-none ring-2 ring-purple-600 transition-all focus:ring-purple-500"
          />
        </div>

        <div className="overflow-hidden rounded-xl bg-purple-900/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-purple-200">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-purple-200">
                    Tên
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-purple-200">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-purple-200">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-purple-200">
                    Số game
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-purple-200">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-purple-200">
                    Xử lí
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-800/50">
                {publishers.map((publisher, index) => (
                  <tr key={index} className="transition-colors hover:bg-purple-800/30">
                    <td className="px-6 py-4 text-sm text-white">{publisher.id}</td>
                    <td className="px-6 py-4 text-sm text-white">{publisher.name}</td>
                    <td className="px-6 py-4 text-sm text-white">{publisher.email}</td>
                    <td className="px-6 py-4 text-sm text-white">{publisher.createdDate}</td>
                    <td className="px-6 py-4 text-sm text-white">{publisher.gameCount}</td>
                    <td className="px-6 py-4">{getStatusBadge(publisher.status)}</td>
                    <td className="px-6 py-4">{getActionButton(publisher.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

        <Footer />
    </div>
  )
}
