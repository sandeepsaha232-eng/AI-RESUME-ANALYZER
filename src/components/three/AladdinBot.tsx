import React from 'react';

interface AladdinBotProps {
  state?: 'idle' | 'thinking' | 'success' | 'pointing';
}

// Global coordinate emitter stubbed to prevent import/export reference errors
export let globalBotTargetSetter: ((x: number, y: number, triggerVortex: boolean) => void) | null = null;

export default function AladdinBot({ state }: AladdinBotProps) {
  return (
    <div className="w-full h-full flex items-center justify-center relative p-1.5 select-none hover:scale-110 transition-transform duration-350 ease-out">
      {/* Premium SVG Magic Lamp - Pure Picture Decoration */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-[0_0_16px_rgba(234,179,8,0.5)] animate-[pulse_3s_infinite_ease-in-out]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="premium-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="80%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
          <radialGradient id="lamp-ambient-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(234, 179, 8, 0.25)" />
            <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
          </radialGradient>
        </defs>

        {/* Ambient Glow Background */}
        <circle cx="50" cy="50" r="45" fill="url(#lamp-ambient-glow)" />

        {/* Little Magic Smoke Dust (Decorative) */}
        <path
          d="M 68,32 C 73,25 78,35 83,28 C 81,36 74,38 68,32 Z"
          fill="rgba(254, 240, 138, 0.45)"
          className="animate-[bounce_2s_infinite_ease-in-out]"
        />

        {/* Lamp Handle */}
        <path
          d="M 28,45 C 14,34 11,66 30,58 C 21,58 19,41 28,45 Z"
          fill="url(#premium-gold-gradient)"
          stroke="#ca8a04"
          strokeWidth="0.5"
        />

        {/* Lamp Base */}
        <ellipse cx="50" cy="74" rx="17" ry="5.5" fill="url(#premium-gold-gradient)" stroke="#9a3412" strokeWidth="0.5" />
        <path d="M 39,73 L 41,67 L 59,67 L 61,73 Z" fill="url(#premium-gold-gradient)" stroke="#9a3412" strokeWidth="0.5" />

        {/* Main Lamp Body */}
        <path d="M 31,58 C 29,44 71,44 69,58 C 67,69 33,69 31,58 Z" fill="url(#premium-gold-gradient)" stroke="#a16207" strokeWidth="0.5" />

        {/* Lamp Spout */}
        <path d="M 59,52 C 73,41 83,37 85,41 C 85,45 71,58 63,58 Z" fill="url(#premium-gold-gradient)" stroke="#a16207" strokeWidth="0.5" />

        {/* Lid knob on top */}
        <path d="M 44,47 C 44,41 56,41 56,47 Z" fill="url(#premium-gold-gradient)" stroke="#ca8a04" strokeWidth="0.5" />
        <circle cx="50" cy="41" r="2.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
