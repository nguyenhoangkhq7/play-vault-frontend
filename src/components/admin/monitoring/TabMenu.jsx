import React, { useRef } from "react";

export default function TabMenu({ activeTab, setActiveTab }) {
  const ordersTabRef = useRef(null);
  const errorsTabRef = useRef(null);

  const getUnderlineStyle = () => {
    const ref = activeTab === "orders" ? ordersTabRef : errorsTabRef;
    if (!ref.current) return {};
    return {
      left: ref.current.offsetLeft,
      width: ref.current.offsetWidth,
    };
  };

  const underlineStyle = getUnderlineStyle();

  return (
    <div className="relative flex border-b border-purple-500/50 mb-6   p-2">
      <button
        ref={ordersTabRef}
        onClick={() => setActiveTab("orders")}
        className={`py-2 px-6 text-lg font-semibold transition-colors duration-300 ${
          activeTab === "orders" ? "text-white" : "text-gray-300"
        }`}
      >
        Lỗi thanh toán
      </button>
      <button
        ref={errorsTabRef}
        onClick={() => setActiveTab("errors")}
        className={`py-2 px-6 text-lg font-semibold transition-colors duration-300 ${
          activeTab === "errors" ? "text-white" : "text-gray-300"
        }`}
      >
        Lỗi game
      </button>

      <div
        className="absolute bottom-0 h-0.5 bg-pink-500 transition-all duration-300 ease-in-out"
        style={underlineStyle}
      ></div>
    </div>
  );
}
