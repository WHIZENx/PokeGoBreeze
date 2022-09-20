import { Badge } from "@mui/material"
import React, { Fragment } from "react"
import APIService from "../../../services/API.service"
import HexagonIcon from '@mui/icons-material/Hexagon';
import { capitalize, splitAndCapitalize } from "../../../util/Utils";
import CloseIcon from '@mui/icons-material/Close';

export const TimeLineVertical = (pokemonCurr: any, pokemonObj: any, hide = false) => {

    const renderMoveBadgeBorder = (move: { type: string; name: string; }, border: boolean, shadow = false) => {
        if (!move) return;
        return (
            <div className="d-flex flex-wrap align-items-center" style={{gap: 5}}>
                <span className={move.type.toLowerCase()+(border ? "-border" : "")+" type-select-bg d-flex align-items-center border-type-init"}>
                    <div style={{display: 'contents', width: 16}}>
                        <img className={"pokemon-sprite-small sprite-type-select"+(!shadow ? "" : " filter-shadow")} alt="img-type-pokemon" src={APIService.getTypeHqSprite(capitalize(move.type.toLowerCase()))}/>
                    </div>
                    <span className={`${!shadow ? "text-black" : "filter-shadow"}`} style={{fontSize: 14}}>{splitAndCapitalize(move.name, "_", " ")}</span>
                </span>
            </div>
        )
    }

    const renderTimeline = (pokeCurr: { timeline: any[]; }, pokeObj: { timeline: { [x: string]: { type: string; }; }; }, end = false) => {
        return (
            <Fragment>
            {pokeCurr.timeline.map((value: any, index: any) => (
                <Fragment key={index}>
                    {(pokeObj.timeline[index] && pokeObj.timeline[index].type === "C") &&
                        <Fragment>
                            {value.type === "B" ?
                                <div style={{height: 80}} className={"d-flex align-items-center turn-battle"+(end ? " justify-content-end":"")}>
                                    <div className="block-attack-container">
                                        <img className="block-spirit-timelime" alt="img-shield" src={APIService.getPokeOtherLeague("ShieldButton")}/>
                                    </div>
                                    <span className="text-success">x{value.block}<span className="dec-block">-1</span></span>
                                </div>
                                :
                                <div className={"wait-attack-container turn-battle"+(end ? " justify-content-end":"")}></div>
                            }
                        </Fragment>
                    }
                    {value.type === "F" &&
                        <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className={`fast-attack-container text-shadow turn-battle ${end ? "justify-content-end":""}`}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: end ? 'right' : 'left',
                        }}>
                            <div className={`fast-attack-content text-center ${value.color}`}>
                                <span className="text-warning" style={{fontSize: 12}}><b>Fast Attack!</b></span>
                                {value.tap &&
                                    <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>
                                }
                            </div>
                        </Badge>
                    }
                    {value.type === "W" &&
                        <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className={`${pokeCurr.timeline[index-1] && pokeCurr.timeline[index-1].dmgImmune ? "fast-attack-container text-shadow" : "wait-attack-container"} ${end ? "justify-content-end":""} turn-battle ${value.tap ? `${value.color}-border` : ''}`}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: end ? 'right' : 'left',
                        }}>
                        {pokeCurr.timeline[index-1] && pokeCurr.timeline[index-1].dmgImmune ?
                            <div className={`fast-attack-content text-center ${value.move.type.toLowerCase()}`}>
                                <span className="text-warning" style={{fontSize: 12}}><b>Fast Attack!</b></span>
                                {value.tap &&
                                    <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>
                                }
                            </div>
                        :
                            <Fragment>
                                {value.tap &&
                                    <Fragment>{renderMoveBadgeBorder(value.move, true)}</Fragment>
                                }
                            </Fragment>
                        }
                        </Badge>
                    }
                    {value.type === "P" &&
                        <div style={{height: 80}} className={"d-flex align-items-center turn-battle"+(end ? " justify-content-end":"")}>
                            <div className={`swipe-attack-container ${value.color}-border text-center`}>
                                <span style={{fontSize: 12}}><b>Swipe Charge</b></span>
                                <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>
                            </div>
                        </div>
                    }
                    {value.type === "C" &&
                        <div className={`charged-attack-container text-shadow turn-battle ${end ? "justify-content-end":""}`}>
                            <div className={`charged-attack-content text-center ${value.color}`}>
                                <span className="text-warning" style={{fontSize: 16}}><b>Charged Attack!</b></span>
                            </div>
                        </div>
                    }
                    {value.type === "X" && (pokeObj.timeline[index] && pokeObj.timeline[index].type === "X") ?
                        <div className={`winner-container bg-dark text-white turn-battle ${end ? "justify-content-end":""}`}>TIE!</div>
                    :
                    <Fragment>
                        {value.type === "Q" &&
                            <div className={`winner-container bg-success text-white turn-battle ${end ? "justify-content-end":""}`}>WIN!</div>
                        }
                        {value.type === "X" &&
                            <div className={`loser-container bg-danger text-white turn-battle ${end ? "justify-content-end":""}`}>LOSE!</div>
                        }
                    </Fragment>
                    }

                </Fragment>
            ))
            }
            </Fragment>
        )
    }

    return (
        <Fragment>
            {!hide &&
            <div className="d-flex timeline-vertical battle-container">
                <div className="w-50">
                    <div className="d-flex flex-column" style={{gap: 10}}>
                        {renderTimeline(pokemonCurr, pokemonObj)}
                    </div>
                </div>
                <div className="w-50">
                    <div className="d-flex flex-column align-items-end" style={{gap: 10}}>
                        {renderTimeline(pokemonObj, pokemonCurr, true)}
                    </div>
                </div>
            </div>
            }
        </Fragment>
    )
}

