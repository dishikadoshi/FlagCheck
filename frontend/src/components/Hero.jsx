import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Transition Timing Constants
const TEXT_EXIT_MS = 550;
const CROSSFADE_MS = 420;
const SWING_MS = 850;

const EASE_OUT = [0.16, 1, 0.3, 1];
const EASE_SNAP = [0.65, 0, 0.35, 1];
const EASE_DOOR = [0.65, 0, 0.15, 1];

export default function Hero({ onEnter, onExitComplete }) {
  const [stage, setStage] = useState("idle");
  const enteredRef = useRef(false);

  const handleActivate = () => {
    if (stage !== "idle") return;
    if (!enteredRef.current) {
      enteredRef.current = true;
      onEnter?.();
    }
    setStage("exiting");
  };

  useEffect(() => {
    if (stage === "exiting") {
      const t = setTimeout(() => setStage("open"), CROSSFADE_MS);
      return () => clearTimeout(t);
    }
    if (stage === "open") {
      const t = setTimeout(() => onExitComplete?.(), SWING_MS);
      return () => clearTimeout(t);
    }
  }, [stage, onExitComplete]);

  const exiting = stage !== "idle";
  const open = stage === "open";

  return (
    <motion.div
      key="hero"
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        perspective: 1600,
        pointerEvents: stage === "idle" ? "auto" : "none",
      }}
    >
      {/* Animated Background Layer: Fades out completely to reveal the app underneath */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[#0a0205]"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: CROSSFADE_MS / 1000, ease: EASE_OUT }}
      >
        {/* Dark Wine/Burgundy Radial Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(65% 55% at 50% 42%, #380b15 0%, #16040a 58%, #080104 100%)",
          }}
        />
        {/* Warm Gold Spotlight behind the Flags */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(36% 32% at 50% 48%, rgba(190, 115, 40, 0.22) 0%, rgba(140, 70, 20, 0.06) 60%, transparent 100%)",
          }}
        />
        <div className="bg-dots absolute inset-0 opacity-[0.2]" />
        <div className="bg-grain animate-grain opacity-25" />
      </motion.div>

      {/* Transition Doors */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 flex pointer-events-none"
        animate={{ opacity: exiting ? 1 : 0 }}
        transition={{ duration: CROSSFADE_MS / 1000, ease: EASE_OUT }}
      >
        <motion.div
          className="h-full w-1/2"
          style={{
            transformOrigin: "left center",
            willChange: "transform",
            backgroundImage: "linear-gradient(120deg, #5c0d16 0%, #240307 100%)",
          }}
          animate={{ rotateY: open ? -108 : 0 }}
          transition={{ duration: SWING_MS / 1000, ease: EASE_DOOR }}
        />
        <motion.div
          className="h-full w-1/2"
          style={{
            transformOrigin: "right center",
            willChange: "transform",
            backgroundImage: "linear-gradient(240deg, #0e3d22 0%, #04170c 100%)",
          }}
          animate={{ rotateY: open ? 108 : 0 }}
          transition={{ duration: SWING_MS / 1000, ease: EASE_DOOR }}
        />
      </motion.div>

      {/* Gold Light Burst on Open */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: "#dca85b", filter: "blur(28px)" }}
        animate={
          open
            ? { width: "60%", opacity: 0 }
            : exiting
            ? { width: 10, opacity: 0.9 }
            : { width: 0, opacity: 0 }
        }
        transition={{ duration: SWING_MS / 1000, ease: "easeOut" }}
      />

      {/* Main Content Layout */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 sm:py-16 px-6 text-center">
        {/* Header Title: Slides UP to exit on tap */}
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={
            exiting
              ? { y: "-70vh", opacity: 0, transition: { duration: TEXT_EXIT_MS / 1000, ease: EASE_SNAP } }
              : { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT, delay: 0.05 } }
          }
          style={{ willChange: "transform, opacity" }}
          className="relative select-none font-serif text-[4rem] sm:text-[5.2rem] md:text-[6rem] font-bold uppercase leading-none tracking-[0.08em] pt-2 sm:pt-4"
        >
          <span
            className="block"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #f4dba8 0%, #c99a4a 32%, #8a5f24 62%, #4a2f12 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow:
                "0 1px 0 rgba(255,238,210,0.18), 0 -1px 1px rgba(0,0,0,0.55), 0 6px 14px rgba(0,0,0,0.85)",
            }}
          >
            FLAG CHECK
          </span>
        </motion.h1>

        {/* Center Flags Area */}
        <div
          className="relative flex items-center justify-center cursor-pointer my-auto"
          style={{ width: 360, height: 210 }}
          role="button"
          tabIndex={0}
          aria-label="Tap the flag to start"
          onClick={handleActivate}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleActivate()}
        >
          {/* Ambient Warm Golden Glow behind flags */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(184,131,56,0.32) 0%, rgba(120,70,20,0.12) 55%, transparent 75%)",
              filter: "blur(22px)",
              transform: "scale(1.25)",
            }}
          />

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 1.12 : 1 }}
            transition={{ duration: CROSSFADE_MS / 1000, ease: EASE_OUT }}
            className="relative w-full h-full"
            style={{
              filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.85))",
            }}
          >
            {/* Red Flag */}
            <RedFlagSVG left={32} top={12} width={155} height={125} z={2} />

            {/* Green Flag */}
            <GreenFlagSVG left={172} top={46} width={155} height={125} z={1} />
          </motion.div>
        </div>

        {/* Subtitle Lines: Slides DOWN to exit */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={
            exiting
              ? { y: "70vh", opacity: 0, transition: { duration: TEXT_EXIT_MS / 1000, ease: EASE_SNAP } }
              : { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT, delay: 0.18 } }
          }
          className="max-w-md pb-2 sm:pb-4"
        >
          <p className="text-[13px] sm:text-[15px] font-bold uppercase tracking-[0.14em] text-[#e3d0bf]">
            CAN YOU SPOT THE SIGNALS IN 90 SECONDS?
          </p>
          <p
            className="mt-2 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.28em]"
            style={{ color: "#b88338" }}
          >
            TAP THE FLAG. NO SIGN-UP
          </p>
        </motion.div>
      </div>

      {/* Sparkle Icon */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: exiting ? 0 : 0.7 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-6 right-6 z-10 pointer-events-none"
      >
        <Sparkle />
      </motion.div>
    </motion.div>
  );
}

