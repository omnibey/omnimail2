'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TextAnimateProps {
  children: string;
  animation?: 'blurIn' | 'fadeIn' | 'slideUp' | 'scaleUp';
  by?: 'word' | 'character' | 'line';
  className?: string;
  delay?: number;
  duration?: number;
  as?: React.ElementType;
}

export function TextAnimate({
  children,
  animation = 'blurIn',
  by = 'word',
  className,
  delay = 0,
  duration = 0.4,
  as: Component = 'span',
}: TextAnimateProps) {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const segments = by === 'character' ? children.split('') : children.split(' ');

  const getAnimationStyles = (index: number) => {
    const segmentDelay = delay + index * 0.05;
    const isVisible = isInView;

    let baseTransform = 'translateY(0) scale(1)';
    let hiddenTransform = 'translateY(0) scale(1)';
    let filter = 'blur(0px)';
    let hiddenFilter = 'blur(0px)';

    if (animation === 'blurIn') {
      hiddenFilter = 'blur(8px)';
      hiddenTransform = 'scale(0.95)';
    } else if (animation === 'slideUp') {
      hiddenTransform = 'translateY(18px)';
    } else if (animation === 'scaleUp') {
      hiddenTransform = 'scale(0.8)';
    }

    return {
      transition: `all ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${segmentDelay}s`,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? baseTransform : hiddenTransform,
      filter: isVisible ? filter : hiddenFilter,
      display: 'inline-block',
    };
  };

  return (
    <Component ref={elementRef} className={cn('inline-block', className)}>
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          style={getAnimationStyles(index)}
          className="inline-block"
        >
          {segment}
          {by === 'word' && index < segments.length - 1 && '\u00A0'}
        </span>
      ))}
    </Component>
  );
}