export const TimeLine = (pokemonCurr: any, pokemonObj: any, elem: React.LegacyRef<HTMLDivElement> | undefined, scroll: { (e: { currentTarget: { scrollLeft: number; }; }): void; bind?: any; }, timeline: React.LegacyRef<HTMLDivElement> | undefined, eRef: React.LegacyRef<HTMLDivElement> | undefined, move: { (e: { currentTarget: { getBoundingClientRect: () => any; }; clientX: number; }): void; bind?: any; }, left: number, showTap: any, hide = false) => {

    const renderTimeline = (poke: { timeline: any[]; }, pokeObj: { timeline: { [x: string]: { type: string; }; }; }, border = false) => {
        return (
            <Fragment>
                <div className="element-top" style={{height: 12}}>
                    <div className="d-flex" style={{columnGap: 10, width: 'max-content'}}>
                        {poke.timeline.map((value: { size: any; tap: any; dmgImmune: any; type: string; buff: any[]; }, index: React.Key) => (
                            <span className="position-relative" key={index} style={{width: value.size}}>
                                {value.tap && <div style={{display: !showTap ? 'none' : 'block', opacity: 0.5, borderColor: value.dmgImmune ? 'red' : 'black'}} className="charge-attack"></div>}
                                {!value.tap &&
                                <Fragment>
                                    {value.type === "C" && value.buff && value.buff.length > 0 ?
                                    <div className="position-absolute icon-buff-timeline">
                                        {value.buff.map((b: { power: number; type: string; }, i: React.Key | null | undefined) => (
                                            <span key={i} className={(b.power < 0 ? "text-danger" : "text-success")}>
                                                {b.type.toUpperCase()} {(b.power > 0 ?"+":"")+b.power}
                                            </span>
                                        ))}
                                    </div>
                                    :
                                    <Fragment>
                                        {pokeObj.timeline[index] && pokeObj.timeline[index].type === "C" && value.buff && value.buff.length > 0 ?
                                            <div className="position-absolute icon-buff-timeline">
                                                {value.buff.map((b: { power: number; type: string; }, i: React.Key | null | undefined) => (
                                                    <span key={i} className={(b.power < 0 ? "text-danger" : "text-success")}>
                                                        {b.type.toUpperCase()} {b.power}
                                                    </span>
                                                ))}
                                            </div>
                                            :
                                            <div style={{display: !showTap ? 'none' : 'block'}} className="wait-attack"></div>
                                        }
                                    </Fragment>
                                    }
                                </Fragment>
                                }
                            </span>
                        ))}
                    </div>
                </div>
                <div className="d-flex align-items-center" style={{columnGap: 10, width: 'max-content', borderBottom: border ? '1px solid lightgray' : 'none'}}>
                    {poke.timeline.map((value: { type: string; size: any; color: any; }, index: any) => (
                        <Fragment key={index}>
                            {value.type === "B" && <HexagonIcon id={index} sx={{color: 'purple', fontSize: value.size}} />}
                            {value.type === "F" && <div id={index} className={`fast-attack ${value.color} ${value.color}-border`}></div>}
                            {(value.type === "S" || value.type === "P") && <div id={index} className={`charge-attack ${value.color}-border`} style={{width: value.size, height: value.size}}></div>}
                            {value.type === "C" && <div id={index} className={`charge-attack ${value.color} ${value.color}-border`} style={{width: value.size, height: value.size}}></div>}
                            {(value.type === "W" || value.type === "N") && <div id={index} className="wait-attack"></div>}
                            {!value.type && <div id={index} className="wait-charge-attack" style={{width: value.size, height: value.size}}></div>}
                            {value.type === "X" && <div id={index}><CloseIcon color="error"/></div>}
                        </Fragment>
                    ))}
                </div>
            </Fragment>
        )
    }

    return (
        <Fragment>
            {!hide &&
            <div className="w-100 battle-bar d-flex justify-content-center">
                <div id="battle-bar-scroll" className="battle-bar-container" ref={elem} onScroll={scroll.bind(this)}>
                    <div className="position-relative" ref={timeline} onMouseMove={move.bind(this)} onMouseOver={move.bind(this)}>
                        {renderTimeline(pokemonCurr, pokemonObj, true)}
                        {renderTimeline(pokemonObj, pokemonCurr)}
                        <div id="play-line" ref={eRef} className="play-line" style={{left: left}}></div>
                    </div>
                </div>
            </div>
            }
        </Fragment>
    )
}

