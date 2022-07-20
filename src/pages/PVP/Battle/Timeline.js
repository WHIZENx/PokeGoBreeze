import { Badge } from "@mui/material"
import { Fragment } from "react"
import APIService from "../../../services/API.service"
import HexagonIcon from '@mui/icons-material/Hexagon';

export const TimeLineVertical = (pokemonCurr, pokemonObj, hide) => {
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
                                            <div className="d-flex align-items-end">
                                                <div className="block-attack-container">
                                                    <img className="block-spirit-timelime" alt="img-shield" src={APIService.getPokeOtherLeague("ShieldButton")}/>
                                                </div>
                                                <span className="text-success">x{value.block}<span className="dec-block">-1</span></span>
                                            </div>
                                            :
                                            <div className="wait-attack-container"></div>
                                        }
                                    </Fragment>
                                }
                                {value.type === "F" &&
                                    <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className={`fast-attack-container ${value.color} text-white text-shadow`}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}>Fast Attack!</Badge>
                                }
                                {value.type === "W" &&
                                    <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className="wait-attack-container"
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}></Badge>
                                }
                                {value.type === "P" &&
                                    <div className={`swipe-attack-container ${value.color}-border`}>Swipe Charge</div>
                                }
                                {value.type === "C" &&
                                    <div className={`charged-attack-container ${value.color} text-white text-shadow`}>Charged Attack!</div>
                                }
                                {value.type === "Q" &&
                                    <div className={`winner-container bg-success text-white`}>WIN!</div>
                                }
                                {value.type === "X" &&
                                    <div className={`loser-container bg-danger text-white`}>LOSE!</div>
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
                                            <div className="d-flex align-items-end">
                                                <div className="block-attack-container">
                                                    <img className="block-spirit-timelime" alt="img-shield" src={APIService.getPokeOtherLeague("ShieldButton")}/>
                                                </div>
                                                <span className="text-success">x{value.block}<span className="dec-block">-1</span></span>
                                            </div>
                                            :
                                            <div className="wait-attack-container"></div>
                                        }
                                    </Fragment>
                                }
                                {value.type === "F" &&
                                    <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className={`fast-attack-container ${value.color} text-white text-shadow`}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}>Fast Attack!</Badge>
                                }
                                {value.type === "W" &&
                                    <Badge color="primary" overlap="circular" badgeContent={value.tap ? "Tap": null} className="wait-attack-container"
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}></Badge>
                                }
                                {value.type === "P" &&
                                    <div className={`swipe-attack-container ${value.color}-border`}>Swipe Charge</div>
                                }
                                {value.type === "C" &&
                                    <div className={`charged-attack-container ${value.color} text-white text-shadow`}>Charged Attack!</div>
                                }
                                {value.type === "Q" &&
                                    <div className={`winner-container bg-success text-white`}>WIN!</div>
                                }
                                {value.type === "X" &&
                                    <div className={`loser-container bg-danger text-white`}>FENT!</div>
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