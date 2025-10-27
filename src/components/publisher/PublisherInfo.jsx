import React from "react";
import { useOutletContext } from "react-router-dom";

export default function PublisherInfo() {
  const {
    title,
    setTitle,
    summary,
    setSummary,
    genre,
    setGenre,
    platforms,
    togglePlatform,
    release,
    setRelease,
    trailer,
    setTrailer,
    isFree,
    setIsFree,
    price,
    setPrice,
    coverUrl,
    coverInputRef,
    pickFile,
    prevent,
    onCoverFiles,
  } = useOutletContext();

  return (
    <section>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="glass-2 p-3 p-md-4 h-100">
            <div className="mb-3">
              <label className="form-label required">Tên game</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="Ví dụ: Hành Trình Bất Tận"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label required">Mô tả ngắn</label>
              <textarea
                name="summary"
                className="form-control"
                rows={3}
                placeholder="Giới thiệu ngắn gọn về game..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label required">Thể loại</label>
                <select
                  className="form-select"
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
              <div className="col-md-6">
                <label className="form-label">Nền tảng hỗ trợ</label>
                <div className="d-flex flex-wrap gap-2">
                  {["Windows", "macOS", "Linux"].map((p) => (
                    <label className="tag" key={p}>
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        checked={platforms.includes(p)}
                        onChange={() => togglePlatform(p)}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <label className="form-label">Ngày phát hành dự kiến</label>
                <input
                  type="date"
                  className="form-control"
                  name="release"
                  value={release}
                  onChange={(e) => setRelease(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Trailer (YouTube URL)</label>
                <input
                  type="url"
                  className="form-control"
                  name="trailer"
                  placeholder="https://youtu.be/..."
                  value={trailer}
                  onChange={(e) => setTrailer(e.target.value)}
                />
              </div>
            </div>
            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="freeSwitch"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="freeSwitch">
                    Miễn phí
                  </label>
                </div>
              </div>
              <div className={`col-md-6 ${isFree ? "d-none" : ""}`}>
                <label className="form-label required">Giá (VND)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  className="form-control"
                  name="price"
                  placeholder="99000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required={!isFree}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass-2 p-3 p-md-4">
            <label className="form-label">Ảnh bìa (JPG/PNG)</label>
            <div
              className="upload-drop text-secondary"
              onClick={() => pickFile(coverInputRef)}
              onDragOver={prevent}
              onDragEnter={prevent}
              onDrop={(e) => {
                prevent(e);
                onCoverFiles(e.dataTransfer.files);
              }}
            >
              <i className="bi bi-cloud-upload fs-3 d-block mb-2" />
              Kéo thả hoặc <span className="text-white">chọn tệp</span>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onCoverFiles(e.target.files)}
              />
            </div>
            <div className="mt-3 d-flex align-items-center gap-3">
              {coverUrl ? (
                <img src={coverUrl} className="thumb" alt="cover preview" />
              ) : (
                <img className="thumb d-none" alt="cover preview" />
              )}
              <div className="small text-secondary">Tối thiểu 1200×675px. Dung lượng ≤ 2MB.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
