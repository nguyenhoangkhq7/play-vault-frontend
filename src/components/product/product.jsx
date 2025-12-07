'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import searchApi from "../../api/searchApi"; 
import { 
  ChevronLeft, ChevronRight, Star, Heart, Search, 
  Grid3x3, List, Loader2, Filter, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamesPage() {
  const [games, setGames] = useState([]); 
  const [featuredGames, setFeaturedGames] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showFilter, setShowFilter] = useState(false); 
  const [priceInputs, setPriceInputs] = useState({ min: '', max: '' }); 

  // STATE MỚI: Danh sách thể loại (Khởi tạo mục "All" mặc định)
  const [genres, setGenres] = useState([
    { id: null, name: 'All' } 
  ]);

  const [filterParams, setFilterParams] = useState({
    keyword: '',      
    categoryId: null, 
    minPrice: null,
    maxPrice: null,
    page: 0,
    size: 12          
  });

  const fallbackImage = "https://via.placeholder.com/300x224.png?text=No+Image";

  // 1. Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await searchApi.getAllCategories();
      const data = response.data || response;
      // Gộp mục "All" với dữ liệu từ API
      setGenres([{ id: null, name: 'All' }, ...data]);
    } catch (error) {
      console.error("Lỗi khi tải thể loại:", error);
    }
  };

  // 2. Fetch Games
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await searchApi.searchGames(filterParams);
      
      if (response && response.content) {
        setGames(response.content); 
        setTotalPages(response.totalPages); 
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedGames = async () => {
    try {
       const response = await searchApi.searchGames({ size: 5 });
       if(response && response.content) {
          setFeaturedGames(response.content);
       }
    } catch (error) {
      console.error("Lỗi khi tải featured games:", error);
    }
  };

  // Gọi API Categories khi mount
  useEffect(() => {
    fetchCategories();
    fetchFeaturedGames();
  }, []);

  useEffect(() => {
    fetchGames();
  }, [filterParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilterParams(prev => ({ ...prev, keyword: searchQuery, page: 0 }));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleGenreSelect = (id) => {
    setFilterParams(prev => ({ ...prev, categoryId: id, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilterParams(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApplyPriceFilter = () => {
    setFilterParams(prev => ({
      ...prev,
      minPrice: priceInputs.min || null,
      maxPrice: priceInputs.max || null,
      page: 0
    }));
    setShowFilter(false); 
  };

  const handleResetPriceFilter = () => {
    setPriceInputs({ min: '', max: '' });
    setFilterParams(prev => ({
      ...prev,
      minPrice: null,
      maxPrice: null,
      page: 0
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 font-sans text-slate-200">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-purple-950/80 border-b border-purple-800/50 shadow-lg shadow-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
                Khám Phá Các Tựa Game
              </h1>
              <p className="text-xs text-purple-300/80 mt-1">Thế giới giải trí vô tận đang chờ đón bạn</p>
            </div>
            <div className="flex gap-2 self-end md:self-auto">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-slate-400 hover:text-slate-200'}`}>
                <Grid3x3 size={20} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-slate-400 hover:text-slate-200'}`}>
                <List size={20} />
              </button>
            </div>
          </div>

          {/* --- DANH MỤC (CATEGORIES) --- */}
          <div className="w-full overflow-x-auto pb-2 no-scrollbar">
            <div className="flex flex-nowrap gap-2 min-w-max">
              {genres.map((genre) => (
                <motion.button 
                  key={genre.id || 'all'} 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => handleGenreSelect(genre.id)} 
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition border whitespace-nowrap ${
                    filterParams.categoryId === genre.id 
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 text-pink-300 shadow-lg shadow-pink-500/20' 
                    : 'bg-purple-900/50 border-purple-700 text-purple-300 hover:text-purple-100 hover:border-purple-600'
                  }`}
                >
                  {genre.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (Đã tăng khoảng cách top: py-12 và mt-4) --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-4 space-y-8">
        
        {/* --- TÌM KIẾM (SEARCH & FILTER) --- */}
        <section>
          <div className="max-w-2xl relative z-20">
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative flex items-center gap-3 bg-purple-900/50 border border-purple-800 hover:border-purple-700 rounded-xl px-4 py-3 transition backdrop-blur-sm">
                  <Search size={18} className="text-slate-400" />
                  <input type="text" placeholder="Tìm kiếm game, studio..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-sm" />
                </div>
              </div>
              <button onClick={() => setShowFilter(!showFilter)} className={`px-4 rounded-xl border transition flex items-center gap-2 ${showFilter || filterParams.minPrice || filterParams.maxPrice ? 'bg-pink-600/20 border-pink-500/50 text-pink-300' : 'bg-purple-900/50 border-purple-800 text-slate-400 hover:border-purple-600 hover:text-white'}`}>
                <Filter size={20} /> <span className="hidden sm:inline text-sm font-medium">Lọc giá</span>
              </button>
            </div>

            <AnimatePresence>
              {showFilter && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="absolute top-full left-0 right-0 mt-2 overflow-hidden shadow-2xl z-30">
                  <div className="bg-purple-900/95 border border-purple-700 backdrop-blur-xl rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white">Khoảng giá (GCoin)</span>
                      <button onClick={handleResetPriceFilter} className="text-xs text-slate-400 hover:text-pink-400 flex items-center gap-1"><X size={12} /> Đặt lại</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="number" placeholder="Min" value={priceInputs.min} onChange={(e) => setPriceInputs({...priceInputs, min: e.target.value})} className="w-1/2 bg-purple-950/50 border border-purple-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none" />
                      <span className="text-slate-400">-</span>
                      <input type="number" placeholder="Max" value={priceInputs.max} onChange={(e) => setPriceInputs({...priceInputs, max: e.target.value})} className="w-1/2 bg-purple-950/50 border border-purple-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none" />
                    </div>
                    <button onClick={handleApplyPriceFilter} className="w-full mt-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-bold py-2 rounded-lg transition shadow-lg">Áp dụng bộ lọc</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* GAME LIST */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white">{filterParams.keyword ? `Kết quả cho "${filterParams.keyword}"` : 'Danh sách Game'}</h3>
            <p className="text-slate-400 text-sm mt-2">{loading ? 'Đang tải...' : `Hiển thị trang ${filterParams.page + 1} trên ${totalPages}`}</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-purple-500" size={48} /></div>
          ) : games.length === 0 ? (
            <div className="text-center text-slate-400 py-12 border border-dashed border-purple-800 rounded-xl bg-purple-900/20">Không tìm thấy game nào phù hợp với tiêu chí tìm kiếm.</div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {games.map((game, idx) => (
                    <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="group/card h-full">
                      <div className="relative overflow-hidden rounded-xl border border-purple-800/50 bg-purple-900/50 hover:border-purple-700 transition backdrop-blur-xl h-full flex flex-col hover:shadow-2xl hover:shadow-pink-500/10">
                        <div className="relative overflow-hidden bg-slate-950 h-48 sm:h-56">
                          <Link to={`/product/${game.id}`}>
                            <img src={game.thumbnail || game.image || fallbackImage} alt={game.name} className="w-full h-full object-cover group-hover/card:scale-110 transition duration-500" onError={(e) => (e.currentTarget.src = fallbackImage)} />
                          </Link>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition" />
                          <motion.button whileHover={{ scale: 1.1 }} className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-pink-500/20 text-slate-300 hover:text-pink-400 border border-transparent hover:border-pink-500/50 transition opacity-0 group-hover/card:opacity-100"><Heart size={18} /></motion.button>
                        </div>

                        <div className="flex-1 p-4 flex flex-col space-y-3">
                          <h4 className="text-white font-semibold text-base line-clamp-2 group-hover/card:text-pink-400 transition min-h-[3rem]">
                            <Link to={`/product/${game.id}`}>{game.name}</Link>
                          </h4>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400 gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={12} 
                                  fill={i < Math.floor(game.rating || 0) ? "currentColor" : "none"} 
                                  className={i < Math.floor(game.rating || 0) ? "" : "text-slate-700"} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">
                                {game.rating ? `(${game.rating.toFixed(1)})` : '(Chưa có)'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-auto">
                            <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">{game.price ? `${game.price.toLocaleString()} GCoin` : 'Free'}</span>
                            <Link to={`/product/${game.id}`}>
                              <motion.div whileHover={{ scale: 1.05 }} className="px-4 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/50 text-pink-300 text-xs font-bold cursor-pointer">Xem</motion.div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {games.map((game, idx) => (
                    <Link to={`/product/${game.id}`} key={game.id} className="block">
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="group/row p-4 rounded-xl border border-purple-800/50 bg-purple-900/50 hover:border-purple-600 hover:bg-purple-900/80 transition flex flex-col sm:flex-row items-center gap-4 backdrop-blur-xl">
                        <img src={game.thumbnail || game.image || fallbackImage} alt={game.name} className="w-full sm:w-32 h-48 sm:h-24 rounded-lg object-cover shadow-lg" onError={(e) => (e.currentTarget.src = fallbackImage)} />
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h4 className="text-lg font-bold text-white group-hover/row:text-pink-400 transition truncate">{game.name}</h4>
                          <p className="text-sm text-slate-400 line-clamp-1 mt-1">{game.description || "Mô tả đang cập nhật..."}</p>
                          <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-sm">
                            <span className="bg-purple-800/50 px-2 py-0.5 rounded text-xs text-purple-200 border border-purple-700">{game.categoryName || "Game"}</span>
                            
                            <div className="flex items-center gap-1 text-yellow-400">
                               <Star size={12} fill="currentColor" />
                               <span className="text-slate-300 text-xs">{game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-700/50 pt-3 sm:pt-0 sm:pl-4">
                          <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">{game.price ? `${game.price.toLocaleString()} GCoin` : 'Free'}</span>
                          <div className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-900/20">Chi tiết</div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button disabled={filterParams.page === 0} onClick={() => handlePageChange(filterParams.page - 1)} className="p-2 rounded-full bg-purple-900/50 border border-purple-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-800 transition"><ChevronLeft size={20} /></button>
                  <div className="text-slate-300 font-medium">Trang <span className="text-white font-bold">{filterParams.page + 1}</span> / {totalPages}</div>
                  <button disabled={filterParams.page + 1 >= totalPages} onClick={() => handlePageChange(filterParams.page + 1)} className="p-2 rounded-full bg-purple-900/50 border border-purple-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-800 transition"><ChevronRight size={20} /></button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}