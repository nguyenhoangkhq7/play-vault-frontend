import React from "react";
import { useOutletContext } from "react-router-dom";

export default function PublisherStore() {
  const { slug, setSlug, tags, setTags, age18, setAge18, controller, setController, ssRefs, onPickSS, ssUrls } = useOutletContext();

  return (
    <section>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass-2 p-3 p-md-4 h-100">
            <h6 className="fw-bold">Thiết lập cửa hàng</h6>
            <div className="mb-3">
              <label className="form-label">Slug URL</label>
              <div className="input-group">
                <span className="input-group-text">gamehub.vn/store/</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="hanh-trinh-bat-tan"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Từ khóa</label>
              <input type="text" className="form-control" placeholder="roguelike, pixel, offline" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="form-check form-switch mt-2">
              <input className="form-check-input" type="checkbox" id="age18" checked={age18} onChange={(e) => setAge18(e.target.checked)} />
              <label className="form-check-label" htmlFor="age18">Giới hạn 18+</label>
            </div>
            <div className="form-check form-switch mt-2">
              <input className="form-check-input" type="checkbox" id="controller" checked={controller} onChange={(e) => setController(e.target.checked)} />
              <label className="form-check-label" htmlFor="controller">Hỗ trợ tay cầm</label>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-2 p-3 p-md-4">
            <label className="form-label">Ảnh chụp màn hình</label>
            <div className="row g-3">
              {[0, 1, 2, 3].map((i) => (
                <div className="col-6" key={i}>
                  <div className="upload-drop text-secondary" onClick={() => ssRefs[i]?.current?.click()}>
                    <i className="bi bi-cloud-upload fs-3 d-block mb-2" />
                    Ảnh {i + 1}
                    <input ref={ssRefs[i]} type="file" accept="image/*" hidden onChange={(e) => onPickSS(i, e.target.files)} />
                  </div>
                  {ssUrls[i] && <img src={ssUrls[i]} alt={`ss-${i}`} className="thumb mt-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
