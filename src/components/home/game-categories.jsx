import { useEffect, useState } from "react";
import {
  Gamepad2, Sword, Map, Rocket, Trophy, Building2, WandSparkles,
  EyeOff, Box, Compass, Globe, Crosshair, Target, Users, Puzzle,
  Layers, LandPlot, Sparkle, PartyPopper, UserX, Ghost, Shield,
  Heart, Wheat, Palette, Building, Brain, Clock, Zap, Axe
} from "lucide-react";
import { set } from "date-fns";
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