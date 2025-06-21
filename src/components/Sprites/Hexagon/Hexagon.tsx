import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import './Hexagon.scss';
import { HexagonStats, IHexagonStats } from '../../../core/models/stats.model';
import { IHexagonComponent } from '../../models/component.model';
import { DynamicObj, toFloatWithPadding, toNumber } from '../../../utils/extension';
import { AnimationType } from './enums/hexagon.enum';

interface IPointer {
  x: number;
  y: number;
}

class Pointer implements IPointer {
  x = 0;
  y = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

const Hexagon = (props: IHexagonComponent) => {
  const canvasHex = useRef<HTMLCanvasElement>();
  const [initHex, setInitHex] = useState(false);
  const [defaultStats, setDefaultStats] = useState(new HexagonStats());

  const getHexConnerCord = (center: IPointer, size: number, i: number) => {
    const angleDeg = 60 * i - 30;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = center.x + size * Math.cos(angleRad);
    const y = center.y + size * Math.sin(angleRad);
    return new Pointer(x, y);
  };

  const drawLineHex = (
    ctx: CanvasRenderingContext2D,
    center: IPointer,
    percentage: number,
    color: string,
    isFill: boolean
  ) => {
    const start = getHexConnerCord(center, percentage, 0);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i <= 6; i++) {
      const end = getHexConnerCord(center, percentage, i);
      ctx.lineTo(end.x, end.y);
    }
    ctx.setLineDash([20, 15]);
    if (isFill) {
      ctx.fillStyle = 'gray';
      ctx.fill();
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
  };

  const drawStatsHex = (ctx: CanvasRenderingContext2D, center: IPointer, stat: IHexagonStats, hexSize: number) => {
    const stats: DynamicObj<number> = {
      '0': (stat.switching * hexSize) / 100,
      '1': (stat.charger * hexSize) / 100,
      '2': (stat.closer * hexSize) / 100,
      '3': (stat.cons * hexSize) / 100,
      '4': (stat.atk * hexSize) / 100,
      '5': (stat.lead * hexSize) / 100,
    };
    const start = getHexConnerCord(center, Math.min(stats['0'], 100), 0);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i <= Object.keys(stats).length; i++) {
      const end = getHexConnerCord(center, Math.min(stats[i.toString()], 100), i);
      ctx.lineTo(end.x, end.y);
    }
    ctx.setLineDash([]);
    ctx.lineTo(start.x, start.y);
    ctx.lineWidth = 3;
    ctx.fillStyle = '#a3eca380';
    ctx.fill();
    ctx.strokeStyle = 'green';
    ctx.stroke();
    ctx.closePath();
  };

  const loop = (animationType: AnimationType, startStat: number | undefined, endStat: number | undefined) => {
    startStat = toNumber(startStat);
    endStat = toNumber(endStat);
    return animationType === AnimationType.On
      ? Math.min(startStat + endStat / 30, endStat)
      : endStat > startStat
      ? Math.min(startStat + endStat / 30, endStat)
      : Math.max(startStat - endStat / 30, endStat);
  };

  const drawHexagon = useCallback(
    (stats: IHexagonStats) => {
      const hexBorderSize = props.size;
      const hexSize = hexBorderSize / 2;

      const ctx = canvasHex.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.clearRect(0, 0, hexBorderSize, hexBorderSize);
        ctx.closePath();
        const pointer = new Pointer(hexSize, (hexBorderSize + 4) / 2);
        drawLineHex(ctx, pointer, hexSize, 'white', true);
        drawLineHex(ctx, pointer, 25, 'var(--custom-table-border)', false);
        drawLineHex(ctx, pointer, 50, 'var(--custom-table-border)', false);
        drawLineHex(ctx, pointer, 75, 'var(--custom-table-border)', false);
        drawStatsHex(ctx, pointer, stats, hexSize);
        setInitHex(true);
      }
    },
    [props.size]
  );

  const equalStats = (initStats: HexagonStats) => {
    return (
      initStats.lead === props.stats?.lead &&
      initStats.charger === props.stats.charger &&
      initStats.closer === props.stats.closer &&
      initStats.cons === props.stats.cons &&
      initStats.atk === props.stats.atk &&
      initStats.switching === props.stats.switching
    );
  };

  useEffect(() => {
    if (props.name && props.animation === AnimationType.On) {
      setDefaultStats(new HexagonStats());
    } else {
      setDefaultStats(props.defaultStats ?? props.stats ?? new HexagonStats());
    }
  }, [props.name, props.animation, props.defaultStats, props.stats]);

  useEffect(() => {
    if (props.animation === AnimationType.On) {
      animateId.current = requestAnimationFrame(function animate() {
        setDefaultStats(
          HexagonStats.render({
            lead: loop(props.animation, defaultStats.lead, props.stats?.lead),
            charger: loop(props.animation, defaultStats.charger, props.stats?.charger),
            closer: loop(props.animation, defaultStats.closer, props.stats?.closer),
            cons: loop(props.animation, defaultStats.cons, props.stats?.cons),
            atk: loop(props.animation, defaultStats.atk, props.stats?.atk),
            switching: loop(props.animation, defaultStats.switching, props.stats?.switching),
          })
        );
        animateId.current = requestAnimationFrame(animate);
      });
    }

    if (!equalStats(defaultStats)) {
      drawHexagon(defaultStats);
    } else {
      drawHexagon(props.stats ?? new HexagonStats());
    }
    return () => {
      if (props.animation === AnimationType.On && animateId.current) {
        cancelAnimationFrame(animateId.current);
        animateId.current = undefined;
      }
    };
  }, [drawHexagon, defaultStats, props.animation, props.stats]);

  const animateId = useRef<number>();
  const onPlayAnimation = () => {
    if (animateId.current) {
      cancelAnimationFrame(animateId.current);
      animateId.current = undefined;
    }

    if (props.animation === AnimationType.On) {
      let initStats = new HexagonStats();
      animateId.current = requestAnimationFrame(function animate() {
        initStats = HexagonStats.render({
          lead: loop(props.animation, initStats.lead, props.stats?.lead),
          charger: loop(props.animation, initStats.charger, props.stats?.charger),
          closer: loop(props.animation, initStats.closer, props.stats?.closer),
          cons: loop(props.animation, initStats.cons, props.stats?.cons),
          atk: loop(props.animation, initStats.atk, props.stats?.atk),
          switching: loop(props.animation, initStats.switching, props.stats?.switching),
        });

        drawHexagon(initStats);

        if (!equalStats(initStats)) {
          animateId.current = requestAnimationFrame(animate);
        }
      });
    }
  };

  return (
    <div className="position-relative stats-border" style={{ width: props.borderSize, height: props.borderSize }}>
      {initHex && (
        <Fragment>
          <div className="position-absolute text-center leader-text">
            {toFloatWithPadding(props.stats?.lead, 1)}
            <br />
            <b>Leader</b>
          </div>
          <div className="position-absolute text-center attacker-text">
            {toFloatWithPadding(props.stats?.atk, 1)}
            <br />
            <b>Attacker</b>
          </div>
          <div className="position-absolute text-center consistence-text">
            {toFloatWithPadding(props.stats?.cons, 1)}
            <br />
            <b>Consistence</b>
          </div>
          <div className="position-absolute text-center closer-text">
            {toFloatWithPadding(props.stats?.closer, 1)}
            <br />
            <b>Closer</b>
          </div>
          <div className="position-absolute text-center charger-text">
            {toFloatWithPadding(props.stats?.charger, 1)}
            <br />
            <b>Charger</b>
          </div>
          <div className="position-absolute text-center switch-text">
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
