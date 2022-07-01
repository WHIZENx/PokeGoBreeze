import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import update from 'immutability-helper';

import './Stats.css';

const Stats = () => {

    const hexBorderSize = 256;
    const hexSize = hexBorderSize/2;
    const initStats = {
        lead: 85,
        atk: 70,
        cons: 65,
        closer: 50,
        charger: 40,
        switch: 75
    }
    const canvasHex = useRef();
    const [initHex, setInitHex] = useState(false);
    const [statsPVP, setStatsPVP] = useState(initStats);


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
        if (!initHex) {
            drawInitHex(canvasHex.current, { x: hexBorderSize/2, y: hexBorderSize/2 });
            drawInitLineHex(canvasHex.current, { x: hexBorderSize/2, y: hexBorderSize/2 });
            drawStatsHex(canvasHex.current, { x: hexBorderSize/2, y: hexBorderSize/2 }, statsPVP);
            setInitHex(true);
        }
    }, [canvasHex, drawInitHex, drawInitLineHex, initHex, statsPVP, drawStatsHex]);

    const onHandleChangeStat = (type, value) => {
        const result = update(statsPVP, {[type]: {$set: Math.min(parseFloat(value), 100)}});
        setStatsPVP(result);
        const ctx = canvasHex.current.getContext('2d');
        ctx.beginPath();
        ctx.clearRect(0, 0, hexBorderSize, hexBorderSize);
        setInitHex(false);
    }

    return (
        <div className="container">
            <h2>PVP Pokémon Stats</h2>
            <div className="d-flex flex-wrap w-100">
                <div className="position-relative stats-border">
                    {initHex &&
                        <Fragment>
                        <div className="position-absolute text-center" style={{left: 'calc(50% - 25px)', top: 20}}>
                            {(statsPVP.lead || 0).toFixed(1)}
                            <br/>
                            <b>Leader</b>
                        </div>
                        <div className="position-absolute text-center" style={{left: 10, top: 105}}>
                            {(statsPVP.atk || 0).toFixed(1)}
                            <br/>
                            <b>Attacker</b>
                        </div>
                        <div className="position-absolute text-center" style={{left: 10, bottom: 105}}>
                            {(statsPVP.cons || 0).toFixed(1)}
                            <br/>
                            <b>Consistance</b>
                        </div>
                        <div className="position-absolute text-center" style={{left: 'calc(50% - 25px)', bottom: 20}}>
                            {(statsPVP.closer || 0).toFixed(1)}
                            <br/>
                            <b>Closer</b>
                        </div>
                        <div className="position-absolute text-center" style={{right: 25, bottom: 105}}>
                            {(statsPVP.charger || 0).toFixed(1)}
                            <br/>
                            <b>Charger</b>
                        </div>
                        <div className="position-absolute text-center" style={{right: 25, top: 105}}>
                            {(statsPVP.switch || 0).toFixed(1)}
                            <br/>
                            <b>Switch</b>
                        </div>
                        </Fragment>
                    }
                    <canvas ref={canvasHex} width={hexBorderSize} height={hexBorderSize}></canvas>
                </div>
                <div className="text-center">
                    <div className="input-group border-input">
                        <span className="input-group-text">Leader</span>
                        <input type="number" className='form-control input-search' placeholder='Leader'
                        value={statsPVP.lead}
                        min={0}
                        max={100}
                        onInput={e => onHandleChangeStat("lead", e.target.value)}/>
                    </div>
                    <div className="input-group border-input">
                        <span className="input-group-text">Attacker</span>
                        <input type="number" className='form-control input-search' placeholder='Attacker'
                        value={statsPVP.atk}
                        min={0}
                        max={100}
                        onInput={e => onHandleChangeStat("atk", e.target.value)}/>
                    </div>
                    <div className="input-group border-input">
                        <span className="input-group-text">Consistance</span>
                        <input type="number" className='form-control input-search' placeholder='Consistance'
                        value={statsPVP.cons}
                        min={0}
                        max={100}
                        onInput={e => onHandleChangeStat("cons", e.target.value)}/>
                    </div>
                    <div className="input-group border-input">
                        <span className="input-group-text">Closer</span>
                        <input type="number" className='form-control input-search' placeholder='Closer'
                        value={statsPVP.closer}
                        min={0}
                        max={100}
                        onInput={e => onHandleChangeStat("closer", e.target.value)}/>
                    </div>
                    <div className="input-group border-input">
                        <span className="input-group-text">Charge</span>
                        <input type="number" className='form-control input-search' placeholder='Charge'
                        value={statsPVP.charger}
                        min={0}
                        max={100}
                        onInput={e => onHandleChangeStat("charger", e.target.value)}/>
                    </div>
                    <div className="input-group border-input">
                        <span className="input-group-text">Switch</span>
                        <input type="number" className='form-control input-search' placeholder='Switch'
                        value={statsPVP.switch}
                        min={0}
                        max={100}
                        onInput={e => onHandleChangeStat("switch", e.target.value)}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Stats;