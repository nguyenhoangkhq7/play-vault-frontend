import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import Sidebar from "../components/home/sidebar";

// ✅ Thêm 2 service gọi API
import { driveService } from "../api/driveService";
import { gameService } from "../api/gameService";

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
  const [buildUrl, setBuildUrl] = useState("");       // ✅ link build thật sau upload
  const [buildProgress, setBuildProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const uploadTimerRef = useRef(null); // giữ lại để clear nếu cần (không dùng fake nữa)

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

  // Drag & drop binders (generic)
  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const resetForm = () => {
  setTitle("");
  setSummary("");
  setGenre("");
  setPlatforms([]);
  setRelease("");
  setTrailer("");
  setIsFree(false);
  setPrice("");
  setCoverUrl("");
  setBuildName("");
  setSsUrls(["", "", "", ""]);
  setSlug("");
  setTags("");
  setAge18(false);
  setController(false);
  setBuildUrl("");
};

  
  // ====================== Cover handlers (UPLOAD THẬT) ======================
  const onCoverFiles = async (files) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Vui lòng chọn ảnh (JPG/PNG)");
      return;
    }
    try {
      const up = await driveService.uploadFile(f, true);
      const link = up.directLink || up.viewLink || up.downloadLink;
      setCoverUrl(link);
    } catch (e) {
      console.error(e);
      alert("Upload ảnh bìa thất bại!");
    }
  };

  // ====================== Build handlers (UPLOAD THẬT + PROGRESS) ======================
  const onBuildFiles = async (files) => {
    const f = files?.[0];
    if (!f) return;
    if (!/(zip|7z|rar)$/i.test(f.name)) {
      alert("Chỉ nhận .zip, .7z, .rar");
      return;
    }
    // set tên build hiển thị
    setBuildName(f.name);
    setIsUploading(true);
    setBuildProgress(0);

    // Clear bất kỳ timer cũ (không dùng fake nhưng để chắc chắn)
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }

    try {
      const up = await driveService.uploadFile(f, true, (pe) => {
        if (pe?.total) {
          const pct = Math.round((pe.loaded * 100) / pe.total);
          setBuildProgress(pct);
        }
      });
      const link = up.directLink || up.downloadLink || up.viewLink;
      setBuildUrl(link);
    } catch (e) {
      console.error(e);
      alert("Upload build thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(
    () => () => uploadTimerRef.current && clearInterval(uploadTimerRef.current),
    []
  );

  // ====================== Screenshots handlers (UPLOAD THẬT) ======================
  const onPickSS = async (idx, files) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    try {
      const up = await driveService.uploadFile(f, true);
      const link = up.directLink || up.viewLink || up.downloadLink;
      setSsUrls((prev) => prev.map((u, i) => (i === idx ? link : u)));
    } catch (e) {
      console.error(e);
      alert("Upload screenshot thất bại!");
    }
  };

  const platformMap = { Windows: "WINDOWS", macOS: "MACOS", Linux: "LINUX" };
  const platformsForApi = platforms.map(p => platformMap[p] || p);                    // đã có link ảnh bìa


  // ---------------------- Progress compute ----------------------
  const progress = useMemo(() => {
    const required = [
      Boolean(title.trim()),
      Boolean(summary.trim()),
      Boolean(genre.trim()),
      isFree ? true : Boolean(String(price).trim()),
      Boolean(buildName.trim()), // đã chọn file build
    ];
    const filled = required.filter(Boolean).length;
    const pct = Math.round((filled / required.length) * 100) || 0;
    return pct;
  }, [title, summary, genre, isFree, price, buildName]);

  // ---------------------- Actions ----------------------
  const onSaveDraft = () => alert("Đã lưu bản nháp (demo).");

  // ✅ Gửi duyệt thật: POST /api/games
  const onSubmitReview = async () => {
    try {
      const payload = {
        title,
        summary,
        genre,
        releaseDate: release || null,
        trailerUrl: trailer || null,
        coverUrl,
        isFree,
        price: isFree ? 0 : Number(price || 0),
        filePath: buildUrl,
        screenshots: ssUrls.filter(Boolean),
        tags: String(tags || "").split(",").map(s => s.trim()).filter(Boolean),
        platforms: platformsForApi, // <— dùng biến đã map
      };

      const token = localStorage.getItem("accessToken") || localStorage.getItem("token"); // nếu có auth
      await gameService.create(payload, token);

      alert("Đã gửi duyệt thành công!");
      // Điều hướng tuỳ ý: qua trang build/store hoặc về admin approval
      // navigate("/admin/approval");
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Gửi duyệt thất bại!");
    }
  };

  // ---------------------- Step Navigation ----------------------
  const goNextStep = () => {
    if (location.pathname.endsWith("/build")) {
      navigate("/publisher/upload/store");
    } else if (location.pathname.endsWith("/store")) {
      return;
    } else {
      navigate("/publisher/upload/build");
    }
  };

  const isLastStep = location.pathname.endsWith("/store");

  // ---------------------- Render ----------------------
  return (
    <div className="publisher-root" data-bs-theme="dark">
      {/* Sidebar */}
      <Sidebar />

      {/* Site navbar (restore global header) */}
      <div className="fixed top-0 left-20 right-0 z-50">
        <Navbar />
      </div>

      <div className="page-wrap">
        {/* Main */}
        <main className="container-fluid py-5 px-4 px-md-5">
          <div className="glass p-6" style={{ margin: "0 auto", maxWidth: "1400px" }}>
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
              <div>
                <h2 className="section-title h4 mb-3">Thông tin phát hành</h2>
                <p className="text-secondary mb-2">
                  Nhập chi tiết game của bạn và tải lên bản build để xuất bản trên GameHub.
                </p>
                <div className="d-flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/publisher/upload")}
                    className={`btn px-4 ${location.pathname === "/publisher/upload" ? "btn-gradient" : "btn-outline-light"}`}
                    style={{ minWidth: "140px", marginRight: "10px" }}
                  >
                    <i className="bi bi-info-circle me-2"></i>
                    Thông tin
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/publisher/upload/build")}
                    className={`btn px-4 ${location.pathname.endsWith("/build") ? "btn-gradient" : "btn-outline-light"}`}
                    style={{ minWidth: "140px", marginRight: "10px" }}
                  >
                    <i className="bi bi-hdd-network me-2"></i>
                    Build
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/publisher/upload/store")}
                    className={`btn px-4 ${location.pathname.endsWith("/store") ? "btn-gradient" : "btn-outline-light"}`}
                    style={{ minWidth: "140px" }}
                  >
                    <i className="bi bi-shop me-2"></i>
                    Store
                  </button>
                </div>
              </div>
              <div className="text-end">
                <div className="small text-secondary mb-1">Tiến độ hoàn thành</div>
                <div className="progress" style={{ width: 260, height: 8 }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* Render step hiện tại qua <Outlet /> */}
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
                  buildInputRef, onBuildFiles, buildName, buildProgress, isUploading,buildUrl,
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
                  <button type="button" className="btn btn-gradient mr-3" onClick={goNextStep}>
                    Tiếp tục <i className="bi bi-arrow-right-circle ms-1" />
                  </button>
                )}
                <button type="button" className="btn btn-outline-light mr-3" onClick={onSaveDraft}>
                  <i className="bi bi-save me-3" />
                  Lưu nháp
                </button>
                <button type="button" className="btn btn-gradient mr-3" onClick={onSubmitReview}>
                  Gửi duyệt <i className="bi bi-arrow-right-circle ms-1" />
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

      {/* Styles giữ nguyên */}
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
        .page-wrap { margin-left: 80px; margin-top: 80px; padding: 0 20px; }
        .glass{ background:rgba(59,7,100,.6); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-radius:20px; box-shadow:0 20px 40px rgba(0,0,0,.35); border:1px solid var(--purple-700); }
        .btn-gradient{ background:linear-gradient(90deg, var(--pink-600), var(--purple-600)); color:#fff; border:none; border-radius:10px; padding:6px 14px; box-shadow:0 0 18px rgba(236,72,153,.25); }
        .sidebar{ width:64px; position:fixed; top:0; bottom:0; left:0; padding:16px 8px; background:rgba(28,6,56,.7); backdrop-filter:blur(10px); border-right:1px solid var(--outline); box-shadow:0 0 20px rgba(236,72,153,.12); }
        .sidebar .nav-link{ color:var(--muted); border-radius:12px; }
        .sidebar .nav-link.active, .sidebar .nav-link:hover{ color:#fff; background:rgba(147,51,234,.30); box-shadow:0 0 12px rgba(236,72,153,.25); }
        .page-wrap{ margin-left:80px; }
        .topbar{ border-bottom:1px solid var(--outline); background:rgba(36,9,74,.55); backdrop-filter:blur(10px); box-shadow:0 0 18px rgba(236,72,153,.18); }
        .section-title{ font-weight:800; }
        .build-card, .build-note-card {
          background: radial-gradient(circle at 0% 0%, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0) 60%), rgba(59, 7, 100, 0.45);
          border-radius: 16px;
          border: 1px solid rgba(147, 51, 234, 0.4);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(236, 72, 153, 0.25) inset;
          backdrop-filter: blur(14px);
        }
        .text-muted-subtle { color: var(--muted, #d8b4fe); font-weight: 500; }
        .build-dropzone {
          border: 2px dashed rgba(147, 51, 234, 0.6);
          border-radius: 16px;
          background: rgba(59, 7, 100, 0.25);
          min-height: 140px; display:flex; flex-direction:column; align-items:center; justify-content:center;
          line-height: 1.4; text-align:center; transition: background 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          box-shadow: 0 0 20px rgba(236, 72, 153, 0) inset; cursor: pointer;
        }
        .build-dropzone:hover {
          background: radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.12) 0%, rgba(147, 51, 234, 0) 70%), rgba(59, 7, 100, 0.35);
          border-color: rgba(236, 72, 153, 0.8); box-shadow: 0 0 24px rgba(236, 72, 153, 0.4), 0 0 60px rgba(147, 51, 234, 0.3); color: #fff;
        }
        .pretty-progress { background: rgba(147, 51, 234, 0.25); border-radius: 999px; box-shadow: 0 0 16px rgba(147, 51, 234, 0.4) inset; overflow: hidden; }
        .pretty-progress .progress-bar {
          background: linear-gradient(90deg, var(--pink-600, #db2777) 0%, var(--purple-600, #9333ea) 100%);
          box-shadow: 0 0 16px rgba(236, 72, 153, 0.6), 0 0 32px rgba(147, 51, 234, 0.6);
          border-radius: 999px;
        }
        .glass-2 { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); transition: all 0.25s ease-in-out; }
        .glass-2:hover { border-color: rgba(236,72,153,0.4); box-shadow: 0 0 30px rgba(236,72,153,0.2); }
        .pretty-progress { background: rgba(255,255,255,0.12); border-radius: 999px; overflow: hidden; height: 10px; }
        .pretty-progress .progress-bar { background: linear-gradient(90deg, #db2777, #9333ea); border-radius: 999px; box-shadow: 0 0 16px rgba(236,72,153,0.6); transition: width 0.25s ease; }
        .build-note-card .form-control { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 10px; transition: all 0.2s ease; }
        .build-note-card .form-control:focus { border-color: #db2777; box-shadow: 0 0 0 0.2rem rgba(236,72,153,0.3); background: rgba(59, 7, 100, 0.4); }
        .build-note-card .form-control::placeholder { color: rgba(255,255,255,0.5); }
        .section-title { font-weight: 800; color: #fff; }
        .form-label { font-weight: 600; color: #e9d5ff; }
        .text-secondary { color: #b69cd9 !important; }
        .glass-2 h6 { font-weight: 700; color: #fff; }
        button.btn.btn-gradient { background: linear-gradient(90deg, #db2777, #9333ea); border: none; border-radius: 10px; color: #fff; padding: 6px 14px; box-shadow: 0 0 15px rgba(236, 72, 153, 0.3); transition: all 0.2s ease; }
        button.btn.btn-gradient:hover { box-shadow: 0 0 25px rgba(236, 72, 153, 0.6); transform: translateY(-1px); }
        button.btn.btn-outline-light { border: 1px solid rgba(255,255,255,0.35); color: #fff; border-radius: 10px; transition: all 0.2s ease; }
        button.btn.btn-outline-light:hover { background: rgba(255,255,255,0.1); border-color: #db2777; }
      `}</style>
    </div>
  );
}
