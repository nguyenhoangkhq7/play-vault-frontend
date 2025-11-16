import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button } from "../components/ui/Button";
import { Edit, Trash2, X, Eye, Search } from "lucide-react";
import { getUsers, updateUser, createUser } from "../api/users.js";
import { uploadImagesToCloudinary } from "../api/cloudinary.js";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    f_name: "",
    l_name: "",
    username: "",
    dob: "",
    avatar: "",
    status: "active",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers().then((data) =>
      setUsers(data.map((user) => ({ ...user, status: user.status || "active" })))
    );
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearForm = () => {
    setFormData({
      id: "",
      f_name: "",
      l_name: "",
      username: "",
      dob: "",
      avatar: "",
      status: "active",
    });
    setAvatarFile(null);
  };

  const handleSubmit = async () => {
    let avatarUrl = formData.avatar;
    if (avatarFile) {
      const uploadedUrls = await uploadImagesToCloudinary([avatarFile]);
      avatarUrl =
        uploadedUrls[0] ||
        "https://res.cloudinary.com/dqnj8bsgu/image/upload/v1746630940/avatar_f6yerg.jpg";
    }

    const newUser = {
      ...formData,
      avatar: avatarUrl.startsWith("data:") ? "" : avatarUrl,
      dob: formData.dob ? { $date: new Date(formData.dob).toISOString() } : formData.dob,
      id: formData.id || String(users.length + 1),
      status: formData.status || "active",
    };

    try {
      if (formData.id) {
        // Update existing user
        await updateUser(formData.id, newUser);
        setUsers(users.map((u) => (u.id === formData.id ? newUser : u)));
      } else {
        // Create new user
        const createdUser = await createUser(newUser);
        setUsers([...users, createdUser]);
      }
      handleClearForm();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleEditUser = (user) => {
    setFormData({
      id: user.id,
      f_name: user.f_name,
      l_name: user.l_name,
      username: user.username,
      dob: user.dob?.$date ? new Date(user.dob.$date).toISOString().split("T")[0] : "",
      avatar: user.avatar || "",
      status: user.status || "active",
    });
    setAvatarFile(null);
  };

  const handleDeleteUser = async (id) => {
    try {
      const updatedUser = users.find((u) => u.id === id);
      updatedUser.status = "deleted";
      await updateUser(id, updatedUser);
      setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users
    .filter((u) => (showDeleted ? u.status === "deleted" : u.status !== "deleted"))
    .filter((u) => {
      const fullName = `${u.f_name} ${u.l_name}`.toLowerCase();
      const username = u.username.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || username.includes(search);
    });

  const columns = [
    {
      name: "Avatar",
      cell: (row) => (
        <img
          src={
            row.avatar ||
            "https://res.cloudinary.com/dqnj8bsgu/image/upload/v1746561931/default_avatar.jpg"
          }
          alt={`${row.f_name} ${row.l_name}`}
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
      width: "80px",
    },
    {
      name: "Họ Tên",
      selector: (row) => `${row.f_name} ${row.l_name}`,
      sortable: true,
    },
    {
      name: "Username",
      selector: (row) => row.username,
      sortable: true,
    },
    {
      name: "Ngày Sinh",
      selector: (row) =>
        row.dob?.$date ? new Date(row.dob.$date).toLocaleDateString("vi-VN") : "N/A",
      sortable: true,
    },
    {
      name: "Trạng Thái",
      cell: (row) => (
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${row.status === "active"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
        >
          {row.status === "active" ? "Hoạt Động" : "Đã Xóa"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Hành Động",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleEditUser(row)}
            variant="outline"
            className="border-blue-400 text-blue-200 hover:bg-blue-700 hover:text-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => handleDeleteUser(row.id)}
            variant="outline"
            className="border-red-400 text-red-200 hover:bg-red-700 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: "150px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#3b0764",
        color: "#d8b4fe",
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        backgroundColor: "#2d004b",
        color: "#ffffff",
        borderTop: "1px solid rgba(139, 92, 246, 0.3)",
      },
    },
    table: {
      style: {
        backgroundColor: "#2d004b",
      },
    },
    pagination: {
      style: {
        backgroundColor: "#2d004b",
        color: "#ffffff",
        borderTop: "1px solid rgba(139, 92, 246, 0.3)",
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-8">Quản Lý Người Dùng</h1>

      {/* Form Nhập Liệu */}
      <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Thêm/Sửa Người Dùng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="f_name"
            placeholder="Họ"
            value={formData.f_name}
            onChange={handleInputChange}
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          />
          <input
            type="text"
            name="l_name"
            placeholder="Tên"
            value={formData.l_name}
            onChange={handleInputChange}
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          />
          <input
            type="date"
            name="dob"
            placeholder="Ngày sinh"
            value={formData.dob}
            onChange={handleInputChange}
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          />
          <div className="flex flex-col">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
            />
            {formData.avatar && (
              <img
                src={formData.avatar}
                alt="Avatar Preview"
                className="mt-2 w-20 h-20 rounded-full object-cover"
              />
            )}
          </div>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          >
            <option value="active">Hoạt Động</option>
            <option value="deleted">Đã Xóa</option>
          </select>
        </div>
        <div className="flex gap-4 mt-4">
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {formData.id ? "Cập Nhật" : "Thêm"}
          </Button>
          <Button
            onClick={handleClearForm}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <X className="w-4 h-4 mr-2" /> Xóa Trắng
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {showDeleted ? "Danh Sách Tài Khoản Đã Xóa" : "Danh Sách Người Dùng"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc username"
                value={searchTerm}
                onChange={handleSearch}
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            </div>
            <Button
              onClick={() => setShowDeleted(!showDeleted)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showDeleted ? "Xem Tài Khoản Hoạt Động" : "Xem Tài Khoản Đã Xóa"}
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredUsers}
          customStyles={customStyles}
          pagination
          paginationPerPage={10}
          highlightOnHover
          pointerOnHover
        />
      </div>
    </div>
  );
}

export default UserManagement;