{/* Red Flag SVG */}
function RedFlagSVG({ left, top, width, height, z }) {
  return (
    <div className="absolute" style={{ left, top, width, height, zIndex: z }}>
      <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="darkRedSilk" x1="85" y1="10" x2="10" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7a0f19" />
            <stop offset="40%" stopColor="#570810" />
            <stop offset="85%" stopColor="#300307" />
            <stop offset="100%" stopColor="#1a0103" />
          </linearGradient>

          <linearGradient id="darkGoldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d09c" />
            <stop offset="30%" stopColor="#b88338" />
            <stop offset="70%" stopColor="#6e4618" />
            <stop offset="100%" stopColor="#dca85b" />
          </linearGradient>
        </defs>

        <rect x="83" y="10" width="3.2" height="66" rx="1.6" fill="url(#darkGoldMetal)" />
        <circle cx="84.6" cy="9" r="3.2" fill="#f0d09c" stroke="url(#darkGoldMetal)" strokeWidth="0.8" />

        <path
          d="M 83 14 C 62 6, 42 22, 12 14 L 12 52 C 42 60, 62 44, 83 52 Z"
          fill="url(#darkRedSilk)"
          stroke="url(#darkGoldMetal)"
          strokeWidth="0.95"
          strokeLinejoin="round"
        />

        <path
          d="M 12 14 C 30 20, 50 18, 83 14 L 83 52 C 50 50, 30 58, 12 52 Z"
          fill="black"
          fillOpacity="0.22"
        />
        <path
          d="M 45 18 C 60 22, 75 20, 83 14 L 83 52 C 75 48, 60 52, 45 56 Z"
          fill="white"
          fillOpacity="0.08"
        />
      </svg>
    </div>
  );
}

{/* Green Flag SVG */}
function GreenFlagSVG({ left, top, width, height, z }) {
  return (
    <div className="absolute" style={{ left, top, width, height, zIndex: z }}>
      <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="darkGreenSilk" x1="15" y1="10" x2="90" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14522d" />
            <stop offset="40%" stopColor="#0c381e" />
            <stop offset="85%" stopColor="#052111" />
            <stop offset="100%" stopColor="#021208" />
          </linearGradient>

          <linearGradient id="darkGoldMetal2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d09c" />
            <stop offset="30%" stopColor="#b88338" />
            <stop offset="70%" stopColor="#6e4618" />
            <stop offset="100%" stopColor="#dca85b" />
          </linearGradient>
        </defs>

        <rect x="14" y="10" width="3.2" height="66" rx="1.6" fill="url(#darkGoldMetal2)" />
        <circle cx="15.6" cy="9" r="3.2" fill="#f0d09c" stroke="url(#darkGoldMetal2)" strokeWidth="0.8" />

        <path
          d="M 17 14 C 38 6, 58 22, 88 14 L 88 52 C 58 60, 38 44, 17 52 Z"
          fill="url(#darkGreenSilk)"
          stroke="url(#darkGoldMetal2)"
          strokeWidth="0.95"
          strokeLinejoin="round"
        />

        <path
          d="M 17 14 C 38 20, 60 18, 88 14 L 88 52 C 60 50, 38 58, 17 52 Z"
          fill="black"
          fillOpacity="0.22"
        />
        <path
          d="M 50 18 C 68 22, 78 20, 88 14 L 88 52 C 78 48, 68 52, 50 56 Z"
          fill="white"
          fillOpacity="0.08"
        />
      </svg>
    </div>
  );
}

function Sparkle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z" fill="#b88338" opacity="0.85" />
    </svg>
  );
}