import { useEffect, useRef, useState } from "react";

export function useIntersectionObserver(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target); // Ngừng theo dõi sau khi xuất hiện
                }
            },
            { threshold: 0.1, ...options } // Kích hoạt khi 10% phần tử xuất hiện
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return [ref, isVisible];
}