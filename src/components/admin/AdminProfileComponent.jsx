"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Lấy user object từ localStorage hoặc sessionStorage */
function useStoredUser() {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    "{}";
  const u = useMemo(() => {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, [raw]);

  // Chuẩn hoá field
  return {
    username: u.username || u.userName || u.name || "admin",
    email: u.email || "",
    phone: u.phone || u.phoneNumber || "",
    createdAt:
      u.createdAt || u.created_at || u.createdDate || u.created_date || null,
    avatarUrl: u.avatarUrl || u.avatar || null,
    fullName: u.fullName || u.displayName || u.username || "Admin",
  };
}

export default function AdminProfileComponent() {
  const user = useStoredUser();

  // Fallback avatar đẹp nếu chưa có ảnh
  const fallbackAvatar =
    `https://ui-avatars.com/api/` +
    `?name=${encodeURIComponent(user.fullName || user.username)}` +
    `&background=9333ea&color=fff&size=200`;

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.35)] rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">Thông tin quản trị viên</h2>
          </div>

          {/* Top: Avatar + Username */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Avatar className="h-28 w-28 border-4 border-purple-500/30">
              <AvatarImage src={user.avatarUrl || fallbackAvatar} alt="Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl">
                {(user.fullName?.[0] || user.username?.[0] || "A").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="text-white text-xl font-semibold">
                {user.username}
              </div>
              <div className="text-purple-300 text-sm">Quản trị viên</div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-xl bg-purple-900/30 border border-purple-700/40 p-4">
              <div className="text-purple-300 text-sm">Email</div>
              <div className="text-white font-medium break-words">
                {user.email || "—"}
              </div>
            </div>

            <div className="rounded-xl bg-purple-900/30 border border-purple-700/40 p-4">
              <div className="text-purple-300 text-sm">Số điện thoại</div>
              <div className="text-white font-medium">
                {user.phone || "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
