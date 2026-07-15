import React from 'react';

interface CanvasVisualizerProps {
  intensity?: 'high' | 'low';
  reduceMotion?: boolean;
}

export default function CanvasVisualizer({ intensity = 'high', reduceMotion = false }: CanvasVisualizerProps) {
  // Floating subtle aesthetic dots
  const dots = [
    { size: 8, top: '15%', left: '10%', duration: '25s', delay: '0s', tx: '20px', ty: '-30px' },
    { size: 14, top: '25%', left: '75%', duration: '35s', delay: '-5s', tx: '-40px', ty: '40px' },
    { size: 6, top: '45%', left: '35%', duration: '18s', delay: '-2s', tx: '25px', ty: '25px' },
    { size: 10, top: '65%', left: '20%', duration: '28s', delay: '-8s', tx: '-20px', ty: '-45px' },
    { size: 8, top: '80%', left: '80%', duration: '30s', delay: '-3s', tx: '35px', ty: '-20px' },
    { size: 16, top: '55%', left: '85%', duration: '40s', delay: '-12s', tx: '-50px', ty: '-30px' },
    { size: 6, top: '10%', left: '50%', duration: '22s', delay: '-6s', tx: '-15px', ty: '35px' },
    { size: 12, top: '85%', left: '45%', duration: '32s', delay: '-10s', tx: '45px', ty: '-40px' },
  ];

  // Rich, sophisticated, yet professional colors (No neon cyan/pinks).
  // Uses deep sapphire blue, elegant royal indigo, and warm rich amber/champagne gold.
  const blobs = [
    // Royal Indigo
    { color: 'radial-gradient(circle, rgba(79, 70, 229, 0.14) 0%, rgba(0,0,0,0) 80%)', width: '600px', height: '600px', top: '-10%', left: '-10%', duration: '40s', delay: '0s' },
    // Sophisticated Rich Amber/Bronze Gold
    { color: 'radial-gradient(circle, rgba(217, 119, 6, 0.08) 0%, rgba(0,0,0,0) 75%)', width: '500px', height: '500px', bottom: '15%', right: '-5%', duration: '45s', delay: '-10s' },
    // Elegant Sapphire Blue
    { color: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(0,0,0,0) 80%)', width: '550px', height: '550px', top: '40%', left: '50%', duration: '50s', delay: '-5s' },
  ];

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden select-none pointer-events-none bg-[#0a0a0c]">
      {/* Styles Injection */}
      <style>{`
        @keyframes float-blob {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(25px, -20px, 0) scale(1.05);
          }
          66% {
            transform: translate3d(-15px, 25px, 0) scale(0.98);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes float-dot {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(var(--tx, 20px), var(--ty, -30px), 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .premium-blob {
          position: absolute;
          border-radius: 50%;
          mix-blend-mode: screen;
          filter: blur(100px);
          pointer-events: none;
          will-change: transform;
        }

        .premium-dot {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(148, 163, 184, 0.15); /* subtle muted slate-400 */
          pointer-events: none;
          will-change: transform;
        }

        /* Animation class triggers */
        .animate-blob-floating {
          animation: float-blob var(--duration, 30s) ease-in-out var(--delay, 0s) infinite;
        }

        .animate-dot-floating {
          animation: float-dot var(--duration, 25s) ease-in-out var(--delay, 0s) infinite;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-blob-floating,
          .animate-dot-floating {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Render Blobs */}
      {!reduceMotion && blobs.map((blob, index) => (
        <div
          key={`blob-${index}`}
          className="premium-blob animate-blob-floating"
          style={{
            background: blob.color,
            width: blob.width,
            height: blob.height,
            top: blob.top,
            left: blob.left,
            bottom: blob.bottom,
            right: blob.right,
            '--duration': blob.duration,
            '--delay': blob.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* Render Floating Dots */}
      {!reduceMotion && dots.map((dot, index) => (
        <div
          key={`dot-${index}`}
          className="premium-dot animate-dot-floating"
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            top: dot.top,
            left: dot.left,
            '--duration': dot.duration,
            '--delay': dot.delay,
            '--tx': dot.tx,
            '--ty': dot.ty,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
