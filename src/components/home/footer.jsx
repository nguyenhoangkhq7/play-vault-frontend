import { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ArrowRight,
  Heart,
  MessageCircle,
  ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail("");
      // Thời gian đóng thông báo sau 3 giây
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    }
  };

  const categories = [
    "Hành động", "Phiêu lưu", "Nhập vai", "Chiến thuật",
    "Thể thao", "Mô phỏng", "Indie"
  ];

  const quickLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Ưa thích", path: "/favorites" },
    { name: "Đã mua", path: "/bought" },
    { name: "Giỏ hàng", path: "/cart" },
  ];

  const services = [
    { name: "Game đã mua", path: "/bought", icon: <ShoppingCart className="w-4 h-4" /> },
    { name: "Yêu thích", path: "/favorites", icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-purple-900 text-white mt-16 w-full overflow-hidden">
      {/* Decorated top border */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - About */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                GameHub
              </h3>
              <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
            </div>

            <p className="text-gray-300">
              Nơi tuyệt vời để khám phá và trải nghiệm thế giới game, cập nhật tin tức và kết nối với cộng đồng game thủ Việt Nam.
            </p>

            {/* Newsletter */}
            <div className="pt-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gray-200">
                Đăng ký nhận thông tin
              </h4>

              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="bg-white/10 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-4 py-2 rounded-r-md transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {subscribed && (
                <div className="text-green-400 text-sm mt-2 animate-fade-in">
                  Cảm ơn bạn đã đăng ký!
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="bg-white/10 hover:bg-pink-600 p-2 rounded-full transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-purple-600 p-2 rounded-full transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-pink-600 p-2 rounded-full transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-purple-600 p-2 rounded-full transition-all duration-300"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="h-5 w-1 bg-pink-500 rounded-full mr-2"></span>
              Liên kết nhanh
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors flex items-center group"
                    onClick={() => console.log(`Navigating to ${link.path}`)}
                  >
                    <span className="w-5 h-5 mr-2 flex justify-center items-center">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-6 flex items-center">
              <span className="h-5 w-1 bg-purple-500 rounded-full mr-2"></span>
              Dịch vụ của chúng tôi
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.path}
                    className="text-gray-300 hover:text-white transition-colors flex items-center group"
                    onClick={() => console.log(`Navigating to ${service.path}`)}
                  >
                    <span className="w-5 h-5 mr-2 flex justify-center items-center text-purple-400 group-hover:text-pink-400 transition-colors">
                      {service.icon}
                    </span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Categories */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="h-5 w-1 bg-indigo-500 rounded-full mr-2"></span>
              Thể loại trò chơi
            </h3>
            <div className="grid grid-cols-1 gap-y-3">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-md px-3 py-2 flex items-center justify-between group"
                  onClick={() => console.log(`Navigating to /products?category=${category}`)}
                >
                  <span>{category}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4 - Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="h-5 w-1 bg-pink-500 rounded-full mr-2"></span>
              Thông tin liên hệ
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-pink-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300">123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300">+84 123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300">contact@gamehub.vn</span>
              </li>
            </ul>

            <div className="pt-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gray-200">
                Giờ làm việc
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white/5 rounded-md px-3 py-2">
                  <div className="font-medium">Thứ 2 - Thứ 6</div>
                  <div className="text-gray-400">8:00 - 20:00</div>
                </div>
                <div className="bg-white/5 rounded-md px-3 py-2">
                  <div className="font-medium">Thứ 7 - Chủ nhật</div>
                  <div className="text-gray-400">10:00 - 18:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">© {currentYear} GameHub Việt Nam. Tất cả các quyền được bảo lưu.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Chính sách bảo mật
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Chính sách cookie
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}