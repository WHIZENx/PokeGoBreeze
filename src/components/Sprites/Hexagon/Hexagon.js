import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import './Hexagon.css';

const Hexagon = ({setDefaultStats, ...props}) => {

    const hexBorderSize = props.size ?? 0;
    const hexSize = hexBorderSize/2;
    const canvasHex = useRef();
    const [initHex, setInitHex] = useState(false);

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

    const drawInitHex = useCallback((canvasId, center) => {
        const ctx = canvasId.getContext('2d');
        const start = getHexConerCord(center, hexSize, 0);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i <= 6; i++) {
            const end = getHexConerCord(center, hexSize, i);
            ctx.lineTo(end.x, end.y);
        }
        ctx.fillStyle = "#dddddd80";
        ctx.fill();
        ctx.strokeStyle = "gray";
        ctx.stroke();
        ctx.closePath();
    }, [getHexConerCord, hexSize]);

    const drawInitLineHex = useCallback((canvasId, center) => {
        const ctx = canvasId.getContext('2d');
        ctx.beginPath();
        for (let i = 1; i <= 6; i++) {
            const end = getHexConerCord(center, hexSize-2, i);
            ctx.moveTo(hexSize-2, hexSize-2);
            ctx.lineTo(end.x, end.y);
        }
        ctx.strokeStyle = "lightgray";
        ctx.stroke();
        ctx.closePath();
    }, [getHexConerCord, hexSize]);

    const drawStatsHex = useCallback((canvasId, center, stat) => {
        const stats = {
            "0": (stat.switching || 0)*hexSize/100,
            "1": (stat.charger || 0)*hexSize/100,
            "2": (stat.closer || 0)*hexSize/100,
            "3": (stat.cons || 0)*hexSize/100,
            "4": (stat.atk || 0)*hexSize/100,
            "5": (stat.lead || 0)*hexSize/100,
            "6": (stat.switching || 0)*hexSize/100
        };
        const ctx = canvasId.getContext('2d');
        const start = getHexConerCord(center, Math.min(stats["0"], 100), 0);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i <= 6; i++) {
            const end = getHexConerCord(center, Math.min(stats[i.toString()], 100), i);
            ctx.lineTo(end.x, end.y);
        }
        ctx.lineTo(start.x, start.y);
        ctx.lineWidth = 2;
        ctx.fillStyle = "#a3eca3";
        ctx.fill();
        ctx.strokeStyle = "green";
        ctx.stroke();
        ctx.closePath();
    }, [getHexConerCord, hexSize]);

    useEffect(() => {
        if (props.lead !== props.stats.lead ||
            props.charger !== props.stats.charger ||
            props.closer !== props.stats.closer ||
            props.cons !== props.stats.cons ||
            props.atk !== props.stats.atk ||
            props.switching !== props.stats.switching) {
            var interval
            if (props.animation) {
                interval = setInterval(() => {
                    setDefaultStats({...props.defaultStats, ...{
                        lead: Math.min(props.lead+(props.stats.lead/30), props.stats.lead),
                        charger: Math.min(props.charger+(props.stats.charger/30), props.stats.charger),
                        closer: Math.min(props.closer+(props.stats.closer/30), props.stats.closer),
                        cons: Math.min(props.cons+(props.stats.cons/30), props.stats.cons),
                        atk: Math.min(props.atk+(props.stats.atk/30), props.stats.atk),
                        switching: Math.min(props.switching+(props.stats.switching/30), props.stats.switching)
                    }})
                }, 5)
            }

            const ctx = canvasHex.current.getContext('2d');
            ctx.beginPath();
            ctx.clearRect(0, 0, hexBorderSize, hexBorderSize);
            drawInitHex(canvasHex.current, { x: hexBorderSize/2, y: (hexBorderSize+4)/2 });
            drawInitLineHex(canvasHex.current, { x: hexBorderSize/2, y: (hexBorderSize+4)/2 });
            drawStatsHex(canvasHex.current, { x: hexBorderSize/2, y: (hexBorderSize+4)/2 }, props.animation ? props.defaultStats : props.stats);
            setInitHex(true);
        }
        return () => clearInterval(interval);
    }, [drawInitHex, drawInitLineHex, drawStatsHex, hexBorderSize, setDefaultStats, props.animation, props.stats,
        props.atk, props.charger, props.closer, props.cons, props.defaultStats, props.lead, props.switching]);

    return (
        <div className="position-relative stats-border">
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
            <canvas ref={canvasHex} width={hexBorderSize} height={hexBorderSize+4}></canvas>
        </div>
    )
}

export default Hexagon;