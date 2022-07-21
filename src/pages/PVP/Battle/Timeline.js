import { Badge } from "@mui/material"
import { Fragment } from "react"
import APIService from "../../../services/API.service"
import HexagonIcon from '@mui/icons-material/Hexagon';
import { capitalize, splitAndCapitalize } from "../../../util/Utils";

export const TimeLineVertical = (pokemonCurr, pokemonObj, hide) => {

    const renderMoveBadgeBorder = (move, border, shadow) => {
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

    return (
        <Fragment>
            {!hide &&
            <div className="d-flex timeline-vertical battle-container">
                <div className="w-50">
                    <div className="d-flex flex-column" style={{gap: 10}}>
                        <Fragment>
                        {pokemonCurr.timeline.map((value, index) => (
                            <Fragment key={index}>
                                {(pokemonObj.timeline[index] && pokemonObj.timeline[index].type === "C") &&
                                    <Fragment>
                                        {value.type === "B" ?
                                            <div style={{height: 80}} className="d-flex align-items-center turn-battle">
                                                <div className="block-attack-container">
                                                    <img className="block-spirit-timelime" alt="img-shield" src={APIService.getPokeOtherLeague("ShieldButton")}/>
                                                </div>
                                                <span className="text-success">x{value.block}<span className="dec-block">-1</span></span>
                                            </div>
                                            :
                                            <div className="wait-attack-container turn-battle"></div>
                                        }
                                    </Fragment>
                                }
                                {value.type === "F" &&
                                    <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className={`fast-attack-container text-shadow turn-battle`}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
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
                                    <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className={`${pokemonCurr.timeline[index-1] && pokemonCurr.timeline[index-1].dmgImmune ? "fast-attack-container text-shadow" : "wait-attack-container"} turn-battle ${value.tap ? `${value.color}-border` : ''}`}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}>
                                    {pokemonCurr.timeline[index-1] && pokemonCurr.timeline[index-1].dmgImmune ?
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
                                    <div style={{height: 80}} className="d-flex align-items-center turn-battle">
                                        <div className={`swipe-attack-container ${value.color}-border text-center`}>
                                            <span style={{fontSize: 12}}><b>Swipe Charge</b></span>
                                            <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>
                                        </div>
                                    </div>
                                }
                                {value.type === "C" &&
                                    <div className={`charged-attack-container text-shadow turn-battle`}>
                                        <div className={`charged-attack-content text-center ${value.color}`}>
                                            <span className="text-warning" style={{fontSize: 16}}><b>Charged Attack!</b></span>
                                        </div>
                                    </div>
                                }
                                {value.type === "Q" &&
                                    <div className={`winner-container bg-success text-white turn-battle`}>WIN!</div>
                                }
                                {value.type === "X" &&
                                    <div className={`loser-container bg-danger text-white turn-battle`}>LOSE!</div>
                                }
                            </Fragment>
                        ))
                        }
                        </Fragment>
                    </div>
                </div>
                <div className="w-50">
                    <div className="d-flex flex-column align-items-end" style={{gap: 10}}>
                        <Fragment>
                        {pokemonObj.timeline.map((value, index) => (
                            <Fragment key={index}>
                                {(pokemonCurr.timeline[index] && pokemonCurr.timeline[index].type === "C") &&
                                    <Fragment>
                                        {value.type === "B" ?
                                            <div style={{height: 80}} className="d-flex align-items-center turn-battle justify-content-end">
                                                <div className="block-attack-container">
                                                    <img className="block-spirit-timelime" alt="img-shield" src={APIService.getPokeOtherLeague("ShieldButton")}/>
                                                </div>
                                                <span className="text-success">x{value.block}<span className="dec-block">-1</span></span>
                                            </div>
                                            :
                                            <div className="wait-attack-container turn-battle justify-content-end"></div>
                                        }
                                    </Fragment>
                                }
                                {value.type === "F" &&
                                    <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className={`fast-attack-container text-shadow turn-battle justify-content-end`}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
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
                                    <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className={`${pokemonObj.timeline[index-1] && pokemonObj.timeline[index-1].dmgImmune ? "fast-attack-container text-shadow" : "wait-attack-container"} turn-battle justify-content-end ${value.tap ? `${value.color}-border` : ''}`}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}>
                                    {pokemonObj.timeline[index-1] && pokemonObj.timeline[index-1].dmgImmune ?
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
                                    <div style={{height: 80}} className="d-flex align-items-center turn-battle justify-content-end">
                                        <div className={`swipe-attack-container ${value.color}-border text-center`}>
                                            <span style={{fontSize: 12}}><b>Swipe Charge</b></span>
                                            <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>
                                        </div>
                                    </div>
                                }
                                {value.type === "C" &&
                                    <div className={`charged-attack-container text-shadow turn-battle justify-content-end`}>
                                        <div className={`charged-attack-content text-center ${value.color}`}>
                                            <span className="text-warning" style={{fontSize: 16}}><b>Charged Attack!</b></span>
                                        </div>
                                    </div>
                                }
                                {value.type === "Q" &&
                                    <div className={`winner-container bg-success text-white turn-battle justify-content-end`}>WIN!</div>
                                }
                                {value.type === "X" &&
                                    <div className={`loser-container bg-danger text-white turn-battle justify-content-end`}>FENT!</div>
                                }
                            </Fragment>
                        ))
                        }
                        </Fragment>
                    </div>
                </div>
            </div>
            }
        </Fragment>
    )
}

export const TimeLine = (pokemonCurr, pokemonObj, showTap, hide) => {

    return (
        <Fragment>
            {!hide &&
            <div className="w-100 battle-bar">
                <div className="element-top" style={{height: 12}}>
                    <div style={{display: !showTap ? 'none' : 'block'}}>
                        <div className="d-flex" style={{columnGap: 10, opacity: 0.5, width: 'max-content'}}>
                            {pokemonCurr.timeline.map((value, index) => (
                                <Fragment key={index}>
                                    {value.tap && <div className="charge-attack" style={{width: value.size}}></div>}
                                    {!value.tap && <div className="wait-attack" style={{width: value.size}}></div>}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center" style={{columnGap: 10, width: 'max-content'}}>
                    {pokemonCurr.timeline.map((value, index) => (
                        <Fragment key={index}>
                            {value.type === "B" && <HexagonIcon sx={{color: 'purple', fontSize: value.size}} />}
                            {value.type === "F" && <div className={`fast-attack ${value.color} ${value.color}-border`}></div>}
                            {(value.type === "S" || value.type === "P") && <div className={`charge-attack ${value.color}-border`} style={{width: value.size, height: value.size}}></div>}
                            {value.type === "C" && <div className={`charge-attack ${value.color} ${value.color}-border`} style={{width: value.size, height: value.size}}></div>}
                            {(value.type === "W" || value.type === "N") && <div className="wait-attack"></div>}
                            {!value.type && <div className="wait-charge-attack" style={{width: value.size, height: value.size}}></div>}
                            {value.type === "X" && <div className="text-danger">X</div>}
                        </Fragment>
                    ))}
                </div>
                <div className="element-top" style={{height: 12}}>
                    <div style={{display: !showTap ? 'none' : 'block'}}>
                        <div className="d-flex" style={{columnGap: 10, opacity: 0.5, width: 'max-content'}}>
                            {pokemonObj.timeline.map((value, index) => (
                                <Fragment key={index}>
                                    {value.tap && <div className="charge-attack" style={{width: value.size}}></div>}
                                    {!value.tap && <div className="wait-attack" style={{width: value.size}}></div>}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center" style={{columnGap: 10, width: 'max-content'}}>
                    {pokemonObj.timeline.map((value, index) => (
                        <Fragment key={index}>
                            {value.type === "B" && <HexagonIcon sx={{color: 'purple', fontSize: value.size}} />}
                            {value.type === "F" && <div className={`fast-attack ${value.color} ${value.color}-border`}></div>}
                            {(value.type === "S" || value.type === "P") && <div className={`charge-attack ${value.color}-border`} style={{width: value.size, height: value.size}}></div>}
                            {value.type === "C" && <div className={`charge-attack ${value.color} ${value.color}-border`} style={{width: value.size, height: value.size}}></div>}
                            {(value.type === "W" || value.type === "N") && <div className="wait-attack"></div>}
                            {!value.type && <div className="wait-charge-attack" style={{width: value.size, height: value.size}}></div>}
                            {value.type === "X" && <div className="text-danger text-danger">X</div>}
                        </Fragment>
                    ))}
                </div>
            </div>
            }
        </Fragment>
    )
}

export const TimeLineFit = (pokemonCurr, pokemonObj, showTap, hide) => {

    const calculateFitPoint = (length, index) => {
        return `${index*100/(length-1)}%`;
    }

    return (
        <Fragment>
            {!hide &&
            <div className="w-100 fit-timeline">
                <div className="element-top" style={{height: 12}}>
                    <div style={{display: !showTap ? 'none' : 'block'}}>
                        <div className="position-relative timeline-fit-container" style={{opacity: 0.5}}>
                            {pokemonCurr.timeline.map((value, index) => (
                                <Fragment key={index}>
                                    {value.tap && <div className="charge-attack" style={{width: value.size, left: calculateFitPoint(pokemonCurr.timeline.length, index)}}></div>}
                                    {!value.tap && <div className="wait-attack" style={{width: value.size, left: calculateFitPoint(pokemonCurr.timeline.length, index)}}></div>}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="position-relative timeline-fit-container" style={{height: 30}}>
                    {pokemonCurr.timeline.map((value, index) => (
                        <Fragment key={index}>
                            {value.type === "B" && <div style={{left: calculateFitPoint(pokemonCurr.timeline.length, index)}}><HexagonIcon sx={{color: 'purple', fontSize: value.size}} /></div>}
                            {value.type === "F" && <div className={`fast-attack ${value.color} black-border`} style={{left: calculateFitPoint(pokemonCurr.timeline.length, index)}}></div>}
                            {(value.type === "S" || value.type === "P") && <div className={`charge-attack ${value.color}-border`} style={{width: value.size, height: value.size, left: calculateFitPoint(pokemonCurr.timeline.length, index)}}></div>}
                            {value.type === "C" && <div className={`charge-attack ${value.color} ${value.color}-border`} style={{width: value.size, height: value.size, left: calculateFitPoint(pokemonCurr.timeline.length, index)}}></div>}
                            {(value.type === "W" || value.type === "N") && <div className="wait-attack" style={{left: calculateFitPoint(pokemonCurr.timeline.length, index)}}></div>}
                            {!value.type && <div className="wait-charge-attack" style={{width: value.size, height: value.size, left: calculateFitPoint(pokemonCurr.timeline.length, index)}}></div>}
                            {value.type === "X" && <div className="text-danger" style={{left: calculateFitPoint(pokemonCurr.timeline.length, index)}}>X</div>}
                        </Fragment>
                    ))}
                </div>
                <div className="element-top" style={{height: 12}}>
                    <div style={{display: !showTap ? 'none' : 'block'}}>
                        <div className="position-relative timeline-fit-container" style={{opacity: 0.5}}>
                            {pokemonObj.timeline.map((value, index) => (
                                <Fragment key={index}>
                                    {value.tap && <div className="charge-attack" style={{width: value.size, left: calculateFitPoint(pokemonObj.timeline.length, index)}}></div>}
                                    {!value.tap && <div className="wait-attack" style={{width: value.size, left: calculateFitPoint(pokemonObj.timeline.length, index)}}></div>}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="position-relative timeline-fit-container" style={{height: 30}}>
                    {pokemonObj.timeline.map((value, index) => (
                        <Fragment key={index}>
                            {value.type === "B" && <div style={{left: calculateFitPoint(pokemonObj.timeline.length, index)}}><HexagonIcon sx={{color: 'purple', fontSize: value.size}} /></div>}
                            {value.type === "F" && <div className={`fast-attack ${value.color} black-border`} style={{left: calculateFitPoint(pokemonObj.timeline.length, index)}}></div>}
                            {(value.type === "S" || value.type === "P") && <div className={`charge-attack ${value.color}-border`} style={{width: value.size, height: value.size, left: calculateFitPoint(pokemonObj.timeline.length, index)}}></div>}
                            {value.type === "C" && <div className={`charge-attack ${value.color} ${value.color}-border`} style={{width: value.size, height: value.size, left: calculateFitPoint(pokemonObj.timeline.length, index)}}></div>}
                            {(value.type === "W" || value.type === "N") && <div className="wait-attack" style={{left: calculateFitPoint(pokemonObj.timeline.length, index)}}></div>}
                            {!value.type && <div className="wait-charge-attack" style={{width: value.size, height: value.size, left: calculateFitPoint(pokemonObj.timeline.length, index)}}></div>}
                            {value.type === "X" && <div className="text-danger" style={{left: calculateFitPoint(pokemonObj.timeline.length, index)}}>X</div>}
                        </Fragment>
                    ))}
                </div>
            </div>
            }
        </Fragment>
    )
}