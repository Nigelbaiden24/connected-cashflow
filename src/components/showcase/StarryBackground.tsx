import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface StarryBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Animated starry night background using Canvas.
 * Stars drift slowly across a deep-black sky with subtle twinkling.
 * Only renders the animation when the `dark` class is on <html>.
 */
export function StarryBackground({ children, className }: StarryBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    interface Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleOffset: number;
    }

    let stars: Star[] = [];

    // The canvas is pinned to the viewport (sticky), so it never grows with the page.
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (Math.round(rect.width) === Math.round(width) && Math.round(rect.height) === Math.round(height)) return;
      width = rect.width;
      height = rect.height;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      initStars();
    };

    const initStars = () => {
      const count = Math.min(320, Math.floor((width * height) / 4000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.3,
        speed: Math.random() * 0.15 + 0.02,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.008 + 0.002,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Only animate when it can be seen: dark mode, tab visible, motion allowed.
    const visible = () => !reducedMotion && document.visibilityState === "visible" &&
      document.documentElement.classList.contains("dark");
    let last = 0;

    const draw = (time: number) => {
      if (!visible()) { running = false; return; }
      animRef.current = requestAnimationFrame(draw);
      if (time - last < 33) return; // ~30 fps is plenty for a backdrop
      last = time;
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        // Drift rightward, wrap around
        star.x += star.speed;
        if (star.x > width + 2) star.x = -2;

        // Twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity + twinkle * 0.25;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(220, 60%, 90%, ${Math.max(0.05, Math.min(1, alpha))})`;
        ctx.fill();

        // Glow for larger stars
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(221, 83%, 53%, ${Math.max(0, alpha * 0.15)})`;
          ctx.fill();
        }
      }
    };

    let running = false;
    const start = () => {
      if (running || !visible()) return;
      resize();
      running = true;
      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    start();

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", start);
    const mo = new MutationObserver(start);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", start);
      mo.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Canvas – only visible in dark mode */}
      <div className="absolute inset-0 z-0 pointer-events-none dark:block hidden" aria-hidden>
        <canvas ref={canvasRef} className="sticky top-0 h-screen w-full" />
      </div>
      {/* Deep-black gradient overlay for dark mode */}
      <div className="absolute inset-0 z-[1] pointer-events-none hidden dark:block bg-gradient-to-b from-transparent via-transparent to-background/60" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
