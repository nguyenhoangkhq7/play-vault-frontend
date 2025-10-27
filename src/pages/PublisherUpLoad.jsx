import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import PublisherInfo from "../components/publisher/PublisherInfo.jsx";
import PublisherBuild from "../components/publisher/PublisherBuild.jsx";
import PublisherStore from "../components/publisher/PublisherStore.jsx";

export default function PublisherUpload() {
  return <PublisherUploadInner />;
}

function PublisherUploadInner() {
  const navigate = useNavigate();
  const location = useLocation();

  // ---------------------- Form state ----------------------
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [genre, setGenre] = useState("");
  const [platforms, setPlatforms] = useState([]); // ["Windows", "macOS", "Linux"]
  const [release, setRelease] = useState("");
  const [trailer, setTrailer] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");

  // Cover upload
  const [coverUrl, setCoverUrl] = useState("");
  const coverInputRef = useRef(null);

  // Build upload
  const buildInputRef = useRef(null);
  const [buildName, setBuildName] = useState("");
  const [buildProgress, setBuildProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const uploadTimerRef = useRef(null);

  // Screenshots
  const ssRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [ssUrls, setSsUrls] = useState(["", "", "", ""]);

  // Store config
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [age18, setAge18] = useState(false);
  const [controller, setController] = useState(false);

  // ---------------------- Helpers ----------------------
  const togglePlatform = (value) => {
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const pickFile = (ref) => ref.current?.click();

  const readAsDataURL = (file, cb) => {
    const reader = new FileReader();
    reader.onload = (e) => cb(String(e.target?.result || ""));
    reader.readAsDataURL(file);
  };

  // Drag & drop binders (generic)
  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Cover handlers
  const onCoverFiles = (files) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Vui lòng chọn ảnh (JPG/PNG)");
      return;
    }
    readAsDataURL(f, setCoverUrl);
  };

  // Build handlers (fake progress demo)
  const onBuildFiles = (files) => {
    const f = files?.[0];
    if (!f) return;
    if (!/(zip|7z|rar)$/i.test(f.name)) {
      alert("Chỉ nhận .zip, .7z, .rar");
      return;
    }
    setBuildName(f.name);
    setIsUploading(true);
    setBuildProgress(0);
    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
    uploadTimerRef.current = setInterval(() => {
      setBuildProgress((p) => {
        const next = Math.min(100, p + Math.random() * 12 + 5);
        if (next >= 100) {
          clearInterval(uploadTimerRef.current);
          uploadTimerRef.current = null;
          setIsUploading(false);
        }
        return next;
      });
    }, 250);
  };

  useEffect(
    () => () => uploadTimerRef.current && clearInterval(uploadTimerRef.current),
    []
  );

  // Screenshots handlers
  const onPickSS = (idx, files) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    readAsDataURL(f, (url) =>
      setSsUrls((prev) => prev.map((u, i) => (i === idx ? url : u)))
    );
  };

  // ---------------------- Progress compute ----------------------
  const progress = useMemo(() => {
    const required = [
      Boolean(title.trim()),
      Boolean(summary.trim()),
      Boolean(genre.trim()),
      // price required if not free
      isFree ? true : Boolean(String(price).trim()),
      Boolean(buildName.trim()),
    ];
    const filled = required.filter(Boolean).length;
    const pct = Math.round((filled / required.length) * 100) || 0;
    return pct;
  }, [title, summary, genre, isFree, price, buildName]);

  // ---------------------- Actions ----------------------
  const onSaveDraft = () => alert("Đã lưu bản nháp (demo).");
  const onSubmitReview = () => alert("Đã gửi duyệt (demo).");

  // ---------------------- Step Navigation ----------------------
  // logic điều hướng theo thứ tự info -> build -> store
  const goNextStep = () => {
    if (location.pathname.endsWith("/build")) {
      navigate("/publisher/upload/store");
    } else if (location.pathname.endsWith("/store")) {
      // bước cuối: không chuyển nữa
      return;
    } else {
      // mặc định coi như đang ở /publisher/upload (info)
      navigate("/publisher/upload/build");
    }
  };

  const isLastStep = location.pathname.endsWith("/store");

  // ---------------------- Render ----------------------
  return (
    <div className="publisher-root" data-bs-theme="dark">
      {/* Site navbar (restore global header) */}
      <div className="fixed top-0 left-20 right-0 z-50">
        <Navbar />
      </div>

      {/* Left publisher sidebar (step navigation) */}
      <div className="sidebar d-flex flex-column align-items-center py-3">
        <nav className="nav flex-column gap-2 w-100" style={{ alignItems: 'center' }}>
          <button
            type="button"
            className={`nav-link d-flex align-items-center justify-content-center p-2 ${
              location.pathname.endsWith('/build') || location.pathname.endsWith('/store') ? '' : 'active'
            }`}
            title="Thông tin"
            onClick={() => navigate('/publisher/upload')}
          >
            <i className="bi bi-info-circle" />
          </button>

          <button
            type="button"
            className={`nav-link d-flex align-items-center justify-content-center p-2 ${
              location.pathname.endsWith('/build') ? 'active' : ''
            }`}
            title="Build"
            onClick={() => navigate('/publisher/upload/build')}
          >
            <i className="bi bi-hdd-network" />
          </button>

          <button
            type="button"
            className={`nav-link d-flex align-items-center justify-content-center p-2 ${
              location.pathname.endsWith('/store') ? 'active' : ''
            }`}
            title="Store"
            onClick={() => navigate('/publisher/upload/store')}
          >
            <i className="bi bi-shop" />
          </button>
        </nav>
      </div>

      <div className="page-wrap">
        

        {/* Main */}
        <main className="container py-30">
          <div className="glass p-4">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
              <div>
                <h2 className="section-title h4 mb-3">Thông tin phát hành</h2>
                <p className="text-secondary mb-2">Nhập chi tiết game của bạn và tải lên bản build để xuất bản trên GameHub.</p>
              </div>
              <div className="text-end">
                <div className="small text-secondary mb-1">Tiến độ hoàn thành</div>
                <div className="progress" style={{ width: 260, height: 8 }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* Không còn nav tabs. Chỉ render đúng step hiện tại */}

            <form onSubmit={(e) => e.preventDefault()} className="tab-content">
              <Outlet
                context={{
                  // form state
                  title, setTitle,
                  summary, setSummary,
                  genre, setGenre,
                  platforms, togglePlatform,
                  release, setRelease,
                  trailer, setTrailer,
                  isFree, setIsFree,
                  price, setPrice,
                  // cover
                  coverUrl, coverInputRef, pickFile, prevent, onCoverFiles,
                  // build
                  buildInputRef, onBuildFiles, buildName, buildProgress, isUploading,
                  // screenshots
                  ssRefs, ssUrls, onPickSS,
                  // store
                  slug, setSlug,
                  tags, setTags,
                  age18, setAge18,
                  controller, setController,
                }}
              />

              {/* CTA + Actions */}
              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                {!isLastStep && (
                  <button type="button" className="btn btn-gradient" onClick={goNextStep}>
                    Tiếp tục <i className="bi bi-arrow-right-circle ms-1" />
                  </button>
                )}
                <button type="button" className="btn btn-outline-light" onClick={onSaveDraft}>
                  <i className="bi bi-save me-1" />Lưu nháp
                </button>
                <button type="button" className="btn btn-gradient" onClick={onSubmitReview}>
                  <i className="bi bi-send-check me-1" />Gửi duyệt
                </button>
              </div>
            </form>
          </div>
        </main>
        {/* Restore global footer */}
        <div className="mt-6">
          <Footer />
        </div>
      </div>

      {/* Styles */}
      <style>{`
        :root{
          --bg-outer:#3B0764; --bg-mid:#581C87; --bg-inner:#6B21A8;
          --purple-700:#7E22CE; --purple-600:#9333EA;
          --pink-600:#DB2777;
          --text:#ffffff; --muted:#D8B4FE; --outline:rgba(126,34,206,.45);
        }
        .publisher-root{ min-height:100vh; color:var(--text);
          background:
            radial-gradient(1200px 600px at 15% 10%, rgba(244,114,182,.14), transparent),
            radial-gradient(1000px 500px at 85% 20%, rgba(147,51,234,.16), transparent),
            linear-gradient(135deg, var(--bg-inner) 0%, var(--bg-mid) 50%, var(--bg-outer) 100%);
        }
        .glass{ background:rgba(59,7,100,.6); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-radius:20px; box-shadow:0 20px 40px rgba(0,0,0,.35); border:1px solid var(--purple-700); }
        .btn-gradient{ background:linear-gradient(90deg, var(--pink-600), var(--purple-600)); color:#fff; border:none; border-radius:10px; padding:6px 14px; box-shadow:0 0 18px rgba(236,72,153,.25); }
        .sidebar{ width:64px; position:fixed; top:0; bottom:0; left:0; padding:16px 8px; background:rgba(28,6,56,.7); backdrop-filter:blur(10px); border-right:1px solid var(--outline); box-shadow:0 0 20px rgba(236,72,153,.12); }
        .sidebar .nav-link{ color:var(--muted); border-radius:12px; }
        .sidebar .nav-link.active, .sidebar .nav-link:hover{ color:#fff; background:rgba(147,51,234,.30); box-shadow:0 0 12px rgba(236,72,153,.25); }
        .page-wrap{ margin-left:80px; }
        .topbar{ border-bottom:1px solid var(--outline); background:rgba(36,9,74,.55); backdrop-filter:blur(10px); box-shadow:0 0 18px rgba(236,72,153,.18); }
        .section-title{ font-weight:800; }
      /* ====== BUILD STEP POLISH ====== */

/* card build + note: kính mờ tím, viền sáng nhẹ, bo đẹp hơn */
.build-card,
.build-note-card {
  background: radial-gradient(
      circle at 0% 0%,
      rgba(236, 72, 153, 0.08) 0%,
      rgba(147, 51, 234, 0) 60%
    ),
    rgba(59, 7, 100, 0.45);
  border-radius: 16px;
  border: 1px solid rgba(147, 51, 234, 0.4);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(236, 72, 153, 0.25) inset;
  backdrop-filter: blur(14px);
}

/* tiêu đề nhãn */
.text-muted-subtle {
  color: var(--muted, #d8b4fe);
  font-weight: 500;
}

/* dropzone upload */
.build-dropzone {
  border: 2px dashed rgba(147, 51, 234, 0.6);
  border-radius: 16px;
  background: rgba(59, 7, 100, 0.25);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.4;
  text-align: center;
  transition: background 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease;
  box-shadow: 0 0 20px rgba(236, 72, 153, 0) inset;
  cursor: pointer;
}

.build-dropzone:hover {
  background: radial-gradient(
      circle at 50% 0%,
      rgba(236, 72, 153, 0.12) 0%,
      rgba(147, 51, 234, 0) 70%
    ),
    rgba(59, 7, 100, 0.35);
  border-color: rgba(236, 72, 153, 0.8);
  box-shadow: 0 0 24px rgba(236, 72, 153, 0.4),
    0 0 60px rgba(147, 51, 234, 0.3);
  color: #fff;
}

/* progress bar */
.pretty-progress {
  background: rgba(147, 51, 234, 0.25);
  border-radius: 999px;
  box-shadow: 0 0 16px rgba(147, 51, 234, 0.4) inset;
  overflow: hidden;
}
.pretty-progress .progress-bar {
  background: linear-gradient(
    90deg,
    var(--pink-600, #db2777) 0%,
    var(--purple-600, #9333ea) 100%
  );
  box-shadow: 0 0 16px rgba(236, 72, 153, 0.6),
    0 0 32px rgba(147, 51, 234, 0.6);
  border-radius: 999px;
}

/* textarea / input trong khối note
   (kế thừa style form-control gốc nhưng chỉnh border nổi hơn nhẹ) */
.build-note-card .form-control {
  background: rgba(8, 12, 24, 0.42);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
}
.build-note-card .form-control::placeholder {
  color: rgba(255, 255, 255, 0.45);
}
.build-note-card .form-control:focus {
  border-color: var(--pink-600, #db2777) !important;
  box-shadow: 0 0 0 0.25rem rgba(236, 72, 153, 0.25) !important;
  background: rgba(59, 7, 100, 0.35);
  color: #fff;
}
/* === BUILD UPLOAD PAGE THEME POLISH === */

/* Glass container style */
.glass-2 {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  transition: all 0.25s ease-in-out;
}

.glass-2:hover {
  border-color: rgba(236, 72, 153, 0.4);
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.2);
}

/* Upload box */
.build-dropzone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #cfc3e8;
  cursor: pointer;
  transition: all 0.25s ease;
}

.build-dropzone:hover {
  border-color: #9333ea;
  background: rgba(147, 51, 234, 0.08);
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.35);
  color: #fff;
}

/* Progress bar */
.pretty-progress {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  overflow: hidden;
  height: 10px;
}

.pretty-progress .progress-bar {
  background: linear-gradient(90deg, #db2777, #9333ea);
  border-radius: 999px;
  box-shadow: 0 0 16px rgba(236, 72, 153, 0.6);
  transition: width 0.25s ease;
}

/* Textarea & inputs in right panel */
.build-note-card .form-control {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.build-note-card .form-control:focus {
  border-color: #db2777;
  box-shadow: 0 0 0 0.2rem rgba(236, 72, 153, 0.3);
  background: rgba(59, 7, 100, 0.4);
}

.build-note-card .form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Titles and labels */
.section-title {
  font-weight: 800;
  color: #fff;
}

.form-label {
  font-weight: 600;
  color: #e9d5ff;
}

.text-secondary {
  color: #b69cd9 !important;
}

/* Layout refinements */
.glass-2 h6 {
  font-weight: 700;
  color: #fff;
}

button.btn.btn-gradient {
  background: linear-gradient(90deg, #db2777, #9333ea);
  border: none;
  border-radius: 10px;
  color: #fff;
  padding: 6px 14px;
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.3);
  transition: all 0.2s ease;
}

button.btn.btn-gradient:hover {
  box-shadow: 0 0 25px rgba(236, 72, 153, 0.6);
  transform: translateY(-1px);
}

button.btn.btn-outline-light {
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  border-radius: 10px;
  transition: all 0.2s ease;
}

button.btn.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #db2777;
}

      `}
      </style>
    </div>
  );
}
