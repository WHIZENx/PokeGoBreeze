import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { combineClasses } from '../../utils/extension';

interface StableHeightSectionProps {
  animateHeight?: boolean;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  minHeight?: number;
  testId?: string;
}

const StableHeightSection = ({
  animateHeight = false,
  children,
  className,
  isLoading = false,
  minHeight = 0,
  testId,
}: StableHeightSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const retainedHeightRef = useRef(0);
  const hasMeasuredRef = useRef(false);
  const [height, setHeight] = useState(minHeight);
  const [canTransition, setCanTransition] = useState(false);
  const [isChildHeightTransitioning, setIsChildHeightTransitioning] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    const handleStart = (event: TransitionEvent) => {
      if (event.target !== section && event.propertyName === 'height') {
        setIsChildHeightTransitioning(true);
      }
    };
    const handleEnd = (event: TransitionEvent) => {
      if (event.target !== section && event.propertyName === 'height') {
        setIsChildHeightTransitioning(false);
      }
    };
    section.addEventListener('transitionrun', handleStart);
    section.addEventListener('transitionend', handleEnd);
    section.addEventListener('transitioncancel', handleEnd);
    return () => {
      section.removeEventListener('transitionrun', handleStart);
      section.removeEventListener('transitionend', handleEnd);
      section.removeEventListener('transitioncancel', handleEnd);
    };
  }, []);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    let animationFrame = 0;
    const updateHeight = (measuredHeight: number) => {
      const nextHeight = Math.max(minHeight, Math.ceil(measuredHeight));
      if (isLoading && retainedHeightRef.current > 0) {
        return;
      }
      retainedHeightRef.current = nextHeight;
      setHeight((current) => (current === nextHeight ? current : nextHeight));
      if (hasMeasuredRef.current) {
        setCanTransition(true);
      } else {
        hasMeasuredRef.current = true;
      }
    };
    const measure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => updateHeight(content.getBoundingClientRect().height));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    measure();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [isLoading, minHeight]);

  return (
    <div
      ref={sectionRef}
      className={combineClasses(
        'tw-overflow-hidden motion-reduce:tw-transition-none',
        canTransition && !isChildHeightTransitioning
          ? `${animateHeight ? 'tw-transition-[height]' : 'tw-transition-[min-height]'} tw-duration-300 tw-ease-in-out`
          : '',
        className
      )}
      data-testid={testId}
      data-stable-height={height}
      aria-busy={isLoading}
      style={animateHeight ? { height } : { minHeight: height }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
};

export default StableHeightSection;
