import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Play, X, ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Demo: React.FC = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
const [playing, setPlaying] = useState(false);

  
  // Premium scroll physics - kept, but optimized for GPU
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax layers (Optimized: tied only to transform/opacity)
  const y1 = useTransform(smoothProgress, [0, 1], [0, -100]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, -50]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.4], [1, 0.95]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Snappy, GPU-accelerated text reveal (No heavy blurs)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08, 
        delayChildren: 0.2,
        ease: [0.16, 1, 0.3, 1]
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      },
    },
  };

  // Fast letter-by-letter animation (Removed heavy text-shadow)
  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: i * 0.02,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const title = "Agriculture,";

  return (
    <div 
      ref={containerRef}
      className="min-h-[200vh] bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-emerald-500/30 relative"
    >
      {/* Optimized Background Gradients - No SVG Noise, No Mouse Tracking */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full opacity-40 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_60%)]"
        />
        
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full opacity-30 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1)_0%,_transparent_60%)]"
        />
      </div>

      {/* Glassmorphism Navigation */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full p-6 md:p-8 z-50"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link 
            to="/" 
            className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-2 group-hover:ml-0">
              Return
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[].map((item, i) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 hover:text-white transition-colors duration-300 relative group"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Scroll Parallax */}
      <motion.main 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center w-full px-6 sticky top-0"
      >
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto text-center">
          
          {/* Animated Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-10"
          >
            <span className="text-[20px] font-black tracking-[0.3em] text-emerald-400 uppercase">
              Krishisanjivni
            </span>
          </motion.div>

          {/* Premium Typography */}
          <div className="overflow-hidden mb-2">
            <motion.h1 className="text-6xl md:text-8xl lg:text-[100px] font-bold tracking-tighter leading-[0.85]">
              {title.split("").map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="show"
                  className="inline-block text-white"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          <div className="overflow-hidden mb-10">
            <motion.h1 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="text-6xl md:text-8xl lg:text-[100px] font-bold tracking-tighter leading-[0.85]"
            >
              <motion.span 
                variants={itemVariants}
                className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent pb-4"
              >
                Reimagined.
              </motion.span>
            </motion.h1>
          </div>

          {/* Animated Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mb-16"
          >
            <p className="text-zinc-400 text-lg md:text-xl font-medium tracking-tight leading-relaxed">
              Witness the convergence of nature and artificial intelligence. 
              <span className="block mt-1 text-white/80">KrishiSanjivni is the definitive platform for the modern farmer.</span>
            </p>
          </motion.div>

          {/* Cinematic Video Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl aspect-video rounded-[2rem] p-[1px] bg-gradient-to-b from-white/10 to-transparent cursor-pointer group"
            onClick={() => setIsVideoOpen(true)}
          >
            <div className="w-full h-full rounded-[2rem] bg-zinc-900 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-black transition-transform duration-700 group-hover:scale-105" />

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:bg-emerald-500/20 group-hover:scale-105">
                  <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-2 relative z-10" fill="currentColor" />
                </div>
                
                <span className="mt-8 text-[20px] font-black tracking-[0.3em] uppercase text-emerald-400/80 group-hover:text-emerald-400 transition-colors duration-300">
                  Play the Demo Video
                </span>
              </div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] font-black tracking-[0.3em] uppercase text-zinc-600">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-4 h-4 text-zinc-600" />
            </motion.div>
          </motion.div>
        </div>
      </motion.main>

      {/* Secondary Content Section */}
      <section className="relative z-20 min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]">
              Precision<br />
              <span className="text-emerald-400">Cultivation.</span>
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
              Every seed, every drop of water, every ray of sunlight—optimized by AI. 
              Our platform transforms traditional farming into data-driven agriculture.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Premium Video Modal */}
      <AnimatePresence mode="wait">
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-8 right-8 z-[110] p-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 border border-white/5"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full max-w-7xl max-h-[85vh] aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl shadow-emerald-900/10"
            >
              <video
                src="/assets/demo.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Demo;