export const TimeLineFit = (pokemonCurr: any, pokemonObj: any, timeline: React.LegacyRef<HTMLDivElement> | undefined, eRef: React.LegacyRef<HTMLDivElement> | undefined, move: { (e: { currentTarget: { getBoundingClientRect: () => any; }; clientX: number; }): void; bind?: any; }, left: string | number, showTap: any, hide = false) => {

    const calculateFitPoint = (length: number, index: number) => {
        return `${index*100/length-2}%`;
    }

    const renderTimelineFit = (poke: { timeline: any[]; }, pokeObj: { timeline: { [x: string]: { type: string; }; }; }) => {
        return (
            <Fragment>
                <div className="element-top" style={{height: 12}}>
                    <div className="position-relative timeline-fit-container">
                        {poke.timeline.map((value: { tap: any; size: any; dmgImmune: any; type: string; buff: any[]; }, index: number) => (
                            <Fragment key={index}>
                                {value.tap && <div className="charge-attack" style={{display: !showTap ? 'none' : 'block', opacity: 0.5, width: value.size, left: calculateFitPoint(poke.timeline.length, index), borderColor: value.dmgImmune ? 'red' : 'black'}}></div>}
                                {!value.tap &&
                                <Fragment>
                                    {value.type === "C" && value.buff && value.buff.length > 0 ?
                                    <div className="position-absolute icon-buff-timeline" style={{left: calculateFitPoint(poke.timeline.length, index), top: 10}}>
                                        {value.buff.map((b: { power: number; type: string; }, i: React.Key | null | undefined) => (
                                            <span key={i} className={(b.power < 0 ? "text-danger" : "text-success")}>
                                                {b.type.toUpperCase()} {(b.power > 0 ?"+":"")+b.power}
                                            </span>
                                        ))}
                                    </div>
                                    :
                                    <Fragment>
                                        {pokeObj.timeline[index] && pokeObj.timeline[index].type === "C" && value.buff && value.buff.length > 0 ?
                                            <div className="position-absolute icon-buff-timeline"  style={{left: calculateFitPoint(poke.timeline.length, index), top: 10}}>
                                                {value.buff.map((b: { power: number; type: string; }, i: React.Key | null | undefined) => (
                                                    <span key={i} className={(b.power < 0 ? "text-danger" : "text-success")}>
                                                        {b.type.toUpperCase()} {b.power}
                                                    </span>
                                                ))}
                                            </div>
                                            :
                                            <div className="wait-attack" style={{display: !showTap ? 'none' : 'block', width: value.size, left: calculateFitPoint(poke.timeline.length, index)}}></div>
                                        }
                                    </Fragment>
                                    }
                                </Fragment>
                                }
                            </Fragment>
                        ))}
                    </div>
                </div>
                <div className="position-relative timeline-fit-container" style={{height: 30}}>
                    {poke.timeline.map((value: { type: string; size: any; color: any; }, index: any) => (
                        <Fragment key={index}>
                            {value.type === "B" && <div id={index} style={{left: calculateFitPoint(poke.timeline.length, index)}}><HexagonIcon sx={{color: 'purple', fontSize: value.size}} /></div>}
                            {value.type === "F" && <div id={index} className={`fast-attack ${value.color} black-border`} style={{left: calculateFitPoint(poke.timeline.length, index)}}></div>}
                            {(value.type === "S" || value.type === "P") && <div id={index} className={`charge-attack ${value.color}-border`} style={{width: value.size, height: value.size, left: calculateFitPoint(poke.timeline.length, index)}}></div>}
                            {value.type === "C" && <div id={index} className={`charge-attack ${value.color} ${value.color}-border`} style={{width: value.size, height: value.size, left: calculateFitPoint(poke.timeline.length, index)}}></div>}
                            {(value.type === "W" || value.type === "N") && <div id={index} className="wait-attack" style={{left: calculateFitPoint(poke.timeline.length, index)}}></div>}
                            {!value.type && <div id={index} className="wait-charge-attack" style={{width: value.size, height: value.size, left: calculateFitPoint(poke.timeline.length, index)}}></div>}
                            {value.type === "X" && <div id={index} style={{left: calculateFitPoint(poke.timeline.length, index)}}><CloseIcon color="error"/></div>}
                        </Fragment>
                    ))}
                </div>
            </Fragment>
        )
    }

    return (
        <Fragment>
            {!hide &&
            <div className="w-100 fit-timeline d-flex justify-content-center">
                <div className="position-relative h-100" ref={timeline} onMouseMove={move.bind(this)} onMouseOver={move.bind(this)}>
                    {renderTimelineFit(pokemonCurr, pokemonObj)}
                    <hr className="w-100" style={{margin: 0}}/>
                    {renderTimelineFit(pokemonObj, pokemonCurr)}
                    <div id="play-line" ref={eRef} className="play-line" style={{left: left+"%"}}></div>
                </div>
            </div>
            }
        </Fragment>
    )
}