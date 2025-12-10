import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from 'react-toastify';

export default function PublisherInfo() {
  
  const {
    title, setTitle,
    summary, setSummary,
    genre, setGenre,
    platforms, togglePlatform,
    release, setRelease,
    trailer, setTrailer,
    isFree, setIsFree,
    price, setPrice,

    // from parent (đã có)
    coverUrl,
    coverInputRef,
    pickFile,
    prevent,
    onCoverFiles,

    galleryUrls,          // ✅ Cloudinary URLs từ localStorage
    galleryInputRefs,     // React.RefObject<HTMLInputElement>[4]
    onGalleryFiles,       // (index:number, files:FileList) => void
  } = useOutletContext();

  
  // ------- COMMON preview helpers -------
  const acceptTypes = /^image\/(png|jpe?g|webp|gif)$/i;
  const MAX_SIZE = 7 * 1024 * 1024; // 7MB

  const createLocalPreview = (file, revokeRefSetter) => {
    if (revokeRefSetter.current) URL.revokeObjectURL(revokeRefSetter.current);
    const url = URL.createObjectURL(file);
    revokeRefSetter.current = url;
    return url;
  };

  const validateFile = (file) => {
    if (!acceptTypes.test(file.type)) {
      toast.error("🖼️ Chỉ hỗ trợ PNG/JPG/WEBP/GIF");
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast.error("⚠️ Ảnh không được vượt quá 7MB");
      return false;
    }
    return true;
  };

  // ------- COVER (thumbnail) preview -------
  const [localPreview, setLocalPreview] = useState(null);
  const revokeRef = useRef(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (revokeRef.current) URL.revokeObjectURL(revokeRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      // revoke cho gallery
      galleryRevokeRefs.current.forEach((r) => r && URL.revokeObjectURL(r));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCoverFiles = (files) => {
    if (!files || !files.length) return;
    const file = files[0];
    if (!validateFile(file)) return;

    const url = createLocalPreview(file, revokeRef);

    // loading 3s, cho parent có thời gian upload và cập nhật coverUrl
    setPreviewLoading(true);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      setLocalPreview(url);
      setPreviewLoading(false);
      previewTimerRef.current = null;
    }, 3000);

    onCoverFiles(files); // đẩy lên parent
  };

  // ------- GALLERY (4 ô) preview -------
  // local previews cho 4 ô
  const [galleryLocalPreviews, setGalleryLocalPreviews] = useState([null, null, null, null]);
  const galleryRevokeRefs = useRef([null, null, null, null]);
  const [galleryLoading, setGalleryLoading] = useState([false, false, false, false]);
  const galleryTimers = useRef([null, null, null, null]);

  const handleGalleryFiles = (idx, files) => {
  if (!files || !files.length) return;
  const file = files[0];
  if (!validateFile(file)) return;

  // revoke URL cũ
  const prev = galleryRevokeRefs.current[idx];
  if (prev) URL.revokeObjectURL(prev);

  // tạo URL mới và lưu vào mảng revoke
  const url = URL.createObjectURL(file);
  galleryRevokeRefs.current[idx] = url;

  // loading + preview local
  setGalleryLoading((prev) => { const n=[...prev]; n[idx]=true; return n; });
  if (galleryTimers.current[idx]) clearTimeout(galleryTimers.current[idx]);
  galleryTimers.current[idx] = setTimeout(() => {
    setGalleryLocalPreviews((prev) => { const n=[...prev]; n[idx]=url; return n; });
    setGalleryLoading((prev) => { const n=[...prev]; n[idx]=false; return n; });
    galleryTimers.current[idx] = null;
  }, 5000);

  onGalleryFiles(idx, files);
};

  // UI Ô gallery dùng lại
  const GallerySlot = ({ index }) => {
    // ✅ Ưu tiên hiển thị galleryUrls (Cloudinary), fallback về local preview
    const cloudinaryUrl = galleryUrls?.[index] || "";
    const hasPreview = Boolean(cloudinaryUrl || galleryLocalPreviews[index]);
    const src = cloudinaryUrl || galleryLocalPreviews[index] || "";
    return (
      <div className="space-y-2">
        <div
          className="
            relative aspect-video rounded-xl border-2 border-dashed border-purple-400/50
            bg-purple-950/20 overflow-hidden cursor-pointer
            hover:bg-purple-900/30 hover:border-pink-500/60 transition
            flex items-center justify-center
          "
          onClick={() => pickFile(galleryInputRefs[index])}
          onDragOver={prevent}
          onDragEnter={prevent}
          onDrop={(e) => {
            prevent(e);
            handleGalleryFiles(index, e.dataTransfer.files);
          }}
        >
          {galleryLoading[index] ? (  
            <div className="flex flex-col items-center gap-2 text-purple-200/70">
              <div className="w-8 h-8 border-4 border-t-transparent border-white/60 rounded-full animate-spin" />
              <div className="text-xs">Đang tải...</div>
            </div>
            ) : hasPreview ? (  
            <img
              src={src}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder-16x9.png";
                e.currentTarget.alt = "Ảnh lỗi";
              }}
            />
            ) : (
              <div className="w-full h-full rounded-lg border border-dashed border-purple-500/30 bg-purple-950/20 flex items-center justify-center text-[10px] text-purple-300/50">
                Chưa có ảnh {index + 1}
              </div>
            )}

          <input
            ref={galleryInputRefs[index]}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleGalleryFiles(index, e.target.files)}
          />
        </div>
        <div className="text-[11px] text-purple-300/70">
          JPG/PNG/WEBP/GIF • ≤ 7MB • Tỉ lệ 16:9 gợi ý (1200×675)
        </div>
      </div>
    );
  };

  return (
    <section className="text-white">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN (form info) */}
        <div className="lg:w-2/3 w-full">
          <div className="h-full rounded-2xl border border-purple-500/40 bg-purple-900/40 p-4 md:p-6 shadow-[0_0_25px_rgba(236,72,153,0.25)] backdrop-blur-xl">
            {/* Tên game */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-200/80 mb-1">
                Tên game <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="w-full rounded-lg border border-white/20 bg-black/20 text-sm text-white placeholder-purple-200/50 px-3 py-2 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 focus:bg-purple-800/40 transition"
                placeholder="Ví dụ: Hành Trình Bất Tận"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Mô tả ngắn */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-200/80 mb-1">
                Mô tả ngắn <span className="text-pink-400">*</span>
              </label>
              <textarea
                name="summary"
                rows={3}
                className="w-full rounded-lg border border-white/20 bg-black/20 text-sm text-white placeholder-purple-200/50 px-3 py-2 outline-none resize-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 focus:bg-purple-800/40 transition"
                placeholder="Giới thiệu ngắn gọn về game..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </div>

            {/* Thể loại + Nền tảng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thể loại */}
              <div>
                <label className="block text-sm font-medium text-purple-200/80 mb-1">
                  Thể loại <span className="text-pink-400">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-white/20 bg-black/20 text-sm text-white px-3 py-2 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 focus:bg-purple-800/40 transition"
                  name="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required
                >
                  <option value="">— Chọn —</option>
                  <option>Hành động</option>
                  <option>Phiêu lưu</option>
                  <option>Nhập vai</option>
                  <option>Chiến thuật</option>
                  <option>Mô phỏng</option>
                  <option>Thể thao</option>
                  <option>Indie</option>
                </select>
              </div>

              {/* Nền tảng */}
              <div>
                <label className="block text-sm font-medium text-purple-200/80 mb-1">
                  Nền tảng hỗ trợ <span className="text-pink-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {["PC", "Mobile", "PlayStation", "Xbox", "Nintendo Switch"].map((p) => (
                    <label
                      key={p}
                      className={`flex items-center gap-2 text-xs font-medium rounded-lg border border-purple-400/40 bg-purple-900/40 px-3 py-2 cursor-pointer shadow-[0_0_10px_rgba(236,72,153,0.15)] hover:border-pink-400/60 hover:bg-purple-800/40 transition ${
                        platforms.includes(p)
                          ? "border-pink-500/70 bg-purple-800/50 text-white shadow-[0_0_16px_rgba(236,72,153,0.4)]"
                          : "text-purple-200/80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border border-white/30 bg-black/40 text-pink-500 focus:ring-2 focus:ring-pink-500/40 focus:ring-offset-0"
                        checked={platforms.includes(p)}
                        onChange={() => togglePlatform(p)}
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Ngày phát hành + Trailer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-purple-200/80 mb-1">
                  Ngày phát hành dự kiến <span className="text-pink-400">*</span>
                </label>
                <input
                  type="date"
                  name="release"
                  value={release}
                  onChange={(e) => setRelease(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-black/20 text-sm text-white px-3 py-2 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 focus:bg-purple-800/40 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200/80 mb-1">
                  Trailer (YouTube URL) <span className="text-pink-400">*</span>
                </label>
                <input
                  type="url"
                  name="trailer"
                  value={trailer}
                  onChange={(e) => setTrailer(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full rounded-lg border border-white/20 bg-black/20 text-sm text-white placeholder-purple-200/50 px-3 py-2 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 focus:bg-purple-800/40 transition"
                  required
                />
              </div>
            </div>

            {/* Miễn phí + Giá */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-purple-200/80 mb-2">
                  Hình thức phát hành <span className="text-pink-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsFree(!isFree)}
                  className="flex items-center gap-3 text-left"
                >
                  <span
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border border-white/20 transition ${
                      isFree
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_16px_rgba(236,72,153,0.6)] border-pink-400/50"
                        : "bg-black/40"
                    }`}
                    role="switch"
                    aria-checked={isFree}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ${
                        isFree ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </span>

                  <span className="text-sm text-white">
                    Miễn phí{" "}
                    <span className="text-xs text-purple-200/70 block">
                      {isFree
                        ? "Người chơi tải xuống không tốn phí"
                        : "Bật để phát hành free-to-play"}
                    </span>
                  </span>
                </button>
              </div>

              {!isFree && (
                <div>
                  <label className="block text-sm font-medium text-purple-200/80 mb-1">
                    Giá (VND) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    name="price"
                    className="w-full rounded-lg border border-white/20 bg-black/20 text-sm text-white placeholder-purple-200/50 px-3 py-2 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 focus:bg-purple-800/40 transition"
                    placeholder="99000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required={!isFree}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (thumbnail + gallery) */}
        <div className="lg:w-1/3 w-full">
          {/* Cover */}
          <div className="rounded-2xl border border-purple-500/40 bg-purple-900/40 p-4 md:p-6 shadow-[0_0_25px_rgba(236,72,153,0.25)] backdrop-blur-xl">
            <label className="block text-sm font-medium text-purple-200/80 mb-3">
              Ảnh bìa (JPG/PNG/WEBP ≤ 7MB) <span className="text-pink-400">*</span>
            </label>

            <div
              className="flex flex-col items-center justify-center text-center cursor-pointer select-none rounded-xl border-2 border-dashed border-purple-400/50 bg-purple-950/20 px-4 py-10 text-sm text-purple-200/70 hover:bg-purple-900/30 hover:border-pink-500/60 transition"
              onClick={() => pickFile(coverInputRef)}
              onDragOver={prevent}
              onDragEnter={prevent}
              onDrop={(e) => {
                prevent(e);
                handleCoverFiles(e.dataTransfer.files);
              }}
            >
              <i className="bi bi-cloud-upload text-2xl mb-2 text-pink-400" />
              <span className="leading-relaxed">
                Kéo thả hoặc <span className="text-white font-semibold">chọn tệp</span>
              </span>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleCoverFiles(e.target.files)}
              />
            </div>

            {/* Preview + note */}
            <div className="flex items-start gap-3 mt-4">
              {previewLoading ? (
                <div className="w-[120px] h-[68px] rounded-lg border border-purple-400/20 bg-purple-900/30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-4 border-t-transparent border-white/60 rounded-full animate-spin" />
                    <div className="text-[11px] text-purple-200/70">Đang tải...</div>
                  </div>
                </div>
              ) : (localPreview || coverUrl) ? (
                <img
                  src={localPreview}
                  alt="Preview"
                  className="w-[120px] h-[68px] rounded-lg object-cover border border-purple-400/40 shadow-[0_0_16px_rgba(236,72,153,0.4)]"
                  onError={(e) => { e.currentTarget.src = "/images/placeholder-16x9.png"; }}
                />
              ) : (
                <div className="w-[120px] h-[68px] rounded-lg border border-dashed border-purple-500/30 bg-purple-950/20 flex items-center justify-center text-[10px] text-purple-300/50">
                  Chưa có ảnh
                </div>
              )}
              <div className="text-[11px] leading-relaxed text-purple-200/70">
                Tối thiểu <span className="text-white font-medium">1200×675px</span>.<br />
                Dung lượng ≤ <span className="text-white font-medium">7MB</span>.
              </div>
            </div>
          </div>

          {/* GALLERY (4 ô) */}
          <div className="rounded-2xl border border-purple-500/40 bg-purple-900/40 p-4 md:p-6 shadow-[0_0_25px_rgba(236,72,153,0.25)] backdrop-blur-xl mt-6">
            <label className="block text-sm font-medium text-purple-200/80 mb-3">
              Ảnh gallery
            </label>

            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <GallerySlot key={i} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
