import React, { useEffect, useRef, useState } from 'react';

// Create an array of 240 frame URLs using Vite's URL globbing
// Assuming the frames are in src/assets/frames/ with names like ezgif-frame-001.jpg
const TOTAL_FRAMES = 240;
const frameUrls: string[] = [];

// Helper to pad the frame index with leading zeros
const padLeft = (num: number, size: number) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
};

// Generate URLs - Vite handles this cleanly if the path is relative to the component
// Since doing dynamic imports for 240 images in a loop can be tricky in Vite,
// we construct the URL string dynamically. Assumes assets are served from /src/assets/frames/
for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const frameName = `ezgif-frame-${padLeft(i, 3)}.jpg`;
    // Construct the URL directly. Vite's standard dynamic assets handling in dev/prod
    // usually requires import.meta.glob or import.meta.url carefully.
    // Using absolute path from src for simplicity in dev, or better yet, a reliable Vite trick:
    frameUrls.push(new URL(`../assets/frames/${frameName}`, import.meta.url).href);
}

const BackgroundFrames: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadedFrames, setLoadedFrames] = useState<number>(0);
    const imagesRef = useRef<HTMLImageElement[]>([]);

    // Animation state stored in refs to avoid causing React re-renders in the tight loop
    const currentFrameIndexRef = useRef(0);
    const animationFrameIdRef = useRef<number | null>(null);
    const lastDrawTimeRef = useRef<number>(0);

    // Target FPS for playing back the frames (adjust if needed, usually 24 or 30 for typical gifs/videos)
    const TARGET_FPS = 24;
    const FRAME_DURATION_MS = 1000 / TARGET_FPS;

    // 1. Preload all images
    useEffect(() => {
        let loadedCount = 0;
        const images: HTMLImageElement[] = [];

        frameUrls.forEach((url, index) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedCount++;
                // Update loaded frames state occasionally or when fully loaded
                if (loadedCount % 20 === 0 || loadedCount === TOTAL_FRAMES) {
                    setLoadedFrames(loadedCount);
                }
            };
            // Keep them in order
            images[index] = img;
        });

        imagesRef.current = images;

        return () => {
            // Cleanup if necessary
            imagesRef.current.forEach(img => { img.src = ''; });
        };
    }, []);

    // 2. Draw loop and Resize Handler
    useEffect(() => {
        // Only start drawing when we have at least the first frame loaded,
        // but ideally wait for a reasonable chunk so it doesn't stutter immediately.
        if (loadedFrames < 1) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas to match the container exactly (like object-cover)
        const handleResize = () => {
            // To make it high-DPI aware (retina displays etc)
            const dpr = window.devicePixelRatio || 1;

            // Get the logical size of the container
            const rect = container.getBoundingClientRect();

            // Set actual internal dimensions of the canvas
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // Set visual size (CSS) of the canvas
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            // Normalize the coordinate system to use css pixels
            ctx.scale(dpr, dpr);

            // Force a redraw immediately so it doesn't wait for the next animation frame
            drawFrame(currentFrameIndexRef.current, true);
        };

        // The core drawing function
        const drawFrame = (frameIndex: number, forceDraw = false) => {
            const image = imagesRef.current[frameIndex];

            // If this specific image hasn't finished loading yet, skip drawing for now
            if (!image || !image.complete || image.naturalWidth === 0) {
                return;
            }

            const rect = container.getBoundingClientRect();
            const canvasW = rect.width;
            const canvasH = rect.height;
            const imgW = image.naturalWidth;
            const imgH = image.naturalHeight;

            // Implements 'object-cover' logic mathematically:
            // Scale the image so it fits the canvas and covers it fully
            const scale = Math.max(canvasW / imgW, canvasH / imgH);
            const drawW = imgW * scale;
            const drawH = imgH * scale;

            // Center the image inside the canvas
            const drawX = (canvasW - drawW) / 2;
            const drawY = (canvasH - drawH) / 2;

            // Clear the canvas and draw the image
            ctx.clearRect(0, 0, canvasW, canvasH);
            ctx.drawImage(image, drawX, drawY, drawW, drawH);
        };

        // The animation loop driven by requestAnimationFrame
        const renderLoop = (timestamp: number) => {

            // Throttle logic to hit the TARGET_FPS
            if (timestamp - lastDrawTimeRef.current >= FRAME_DURATION_MS) {
                // It's time to draw the next frame
                drawFrame(currentFrameIndexRef.current);

                // Advance the frame index
                currentFrameIndexRef.current = (currentFrameIndexRef.current + 1) % TOTAL_FRAMES;

                lastDrawTimeRef.current = timestamp;
            }

            // Queue up the next tick
            animationFrameIdRef.current = requestAnimationFrame(renderLoop);
        };

        // Setup
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial measurement

        // Start loop
        animationFrameIdRef.current = requestAnimationFrame(renderLoop);

        // Cleanup on unmount or deps change
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameIdRef.current !== null) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };

    }, [loadedFrames, TARGET_FPS, FRAME_DURATION_MS]);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-black">
            {/* 
        Optional Loading State. 
        Shows a subtle fade-in when the first frames start rendering.
        The div handles the dark overlay overlaying the canvas directly.
      */}
            <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${loadedFrames > 0 ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Dark overlay logic migrated from Index.tsx */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        </div>
    );
};

export default BackgroundFrames;
