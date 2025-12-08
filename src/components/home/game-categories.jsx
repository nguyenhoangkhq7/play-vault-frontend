import { useEffect, useState } from "react";
import { getCategories } from "../../api/categories";

export default function GameCategories() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(()=>{
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const allCategory= await getCategories();
        setCategories(allCategory);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold text-white mb-6">Danh mục sản phẩm</h2>

      <div className="grid grid-cols-10 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-full transition-colors min-w-[120px] h-10 ${activeCategory === category.id
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
              }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {/* <category.icon className="w-4 h-4" /> */}
            <span className="text-sm">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}