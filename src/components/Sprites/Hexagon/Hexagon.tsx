import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import './Hexagon.scss';
import { HexagonStats } from '../../../core/models/stats.model';
import { IHexagonComponent } from '../../models/component.model';

const Hexagon = (props: IHexagonComponent) => {
  const canvasHex: React.MutableRefObject<HTMLCanvasElement | undefined> = useRef();
  const [initHex, setInitHex] = useState(false);
  const [defaultStats, setDefaultStats] = useState(props.defaultStats ?? props.stats);

  const getHexConnerCord = (center: { x: number; y: number }, size: number, i: number) => {
    const angleDeg = 60 * i - 30;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = center.x + size * Math.cos(angleRad);
    const y = center.y + size * Math.sin(angleRad);
    return Point(x, y);
  };

  const Point = (x: number, y: number) => {
    return { x, y };
  };

  const drawLineHex = (
    ctx: CanvasRenderingContext2D | null | undefined,
    center: { x: number; y: number },
    percentage: number,
    color: string,
    fill: boolean
  ) => {
    const start = getHexConnerCord(center, percentage, 0);
    ctx?.beginPath();
    ctx?.moveTo(start.x, start.y);
    for (let i = 1; i <= 6; i++) {
      const end = getHexConnerCord(center, percentage, i);
      ctx?.lineTo(end.x, end.y);
    }
    ctx?.setLineDash([20, 15]);
    if (ctx) {
      if (fill) {
        ctx.fillStyle = 'gray';
        ctx.fill();
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
    }
    ctx?.stroke();
    ctx?.closePath();
  };

  const drawStatsHex = (
    ctx: CanvasRenderingContext2D | null | undefined,
    center: { x: number; y: number },
    stat: HexagonStats,
    hexSize: number
  ) => {
    const stats: { [x: string]: number } = {
      '0': ((stat.switching || 0) * hexSize) / 100,
      '1': ((stat.charger || 0) * hexSize) / 100,
      '2': ((stat.closer || 0) * hexSize) / 100,
      '3': ((stat.cons || 0) * hexSize) / 100,
      '4': ((stat.atk || 0) * hexSize) / 100,
      '5': ((stat.lead || 0) * hexSize) / 100,
    };
    const start = getHexConnerCord(center, Math.min(stats['0'], 100), 0);
    ctx?.beginPath();
    ctx?.moveTo(start.x, start.y);
    for (let i = 1; i <= 6; i++) {
      const end = getHexConnerCord(center, Math.min(stats[i.toString()], 100), i);
      ctx?.lineTo(end.x, end.y);
    }
    ctx?.setLineDash([]);
    ctx?.lineTo(start.x, start.y);
    if (ctx) {
      ctx.lineWidth = 3;
      ctx.fillStyle = '#a3eca380';
    }
    ctx?.fill();
    if (ctx) {
      ctx.strokeStyle = 'green';
    }
    ctx?.stroke();
    ctx?.closePath();
  };

  const loop = (type: number, startStat: number, endStat: number) => {
    return type === 1
      ? Math.min(startStat + endStat / 30, endStat)
      : endStat > startStat
      ? Math.min(startStat + endStat / 30, endStat)
      : Math.max(startStat - endStat / 30, endStat);
  };

  const drawHexagon = useCallback(
    (stats: HexagonStats) => {
      const hexBorderSize = props.size ?? 0;
      const hexSize = hexBorderSize / 2;

      const ctx = canvasHex.current?.getContext('2d');
      ctx?.beginPath();
      ctx?.clearRect(0, 0, hexBorderSize, hexBorderSize);
      ctx?.closePath();
      drawLineHex(ctx, { x: hexSize, y: (hexBorderSize + 4) / 2 }, hexSize, 'white', true);
      drawLineHex(ctx, { x: hexSize, y: (hexBorderSize + 4) / 2 }, 25, 'lightgray', false);
      drawLineHex(ctx, { x: hexSize, y: (hexBorderSize + 4) / 2 }, 50, 'lightgray', false);
      drawLineHex(ctx, { x: hexSize, y: (hexBorderSize + 4) / 2 }, 75, 'lightgray', false);
      drawStatsHex(ctx, { x: hexSize, y: (hexBorderSize + 4) / 2 }, stats, hexSize);
      setInitHex(true);
    },
    [props.size]
  );

  useEffect(() => {
    if (!props.animation) {
      drawHexagon(props.stats);
    } else if (
      defaultStats.lead !== props.stats.lead ||
      defaultStats.charger !== props.stats.charger ||
      defaultStats.closer !== props.stats.closer ||
      defaultStats.cons !== props.stats.cons ||
      defaultStats.atk !== props.stats.atk ||
      defaultStats.switching !== props.stats.switching
    ) {
      if (props.animation) {
        animateId.current = requestAnimationFrame(function animate() {
          setDefaultStats({
            lead: loop(props.animation, defaultStats.lead, props.stats.lead),
            charger: loop(props.animation, defaultStats.charger, props.stats.charger),
            closer: loop(props.animation, defaultStats.closer, props.stats.closer),
            cons: loop(props.animation, defaultStats.cons, props.stats.cons),
            atk: loop(props.animation, defaultStats.atk, props.stats.atk),
            switching: loop(props.animation, defaultStats.switching, props.stats.switching),
          });
          animateId.current = requestAnimationFrame(animate);
        });
      }
      drawHexagon(defaultStats);
      return () => {
        if (animateId.current) {
          cancelAnimationFrame(animateId.current);
          animateId.current = undefined;
        }
      };
    }
  }, [drawHexagon, defaultStats, props.animation, props.stats]);

  const animateId: React.MutableRefObject<number | undefined> = useRef();
  const onPlayAnimation = () => {
    if (animateId.current) {
      cancelAnimationFrame(animateId.current);
      animateId.current = undefined;
    }

    let initStats: HexagonStats = {
      lead: 0,
      atk: 0,
      cons: 0,
      closer: 0,
      charger: 0,
      switching: 0,
    };

    animateId.current = requestAnimationFrame(function animate() {
      initStats = {
        lead: loop(1, initStats.lead, props.stats.lead),
        charger: loop(1, initStats.charger, props.stats.charger),
        closer: loop(1, initStats.closer, props.stats.closer),
        cons: loop(1, initStats.cons, props.stats.cons),
        atk: loop(1, initStats.atk, props.stats.atk),
        switching: loop(1, initStats.switching, props.stats.switching),
      };

      drawHexagon(initStats);

      if (
        !(
          initStats.lead === props.stats.lead &&
          initStats.charger === props.stats.charger &&
          initStats.closer === props.stats.closer &&
          initStats.cons === props.stats.cons &&
          initStats.atk === props.stats.atk &&
          initStats.switching === props.stats.switching
        )
      ) {
        animateId.current = requestAnimationFrame(animate);
      }
    });
  };

  return (
    <div className="position-relative stats-border" style={{ width: props.borderSize, height: props.borderSize }}>
      {initHex && (
        <Fragment>
          <div className="position-absolute text-center leader-text">
            {(props.stats.lead || 0).toFixed(1)}
            <br />
            <b>Leader</b>
          </div>
          <div className="position-absolute text-center attacker-text">
            {(props.stats.atk || 0).toFixed(1)}
            <br />
            <b>Attacker</b>
          </div>
          <div className="position-absolute text-center consistence-text">
            {(props.stats.cons || 0).toFixed(1)}
            <br />
            <b>Consistence</b>
          </div>
          <div className="position-absolute text-center closer-text">
            {(props.stats.closer || 0).toFixed(1)}
            <br />
            <b>Closer</b>
          </div>
          <div className="position-absolute text-center charger-text">
            {(props.stats.charger || 0).toFixed(1)}
            <br />
            <b>Charger</b>
          </div>
          <div className="position-absolute text-center switch-text">
            {(props.stats.switching || 0).toFixed(1)}
            <br />
            <b>Switch</b>
          </div>
        </Fragment>
      )}
      <canvas
        onClick={() => onPlayAnimation()}
        ref={canvasHex as React.LegacyRef<HTMLCanvasElement> | undefined}
        width={props.size ?? 0}
        height={(props.size ?? 0) + 4}
      />
    </div>
  );
};

export default Hexagon;
