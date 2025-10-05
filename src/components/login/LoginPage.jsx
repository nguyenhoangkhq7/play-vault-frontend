import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { loginUser } from "../../services/login" // Giả sử bạn có một hàm loginUser trong api/auth.js

export default function LoginPage() {
  const [formState, setFormState] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    if (!formState.username) {
      newErrors.username = "Tên người dùng là bắt buộc"
    }
    if (!formState.password) {
      newErrors.password = "Mật khẩu là bắt buộc"
    } else if (formState.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    // Xóa thông báo lỗi đăng nhập khi người dùng thay đổi đầu vào
    if (loginError) {
      setLoginError("")
    }
  }

  const handleCheckboxChange = (checked) => {
    setFormState((prev) => ({ ...prev, rememberMe: checked }))
  }


  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setLoginError("");

    try {
      // Gọi hàm loginUser để xác thực
      const user = await loginUser(formState.username, formState.password);

      // Lưu token và user vào storage
      const storage = formState.rememberMe ? localStorage : sessionStorage;
      storage.setItem("accessToken", "fake-token");
      storage.setItem("user", JSON.stringify(user));

      // Hiển thị thông báo thành công
      toast.success("Đăng nhập thành công", {
        description: `Chào mừng ${user.f_name} ${user.l_name}!`,
        duration: 3000,
      });

      // Chuyển hướng dựa trên role sau 1 giây
      setTimeout(() => {
        if (user.role === "admin") {
          navigate("/admindashboard");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      // Xử lý lỗi từ loginUser
      setLoginError(error.message);
      toast.error("Đăng nhập thất bại", {
        description: error.message || "Vui lòng kiểm tra lại tên người dùng và mật khẩu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 px-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] w-full max-w-md rounded-2xl text-white">
        <CardContent className="p-8">
          <motion.h1
            className="text-3xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Đăng Nhập
          </motion.h1>

          {/* Hiển thị thông báo lỗi đăng nhập */}
          {loginError && (
            <motion.div
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="text-red-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-red-200">{loginError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <Input
                  type="text"
                  name="username"
                  placeholder="Tên người dùng"
                  className="pl-10 bg-purple-900/40 border-purple-600 text-white placeholder-purple-300 focus:border-pink-500 focus:ring-pink-500/30"
                  value={formState.username}
                  onChange={handleChange}
                  aria-invalid={!!errors.username}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="text-pink-400 text-sm ml-1">{errors.username}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mật khẩu"
                  className="pl-10 pr-10 bg-purple-900/40 border-purple-600 text-white placeholder-purple-300 focus:border-pink-500 focus:ring-pink-500/30"
                  value={formState.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 focus:outline-none focus:text-pink-400"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-pink-400 text-sm ml-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={formState.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  className="border-purple-500 data-[state=checked]:bg-pink-600"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="text-sm text-purple-300 cursor-pointer">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a href="/forgot-password" className="text-sm text-pink-400 hover:text-pink-300 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <Button
              type="submit"
              className={`w-full bg-gradient-to-r ${isLoading ? 'from-purple-600 to-pink-600 opacity-80' : 'from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'} text-white font-semibold py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 focus:ring-2 focus:ring-pink-500/50 active:scale-[0.98]`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Đăng Nhập"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-purple-950/60 px-2 text-purple-400">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 border border-purple-700 rounded-xl bg-purple-900/20 hover:bg-purple-800/30 transition-colors duration-200 text-white"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 text-white opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
              <span className="text-sm">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 border border-purple-700 rounded-xl bg-purple-900/20 hover:bg-purple-800/30 transition-colors duration-200 text-white"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 text-white opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
              </svg>
              <span className="text-sm">Facebook</span>
            </button>
          </div>

          <motion.div
            className="rounded-xl bg-purple-900/40 border border-purple-700 p-4 text-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <p className="text-sm text-purple-300">
              Chưa có tài khoản?{" "}
              <a href="/register" className="text-pink-400 font-medium hover:text-pink-300 hover:underline transition-colors">
                Đăng ký ngay
              </a>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}