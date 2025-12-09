import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import Sidebar from "../components/home/sidebar";

// ✅ Thêm service gọi API
import { gameService } from "../api/gameService";
import { r2Service } from "../api/r2Service";
import { uploadImageToCloudinary } from "../api/uploadImage"; // ✅ Dùng Cloudinary cho ảnh

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
  const [platforms, setPlatforms] = useState([]); // ["PC", "Mobile", "PlayStation", "Xbox", "Nintendo Switch"]
  const [release, setRelease] = useState("");
  const [trailer, setTrailer] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");

  // Cover upload - ✅ Lưu vào localStorage
  const [coverUrl, setCoverUrl] = useState(() => 
    localStorage.getItem("publisher_coverUrl") || ""
  );
  const coverInputRef = useRef(null);

  // Build upload - ✅ Lưu vào localStorage
  const buildInputRef = useRef(null);
  const [buildName, setBuildName] = useState(() => 
    localStorage.getItem("publisher_buildName") || ""
  );
  const [buildUrl, setBuildUrl] = useState(() => 
    localStorage.getItem("publisher_buildUrl") || ""
  );
  const [buildProgress, setBuildProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const uploadTimerRef = useRef(null);

  // Screenshots - ✅ Lưu vào localStorage
  const ssRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [ssUrls, setSsUrls] = useState(() => {
    const saved = localStorage.getItem("publisher_ssUrls");
    return saved ? JSON.parse(saved) : ["", "", "", ""];
  });

  // --- FORM STATE BỔ SUNG (đồng bộ backend) ---
  const [notes, setNotes] = useState("");        // description (ghi chú phát hành)
  const [age18, setAge18] = useState(0);         // requiredAge
  const [controller, setController] = useState(false); // isSupportController

  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [storage, setStorage] = useState("");
  const [ram, setRam] = useState("");


  const togglePlatform = (p) =>
  setPlatforms((prev) =>
    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
  );
  // ===== Gallery (4 ô) =====
  const galleryInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  // ✅ Khởi tạo từ localStorage
  const [galleryUrls, setGalleryUrls] = useState(() => {
    const saved = localStorage.getItem("publisher_galleryUrls");
    return saved ? JSON.parse(saved) : ["", "", "", ""];
  });
  // ✅ Upload ảnh gallery lên Cloudinary
const onGalleryFiles = async (index, files) => {
  const f = files?.[0];
  if (!f) return;
  if (!f.type.startsWith("image/")) {
    alert("Vui lòng chọn ảnh (JPG/PNG/WEBP/GIF)");
    return;
  }
  try {
    const result = await uploadImageToCloudinary(f);
    const link = result.secure_url;
    setGalleryUrls((prev) => {
      const next = [...prev];
      next[index] = link;
      // ✅ Lưu vào localStorage
      localStorage.setItem("publisher_galleryUrls", JSON.stringify(next));
      return next;
    });
    console.log("✅ Upload gallery image:", link);
  } catch (e) {
    console.error("❌ Upload gallery thất bại:", e);
    alert("Upload ảnh gallery thất bại! Vui lòng thử lại.");
  }
};

  // ---------------------- Helpers ----------------------

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
  setBuildUrl("");
  setNotes("");
  setAge18(0);
  setController(false);
  setCpu(""); setGpu(""); setStorage(""); setRam("");
  
  // ✅ Xóa localStorage khi reset form
  localStorage.removeItem("publisher_coverUrl");
  localStorage.removeItem("publisher_galleryUrls");
  localStorage.removeItem("publisher_ssUrls");
  localStorage.removeItem("publisher_buildUrl");
  localStorage.removeItem("publisher_buildName");
};

  // Platform names now match database exactly: PC, Mobile, PlayStation, Xbox, Nintendo Switch
  const platformIds = platforms.length ? [1] : [];

  // Thể loại (VN) -> id (theo DB dump của bạn)
  const categoryMap = {
    "Hành động": 1,
    "Phiêu lưu": 2,
    "Nhập vai": 3,
    "Mô phỏng": 4,
    "Chiến thuật": 5,
    "Giải đố": 6,
    "Kinh dị": 7,
    "Đua xe": 8,
  };
