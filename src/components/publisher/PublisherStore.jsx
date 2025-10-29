import React from "react";
import { useOutletContext } from "react-router-dom";

export default function PublisherStore() {
  const {
    slug,
    setSlug,
    tags,
    setTags,
    age18,
    setAge18,
    controller,
    setController,
    ssRefs,
    onPickSS,
    ssUrls,
  } = useOutletContext();

  return (
    <section className="text-white">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: store settings */}
        <div className="lg:w-1/2 w-full">
          <div
            className="
              rounded-2xl border border-purple-500/40
              bg-purple-900/40 p-4 md:p-6
              shadow-[0_0_25px_rgba(236,72,153,0.25)]
              backdrop-blur-xl
            "
          >
            <h6 className="text-base font-semibold mb-4">Thiết lập cửa hàng</h6>

            {/* Slug URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-200/80 mb-1">
                Slug URL
              </label>
              <div className="flex">
                <span
                  className="
                    inline-flex items-center px-3 text-sm
                    rounded-l-lg border border-r-0 border-white/20
                    bg-black/30 text-purple-200/70
                  "
                >
                  gamehub.vn/store/
                </span>
                <input
                  type="text"
                  className="
                    flex-1 rounded-r-lg border border-white/20 bg-black/20
                    text-sm text-white placeholder-purple-200/50
                    px-3 py-2 outline-none
                    focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30
                    focus:bg-purple-800/40 transition
                  "
                  placeholder="hanh-trinh-bat-tan"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-200/80 mb-1">
                Từ khóa
              </label>
              <input
                type="text"
                className="
                  w-full rounded-lg border border-white/20 bg-black/20
                  text-sm text-white placeholder-purple-200/50
                  px-3 py-2 outline-none
                  focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30
                  focus:bg-purple-800/40 transition
                "
                placeholder="roguelike, pixel, offline"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Switches */}
            <div className="space-y-4 mt-3">
              {/* 18+ */}
              <button
                type="button"
                onClick={() => setAge18(!age18)}
                className="flex items-center gap-3 text-left"
              >
                <span
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                    border border-white/20 transition
                    ${
                      age18
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_16px_rgba(236,72,153,0.6)] border-pink-400/50"
                        : "bg-black/40"
                    }
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition
                      ${age18 ? "translate-x-5" : "translate-x-1"}
                    `}
                  />
                </span>
                <span className="text-sm text-white">
                  Giới hạn 18+
                  <span className="block text-xs text-purple-200/70">
                    {age18 ? "Yêu cầu xác nhận độ tuổi" : "Không giới hạn độ tuổi"}
                  </span>
                </span>
              </button>

              {/* Controller */}
              <button
                type="button"
                onClick={() => setController(!controller)}
                className="flex items-center gap-3 text-left"
              >
                <span
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                    border border-white/20 transition
                    ${
                      controller
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_16px_rgba(236,72,153,0.6)] border-pink-400/50"
                        : "bg-black/40"
                    }
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition
                      ${controller ? "translate-x-5" : "translate-x-1"}
                    `}
                  />
                </span>
                <span className="text-sm text-white">
                  Hỗ trợ tay cầm
                  <span className="block text-xs text-purple-200/70">
                    {controller
                      ? "Người chơi có thể dùng controller"
                      : "Chỉ hỗ trợ bàn phím và chuột"}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: screenshots */}
        <div className="lg:w-1/2 w-full">
          <div
            className="
              rounded-2xl border border-purple-500/40
              bg-purple-900/40 p-4 md:p-6
              shadow-[0_0_25px_rgba(236,72,153,0.25)]
              backdrop-blur-xl
            "
          >
            <label className="block text-sm font-medium text-purple-200/80 mb-3">
              Ảnh chụp màn hình
            </label>

            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i}>
                  {/* Dropzone for screenshot */}
                  <div
                    className="
                      flex flex-col items-center justify-center text-center
                      cursor-pointer select-none
                      rounded-xl border-2 border-dashed border-purple-400/50
                      bg-purple-950/20 px-4 py-10 text-sm
                      text-purple-200/70
                      hover:bg-purple-900/30 hover:border-pink-500/60
                      transition
                    "
                    onClick={() => ssRefs[i]?.current?.click()}
                  >
                    <i className="bi bi-cloud-upload text-2xl mb-2 text-pink-400" />
                    Ảnh {i + 1}
                    <input
                      ref={ssRefs[i]}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => onPickSS(i, e.target.files)}
                    />
                  </div>

                  {/* Preview */}
                  {ssUrls[i] && (
                    <img
                      src={ssUrls[i]}
                      alt={`ss-${i}`}
                      className="
                        w-full aspect-video object-cover rounded-lg mt-3
                        border border-purple-400/40
                        shadow-[0_0_16px_rgba(236,72,153,0.4)]
                      "
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
