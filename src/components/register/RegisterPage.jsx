import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, Calendar as CalendarIcon, CheckCircle2, Check, Phone, MapPin, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { checkIfUserExists, registerUser, getUsers } from "../../api/users.js";

export default function RegisterPage() {
    const [formState, setFormState] = useState({
        username: "",
        email: "",
        phone: "",
        gender: "",
        address: "",
        password: "",
        confirmPassword: "",
        f_name: "",
        l_name: "",
        dob: null,
        acceptTerms: false,
    });
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        phone: false,
        gender: false,
        address: false,
        password: false,
        confirmPassword: false,
        f_name: false,
        l_name: false,
        dob: false,
        acceptTerms: false,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registrationError, setRegistrationError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const navigate = useNavigate();

    // ... (Giữ nguyên các hàm useEffect, validateForm, handle... như cũ)
    useEffect(() => {
        // console.log("Form state:", formState); 
        // Giữ logic cũ của bạn ở đây
    }, [formState, touched, errors, isLoading, isSuccess, userInfo]);

    const validateForm = (validateAll = false) => {
        const newErrors = {};
        // ... (Giữ nguyên logic validateForm như cũ)
        if (validateAll || touched.username) {
            if (!formState.username) {
                newErrors.username = "Tên người dùng là bắt buộc";
            } else if (formState.username.length < 3) {
                newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
            } else if (!/^[a-zA-Z0-9_]+$/.test(formState.username)) {
                newErrors.username = "Tên người dùng chỉ được chứa chữ, số và dấu gạch dưới";
            }
        }

        if (validateAll || touched.email) {
            if (!formState.email) {
                newErrors.email = "Email là bắt buộc";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
                newErrors.email = "Email không hợp lệ";
            }
        }

        if (validateAll || touched.phone) {
            if (!formState.phone) {
                newErrors.phone = "Số điện thoại là bắt buộc";
            } else if (!/^0\d{9}$/.test(formState.phone)) {
                newErrors.phone = "Số điện thoại phải là 10 chữ số, bắt đầu bằng 0";
            }
        }

        if (validateAll || touched.gender) {
            if (!formState.gender) {
                newErrors.gender = "Giới tính là bắt buộc";
            }
        }

        if (validateAll || touched.address) {
            if (!formState.address) {
                newErrors.address = "Địa chỉ là bắt buộc";
            } else if (formState.address.length < 5) {
                newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
            }
        }

        if (validateAll || touched.password) {
            if (!formState.password) {
                newErrors.password = "Mật khẩu là bắt buộc";
            } else if (formState.password.length <= 7) {
                newErrors.password = "Mật khẩu phải có hơn 7 ký tự";
            }
        }

        if (validateAll || touched.confirmPassword) {
            if (!formState.confirmPassword) {
                newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
            } else if (formState.confirmPassword !== formState.password) {
                newErrors.confirmPassword = "Mật khẩu không khớp";
            }
        }

        if (validateAll || touched.f_name) {
            if (!formState.f_name) {
                newErrors.f_name = "Họ là bắt buộc";
            } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formState.f_name)) {
                newErrors.f_name = "Họ chỉ được chứa chữ cái và khoảng trắng";
            }
        }

        if (validateAll || touched.l_name) {
            if (!formState.l_name) {
                newErrors.l_name = "Tên là bắt buộc";
            } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formState.l_name)) {
                newErrors.l_name = "Tên chỉ được chứa chữ cái và khoảng trắng";
            }
        }

        if (validateAll || touched.dob) {
            if (!formState.dob) {
                newErrors.dob = "Ngày sinh là bắt buộc";
            } else {
                const today = new Date();
                const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                if (formState.dob > minAgeDate) {
                    newErrors.dob = "Bạn phải từ 18 tuổi trở lên";
                }
            }
        }

        if (validateAll || touched.acceptTerms) {
            if (!formState.acceptTerms) {
                newErrors.acceptTerms = "Bạn phải đồng ý với điều khoản và điều kiện";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "f_name" || name === "l_name") {
            if (!/^[a-zA-ZÀ-ỹ\s]*$/.test(value)) return;
        }
        if (name === "username") {
            if (!/^[a-zA-Z0-9_]*$/.test(value)) return;
        }
        if (name === "phone") {
            if (!/^[0-9]*$/.test(value)) return;
        }
        setFormState((prev) => ({ ...prev, [name]: value }));
        setRegistrationError("");
    };

    const handleGenderChange = (value) => {
        setFormState((prev) => ({ ...prev, gender: value }));
        setTouched((prev) => ({ ...prev, gender: true }));
        validateForm();
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateForm();
    };

    const handleDateChange = (date) => {
        setFormState((prev) => ({ ...prev, dob: date }));
        setTouched((prev) => ({ ...prev, dob: true }));
        setIsCalendarOpen(false);
        validateForm();
    };

    const handleCheckboxChange = (checked) => {
        setFormState((prev) => ({ ...prev, acceptTerms: checked }));
        setTouched((prev) => ({ ...prev, acceptTerms: true }));
        validateForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);
        setRegistrationError("");

        try {
            const isValid = validateForm(true);
            if (!isValid) {
                setIsLoading(false);
                return;
            }

            const userCheck = await checkIfUserExists(formState.username);
            if (userCheck.exists) {
                setRegistrationError(userCheck.message);
                setIsLoading(false);
                return;
            }

            const users = await getUsers();
            const maxId = users.reduce((max, user) => {
                const userId = parseInt(user.id, 10);
                return !isNaN(userId) && userId > max ? userId : max;
            }, 0);
            const newId = String(maxId + 1);

            const user = await registerUser({
                id: newId,
                username: formState.username,
                email: formState.email,
                phone: formState.phone,
                gender: formState.gender,
                address: formState.address,
                password: formState.password,
                f_name: formState.f_name,
                l_name: formState.l_name,
                dob: formState.dob,
                avatar: "https://res.cloudinary.com/dqnj8bsgu/image/upload/v1746630940/avatar_f6yerg.jpg",
                role: "user",
                status: "active",
                created_at: new Date().toISOString(),
            });

            toast.success("Đăng ký thành công", {
                description: `Chào mừng ${user.f_name} ${user.l_name}! Tài khoản của bạn đã được tạo thành công.`,
                duration: 5000,
            });

            setUserInfo({
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                address: user.address,
                fullName: `${user.f_name} ${user.l_name}`,
                dob: format(new Date(user.dob.$date || user.dob), "dd/MM/yyyy", { locale: vi }),
                role: user.role,
                status: user.status,
                created_at: format(new Date(user.created_at), "dd/MM/yyyy HH:mm:ss", { locale: vi }),
            });

            setFormState({
                username: "", email: "", phone: "", gender: "", address: "",
                password: "", confirmPassword: "", f_name: "", l_name: "",
                dob: null, acceptTerms: false,
            });
            setTouched({});
            setErrors({});
            setIsSuccess(true);
        } catch (error) {
            console.error("Lỗi:", error);
            setRegistrationError(`Lỗi: ${error.message}. Vui lòng thử lại sau.`);
            toast.error("Đăng ký thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => { if (!isLoading) setShowPassword((prev) => !prev); };
    const toggleConfirmPasswordVisibility = () => { if (!isLoading) setShowConfirmPassword((prev) => !prev); };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 px-4 py-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] w-full max-w-lg rounded-2xl text-white">
                <CardContent className="p-8">
                    
                    
                    

                    <motion.h1
                        className="text-3xl font-bold text-center mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Đăng Ký Tài Khoản
                    </motion.h1>

                    {/* --- TAB CHUYỂN ĐỔI USER / PUBLISHER --- */}
                    <div className="flex bg-purple-900/30 p-1 rounded-xl mb-6 border border-purple-700/30">
                        <button
                            type="button"
                            className="w-1/2 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium shadow-lg shadow-purple-900/20 cursor-default transition-all"
                        >
                            <User size={18} />
                            Người dùng
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/publisher-register")} // Chuyển hướng sang trang Publisher
                            className="w-1/2 flex items-center justify-center gap-2 py-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/50 cursor-pointer transition-all duration-200"
                        >
                            <Briefcase size={18} />
                            Nhà phát hành
                        </button>
                    </div>

                    {registrationError && (
                        <motion.div
                            className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start text-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AlertCircle className="text-red-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                            <p className="text-red-200">{registrationError}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* HỌ VÀ TÊN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                    <Input
                                        type="text" name="f_name" placeholder="Họ"
                                        className="pl-10 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10"
                                        value={formState.f_name} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.f_name} disabled={isLoading}
                                    />
                                    {!errors.f_name && touched.f_name && formState.f_name && (<Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                                </div>
                                {errors.f_name && <p className="text-pink-400 text-sm ml-1">{errors.f_name}</p>}
                            </div>

                            <div className="space-y-1">
                                <div className="relative">
                                    <Input
                                        type="text" name="l_name" placeholder="Tên"
                                        className="bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10"
                                        value={formState.l_name} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.l_name} disabled={isLoading}
                                    />
                                    {!errors.l_name && touched.l_name && formState.l_name && (<Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                                </div>
                                {errors.l_name && <p className="text-pink-400 text-sm ml-1">{errors.l_name}</p>}
                            </div>
                        </div>

                        {/* NGÀY SINH (LOGIC CALENDAR GIỮ NGUYÊN) */}
                        <div className="space-y-1">
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                <Input
                                    type="text" name="dobDisplay" placeholder="Chọn ngày sinh (từ 18 tuổi trở lên)"
                                    className="pl-10 pr-3 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10 cursor-pointer"
                                    readOnly
                                    value={formState.dob ? format(formState.dob, "dd/MM/yyyy", { locale: vi }) : ""}
                                    onClick={() => !isLoading && setIsCalendarOpen(!isCalendarOpen)}
                                    aria-invalid={!!errors.dob} disabled={isLoading}
                                />
                                {!errors.dob && touched.dob && formState.dob && (<Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                            </div>

                            {/* POPUP CALENDAR */}
                            <div
                                className={`absolute z-50 mt-2 p-4 bg-purple-950 border border-purple-700 shadow-xl shadow-purple-900/70 rounded-lg ${isCalendarOpen ? 'block' : 'hidden'}`}
                                style={{ width: "auto", maxWidth: "320px", left: "50%", transform: "translateX(-50%)" }}
                            >
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <select
                                            className="bg-purple-900 text-white border border-purple-700 py-1 px-2 rounded-md cursor-pointer text-sm"
                                            value={formState.dob ? formState.dob.getMonth() : new Date().getMonth()}
                                            onChange={(e) => {
                                                const month = parseInt(e.target.value);
                                                const newDate = formState.dob || new Date(2000, 0, 1);
                                                newDate.setMonth(month);
                                                setFormState(prev => ({ ...prev, dob: new Date(newDate) }));
                                                setTouched(prev => ({ ...prev, dob: true }));
                                                validateForm();
                                            }}
                                            disabled={isLoading}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i} value={i}>{new Date(0, i).toLocaleString('vi', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-purple-900 text-white border border-purple-700 py-1 px-2 rounded-md cursor-pointer text-sm"
                                            value={formState.dob ? formState.dob.getFullYear() : 2000}
                                            onChange={(e) => {
                                                const year = parseInt(e.target.value);
                                                const newDate = formState.dob || new Date(2000, 0, 1);
                                                newDate.setFullYear(year);
                                                setFormState(prev => ({ ...prev, dob: new Date(newDate) }));
                                                setTouched(prev => ({ ...prev, dob: true }));
                                                validateForm();
                                            }}
                                            disabled={isLoading}
                                        >
                                            {Array.from({ length: 82 }, (_, i) => (
                                                <option key={i} value={new Date().getFullYear() - 18 - i}>{new Date().getFullYear() - 18 - i}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (<div key={day} className="text-center text-xs text-purple-400 font-medium">{day}</div>))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {(() => {
                                        const date = formState.dob || new Date(2000, 0, 1);
                                        const year = date.getFullYear();
                                        const month = date.getMonth();
                                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                                        const firstDayOfMonth = new Date(year, month, 1).getDay();
                                        const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                                        const days = [];
                                        for (let i = 0; i < startOffset; i++) { days.push(<div key={`empty-${i}`} className="h-8 w-8 flex items-center justify-center" />); }
                                        for (let i = 1; i <= daysInMonth; i++) {
                                            const isSelected = formState.dob && formState.dob.getDate() === i && formState.dob.getMonth() === month && formState.dob.getFullYear() === year;
                                            days.push(
                                                <button
                                                    key={i} type="button"
                                                    className={`h-8 w-8 flex items-center justify-center rounded-full text-sm hover:bg-purple-700 ${isSelected ? 'bg-purple-600 text-white' : 'text-white'}`}
                                                    onClick={() => { const newDate = new Date(year, month, i); handleDateChange(newDate); }}
                                                    disabled={isLoading}
                                                >{i}</button>
                                            );
                                        }
                                        return days;
                                    })()}
                                </div>
                                <div className="flex justify-end mt-3">
                                    <button type="button" className="text-xs text-purple-300 hover:text-white py-1 px-2 rounded" onClick={() => setIsCalendarOpen(false)} disabled={isLoading}>Đóng</button>
                                </div>
                            </div>
                            {errors.dob && <p className="text-pink-400 text-sm ml-1">{errors.dob}</p>}
                        </div>

                        {/* USERNAME */}
                        <div className="space-y-1">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                <Input
                                    type="text" name="username" placeholder="Tên đăng nhập"
                                    className="pl-10 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10"
                                    value={formState.username} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.username} disabled={isLoading} autoComplete="username"
                                />
                                {!errors.username && touched.username && formState.username && (<Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                            </div>
                            {errors.username && <p className="text-pink-400 text-sm ml-1">{errors.username}</p>}
                        </div>

                        {/* EMAIL */}
                        <div className="space-y-1">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                <Input
                                    type="email" name="email" placeholder="Địa chỉ email"
                                    className="pl-10 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10"
                                    value={formState.email} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.email} disabled={isLoading} autoComplete="email"
                                />
                                {!errors.email && touched.email && formState.email && (<Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                            </div>
                            {errors.email && <p className="text-pink-400 text-sm ml-1">{errors.email}</p>}
                        </div>

                        {/* PHONE */}
                        <div className="space-y-1">
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                <Input
                                    type="text" name="phone" placeholder="Số điện thoại"
                                    className="pl-10 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10"
                                    value={formState.phone} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.phone} disabled={isLoading}
                                />
                                {!errors.phone && touched.phone && formState.phone && (<Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                            </div>
                            {errors.phone && <p className="text-pink-400 text-sm ml-1">{errors.phone}</p>}
                        </div>

                        {/* GENDER */}
                        <div className="space-y-1">
                            <label className="text-sm text-purple-300">Giới tính</label>
                            <div className="relative">
                                <RadioGroup
                                    name="gender" value={formState.gender} onValueChange={handleGenderChange}
                                    onBlur={() => { setTouched((prev) => ({ ...prev, gender: true })); validateForm(); }}
                                    className="flex space-x-4" disabled={isLoading} aria-invalid={!!errors.gender}
                                >
                                    {[
                                        { value: "male", label: "Nam" },
                                        { value: "female", label: "Nữ" },
                                        { value: "other", label: "Khác" },
                                    ].map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value={option.value} id={`gender-${option.value}`}
                                                className="bg-purple-900/40 border-purple-700/50 text-white w-5 h-5 rounded-full focus:ring-pink-500/30 data-[state=checked]:bg-pink-600 data-[state=checked]:border-purple-500"
                                            />
                                            <label htmlFor={`gender-${option.value}`} className="text-sm text-purple-300 cursor-pointer">{option.label}</label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                {!errors.gender && touched.gender && formState.gender && (<Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                            </div>
                            {errors.gender && <p className="text-pink-400 text-sm ml-1">{errors.gender}</p>}
                        </div>

                        {/* ADDRESS */}
                        <div className="space-y-1">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                <Input
                                    type="text" name="address" placeholder="Địa chỉ"
                                    className="pl-10 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10"
                                    value={formState.address} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.address} disabled={isLoading}
                                />
                                {!errors.address && touched.address && formState.address && (<Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                            </div>
                            {errors.address && <p className="text-pink-400 text-sm ml-1">{errors.address}</p>}
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-1">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                <Input
                                    type={showPassword ? "text" : "password"} name="password" placeholder="Mật khẩu"
                                    className="pl-10 pr-10 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10"
                                    value={formState.password} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.password} disabled={isLoading} autoComplete="new-password"
                                />
                                <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 focus:outline-none focus:text-pink-400" disabled={isLoading}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {!errors.password && touched.password && formState.password && (<Check className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                            </div>
                            {errors.password && <p className="text-pink-400 text-sm ml-1">{errors.password}</p>}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="space-y-1">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                                <Input
                                    type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Xác nhận mật khẩu"
                                    className="pl-10 pr-10 bg-purple-900/40 border-purple-700/50 focus:border-purple-500 text-white placeholder-purple-300 focus:ring-pink-500/30 rounded-lg h-10"
                                    value={formState.confirmPassword} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.confirmPassword} disabled={isLoading} autoComplete="new-password"
                                />
                                <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 focus:outline-none focus:text-pink-400" disabled={isLoading}>
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {!errors.confirmPassword && touched.confirmPassword && formState.confirmPassword && formState.password === formState.confirmPassword && (<Check className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" size={18} />)}
                            </div>
                            {errors.confirmPassword && <p className="text-pink-400 text-sm ml-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* TERMS */}
                        <div className="space-y-1">
                            <div className="flex items-start space-x-2">
                                <Checkbox id="accept-terms" checked={formState.acceptTerms} onCheckedChange={handleCheckboxChange} className="border-purple-500 data-[state=checked]:bg-pink-600 mt-0.5" disabled={isLoading} />
                                <label htmlFor="accept-terms" className="text-sm text-purple-300">
                                    Tôi đồng ý với <a href="/terms" className="text-pink-400 hover:text-pink-300 hover:underline">Điều khoản dịch vụ</a> và <a href="/privacy" className="text-pink-400 hover:text-pink-300 hover:underline">Chính sách quyền riêng tư</a>
                                </label>
                            </div>
                            {errors.acceptTerms && <p className="text-pink-400 text-sm ml-1">{errors.acceptTerms}</p>}
                        </div>

                        <Button
                            type="submit"
                            className={`w-full bg-gradient-to-r ${isLoading ? 'from-purple-600 to-pink-600 opacity-80' : 'from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'} text-white font-semibold py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 h-11`}
                            disabled={isLoading || Object.keys(errors).length > 0}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Đang xử lý...</span>
                                </div>
                            ) : "Đăng Ký"}
                        </Button>
                    </form>

                    <motion.div
                        className="rounded-xl bg-purple-900/40 border border-purple-700 p-4 text-center mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        <p className="text-sm text-purple-300">
                            Đã có tài khoản?{" "}
                            <a href="/login" className="text-pink-400 font-medium hover:text-pink-300 hover:underline transition-colors">
                                Đăng nhập
                            </a>
                        </p>
                    </motion.div>
                </CardContent>
            </Card>

            {/* DIALOG THÀNH CÔNG (GIỮ NGUYÊN) */}
            <Dialog open={isSuccess}>
                <DialogContent className="bg-purple-950 border-purple-700 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2 text-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            <span>Đăng Ký Thành Công</span>
                        </DialogTitle>
                        <DialogDescription className="text-purple-300 pt-2 text-center">
                            Tài khoản của bạn đã được tạo thành công.
                        </DialogDescription>
                    </DialogHeader>
                    {userInfo && (
                        <div className="bg-purple-900/50 rounded-lg p-4 space-y-3 my-2">
                             {/* ... Phần hiển thị thông tin user giữ nguyên ... */}
                             <div className="space-y-1"><p className="text-xs text-purple-400">Họ và Tên</p><p className="text-sm font-semibold">{userInfo.fullName}</p></div>
                             <div className="space-y-1"><p className="text-xs text-purple-400">Tên đăng nhập</p><p className="text-sm font-semibold">{userInfo.username}</p></div>
                             <div className="space-y-1"><p className="text-xs text-purple-400">Email</p><p className="text-sm font-semibold">{userInfo.email}</p></div>
                        </div>
                    )}
                    <Button onClick={() => navigate("/login")} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white">
                        Đi đến Đăng nhập
                    </Button>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}