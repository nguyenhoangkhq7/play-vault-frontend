import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [emailSent, setEmailSent] = useState(false)
    const navigate = useNavigate()

    const validateEmail = (email) => {
        // Simple email validation
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!email) {
            setError("Vui lòng nhập địa chỉ email")
            return
        }

        if (!validateEmail(email)) {
            setError("Email không hợp lệ")
            return
        }

        setIsLoading(true)

        try {
            // Giả lập gửi email khôi phục mật khẩu
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Hiển thị thông báo thành công
            toast.success("Gửi yêu cầu thành công", {
                description: "Hướng dẫn đặt lại mật khẩu đã được gửi tới email của bạn.",
                duration: 5000,
            })

            setEmailSent(true)
        } catch (error) {
            setError("Đã xảy ra lỗi khi gửi email. Vui lòng thử lại sau.")
            toast.error("Gửi yêu cầu thất bại", {
                description: "Đã xảy ra lỗi, vui lòng thử lại sau.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoBack = () => {
        navigate("/login")
    }

    if (emailSent) {
        return (
            <motion.div
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] w-full max-w-md rounded-2xl text-white">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <motion.div
                                className="mb-4 bg-green-500/20 rounded-full p-3"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                <CheckCircle2 className="h-10 w-10 text-green-400" />
                            </motion.div>

                            <h2 className="text-2xl font-bold mb-2">Email đã được gửi!</h2>
                            <p className="text-purple-300 mb-6">
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                            </p>

                            <div className="space-y-3 w-full">
                                <Button
                                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-2 rounded-xl"
                                    onClick={handleGoBack}
                                >
                                    Quay lại đăng nhập
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-purple-700 text-purple-300 hover:bg-purple-800/30 hover:text-white"
                                    onClick={() => setEmailSent(false)}
                                >
                                    Thử với email khác
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
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
                        className="text-3xl font-bold text-center mb-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Quên mật khẩu
                    </motion.h1>

                    <p className="text-center text-purple-300 mb-6">
                        Nhập email của bạn và chúng tôi sẽ gửi cho bạn hướng dẫn để đặt lại mật khẩu.
                    </p>

                    {/* Hiển thị thông báo lỗi */}
                    {error && (
                        <motion.div
                            className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start text-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AlertCircle className="text-red-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                            <p className="text-red-200">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                <Input
                                    type="email"
                                    placeholder="Địa chỉ email"
                                    className="pl-10 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className={`w-full bg-gradient-to-r ${isLoading ? 'from-purple-600 to-pink-600 opacity-80' : 'from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'} text-white font-semibold py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 h-11`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Đang xử lý...</span>
                                </div>
                            ) : (
                                "Gửi yêu cầu khôi phục"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <Button
                            variant="ghost"
                            className="w-full flex items-center justify-center gap-2 text-purple-300 hover:text-white hover:bg-purple-800/30"
                            onClick={handleGoBack}
                            disabled={isLoading}
                        >
                            <ArrowLeft size={16} />
                            <span>Quay lại đăng nhập</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}