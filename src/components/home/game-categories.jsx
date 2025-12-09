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
      

      
    </div>
  );
}