import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Trash2, Edit } from "lucide-react";
import { getGames, addGame, updateGame, deleteGame } from "../api/games.js";
import { uploadImagesToCloudinary } from "../api/cloudinary.js";
import DataTable from "react-data-table-component";

function GameManagement() {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({
    name: "",
    price: 0,
    tags: [],
    details: { publisher: "", describe: "", "age-limit": "" },
    images: [],
    thumbnail_image: "",
    minimum_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
    recommended_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
  });
  const [editingGame, setEditingGame] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const data = await getGames();
      setGames(data.games || data); // Adjust based on your JSON server response structure
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const setDefaultConfiguration = () => {
    const defaultConfig = {
      minimum_configuration: {
        os: "Windows 10",
        cpu: "Intel i5",
        ram: "8GB",
        gpu: "NVIDIA GTX 970",
        disk: "50GB",
      },
      recommended_configuration: {
        os: "Windows 11",
        cpu: "Intel i7",
        ram: "16GB",
        gpu: "NVIDIA RTX 3060",
        disk: "100GB",
      },
    };
    if (editingGame) {
      setEditingGame((prev) => ({ ...prev, ...defaultConfig }));
    } else {
      setNewGame((prev) => ({ ...prev, ...defaultConfig }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    if (editingGame) {
      setEditingGame({
        ...editingGame,
        images: editingGame.images.filter((_, i) => i !== index),
      });
    } else {
      setNewGame({
        ...newGame,
        images: newGame.images.filter((_, i) => i !== index),
      });
    }
  };

  const clearAllFields = () => {
    if (!editingGame) {
      setNewGame({
        name: "",
        price: 0,
        tags: [],
        details: { publisher: "", describe: "", "age-limit": "" },
        images: [],
        thumbnail_image: "",
        minimum_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
        recommended_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
      });
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  const handleAddGame = async () => {
    if (imageFiles.length > 0) {
      const uploadedImageUrls = await uploadImagesToCloudinary(imageFiles);
      const gameToAdd = {
        ...newGame,
        images: uploadedImageUrls,
        thumbnail_image: uploadedImageUrls[0] || "",
      };
      try {
        const response = await addGame(gameToAdd);
        await fetchGames(); // Refresh with server-generated ID
        setNewGame({
          name: "",
          price: 0,
          tags: [],
          details: { publisher: "", describe: "", "age-limit": "" },
          images: [],
          thumbnail_image: "",
          minimum_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
          recommended_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
        });
        setImageFiles([]);
        setImagePreviews([]);
      } catch (error) {
        console.error("Error adding game:", error);
      }
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setImagePreviews(game.images || []);
    setImageFiles([]);
  };

  const handleUpdateGame = async () => {
    if (!editingGame) return;

    let updatedImageUrls = editingGame.images;
    if (imageFiles.length > 0) {
      updatedImageUrls = await uploadImagesToCloudinary(imageFiles);
    }

    const updatedGame = {
      ...editingGame,
      images: updatedImageUrls,
      thumbnail_image: updatedImageUrls[0] || editingGame.thumbnail_image,
    };
    try {
      await updateGame(editingGame.id, updatedGame);
      await fetchGames(); // Refresh to sync with server
      setEditingGame(null);
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Error updating game:", error);
    }
  };

  const handleDeleteGame = async (id) => {
    try {
      await deleteGame(id);
      await fetchGames(); // Refresh after deletion
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  const columns = [
    {
      name: "Tên",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <span className="text-white">{row.name}</span>,
    },
    {
      name: "Giá",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => (
        <span className="text-white">{row.price.toLocaleString("vi-VN")} VND</span>
      ),
    },
    {
      name: "Tags",
      selector: (row) => row.tags.join(", "),
      cell: (row) => <span className="text-white">{row.tags.join(", ")}</span>,
    },
    {
      name: "Nhà Phát Hành",
      selector: (row) => row.details.publisher,
      cell: (row) => <span className="text-white">{row.details.publisher}</span>,
    },
    {
      name: "Hình Ảnh",
      cell: (row) => (
        <div className="flex gap-2">
          {row.images && row.images.slice(0, 3).map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Game ${row.name} ${index}`}
              className="w-16 h-16 object-cover rounded-md"
            />
          ))}
        </div>
      ),
    },
    {
      name: "Hành Động",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleEditGame(row)}
            variant="outline"
            className="border-blue-400 text-blue-200 hover:bg-blue-700 hover:text-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => handleDeleteGame(row.id)}
            variant="outline"
            className="border-red-400 text-red-200 hover:bg-red-700 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: "hsl(var(--card))",
        backdropFilter: "blur(4px)",
        borderRadius: "var(--radius)",
        border: "1px solid hsl(var(--border))",
        fontFamily: "Inter, sans-serif",
        color: "hsl(var(--foreground))",
      },
    },
    tableWrapper: {
      style: {
        backgroundColor: "transparent",
      },
    },
    head: {
      style: {
        backgroundColor: "transparent",
        borderBottom: "1px solid hsl(var(--border))",
      },
    },
    headRow: {
      style: {
        backgroundColor: "transparent",
      },
    },
    headCells: {
      style: {
        color: "hsl(var(--primary))",
        fontWeight: "600",
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
        padding: "12px",
      },
    },
    cells: {
      style: {
        color: "hsl(var(--foreground))",
        backgroundColor: "transparent",
        padding: "12px",
        borderTop: "1px solid hsl(var(--border))",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "hsl(var(--accent))",
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
        borderTop: "1px solid hsl(var(--border))",
        fontFamily: "Inter, sans-serif",
      },
      pageButtonsStyle: {
        color: "hsl(var(--foreground))",
        backgroundColor: "transparent",
        "&:hover:not(:disabled)": {
          backgroundColor: "hsl(var(--accent))",
        },
        "&:disabled": {
          color: "hsl(var(--muted-foreground))",
        },
      },
    },
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Quản Lý Game</h1>

      {/* Form Thêm/Sửa Game */}
      <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          {editingGame ? "Sửa Game" : "Thêm Game Mới"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Tên game"
            value={editingGame ? editingGame.name : newGame.name}
            onChange={(e) =>
              editingGame
                ? setEditingGame({ ...editingGame, name: e.target.value })
                : setNewGame({ ...newGame, name: e.target.value })
            }
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          />
          <input
            type="number"
            placeholder="Giá (VND)"
            value={editingGame ? editingGame.price : newGame.price}
            onChange={(e) =>
              editingGame
                ? setEditingGame({
                    ...editingGame,
                    price: parseInt(e.target.value) || 0,
                  })
                : setNewGame({ ...newGame, price: parseInt(e.target.value) || 0 })
            }
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          />
          <input
            type="text"
            placeholder="Tags (cách nhau bằng dấu phẩy)"
            value={
              editingGame
                ? editingGame.tags.join(",")
                : newGame.tags.join(",")
            }
            onChange={(e) =>
              editingGame
                ? setEditingGame({
                    ...editingGame,
                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                  })
                : setNewGame({
                    ...newGame,
                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                  })
            }
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          />
          <input
            type="text"
            placeholder="Nhà phát hành"
            value={
              editingGame
                ? editingGame.details.publisher
                : newGame.details.publisher
            }
            onChange={(e) =>
              editingGame
                ? setEditingGame({
                    ...editingGame,
                    details: { ...editingGame.details, publisher: e.target.value },
                  })
                : setNewGame({
                    ...newGame,
                    details: { ...newGame.details, publisher: e.target.value },
                  })
            }
            className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
          />
          {/* Configuration Inputs */}
          <div className="col-span-2">
            <h3 className="text-white mb-2">Cấu Hình Tối Thiểu</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="OS"
                value={editingGame ? editingGame.minimum_configuration.os : newGame.minimum_configuration.os}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        minimum_configuration: { ...editingGame.minimum_configuration, os: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        minimum_configuration: { ...newGame.minimum_configuration, os: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
              <input
                type="text"
                placeholder="CPU"
                value={editingGame ? editingGame.minimum_configuration.cpu : newGame.minimum_configuration.cpu}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        minimum_configuration: { ...editingGame.minimum_configuration, cpu: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        minimum_configuration: { ...newGame.minimum_configuration, cpu: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
              <input
                type="text"
                placeholder="RAM"
                value={editingGame ? editingGame.minimum_configuration.ram : newGame.minimum_configuration.ram}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        minimum_configuration: { ...editingGame.minimum_configuration, ram: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        minimum_configuration: { ...newGame.minimum_configuration, ram: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
              <input
                type="text"
                placeholder="GPU"
                value={editingGame ? editingGame.minimum_configuration.gpu : newGame.minimum_configuration.gpu}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        minimum_configuration: { ...editingGame.minimum_configuration, gpu: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        minimum_configuration: { ...newGame.minimum_configuration, gpu: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
              <input
                type="text"
                placeholder="Disk"
                value={editingGame ? editingGame.minimum_configuration.disk : newGame.minimum_configuration.disk}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        minimum_configuration: { ...editingGame.minimum_configuration, disk: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        minimum_configuration: { ...newGame.minimum_configuration, disk: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
            </div>
            <h3 className="text-white mt-4 mb-2">Cấu Hình Đề Nghị</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="OS"
                value={editingGame ? editingGame.recommended_configuration.os : newGame.recommended_configuration.os}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        recommended_configuration: { ...editingGame.recommended_configuration, os: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        recommended_configuration: { ...newGame.recommended_configuration, os: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
              <input
                type="text"
                placeholder="CPU"
                value={editingGame ? editingGame.recommended_configuration.cpu : newGame.recommended_configuration.cpu}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        recommended_configuration: { ...editingGame.recommended_configuration, cpu: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        recommended_configuration: { ...newGame.recommended_configuration, cpu: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
              <input
                type="text"
                placeholder="RAM"
                value={editingGame ? editingGame.recommended_configuration.ram : newGame.recommended_configuration.ram}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        recommended_configuration: { ...editingGame.recommended_configuration, ram: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        recommended_configuration: { ...newGame.recommended_configuration, ram: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
              <input
                type="text"
                placeholder="GPU"
                value={editingGame ? editingGame.recommended_configuration.gpu : newGame.recommended_configuration.gpu}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        recommended_configuration: { ...editingGame.recommended_configuration, gpu: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        recommended_configuration: { ...newGame.recommended_configuration, gpu: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
              <input
                type="text"
                placeholder="Disk"
                value={editingGame ? editingGame.recommended_configuration.disk : newGame.recommended_configuration.disk}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        recommended_configuration: { ...editingGame.recommended_configuration, disk: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        recommended_configuration: { ...newGame.recommended_configuration, disk: e.target.value },
                      })
                }
                className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2"
              />
            </div>
            <Button
              onClick={setDefaultConfiguration}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Đặt Cấu Hình Mặc Định
            </Button>
          </div>
          {/* Image Upload */}
          <div className="col-span-2 mt-4">
            <label className="text-white mb-2 block">Tải lên hình ảnh</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="bg-purple-800/30 text-white border border-purple-500/30 rounded-md px-4 py-2 w-full"
            />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Xem trước ${index}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <Button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            onClick={editingGame ? handleUpdateGame : handleAddGame}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {editingGame ? "Cập Nhật" : "Thêm Game"}
          </Button>
          <Button
            onClick={clearAllFields}
            className="bg-gray-600 hover:bg-gray-700 text-white"
            disabled={editingGame}
          >
            Xóa Trắng Tất Cả
          </Button>
        </div>
      </div>

      {/* Danh sách Game */}
      <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
        <h2 className="text-xl font-semibold text-white mb-4">Danh Sách Game</h2>
        <DataTable
          columns={columns}
          data={games}
          pagination
          paginationPerPage={10}
          customStyles={customStyles}
          noDataComponent={<span className="text-white">Không có game nào</span>}
        />
      </div>
    </div>
  );
}

export default GameManagement;