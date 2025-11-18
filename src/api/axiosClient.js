import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- GẮN TOKEN VÀO HEADER ---
axiosClient.interceptors.request.use(async (config) => {
    // Lấy token từ localStorage
    // Đảm bảo tên key 'accessToken' KHỚP với lúc bạn lưu ở trang Login
    const token = localStorage.getItem('accessToken'); 
    
    if (token) {
        // In ra để kiểm tra xem có lấy được token không
        console.log("🔑 Đang gửi request với Token:", token.substring(0, 15) + "..."); 
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn("⚠️ Không tìm thấy Token! Request này sẽ bị 401 nếu Backend yêu cầu login.");
    }
    
    return config;
});

// --- XỬ LÝ KHI TOKEN HẾT HẠN (401) ---
axiosClient.interceptors.response.use((response) => {
    if (response && response.data) {
        return response.data;
    }
    return response;
}, (error) => {
    console.error("❌ API Error:", error.response?.status, error.message);

    // Nếu bị 401 (Unauthorized) -> Có thể Token hết hạn hoặc không đúng
    if (error.response && error.response.status === 401) {
        console.log("🔒 Token hết hạn hoặc không hợp lệ. Đang đăng xuất...");
        // Xóa token cũ đi để tránh gửi sai mãi
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Tùy chọn: Chuyển hướng người dùng về trang đăng nhập
        // window.location.href = '/login'; 
    }
    
    throw error;
});

export default axiosClient;