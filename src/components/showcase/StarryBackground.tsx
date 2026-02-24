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

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
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
      const count = Math.floor((width * height) / 2800);
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

    const draw = (time: number) => {
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

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    animRef.current = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Canvas – only visible in dark mode */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none dark:block hidden"
        aria-hidden
      />
      {/* Deep-black gradient overlay for dark mode */}
      <div className="absolute inset-0 z-[1] pointer-events-none hidden dark:block bg-gradient-to-b from-transparent via-transparent to-background/60" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
