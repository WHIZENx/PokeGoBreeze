import React, { useEffect, useState, useRef } from 'react';
import '../PVP.css';

const animate = ({ setState, start, requestId, timing, draw, left, duration, timer }: any) => {
  const animateLoop = (timestamp: number) => {
    const time = timestamp - start;
    const durationFraction = Math.min(1, Math.max(0, time / timer));
    if (time > 0) {
      duration(timer - time);
    }
    const progress = timing(durationFraction);
    draw(progress);
    left(progress);
    if (requestId.current) {
      if (durationFraction < 1) {
        requestId.current = requestAnimationFrame(animateLoop);
      } else {
        setState({
          play: false,
          stop: true,
        });
        stopAnimate(requestId);
      }
    }
  };
  if (!requestId.current) {
    requestId.current = requestAnimationFrame(animateLoop);
  }
};

const stopAnimate = (requestId: any) => {
  cancelAnimationFrame(requestId.current);
  requestId.current = null;
};

const PlayLine = ({ timeline, state, setState, setLeft, width, duration }: any) => {
  const [pos, setPos] = useState(0);
  const [timer, setTimer] = useState(0);
  const ref: any = useRef(null);
  const requestId: any = useRef(null);
  const start = useRef(0);

  useEffect(() => {
    if (pos === 0) {
      start.current = ref.current.getBoundingClientRect()?.left;
    }
  }, [pos]);

  useEffect(() => {
    setTimer(duration);
  }, [duration]);

  useEffect(() => {
    if (state.stop) {
      stopAnimate(requestId);
    } else if (state.play) {
      const offsetPlayLine = parseInt(ref.current.style.left.replace('px', ''));
      animate({
        setState,
        start: performance.now(),
        requestId,
        timing: (fraction: number) => (width - offsetPlayLine) * fraction,
        draw: (progress: number) => setPos(progress + offsetPlayLine),
        left: (progress: number) => setLeft(progress + offsetPlayLine),
        duration: (duration: number) => setTimer(duration),
        timer,
      });
    } else if (!state.play && !state.stop) {
      stopAnimate(requestId);
      setPos(0);
      setTimer(duration);
    }
  }, [state]);

  return <div ref={ref} id="play-line" className="play-line" style={{ left: pos }} />;
};

export default PlayLine;