const categoryIdMapped = categoryMap[genre] || 1;

  // ====================== Cover handlers (UPLOAD LÊN CLOUDINARY) ======================
  const onCoverFiles = async (files) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Vui lòng chọn ảnh (JPG/PNG)");
      return;
    }
    try {
      const result = await uploadImageToCloudinary(f);
      const link = result.secure_url;
      setCoverUrl(link);
      localStorage.setItem("publisher_coverUrl", link); // ✅ Lưu localStorage
      console.log("✅ Upload cover image:", link);
    } catch (e) {
      console.error("❌ Upload cover thất bại:", e);
      alert("Upload ảnh bìa thất bại! Vui lòng thử lại.");
    }
  };

  // ====================== Build handlers (UPLOAD THẬT + PROGRESS VỚI R2) ======================
  const onBuildFiles = async (files) => {
    const f = files?.[0];
    if (!f) return;
    if (!/(zip|7z|rar|exe)$/i.test(f.name)) {
      alert("Chỉ nhận .zip, .7z, .rar, .exe");
      return;
    }
    // set tên build hiển thị
    setBuildName(f.name);
    setIsUploading(true);
    setBuildProgress(0);

    // Clear bất kỳ timer cũ
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }

    try {
      // ✅ DÙNG R2 SERVICE: Upload file game và nhận filePath
      const filePath = await r2Service.uploadGameFile(f, (percent) => {
        setBuildProgress(percent);
      });
      
      // ✅ Lưu filePath để gửi lên backend khi submit
      setBuildUrl(filePath);
      localStorage.setItem("publisher_buildUrl", filePath); // ✅ Lưu localStorage
      localStorage.setItem("publisher_buildName", f.name); // ✅ Lưu tên file
      console.log("✅ Upload thành công! FilePath:", filePath);
    } catch (e) {
      console.error("❌ Upload build thất bại:", e);
      alert("Upload build thất bại! Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(
    () => () => uploadTimerRef.current && clearInterval(uploadTimerRef.current),
    []
  );

  // ====================== Screenshots handlers (UPLOAD LÊN CLOUDINARY) ======================
  const onPickSS = async (idx, files) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    try {
      const result = await uploadImageToCloudinary(f);
      const link = result.secure_url;
      setSsUrls((prev) => {
        const updated = prev.map((u, i) => (i === idx ? link : u));
        localStorage.setItem("publisher_ssUrls", JSON.stringify(updated)); // ✅ Lưu localStorage
        return updated;
      });
      console.log("✅ Upload screenshot:", link);
    } catch (e) {
      console.error("❌ Upload screenshot thất bại:", e);
      alert("Upload screenshot thất bại! Vui lòng thử lại.");
    }
  };



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

  // ✅ Gửi duyệt thật: POST /api/games
  const onSubmitReview = async () => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

      // ✅ Validate required fields
      if (!title || !summary || !buildUrl) {
        alert("Vui lòng điền đầy đủ thông tin: Tên game, Mô tả, và File game!");
        return;
      }

      if (!coverUrl) {
        alert("Vui lòng upload ảnh bìa game!");
        return;
      }

      // ✅ Payload khớp với GameCreateRequest của backend
      const payload = {
        title: title,                           // ✅ Đổi name → title
        summary: summary,                        // ✅ Đổi shortDescription → summary
        description: notes || summary,           // ✅ description
        coverUrl: coverUrl,                      // ✅ Đổi thumbnail → coverUrl
        trailerUrl: trailer || null,
        isFree: isFree,                          // ✅ boolean
        price: isFree ? 0 : Number(price || 0),
        releaseDate: release || new Date().toISOString().split('T')[0], // yyyy-MM-dd
        categoryId: categoryIdMapped,
        platforms: platforms.length > 0 
          ? platforms // ✅ Send exactly as selected: PC, Mobile, PlayStation, Xbox, Nintendo Switch
          : ["PC"], // ✅ Default to PC
        filePath: buildUrl,                      // ✅ File path từ R2
        isAge18: age18 >= 18,                    // ✅ boolean
        isSupportController: Boolean(controller),
        gallery: galleryUrls.filter(Boolean),    // ✅ Thêm gallery URLs
      };

      console.log("📤 Submitting game payload:", payload);
      console.log("📊 Payload details:", {
        title, summary, coverUrl, buildUrl,
        categoryId: categoryIdMapped,
        platforms,
        galleryCount: galleryUrls.filter(Boolean).length
      });

      const response = await gameService.createPendingJson(payload, token);
      
      console.log("✅ Game submitted successfully:", response);
      alert("Đã gửi duyệt game thành công! Vui lòng chờ admin phê duyệt.");
      
      resetForm();
      // Có thể navigate về dashboard
      // navigate("/publisher/dashboard");
    } catch (e) {
      console.error("❌ Error submitting game:", e);
      console.error("Error response:", e.response?.data);
      
      if (e.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else if (e.response?.status === 403) {
        alert("Bạn không có quyền tạo game. Vui lòng đăng nhập với tài khoản Publisher!");
      } else {
        const errorMsg = e.response?.data?.message || e.message || "Lỗi không xác định";
        alert(`Gửi duyệt thất bại: ${errorMsg}`);
      }
    }
  };

  // ---------------------- Step Navigation ----------------------
  const goNextStep = () => {
    if (location.pathname.endsWith("/build")) {
      return; // Last step
    } else {
      navigate("/publisher/upload/build");
    }
  };

  const isLastStep = location.pathname.endsWith("/build");

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
                    style={{ minWidth: "140px" }}
                  >
                    <i className="bi bi-hdd-network me-2"></i>
                    Build
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
                  // --- state phần Thông tin ---
                  title, setTitle,
                  summary, setSummary,
                  genre, setGenre,
                  platforms, setPlatforms,    // hoặc togglePlatform nếu bạn đang dùng
                  release, setRelease,
                  trailer, setTrailer,
                  isFree, setIsFree,
                  price, setPrice,
                  togglePlatform,  

                  // --- Cover & Build hiện có ---
                  coverUrl, coverInputRef, pickFile, prevent, onCoverFiles,
                  buildInputRef, onBuildFiles, buildName, buildProgress, isUploading, buildUrl,

                  // --- Screenshots (nếu có) ---
                  ssRefs, ssUrls, onPickSS,

                  galleryUrls,
                  galleryInputRefs,
                  onGalleryFiles,

                  // --- state BỔ SUNG cho tab Build ---
                  notes, setNotes,
                  cpu, setCpu,
                  gpu, setGpu,
                  storage, setStorage,
                  ram, setRam,
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
                
                {isLastStep && (
                  <button type="button" className="btn btn-gradient mr-3" onClick={onSubmitReview}>
                    Gửi duyệt <i className="bi bi-arrow-right-circle ms-1" />
                  </button>
                )}
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
