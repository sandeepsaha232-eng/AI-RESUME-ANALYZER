import { useEffect, useRef } from 'react';

interface CanvasVisualizerProps {
  intensity?: 'high' | 'low';
  reduceMotion?: boolean;
}

export default function CanvasVisualizer({ intensity = 'high', reduceMotion = false }: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    
    // Config based on motion and intensity
    const particleCount = reduceMotion ? 0 : intensity === 'high' ? 80 : 30;
    const maxDistance = intensity === 'high' ? 120 : 80;
    const speedMultiplier = intensity === 'high' ? 0.35 : 0.2;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const mouse = {
      x: -9999,
      y: -9999,
      radius: 140,
    };

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Re-initialize particles on resize to fit bounds
      initParticles();
    };

    const initParticles = () => {
      particles.length = 0;
      if (reduceMotion) return;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speedMultiplier,
          vy: (Math.random() - 0.5) * speedMultiplier,
          radius: Math.random() * 2 + 1,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Gradient background
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#0B0B12' : '#F7F7FB';
      ctx.fillRect(0, 0, width, height);

      if (reduceMotion) {
        // Simple subtle static mesh/glow when reduceMotion is true
        ctx.beginPath();
        ctx.arc(width * 0.7, height * 0.3, 200, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(139, 124, 252, 0.03)' : 'rgba(109, 93, 246, 0.03)';
        ctx.fill();
        return;
      }

      // Draw subtle background radial glow
      const glowX = width * 0.75;
      const glowY = height * 0.25;
      const radialGlow = ctx.createRadialGradient(glowX, glowY, 50, glowX, glowY, 400);
      radialGlow.addColorStop(0, isDark ? 'rgba(139, 124, 252, 0.08)' : 'rgba(109, 93, 246, 0.05)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Update and Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse avoidance/attraction
        if (mouse.x !== -9999) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x -= (dx / dist) * force * 1.5;
            p.y -= (dy / dist) * force * 1.5;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(139, 124, 252, 0.35)' : 'rgba(109, 93, 246, 0.3)';
        ctx.fill();
      });

      // Draw connecting lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.15;
            ctx.strokeStyle = isDark 
              ? `rgba(139, 124, 252, ${alpha})` 
              : `rgba(109, 93, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw active mouse glow
      if (mouse.x !== -9999) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        mouseGlow.addColorStop(0, isDark ? 'rgba(139, 124, 252, 0.05)' : 'rgba(109, 93, 246, 0.04)');
        mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    handleResize();
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, reduceMotion]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full -z-10 overflow-hidden select-none pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-auto" />
    </div>
  );
}
