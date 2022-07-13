import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import './Hexagon.css';

const Hexagon = (props) => {

    const canvasHex = useRef();
    const [initHex, setInitHex] = useState(false);
    const [defaultStats, setDefaultStats] = useState(props.defaultStats ?? props.stats);

    const getHexConerCord = useCallback((center, size, i) => {
        let angle_deg = 60 * i - 30;
        let angle_rad = Math.PI / 180 * angle_deg;
        let x = center.x + size * Math.cos(angle_rad);
        let y = center.y + size * Math.sin(angle_rad);
        return Point(x, y);
    }, []);

    const Point = (x, y) => {
        return { x: x, y: y };
    }

    const drawLineHex = useCallback((ctx, center, percentage, color, fill) => {
        const start = getHexConerCord(center, percentage, 0);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i <= 6; i++) {
            const end = getHexConerCord(center, percentage, i);
            ctx.lineTo(end.x, end.y);
        }
        ctx.setLineDash([20, 15]);
        if (fill) {
            ctx.fillStyle = "gray";
            ctx.fill();
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }, [getHexConerCord]);

    const drawStatsHex = useCallback((ctx, center, stat, hexSize) => {
        const stats = {
            "0": (stat.switching || 0)*hexSize/100,
            "1": (stat.charger || 0)*hexSize/100,
            "2": (stat.closer || 0)*hexSize/100,
            "3": (stat.cons || 0)*hexSize/100,
            "4": (stat.atk || 0)*hexSize/100,
            "5": (stat.lead || 0)*hexSize/100
        };
        const start = getHexConerCord(center, Math.min(stats["0"], 100), 0);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i <= 6; i++) {
            const end = getHexConerCord(center, Math.min(stats[i.toString()], 100), i);
            ctx.lineTo(end.x, end.y);
        }
        ctx.setLineDash([]);
        ctx.lineTo(start.x, start.y);
        ctx.lineWidth = 3;
        ctx.fillStyle = "#a3eca380";
        ctx.fill();
        ctx.strokeStyle = "green";
        ctx.stroke();
        ctx.closePath();
    }, [getHexConerCord]);

    const loop = (type, startStat, endStat) => {
        return type === 1 ? Math.min(startStat+(endStat/30), endStat)
        : endStat > startStat ? Math.min(startStat+(endStat/30), endStat)
        : Math.max(startStat-(endStat/30), endStat)
    }

    const drawHexagon = useCallback((stats) => {
        const hexBorderSize = props.size ?? 0;
        const hexSize = hexBorderSize/2;

        const ctx = canvasHex.current.getContext('2d');
        ctx.beginPath();
        ctx.clearRect(0, 0, hexBorderSize, hexBorderSize);
        ctx.closePath();
        drawLineHex(ctx, { x: hexSize, y: (hexBorderSize+4)/2 }, hexSize, "white", true);
        drawLineHex(ctx, { x: hexSize, y: (hexBorderSize+4)/2 }, 25, "lightgray", false);
        drawLineHex(ctx, { x: hexSize, y: (hexBorderSize+4)/2 }, 50, "lightgray", false);
        drawLineHex(ctx, { x: hexSize, y: (hexBorderSize+4)/2 }, 75, "lightgray", false);
        drawStatsHex(ctx, { x: hexSize, y: (hexBorderSize+4)/2 }, stats, hexSize);
        setInitHex(true);
    }, [drawLineHex, drawStatsHex, props.size]);

    useEffect(() => {
        if (!props.animation) {
            drawHexagon(props.stats);
        } else if (defaultStats.lead !== props.stats.lead ||
            defaultStats.charger !== props.stats.charger ||
            defaultStats.closer !== props.stats.closer ||
            defaultStats.cons !== props.stats.cons ||
            defaultStats.atk !== props.stats.atk ||
            defaultStats.switching !== props.stats.switching) {
            var interval
            if (props.animation) {
                interval = setInterval(() => {
                    setDefaultStats({
                        lead: loop(props.animation, defaultStats.lead, props.stats.lead),
                        charger: loop(props.animation, defaultStats.charger, props.stats.charger),
                        closer: loop(props.animation, defaultStats.closer, props.stats.closer),
                        cons: loop(props.animation, defaultStats.cons, props.stats.cons),
                        atk: loop(props.animation, defaultStats.atk, props.stats.atk),
                        switching: loop(props.animation, defaultStats.switching, props.stats.switching)
                    })
                }, 25)
            }
            drawHexagon(defaultStats);
            return () => clearInterval(interval);
        }
    }, [drawHexagon, defaultStats, setDefaultStats, props.animation, props.stats]);

    const onPlayAnimaion = () => {
        var interval;
        clearInterval(interval);

        let initStats = {
            lead: 0,
            atk: 0,
            cons: 0,
            closer: 0,
            charger: 0,
            switching: 0
        }

        interval = setInterval(() => {
            initStats = {
                lead: loop(1, initStats.lead, props.stats.lead),
                charger: loop(1, initStats.charger, props.stats.charger),
                closer: loop(1, initStats.closer, props.stats.closer),
                cons: loop(1, initStats.cons, props.stats.cons),
                atk: loop(1, initStats.atk, props.stats.atk),
                switching: loop(1, initStats.switching, props.stats.switching)
            };

            drawHexagon(initStats);

            if (initStats.lead === props.stats.lead &&
                initStats.charger === props.stats.charger &&
                initStats.closer === props.stats.closer &&
                initStats.cons === props.stats.cons &&
                initStats.atk === props.stats.atk &&
                initStats.switching === props.stats.switching) clearInterval(interval);
        }, 10)
    }

    return (
        <div className="position-relative stats-border" style={{width: props.borderSize, height: props.borderSize}}>
            {initHex &&
                <Fragment>
                <div className="position-absolute text-center leader-text">
                    {(props.stats.lead || 0).toFixed(1)}
                    <br/>
                    <b>Leader</b>
                </div>
                <div className="position-absolute text-center attacker-text">
                    {(props.stats.atk || 0).toFixed(1)}
                    <br/>
                    <b>Attacker</b>
                </div>
                <div className="position-absolute text-center consistance-text">
                    {(props.stats.cons || 0).toFixed(1)}
                    <br/>
                    <b>Consistance</b>
                </div>
                <div className="position-absolute text-center closer-text">
                    {(props.stats.closer || 0).toFixed(1)}
                    <br/>
                    <b>Closer</b>
                </div>
                <div className="position-absolute text-center charger-text">
                    {(props.stats.charger || 0).toFixed(1)}
                    <br/>
                    <b>Charger</b>
                </div>
                <div className="position-absolute text-center switch-text">
                    {(props.stats.switching || 0).toFixed(1)}
                    <br/>
                    <b>Switch</b>
                </div>
                </Fragment>
            }
            <canvas onClick={() => onPlayAnimaion()} ref={canvasHex} width={props.size ?? 0} height={(props.size ?? 0)+4}></canvas>
        </div>
    )
}

export default Hexagon;