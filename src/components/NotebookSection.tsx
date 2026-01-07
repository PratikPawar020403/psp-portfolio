
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
            className="w-full flex flex-col items-center my-20 snap-section"
        >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 tracking-wider uppercase">
                It's a Flipbook
            </h2>
            {shouldLoad ? (
                <iframe
                    src="https://academic-notebook.netlify.app/"
                    loading="lazy"
                    title="Academic Notebook"
                    className="w-full max-w-[1200px] h-[900px] max-md:h-[650px] border-none"
                />
            ) : (
                <div className="w-full max-w-[1200px] h-[900px] max-md:h-[650px] bg-gray-900/50 flex items-center justify-center">
                    <p className="text-gray-400">Loading Notebook...</p>
                </div>
            )}
        </section>
    );
};

export default NotebookSection;
