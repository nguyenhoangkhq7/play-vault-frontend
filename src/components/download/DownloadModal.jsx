import { useState } from "react"

export default function DownloadModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("download")
  const [expandedFaq, setExpandedFaq] = useState(null)

  if (!isOpen) return null

  const tabs = [
    { id: "about", label: "About" },
    { id: "requirements", label: "System Requirements" },
    { id: "reviews", label: "Reviews" },
    { id: "download", label: "Download" },
  ]

  const faqs = [
    { id: 1, question: "Bao lâu nữa thì bản được 1 tỷ gọi mẹ?", answer: "Câu trả lời sẽ được hiển thị ở đây." },
    { id: 2, question: "Làm sao để tải xuống?", answer: "Chọn nền tảng và nhấn vào nút tải xuống." },
    { id: 3, question: "Có miễn phí không?", answer: "Có, hoàn toàn miễn phí." },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-purple-500/30 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id ? "bg-pink-600 text-white" : "text-white hover:bg-purple-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button onClick={onClose} className="ml-auto text-white hover:text-gray-200">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Download Content */}
        <div className="p-6">
          {/* Google Drive Section */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">Google Drive:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Part 1", "Part 2", "Part 3", "Part 4"].map((part) => (
                <button
                  key={part}
                  className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
                >
                  {part}
                </button>
              ))}
            </div>
          </div>

          {/* MediaFire Section */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">MediaFire:</span>
            </div>
            <button className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">
              Full
            </button>
          </div>

          {/* Mega Section */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <span className="text-lg font-semibold text-white">Mega:</span>
            </div>
            <button className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">
              Full
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-purple-500/30"></div>

          {/* FAQ Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Câu hỏi thường gặp:</h3>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <div key={faq.id} className="overflow-hidden rounded-lg bg-black/20">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="flex w-full items-center justify-between p-4 text-left text-white transition-colors hover:bg-black/30"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <svg
                      className={`h-5 w-5 transition-transform ${expandedFaq === faq.id ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="border-t border-purple-500/30 bg-black/10 p-4 text-white/80">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
