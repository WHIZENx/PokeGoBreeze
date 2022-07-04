import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import './Hexagon.css';

const Hexagon = (props) => {

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
            const end = getHexConerCord(center, hexSize, i);
            ctx.moveTo(hexSize, hexSize);
            ctx.lineTo(end.x, end.y);
        }
        ctx.strokeStyle = "lightgray";
        ctx.stroke();
        ctx.closePath();
    }, [getHexConerCord, hexSize]);

    const drawStatsHex = useCallback((canvasId, center, stat) => {
        const stats = {
            "0": (stat.switch || 0)*hexSize/100,
            "1": (stat.charger || 0)*hexSize/100,
            "2": (stat.closer || 0)*hexSize/100,
            "3": (stat.cons || 0)*hexSize/100,
            "4": (stat.atk || 0)*hexSize/100,
            "5": (stat.lead || 0)*hexSize/100,
            "6": (stat.switch || 0)*hexSize/100
        };
        const ctx = canvasId.getContext('2d');
        const start = getHexConerCord(center, stats["0"], 0);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i <= 6; i++) {
            const end = getHexConerCord(center, stats[i.toString()], i);
            ctx.lineTo(end.x, end.y);
        }
        ctx.lineTo(start.x, start.y);
        ctx.fillStyle = "#a3eca3";
        ctx.fill();
        ctx.strokeStyle = "green";
        ctx.stroke();
        ctx.closePath();
    }, [getHexConerCord, hexSize]);

    useEffect(() => {
        const ctx = canvasHex.current.getContext('2d');
        ctx.beginPath();
        ctx.clearRect(0, 0, hexBorderSize, hexBorderSize);
        drawInitHex(canvasHex.current, { x: hexBorderSize/2, y: hexBorderSize/2 });
        drawInitLineHex(canvasHex.current, { x: hexBorderSize/2, y: hexBorderSize/2 });
        drawStatsHex(canvasHex.current, { x: hexBorderSize/2, y: hexBorderSize/2 }, props.stats);
        setInitHex(true);
    }, [canvasHex, drawInitHex, drawInitLineHex, initHex, drawStatsHex, hexBorderSize, props.stats]);

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
                    {(props.stats.switch || 0).toFixed(1)}
                    <br/>
                    <b>Switch</b>
                </div>
                </Fragment>
            }
            <canvas ref={canvasHex} width={hexBorderSize} height={hexBorderSize}></canvas>
        </div>
    )
}

export default Hexagon;