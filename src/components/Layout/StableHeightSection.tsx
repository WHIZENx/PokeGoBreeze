import React, { useLayoutEffect, useRef, useState } from 'react';
import { combineClasses } from '../../utils/extension';

interface StableHeightSectionProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  minHeight?: number;
  testId?: string;
}

const StableHeightSection = ({
  children,
  className,
  isLoading = false,
  minHeight = 0,
  testId,
}: StableHeightSectionProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const retainedHeightRef = useRef(0);
  const hasMeasuredRef = useRef(false);
  const [height, setHeight] = useState(minHeight);
  const [canTransition, setCanTransition] = useState(false);

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
      className={combineClasses(
        'tw-overflow-hidden motion-reduce:tw-transition-none',
        canTransition ? 'tw-transition-[height] tw-duration-300 tw-ease-in-out' : '',
        className
      )}
      data-testid={testId}
      data-stable-height={height}
      aria-busy={isLoading}
      style={{ height }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
};

export default StableHeightSection;
