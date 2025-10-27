import React from "react";
import { useOutletContext } from "react-router-dom";

export default function PublisherBuild() {
  const {
    buildInputRef,
    pickFile,
    prevent,
    onBuildFiles,
    buildProgress,
    isUploading,
    buildName,
  } = useOutletContext();

  return (
    <section className="text-white">
      {/* layout 2 cột: 7/5 trên desktop, stacked trên mobile */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* --- Upload build card --- */}
        <div className="lg:w-7/12 w-full">
          <div
            className="
              h-full
              rounded-2xl border border-purple-500/40
              bg-purple-900/40 p-4 md:p-6
              shadow-[0_0_25px_rgba(236,72,153,0.25)]
              backdrop-blur-xl
            "
          >
            {/* Label */}
            <label className="block text-sm font-medium text-purple-200/80 mb-3">
              Tải bản build <span className="text-pink-400">*</span>
            </label>

            {/* Dropzone */}
            <div
              className="
                flex flex-col items-center justify-center text-center
                cursor-pointer select-none
                rounded-xl border-2 border-dashed border-purple-400/50
                bg-purple-950/20 px-4 py-10 mb-4
                text-purple-200/70 text-sm
                hover:bg-purple-900/30 hover:border-pink-500/60
                transition
              "
              onClick={() => pickFile(buildInputRef)}
              onDragOver={prevent}
              onDragEnter={prevent}
              onDrop={(e) => {
                prevent(e);
                onBuildFiles(e.dataTransfer.files);
              }}
            >
              <i className="bi bi-cloud-upload text-2xl mb-2 text-pink-400" />
              <span className="leading-relaxed">
                Kéo thả ZIP (Windows/macOS/Linux) hoặc{" "}
                <span className="text-white font-semibold">chọn tệp</span>
              </span>

              <input
                ref={buildInputRef}
                type="file"
                accept=".zip,.7z,.rar"
                hidden
                onChange={(e) => onBuildFiles(e.target.files)}
              />
            </div>

            {/* Progress bar + status */}
            <div className="flex items-center gap-3">
              {/* progress wrapper */}
              <div className="w-full h-2 rounded-full bg-purple-900/40 border border-purple-500/30 shadow-inner overflow-hidden">
                <div
                  className="
                    h-full rounded-full
                    bg-gradient-to-r from-pink-500 to-purple-500
                    shadow-[0_0_12px_rgba(236,72,153,0.6)]
                    transition-all
                  "
                  style={{ width: `${buildProgress}%` }}
                />
              </div>

              <span className="text-[11px] text-purple-200/70 whitespace-nowrap">
                {isUploading
                  ? "Đang tải lên..."
                  : buildName
                  ? `Hoàn tất · ${buildName}`
                  : "Chưa tải lên"}
              </span>
            </div>
          </div>
        </div>

        {/* --- Release notes / yêu cầu cấu hình --- */}
        <div className="lg:w-5/12 w-full">
          <div
            className="
              h-full
              rounded-2xl border border-purple-500/40
              bg-purple-900/40 p-4 md:p-6
              shadow-[0_0_25px_rgba(236,72,153,0.25)]
              backdrop-blur-xl
            "
          >
            <h6 className="text-white font-semibold text-sm mb-3">
              Ghi chú phát hành
            </h6>

            <textarea
              className="
                w-full rounded-lg border border-white/20 bg-black/20
                text-sm text-white placeholder-purple-200/50
                px-3 py-2 outline-none
                focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30
                focus:bg-purple-800/40 transition
                mb-4
              "
              rows={7}
              placeholder="Nội dung cập nhật, yêu cầu cấu hình, known issues..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RAM requirement */}
              <div>
                <label className="block text-xs font-medium text-purple-200/80 mb-1">
                  Yêu cầu tối thiểu (RAM)
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
                  placeholder="8 GB"
                />
              </div>

              {/* Disk size */}
              <div>
                <label className="block text-xs font-medium text-purple-200/80 mb-1">
                  Dung lượng sau cài đặt
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
                  placeholder="10 GB"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
