import React from 'react';

interface CanvasVisualizerProps {
  intensity?: 'high' | 'low';
  reduceMotion?: boolean;
}

export default function CanvasVisualizer({ intensity = 'high', reduceMotion = false }: CanvasVisualizerProps) {
  // Let's create an array of floating dots with fixed, randomized offsets so they look completely organic
  const dots = [
    { size: 12, top: '15%', left: '10%', duration: '25s', delay: '0s', tx: '40px', ty: '-60px' },
    { size: 36, top: '25%', left: '75%', duration: '35s', delay: '-5s', tx: '-80px', ty: '80px' },
    { size: 8, top: '45%', left: '35%', duration: '18s', delay: '-2s', tx: '50px', ty: '50px' },
    { size: 24, top: '65%', left: '20%', duration: '28s', delay: '-8s', tx: '-40px', ty: '-90px' },
    { size: 16, top: '80%', left: '80%', duration: '30s', delay: '-3s', tx: '70px', ty: '-40px' },
    { size: 48, top: '55%', left: '85%', duration: '40s', delay: '-12s', tx: '-100px', ty: '-60px' },
    { size: 10, top: '10%', left: '50%', duration: '22s', delay: '-6s', tx: '-30px', ty: '70px' },
    { size: 32, top: '85%', left: '45%', duration: '32s', delay: '-10s', tx: '90px', ty: '-80px' },
    { size: 14, top: '35%', left: '90%', duration: '26s', delay: '-1s', tx: '-50px', ty: '90px' },
    { size: 28, top: '70%', left: '55%', duration: '34s', delay: '-4s', tx: '60px', ty: '60px' },
  ];

  // Soft gradient blobs to add that premium "cosmic" feel without being distracting
  const blobs = [
    { color: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)', width: '600px', height: '600px', top: '-10%', left: '-10%', duration: '40s', delay: '0s' },
    { color: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(0,0,0,0) 70%)', width: '500px', height: '500px', bottom: '15%', right: '-5%', duration: '45s', delay: '-10s' },
    { color: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(0,0,0,0) 70%)', width: '550px', height: '550px', top: '40%', left: '50%', duration: '50s', delay: '-5s' },
  ];

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden select-none pointer-events-none bg-[#05050C]">
      {/* Styles Injection */}
      <style>{`
        @keyframes float-blob {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(50px, -40px, 0) scale(1.1);
          }
          66% {
            transform: translate3d(-30px, 50px, 0) scale(0.95);
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
            transform: translate3d(var(--tx, 40px), var(--ty, -60px), 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .premium-blob {
          position: absolute;
          border-radius: 50%;
          mix-blend-mode: screen;
          filter: blur(80px);
          pointer-events: none;
          will-change: transform;
        }

        .premium-dot {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(148, 163, 184, 0.25); /* slate-400 with 25% opacity, matches image */
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
