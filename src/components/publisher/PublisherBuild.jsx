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
    <section>
      <div className="row g-4">
        {/* Khối upload build */}
        <div className="col-lg-7">
          <div className="glass-2 build-card p-3 p-md-4 h-100">
            <label className="form-label required text-muted-subtle">
              Tải bản build
            </label>

            {/* Dropzone */}
            <div
              className="upload-drop build-dropzone text-secondary mb-3"
              onClick={() => pickFile(buildInputRef)}
              onDragOver={prevent}
              onDragEnter={prevent}
              onDrop={(e) => {
                prevent(e);
                onBuildFiles(e.dataTransfer.files);
              }}
            >
              <i className="bi bi-cloud-upload fs-3 d-block mb-2" />
              Kéo thả ZIP (Windows/macOS/Linux) hoặc{" "}
              <span className="text-white fw-semibold">chọn tệp</span>
              <input
                ref={buildInputRef}
                type="file"
                accept=".zip,.7z,.rar"
                hidden
                onChange={(e) => onBuildFiles(e.target.files)}
              />
            </div>

            {/* Progress */}
            <div className="d-flex align-items-center gap-3">
              <div
                className="progress pretty-progress flex-grow-1"
                style={{ height: 10 }}
              >
                <div
                  className="progress-bar"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>

              <span className="small text-secondary">
                {isUploading
                  ? "Đang tải lên..."
                  : buildName
                  ? `Hoàn tất · ${buildName}`
                  : "Chưa tải lên"}
              </span>
            </div>
          </div>
        </div>

        {/* Khối ghi chú phát hành */}
        <div className="col-lg-5">
          <div className="glass-2 build-note-card p-3 p-md-4 h-100">
            <h6 className="fw-bold text-white mb-3">Ghi chú phát hành</h6>

            <textarea
              className="form-control mb-3"
              rows={7}
              placeholder="Nội dung cập nhật, yêu cầu cấu hình, known issues..."
            />

            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <label className="form-label text-muted-subtle">
                  Yêu cầu tối thiểu (RAM)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="8 GB"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted-subtle">
                  Dung lượng sau cài đặt
                </label>
                <input
                  type="text"
                  className="form-control"
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
