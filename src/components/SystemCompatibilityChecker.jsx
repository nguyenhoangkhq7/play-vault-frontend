import { useState, useRef, useEffect } from "react";
import { Upload, AlertCircle, Zap, Cpu, MemoryStick, Monitor, CpuIcon, Copy, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import systemCompatibilityService from "../api/systemCompatibility";
import { parseDXDiagFile } from "../utils/dxdiagParser";

export default function SystemCompatibilityChecker({ gameId, gameName }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Xử lý drag and drop
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Chỉ set false khi rời khỏi drop zone, không phải khi vào child elements
      if (!dropZone.contains(e.relatedTarget)) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileValidation(files[0]);
      }
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleFileValidation = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
      setError("Chỉ chấp nhận file .txt");
      toast.error("Chỉ chấp nhận file .txt");
      return;
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File quá lớn (tối đa 5MB)");
      toast.error("File quá lớn (tối đa 5MB)");
      return;
    }

    setFile(selectedFile);
    setError(null);
    toast.success(`Đã chọn file: ${selectedFile.name}`);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    handleFileValidation(selectedFile);
  };

  const handleCheck = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file DXDiag.txt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("📄 File selected:", file.name, "Size:", file.size);
      
      // Parse file content on frontend to debug
      const fileContent = await file.text();
      console.log("🔍 File content preview (first 500 chars):");
      console.log(fileContent.substring(0, 500));
      
      const parsedLocally = await parseDXDiagFile(file);
      console.log("✅ Frontend parsed result:", parsedLocally);
      
      console.log("\n🚀 Uploading file to backend...");
      const response = await systemCompatibilityService.quickCheckCompatibility(gameId, file);
      
      console.log("===== RESPONSE FROM BACKEND =====");
      console.log("Full response:", response);
      console.log("response.success:", response.success);
      console.log("response.compatibilityResult:", response.compatibilityResult);
      console.log("response.systemInfo:", response.systemInfo);
      console.log("response.message:", response.message);
      
      // Check userSystem data
      if (response.compatibilityResult?.userSystem) {
        console.log("❌ Backend userSystem:", response.compatibilityResult.userSystem);
        console.log("⚠️ If all values are 'Unknown', backend parser may have issues");
      }
      console.log("==================================");
      
      if (response.success) {
        // Backend trả về compatibilityResult
        const resultData = response.compatibilityResult;
        
        if (!resultData) {
          console.error("❌ Không tìm thấy compatibilityResult trong response!");
          setError("Backend không trả về kết quả. Kiểm tra console backend.");
          toast.error("Không có kết quả từ server");
          return;
        }
        
        // Check if userSystem has real data
        if (resultData.userSystem && 
            resultData.userSystem.os === "Unknown" && 
            resultData.userSystem.cpu === "Unknown" &&
            resultData.userSystem.gpu === "Unknown") {
          console.warn("⚠️ Backend parser returned all 'Unknown' values");
          console.log("📝 Note: Backend DXDiag parser may need improvement");
        }
        
        console.log("✅ Result data:", resultData);
        setResult(resultData);
        toast.success("✅ Kiểm tra cấu hình thành công!");
      } else {
        setError(response.message || "Không thể kiểm tra cấu hình");
        toast.error(response.message || "Lỗi khi kiểm tra");
      }
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      
      // Xử lý lỗi từ server hoặc network
      let errorMsg = "Lỗi khi kiểm tra cấu hình";
      
      if (err.response?.status === 401) {
        errorMsg = "Token hết hạn. Vui lòng đăng nhập lại!";
      } else if (err.response?.status === 404) {
        errorMsg = "Game không tồn tại hoặc endpoint sai";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (level) => {
    switch (level?.toLowerCase()) {
      case "rất cao":
      case "very high":
        return "from-emerald-500 to-green-500";
      case "cao":
      case "high":
        return "from-cyan-500 to-blue-500";
      case "trung bình":
      case "medium":
        return "from-amber-500 to-orange-500";
      case "thấp":
      case "low":
        return "from-orange-500 to-red-500";
      case "rất thấp":
      case "very low":
        return "from-red-600 to-rose-600";
      default:
        return "from-slate-600 to-gray-600";
    }
  };

  const getProgressColor = (score) => {
    if (score >= 0.8) return "text-emerald-400";
    if (score >= 0.6) return "text-cyan-400";
    if (score >= 0.4) return "text-amber-400";
    return "text-red-400";
  };

  const specIcons = {
    os: <Monitor className="w-5 h-5" />,
    cpu: <CpuIcon className="w-5 h-5" />,
    gpu: <Monitor className="w-5 h-5" />,
    ram: <MemoryStick className="w-5 h-5" />
  };

  const resetChecker = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/90 border border-gray-800 backdrop-blur-xl shadow-2xl"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-purple-500/30">
              <Zap className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Kiểm tra tương thích hệ thống
              </h3>
              <p className="text-gray-400">Đảm bảo PC của bạn có thể chơi mượt mà</p>
            </div>
          </div>

          {/* File Upload Area với Drag & Drop */}
          <div className="mb-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            <motion.div
              ref={dropZoneRef}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative overflow-hidden rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer group ${
                isDragging 
                  ? "border-cyan-500 bg-cyan-500/10 scale-105" 
                  : file 
                  ? "border-emerald-500/50 bg-emerald-500/5" 
                  : "border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/5"
              }`}
            >
              {/* Hiệu ứng khi drag */}
              {isDragging && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-white font-bold text-lg">Thả file tại đây</p>
                  </div>
                </motion.div>
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <div className="relative flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full transition-all duration-300 ${
                  isDragging ? "bg-cyan-500/30 scale-110" :
                  file ? "bg-emerald-500/20" : "bg-gray-800 group-hover:bg-cyan-500/20"
                }`}>
                  {isDragging ? (
                    <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
                  ) : (
                    <Upload className={`w-8 h-8 transition-colors ${
                      file ? "text-emerald-400" : "text-gray-400 group-hover:text-cyan-400"
                    }`} />
                  )}
                </div>
                
                <div>
                  <motion.p 
                    key={file ? 'has-file' : 'no-file'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-semibold text-white mb-1"
                  >
                    {file ? file.name : "Kéo thả hoặc nhấn để chọn file"}
                  </motion.p>
                  <p className="text-sm text-gray-400">
                    {file ? "File đã sẵn sàng để kiểm tra" : "Tối đa 5MB • Định dạng .txt"}
                  </p>
                </div>

                {!file && !isDragging && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <p className="text-sm text-gray-300">DXDiag.txt</p>
                  </motion.div>
                )}

                {/* Drag & Drop Hint */}
                {!file && !isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
                  >
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="text-cyan-400">💡</span> 
                      Kéo file .txt và thả vào đây hoặc nhấn để chọn
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCheck}
              disabled={!file || loading}
              className="flex-1 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 group-hover:from-cyan-500 group-hover:to-purple-500 transition-all" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 py-4 px-6 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    BẮT ĐẦU KIỂM TRA
                  </>
                )}
              </div>
            </motion.button>

            {file && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetChecker}
                className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-all border border-gray-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Mới
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl p-4 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 backdrop-blur-sm"
          >
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium mb-1">Có lỗi xảy ra</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            {/* Main Result Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500" />
              
              <div className="p-8">
                {/* Title */}
                <h3 className="text-3xl font-bold text-white mb-12 text-center">
                  Kết quả kiểm tra: <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{gameName}</span>
                </h3>

                {/* Main Score and Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-8">
                  {/* Left: Big Percentage Display */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    {/* Big Percentage Number */}
                    <div className="relative mb-6">
                      <div 
                        className="text-8xl font-black"
                        style={{
                          background: `linear-gradient(90deg, 
                            #10b981 0%, 
                            #06b6d4 ${result.percentage}%, 
                            rgba(255,255,255,0.15) ${result.percentage}%, 
                            rgba(255,255,255,0.15) 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          transition: 'background 0.5s ease',
                          textShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {result.percentage}%
                      </div>
                    </div>
                    
                    {/* Level Label */}
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {result.level}
                    </div>
                    
                    {/* Status Message */}
                    <div className="mt-8 text-center max-w-sm">
                      <p className={`text-lg font-semibold ${
                        result.percentage >= 80
                          ? "text-emerald-300"
                          : result.percentage >= 60
                          ? "text-cyan-300"
                          : result.percentage >= 40
                          ? "text-amber-300"
                          : "text-red-300"
                      }`}>
                        {result.percentage >= 80
                          ? "🎉 PC của bạn có thể chơi game này mượt mà!"
                          : result.percentage >= 60
                          ? "✅ PC của bạn đạt yêu cầu tối thiểu"
                          : result.percentage >= 40
                          ? "⚡ Có thể cần điều chỉnh cài đặt"
                          : "🔧 Cần nâng cấp phần cứng"
                        }
                      </p>
                    </div>
                  </motion.div>

                  {/* Center & Right: Spec Details */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 gap-5">
                      {[
                        { key: 'os', label: 'Hệ điều hành', score: result.details?.os },
                        { key: 'cpu', label: 'Bộ xử lý', score: result.details?.cpu },
                        { key: 'gpu', label: 'Card đồ họa', score: result.details?.gpu },
                        { key: 'ram', label: 'Bộ nhớ RAM', score: result.details?.ram },
                      ].map((item, idx) => (
                        <motion.div 
                          key={item.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          className={`relative overflow-hidden rounded-xl p-5 border-2 backdrop-blur-sm ${
                            item.score >= 0.8
                              ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/50"
                              : item.score >= 0.6
                              ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50"
                              : item.score >= 0.4
                              ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50"
                              : "bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-500/50"
                          }`}
                        >
                          {/* Label and Icon */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`${
                              item.score >= 0.8
                                ? "text-emerald-400"
                                : item.score >= 0.6
                                ? "text-cyan-400"
                                : item.score >= 0.4
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}>
                              {specIcons[item.key]}
                            </div>
                            <span className="text-sm text-gray-300 font-medium">{item.label}</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden mb-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.score * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                item.score >= 0.8
                                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                  : item.score >= 0.6
                                  ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                                  : item.score >= 0.4
                                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                  : "bg-gradient-to-r from-red-400 to-rose-500"
                              }`}
                            />
                          </div>
                          
                          {/* Percentage below */}
                          <div className="text-center">
                            <span className={`text-lg font-bold ${getProgressColor(item.score)}`}>
                              {(item.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* System Comparison - Side by Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* User System */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 flex-shrink-0">
                      <Cpu className="w-7 h-7 text-cyan-400" />
                    </div>
                    <h4 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Cấu hình của bạn</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(result.userSystem || {}).map(([key, value]) => (
                      <motion.div 
                        key={key}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-5 bg-gray-800/40 rounded-xl border border-gray-700/60 hover:border-cyan-500/50 hover:bg-gray-800/60 transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                            {specIcons[key]}
                          </div>
                          <span className="text-gray-400 capitalize font-medium">
                            {key === 'cpu' ? 'CPU' : key === 'gpu' ? 'GPU' : key === 'ram' ? 'RAM' : key.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white font-bold text-base leading-relaxed break-words ml-10">
                          {value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Required System */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 flex-shrink-0">
                      <Zap className="w-7 h-7 text-purple-400" />
                    </div>
                    <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Yêu cầu game</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(result.requiredSystem || {}).map(([key, value]) => (
                      <motion.div 
                        key={key}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-5 bg-gray-800/40 rounded-xl border border-gray-700/60 hover:border-purple-500/50 hover:bg-gray-800/60 transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                            {specIcons[key]}
                          </div>
                          <span className="text-gray-400 capitalize font-medium">
                            {key === 'cpu' ? 'CPU' : key === 'gpu' ? 'GPU' : key === 'ram' ? 'RAM' : key.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white font-bold text-base leading-relaxed break-words ml-10">
                          {value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Gợi ý tối ưu</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendations.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="flex gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-emerald-500/30 transition-colors group"
                    >
                      <div className="text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform">✓</div>
                      <p className="text-gray-300 group-hover:text-white transition-colors">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetChecker}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Kiểm tra lại
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const text = `Kết quả kiểm tra tương thích ${gameName}:\n\n` +
                    `Tổng điểm: ${result.percentage}% (${result.level})\n\n` +
                    `📊 CẤU HÌNH CỦA BẠN:\n` +
                    `• Hệ điều hành: ${result.userSystem?.os}\n` +
                    `• CPU: ${result.userSystem?.cpu}\n` +
                    `• GPU: ${result.userSystem?.gpu}\n` +
                    `• RAM: ${result.userSystem?.ram}\n\n` +
                    `🎮 YÊU CẦU GAME:\n` +
                    `• Hệ điều hành: ${result.requiredSystem?.os}\n` +
                    `• CPU: ${result.requiredSystem?.cpu}\n` +
                    `• GPU: ${result.requiredSystem?.gpu}\n` +
                    `• RAM: ${result.requiredSystem?.ram}`;
                  
                  navigator.clipboard.writeText(text);
                  toast.success("✅ Đã sao chép kết quả!");
                }}
                className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Sao chép kết quả
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
      >
        <h4 className="text-xl font-bold text-white mb-4">📝 Hướng dẫn lấy file DXDiag</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "1",
              title: "Mở DXDiag",
              description: "Nhấn Win + R, gõ 'dxdiag' và nhấn Enter",
              icon: "🚀"
            },
            {
              step: "2",
              title: "Lưu thông tin",
              description: "Chọn 'Save All Information' ở góc dưới cùng",
              icon: "💾"
            },
            {
              step: "3",
              title: "Chọn định dạng",
              description: "Lưu file với định dạng .txt",
              icon: "📄"
            },
            {
              step: "4",
              title: "Upload và kiểm tra",
              description: "Kéo thả file hoặc nhấn để chọn",
              icon: "⚡"
            }
          ].map((item) => (
            <div key={item.step} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <span className="text-xl">{item.icon}</span>
              </div>
              <h5 className="text-white font-semibold mb-2">{item.title}</h5>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}