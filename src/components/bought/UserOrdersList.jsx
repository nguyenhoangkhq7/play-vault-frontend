import React from 'react';
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";

/**
 * Component hiển thị danh sách đơn hàng (dạng List Card Tối giản)
 * Component này nhận dữ liệu đã fetch từ component cha (UserProfile).
 * * @param {object} props
 * @param {Array<object>} props.orders - Danh sách đơn hàng đã chuẩn hóa.
 * @param {boolean} props.isLoading - Trạng thái đang tải.
 * @param {boolean} props.isError - Trạng thái lỗi.
 * @param {function} props.refetch - Hàm tải lại dữ liệu.
 */
export default function UserOrdersList({ orders = [], isLoading, isError, refetch }) {
    const navigate = useNavigate();
    // Helper: Định dạng tiền tệ VND
    const formatCurrency = (amount) => {
        const numAmount = Number(amount);
        if (isNaN(numAmount)) return "0₫";

        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numAmount);
    };

    // Helper: Định dạng trạng thái và class CSS
    const formatStatus = (status) => {
        // Giả sử các đơn hàng game đã mua (từ library API) là đã hoàn thành
        const s = String(status).toUpperCase();
        if (s === "COMPLETED" || s === "HOÀN THÀNH" || s === "DELIVERED") {
            return { label: "Đã giao", className: "bg-green-600/90 text-white" };
        }
        // Trường hợp khác (chỉ dành cho API đơn hàng tổng quát)
        return { label: "Đang xử lý", className: "bg-yellow-600/90 text-white" };
    };
    
    // Helper: Định dạng ngày
    const formatDate = (dateString) => {
        try {
            // new Date() sẽ xử lý cả ISO string và timestamp
            return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
        } catch (e) {
            return "N/A";
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                {/* Spinner */}
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12 text-red-400">
                Không thể tải đơn hàng.{" "}
                <Button onClick={refetch} variant="link" className="text-purple-400">
                    Thử lại
                </Button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-16 w-16 text-purple-400 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                    Chưa có đơn hàng nào
                </h3>
                <p className="text-purple-300">Bạn chưa mua trò chơi nào</p>
            </div>
        );
    }

    const buttonBg = "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700";

    const handleReportClick = (orderId) => {
        navigate(`/report?orderId=${orderId}`);
    };

    return (
        <div className="space-y-4">
            {orders.map((order, idx) => {
                // Đảm bảo data từ useUserOrders đã được chuẩn hóa (như đã thảo luận)
                const statusInfo = formatStatus(order.status);
                const gameName = order.name || `Unknown Game #${idx + 1}`;
                const purchaseDate = formatDate(order.date || order.purchaseDate || new Date());
                const price = formatCurrency(order.price || 0);
                const imageUrl = order.image || order.thumbnail_image || 'https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image';

                return (
                    <div
                        key={order.id || idx}
                        className="flex items-center justify-between bg-purple-900/40 border border-purple-700/50 rounded-lg p-2 transition-colors hover:bg-purple-900/60"
                    >
                        {/* LEFT: Game Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Game Image */}
                            <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                                <LazyLoadImage
                                    src={imageUrl}
                                    alt={gameName}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    width={96} // ✅ Thêm width explicit
                                    height={96} // ✅ Thêm height explicit
                                    placeholderSrc="https://placehold.co/96x96/3a1a5e/ffffff?text=Loading" // ✅ Placeholder cùng kích thước
                                />
                            </div>
                            
                            {/* Text Info */}
                            <div className="flex flex-col justify-center min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1 truncate">
                                    {gameName}
                                </h3>
                                <div className="text-sm text-purple-300 flex items-center gap-2">
                                    Ngày mua: {purchaseDate}
                                    {/* Status Badge */}
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                                    >
                                        {statusInfo.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Price & Action Button */}
                        <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                            <div className="text-xl font-bold text-white">
                                {price}
                            </div>
                            {statusInfo.label === "Đang xử lí" || statusInfo.label === "Đang xử lý" ? (
                                <Button
                                    size="sm"
                                    className="text-sm h-10 px-4 rounded-lg text-white shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReportClick(order.id);
                                    }}
                                >
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    Report
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    className={`text-sm h-10 px-4 rounded-lg text-white shadow-lg ${buttonBg}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Tải lại game:', order.id);
                                    }}
                                >
                                    Tải lại game
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}