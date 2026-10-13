'use client';

import React, { useId, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface GlowingGridProps extends React.HTMLAttributes<HTMLDivElement> {
  gridSize?: number;
  glowRadius?: number;
  strokeDasharray?: string;
  squares?: Array<[x: number, y: number]>;
  className?: string;
  children?: React.ReactNode;
  containerClassName?: string;
}

export function GlowingGrid({
  gridSize = 44,
  glowRadius = 380,
  strokeDasharray = '4 2',
  squares = [
    [2, 2],
    [5, 4],
    [9, 2],
    [13, 6],
    [7, 9],
    [16, 3],
  ],
  className,
  children,
  containerClassName,
  ...props
}: GlowingGridProps) {
  const baseId = useId();
  const patternId = `grid-pattern-${baseId}`;
  const glowPatternId = `grid-glow-${baseId}`;
  const gradientId = `grid-gradient-${baseId}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial centered mouse position
    const rect = container.getBoundingClientRect();
    container.style.setProperty('--mouse-x', `${rect.width / 2}px`);
    container.style.setProperty('--mouse-y', `${Math.min(rect.height * 0.35, 260)}px`);
    container.style.setProperty('--mouse-opacity', '0.75');

    const handlePointerMove = (e: PointerEvent) => {
      const currentRect = container.getBoundingClientRect();
      const x = e.clientX - currentRect.left;
      const y = e.clientY - currentRect.top;

      // Only track if pointer is within or near the bounding box
      if (
        x >= -100 &&
        x <= currentRect.width + 100 &&
        y >= -100 &&
        y <= currentRect.height + 100
      ) {
        container.style.setProperty('--mouse-x', `${x}px`);
        container.style.setProperty('--mouse-y', `${y}px`);
        container.style.setProperty('--mouse-opacity', '1');
      }
    };

    const handlePointerLeave = () => {
      // Softly fall back to ambient state
      container.style.setProperty('--mouse-opacity', '0.5');
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', containerClassName)}
      style={
        {
          '--glow-radius': `${glowRadius}px`,
          '--mouse-opacity': '0.7',
        } as React.CSSProperties
      }
      {...props}
    >
      {/* 1. LAYER ONE: Passive Baseline Grid */}
      <svg
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 h-full w-full opacity-40 transition-opacity duration-300',
          className
        )}
        style={{
          maskImage: 'radial-gradient(ellipse at center, white 35%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, white 35%, transparent 80%)',
        }}
      >
        <defs>
          <pattern
            id={patternId}
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
            x={-1}
            y={-1}
          >
            <path
              d={`M.5 ${gridSize}V.5H${gridSize}`}
              fill="none"
              stroke="var(--line)"
              strokeDasharray={strokeDasharray}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      </svg>

      {/* 2. LAYER TWO: Ambient Reactive Mouse Torch Flare */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: 'var(--mouse-opacity, 0.7)',
          background:
            'radial-gradient(circle var(--glow-radius, 380px) at var(--mouse-x, 50%) var(--mouse-y, 35%), rgba(124, 92, 255, 0.22) 0%, rgba(99, 102, 241, 0.12) 35%, rgba(56, 189, 248, 0.05) 60%, transparent 80%)',
        }}
      />

      {/* 3. LAYER THREE: Glowing High-Luminance Neon Grid revealed by cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: 'var(--mouse-opacity, 0.7)',
          maskImage:
            'radial-gradient(circle var(--glow-radius, 380px) at var(--mouse-x, 50%) var(--mouse-y, 35%), black 20%, rgba(0,0,0,0.4) 50%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(circle var(--glow-radius, 380px) at var(--mouse-x, 50%) var(--mouse-y, 35%), black 20%, rgba(0,0,0,0.4) 50%, transparent 85%)',
        }}
      >
        <svg className="h-full w-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <pattern
              id={glowPatternId}
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
              x={-1}
              y={-1}
            >
              <path
                d={`M.5 ${gridSize}V.5H${gridSize}`}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="1.25"
              />
              {/* Intersection Micro-sparks */}
              <circle cx={gridSize} cy="0" r="1.5" fill="#a78bfa" opacity="0.7" />
              <circle cx="0" cy={gridSize} r="1.5" fill="#38bdf8" opacity="0.7" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${glowPatternId})`} />

          {/* Random Glowing Cells in Cursor Area */}
          {squares && (
            <svg x={-1} y={-1} className="overflow-visible">
              {squares.map(([sqX, sqY], idx) => (
                <rect
                  strokeWidth="1"
                  key={`glow-sq-${sqX}-${sqY}-${idx}`}
                  width={gridSize - 1}
                  height={gridSize - 1}
                  x={sqX * gridSize + 1}
                  y={sqY * gridSize + 1}
                  className="fill-[#7c5cff]/20 stroke-[#818cf8]/60 transition-all duration-300"
                />
              ))}
            </svg>
          )}
        </svg>
      </div>

      {/* 4. Ambient Top Diffuse Bulb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-4 h-[420px] w-[640px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, var(--acc-soft), transparent 70%)',
        }}
      />

      {/* 5. Actual Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
