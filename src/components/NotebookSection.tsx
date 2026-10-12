
import React, { useState, useEffect, useRef } from 'react';

const NotebookSection = () => {
    const [shouldLoad, setShouldLoad] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Use IntersectionObserver to load iframe only when visible
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Start loading 200px before it's visible
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        // Fallback: Load after 5 seconds regardless (for users who scroll slowly)
        const fallbackTimer = setTimeout(() => setShouldLoad(true), 5000);

        return () => {
            observer.disconnect();
            clearTimeout(fallbackTimer);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id="academic-notebook-section"
            className="w-full h-screen h-[100dvh] flex flex-col items-center justify-center snap-section overflow-hidden bg-[#eef1f5]"
        >
            {shouldLoad ? (
                <iframe
                    src="https://academic-notebook.netlify.app/"
                    loading="lazy"
                    title="Academic Notebook"
                    className="w-full h-full border-none"
                />
            ) : (
                <div className="w-full h-full bg-[#eef1f5] flex items-center justify-center">
                    <p className="text-slate-500">Loading Notebook...</p>
                </div>
            )}
        </section>
    );
};

export default NotebookSection;
