'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export interface HyperTextProps {
  children?: string;
  text?: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  startOnView?: boolean;
  animateOnHover?: boolean;
}

export function HyperText({
  children,
  text,
  className,
  duration = 800,
  delay = 0,
  as: Component = 'span',
  startOnView = true,
  animateOnHover = true,
}: HyperTextProps) {
  const originalText = text || children || '';
  const [displayText, setDisplayText] = useState(originalText);
  const [trigger, setTrigger] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const iterations = useRef(0);

  const triggerAnimation = () => {
    iterations.current = 0;
    setTrigger(true);
  };

  useEffect(() => {
    if (!startOnView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            triggerAnimation();
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [startOnView, delay]);

  useEffect(() => {
    if (!trigger) return;

    const intervalTime = duration / (originalText.length * 5);
    const interval = setInterval(() => {
      setDisplayText(
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iterations.current) {
              return originalText[index];
            }
            return alphabets[Math.floor(Math.random() * alphabets.length)];
          })
          .join('')
      );

      iterations.current += 1 / 3;

      if (iterations.current >= originalText.length) {
        setDisplayText(originalText);
        setTrigger(false);
        clearInterval(interval);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [trigger, originalText, duration]);

  return (
    <Component
      ref={elementRef}
      onMouseEnter={() => {
        if (animateOnHover) triggerAnimation();
      }}
      className={cn('inline-block font-mono cursor-default select-none', className)}
    >
      {displayText}
    </Component>
  );
}
