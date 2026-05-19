import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import './Hexagon.scss';
import { HexagonStats, IHexagonStats } from '../../../core/models/stats.model';
import { IHexagonComponent } from '../../models/component.model';
import { toFloatWithPadding, toNumber } from '../../../utils/extension';
import { AnimationType } from './enums/hexagon.enum';

// Resolve a CSS variable to its computed colour once, then cache it.
// DOM access is done outside the RAF loop to avoid layout thrashing every frame.
const cssVarCache = new Map<string, string>();
const resolveColor = (color: string): string => {
  if (!color.startsWith('var(')) {
    return color;
  }
  const cached = cssVarCache.get(color);
  if (cached) {
    return cached;
  }
  const el = document.createElement('div');
  el.style.color = color;
  document.body.appendChild(el);
  const resolved = getComputedStyle(el).color;
  document.body.removeChild(el);
  cssVarCache.set(color, resolved);
  return resolved;
};

// Pure geometry helper — returns x/y directly instead of allocating a Pointer object.
const hexCorner = (cx: number, cy: number, size: number, i: number): [number, number] => {
  const angleRad = (Math.PI / 180) * (60 * i - 30);
  return [cx + size * Math.cos(angleRad), cy + size * Math.sin(angleRad)];
};

const drawLineHex = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  percentage: number,
  bgColor: string,
  strokeColor: string,
  isFill: boolean
) => {
  const [sx, sy] = hexCorner(cx, cy, percentage, 0);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  for (let i = 1; i <= 6; i++) {
    const [ex, ey] = hexCorner(cx, cy, percentage, i);
    ctx.lineTo(ex, ey);
  }
  ctx.setLineDash([20, 15]);
  if (isFill) {
    ctx.fillStyle = bgColor;
    ctx.fill();
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
  ctx.closePath();
};

const drawStatsHex = (ctx: CanvasRenderingContext2D, cx: number, cy: number, halfSize: number, stat: IHexagonStats) => {
  const pct = (v: number) => Math.min((halfSize * v) / 100, halfSize);
  const sizes = [
    pct(stat.switching),
    pct(stat.charger),
    pct(stat.closer),
    pct(stat.cons),
    pct(stat.atk),
    pct(stat.lead),
  ];
  const [sx, sy] = hexCorner(cx, cy, sizes[0], 0);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  for (let i = 1; i < sizes.length; i++) {
    const [ex, ey] = hexCorner(cx, cy, sizes[i], i);
    ctx.lineTo(ex, ey);
  }
  ctx.setLineDash([]);
  ctx.lineTo(sx, sy);
  ctx.lineWidth = 3;
  ctx.fillStyle = '#a3eca380';
  ctx.fill();
  ctx.strokeStyle = 'green';
  ctx.stroke();
  ctx.closePath();
};

// Time-based easing step: covers the remaining distance at a fixed rate per second
// (targetted to finish in ~400 ms regardless of frame rate).
const ANIM_DURATION_MS = 400;
const lerp = (current: number, target: number, dt: number): number => {
  const step = (target / ANIM_DURATION_MS) * dt;
  return target > current ? Math.min(current + step, target) : Math.max(current - step, target);
};

const statsEqual = (a: IHexagonStats, b: IHexagonStats | undefined): boolean =>
  !!b &&
  a.lead === b.lead &&
  a.charger === b.charger &&
  a.closer === b.closer &&
  a.cons === b.cons &&
  a.atk === b.atk &&
  a.switching === b.switching;

const Hexagon = (props: IHexagonComponent) => {
  const canvasHex = useRef<HTMLCanvasElement>();
  const [initHex, setInitHex] = useState(false);
  const [defaultStats, setDefaultStats] = useState(new HexagonStats());

  const animationStatsRef = useRef<IHexagonStats>({ ...defaultStats });
  const animateId = useRef<number>();

  const getPercentageBySize = useCallback((size: number) => ((props.size / 2) * size) / 100, [props.size]);

  const drawHexagon = useCallback(
    (stats: IHexagonStats) => {
      const hexBorderSize = props.size;
      const hexSize = hexBorderSize / 2;
      const ctx = canvasHex.current?.getContext('2d');
      if (!ctx) {
        return;
      }
      // Resolve colours once per draw (cached after first call per theme).
      const bgColor = resolveColor('var(--custom-gray)');
      const strokeColor = resolveColor('var(--custom-table-border)');

      ctx.clearRect(0, 0, hexBorderSize, hexBorderSize);

      const cx = hexSize;
      const cy = (hexBorderSize + 4) / 2;

      drawLineHex(ctx, cx, cy, hexSize, bgColor, strokeColor, true);
      drawLineHex(ctx, cx, cy, getPercentageBySize(25), bgColor, strokeColor, false);
      drawLineHex(ctx, cx, cy, getPercentageBySize(50), bgColor, strokeColor, false);
      drawLineHex(ctx, cx, cy, getPercentageBySize(75), bgColor, strokeColor, false);
      drawStatsHex(ctx, cx, cy, hexSize, stats);
    },
    [props.size, getPercentageBySize]
  );

  useEffect(() => {
    if (!props.animation) {
      setDefaultStats(props.defaultStats ?? props.stats ?? new HexagonStats());
    }
  }, [props.defaultStats, props.stats, props.animation]);

  useEffect(() => {
    animationStatsRef.current = { ...defaultStats };

    if (props.animation === AnimationType.On) {
      let lastTime: number | undefined;
      animateId.current = requestAnimationFrame(function animate(timestamp) {
        const dt = lastTime !== undefined ? timestamp - lastTime : 16;
        lastTime = timestamp;

        const cur = animationStatsRef.current;
        const tgt = props.stats;
        animationStatsRef.current = HexagonStats.render({
          lead: lerp(cur.lead, toNumber(tgt?.lead), dt),
          charger: lerp(cur.charger, toNumber(tgt?.charger), dt),
          closer: lerp(cur.closer, toNumber(tgt?.closer), dt),
          cons: lerp(cur.cons, toNumber(tgt?.cons), dt),
          atk: lerp(cur.atk, toNumber(tgt?.atk), dt),
          switching: lerp(cur.switching, toNumber(tgt?.switching), dt),
        });

        drawHexagon(animationStatsRef.current);
        if (!initHex) {
          setInitHex(true);
        }

        if (!statsEqual(animationStatsRef.current, tgt)) {
          animateId.current = requestAnimationFrame(animate);
        }
      });
    } else {
      const s = props.stats ?? defaultStats ?? new HexagonStats();
      drawHexagon(s);
      setInitHex(true);
    }

    return () => {
      if (animateId.current) {
        cancelAnimationFrame(animateId.current);
        animateId.current = undefined;
      }
    };
  }, [drawHexagon, props.animation, props.stats]);

  const onPlayAnimation = () => {
    if (animateId.current) {
      cancelAnimationFrame(animateId.current);
      animateId.current = undefined;
    }

    if (props.animation !== AnimationType.On) {
      return;
    }

    let lastTime: number | undefined;
    let cur = new HexagonStats();

    animateId.current = requestAnimationFrame(function animate(timestamp) {
      const dt = lastTime !== undefined ? timestamp - lastTime : 16;
      lastTime = timestamp;

      const tgt = props.stats;
      cur = HexagonStats.render({
        lead: lerp(cur.lead, toNumber(tgt?.lead), dt),
        charger: lerp(cur.charger, toNumber(tgt?.charger), dt),
        closer: lerp(cur.closer, toNumber(tgt?.closer), dt),
        cons: lerp(cur.cons, toNumber(tgt?.cons), dt),
        atk: lerp(cur.atk, toNumber(tgt?.atk), dt),
        switching: lerp(cur.switching, toNumber(tgt?.switching), dt),
      });

      drawHexagon(cur);

      if (!statsEqual(cur, tgt)) {
        animateId.current = requestAnimationFrame(animate);
      }
    });
  };

  return (
    <div className="tw-relative stats-border" style={{ width: props.borderSize, height: props.borderSize }}>
      {initHex && (
        <Fragment>
          <div className="tw-absolute tw-text-center leader-text">
            {toFloatWithPadding(props.stats?.lead, 1)}
            <br />
            <b>Leader</b>
          </div>
          <div className="tw-absolute tw-text-center attacker-text">
            {toFloatWithPadding(props.stats?.atk, 1)}
            <br />
            <b>Attacker</b>
          </div>
          <div className="tw-absolute tw-text-center consistence-text">
            {toFloatWithPadding(props.stats?.cons, 1)}
            <br />
            <b>Consistence</b>
          </div>
          <div className="tw-absolute tw-text-center closer-text">
            {toFloatWithPadding(props.stats?.closer, 1)}
            <br />
            <b>Closer</b>
          </div>
          <div className="tw-absolute tw-text-center charger-text">
            {toFloatWithPadding(props.stats?.charger, 1)}
            <br />
            <b>Charger</b>
          </div>
          <div className="tw-absolute tw-text-center switch-text">
            {toFloatWithPadding(props.stats?.switching, 1)}
            <br />
            <b>Switch</b>
          </div>
        </Fragment>
      )}
      <canvas
        onClick={() => onPlayAnimation()}
        ref={canvasHex as React.LegacyRef<HTMLCanvasElement> | undefined}
        width={props.size}
        height={props.size + 4}
      />
    </div>
  );
};

export default Hexagon;
