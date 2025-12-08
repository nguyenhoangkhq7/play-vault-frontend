import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll lên đầu trang khi route thay đổi
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
