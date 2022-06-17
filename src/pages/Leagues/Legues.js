import Type from '../../components/Sprites/Type';

import { Accordion, Form, useAccordionButton } from 'react-bootstrap';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import leaguesData from '../../data/pokemon_go_leagues.json';
import pokeImageList from '../../data/assets_pokemon_go.json';
import APIService from '../../services/API.service';

import './Leagues.css';
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTime, rankIconCenterName, rankIconName, rankName, splitAndCapitalize } from '../../components/Calculate/Calculate';
import { capitalize } from '@mui/material';

const Leagues = () => {

    const [season, setSeason] = useState(Object.keys(leaguesData.seasons)[Object.keys(leaguesData.seasons).length-1])

    const getAssetPokeGo = (id, form) => {
        try {
            let data = pokeImageList.find(item => item.id === id).image.find(item => item.form === form);
            return data ? APIService.getPokemonModel(data.default) : APIService.getPokemonModel(pokeImageList.find(item => item.id === id).image[0].default);
        } catch {return APIService.getPokeFullSprite(id)}
    }

    const LeaveToggle = ({ eventKey }) => {
        const decoratedOnClick = useAccordionButton(eventKey, () => <></>);

        return (
          <div className='accordion-footer' onClick={decoratedOnClick}>
            <span className='text-danger'>Close <CloseIcon sx={{color: 'red'}}/></span>
          </div>
        );
    }

    useEffect(() => {
        document.title = "Battle Leagues List";
    }, []);

    return (
        <div className='container' style={{padding: 15}}>
            <h2 className='title-leagues' style={{marginBottom: 15}}>Battle Leagues List</h2>
            <span className="text-timestamp">* Update: {getTime(leaguesData.timestamp, true)}</span>
            <hr></hr>
            <div className='row'>
                <div className='col d-flex justify-content-start align-items-center'>
                    <span style={{fontWeight: 500}}>Start Date: {getTime(leaguesData.seasons[season].seasonEndTime)}</span>
                </div>
                <div className='col d-flex justify-content-end'>
                <Form.Select onChange={(e) => setSeason(e.target.value)} defaultValue={season}>
                    {Object.keys(leaguesData.seasons).map((value, index) => (
                        <option key={index} value={value}>Season {value}</option>
                    ))
                    }
                </Form.Select>
                </div>
            </div>
            <div className='season-league'>
                <div className='group-rank-league reward-league text-center'>
                    <div className='rank-header'>Season {season}</div>
                    <span target="_blank" className='img-link'>
                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getPokeOtherLeague("BattleIconColor")}></img>
                        <span className='caption text-black'>Free</span>
                    </span>
                    <hr></hr>
                    <span target="_blank" className='img-link' style={{paddingBottom: 20, width: 64}}>
                        <img className='pokemon-sprite-medium' alt='img-pokemon' src={APIService.getItemSprite("Item_1402")}></img>
                        <span className='caption text-black'>Premium</span>
                    </span>
                </div>
                {leaguesData.seasons[season].rewards ?
                <Fragment>
                {Object.entries(leaguesData.seasons[season].rewards).map(([rank, value]) => (
                    <Fragment key={rank}>
                    {value.filter(item => item.type === "FREE" && item.guaranteedLimited).length > 0 && value.filter(item => item.type === "PREMIUM" && item.guaranteedLimited).length > 0 && ((
                        <Fragment>
                            <div className='group-rank-league text-center'>
                            <div className='rank-header'>
                                {parseInt(rank) > 20 &&
                                <div className='combat-league'>
                                    <img className='main-combat-league' alt='img-pokemon' src={rankIconName(parseInt(rank))}></img>
                                    <span className='combat-center-league'>
                                        <img alt='img-league' height={10} src={rankIconCenterName(parseInt(rank))}></img>
                                    </span>
                                </div>
                                }
                                {parseInt(rank) < 21 ? "Rank "+rank : rankName(parseInt(rank))+" Rank"}
                            </div>
                            {value.filter(item => item.type === "FREE" && item.guaranteedLimited).map((item, index) => (
                                <Link target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                                    <div className='w-100 d-flex justify-content-center'>
                                        <div className='group-pokemon-sprite'>
                                            <img className='pokemon-sprite-medium' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}></img>
                                        </div>
                                    </div>
                                    <span className='caption'>{splitAndCapitalize(item.name.toLowerCase(), "_", " ")} {item.form !== "NORMAL" && splitAndCapitalize(item.form, "_", " ")}</span>
                                    {item.guaranteedLimited && <span className='caption text-danger position-absolute text-guarantee'>Guarantee</span>}
                                </Link>
                            ))}
                            <hr></hr>
                            {value.filter(item => item.type === "PREMIUM" && item.guaranteedLimited).map((item, index) => (
                                <Link style={{paddingBottom: 20}} target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                                    <div className='w-100 d-flex justify-content-center'>
                                        <div className='group-pokemon-sprite'>
                                            <img className='pokemon-sprite-medium' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}></img>
                                        </div>
                                    </div>
                                    <span className='caption'>{splitAndCapitalize(item.name.toLowerCase(), "_", " ")} {item.form !== "NORMAL" && splitAndCapitalize(item.form, "_", " ")}</span>
                                    {item.guaranteedLimited && <span className='caption text-danger position-absolute text-guarantee'>Guarantee</span>}
                                </Link>
                            ))}
                            </div>
                        </Fragment>
                    ))}
                    {rank < 21 &&
                    <div className='group-rank-league text-center'>
                        <div className='rank-header'>Rank {rank}{parseInt(rank) === 20 ? "" : "-"+(parseInt(rank)+4)}</div>
                        {value.filter((item, index, arr) => arr.findIndex(value => (value.id === item.id && value.type === "FREE")) === index).map((item, index) => (
                            <Link target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                                <div className='w-100 d-flex justify-content-center'>
                                    <div className='group-pokemon-sprite'>
                                        <img className='pokemon-sprite-medium' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}></img>
                                    </div>
                                </div>
                                <span className='caption'>{splitAndCapitalize(item.name.toLowerCase(), "_", " ")} {item.form !== "NORMAL" && splitAndCapitalize(item.form, "_", " ")}</span>
                            </Link>
                        ))}
                        <hr></hr>
                        {value.filter((item, index, arr) => arr.findIndex(value => (value.id === item.id && value.type === "PREMIUM")) === index).map((item, index) => (
                            <Link style={{paddingBottom: 20}} target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                                <div className='w-100 d-flex justify-content-center'>
                                    <div className='group-pokemon-sprite'>
                                        <img className='pokemon-sprite-medium' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}></img>
                                    </div>
                                </div>
                                <span className='caption'>{splitAndCapitalize(item.name.toLowerCase(), "_", " ")} {item.form !== "NORMAL" && splitAndCapitalize(item.form, "_", " ")}</span>
                            </Link>
                        ))}
                    </div>
                    }
                    </Fragment>
                ))}
                </Fragment>
                :
                <div className='season-unavailable'>
                    Season {season} information unavailable.
                </div>
                }
            </div>
            <Accordion alwaysOpen style={{marginTop: 15}}>
                {leaguesData.data.map((value, index) => (
                    <Accordion.Item key={index} eventKey={index}>
                        <Accordion.Header>
                            <img style={{marginRight: 10}} alt='img-league' height={50} src={APIService.getAssetPokeGo(value.iconUrl)}></img>
                            <b className={value.enabled ? "" : "text-danger"}>{(value.id.includes("SEEKER") && ["GREAT_LEAGUE", "ULTRA_LEAGUE", "MASTER_LEAGUE"].includes(value.title) ? splitAndCapitalize(value.id.replace("VS_","").toLowerCase(), "_", " ") : splitAndCapitalize(value.title.toLowerCase(), "_", " ")) +
                            (value.id.includes("SAFARI_ZONE") ? ` ${value.id.split("_")[3]} ${capitalize(value.id.split("_")[4].toLowerCase())}` : "")}</b>
                        </Accordion.Header>
                        <Accordion.Body>
                            <div className='sub-body'>
                            <h4 className='title-leagues'>{splitAndCapitalize(value.id.toLowerCase(), "_", " ")}</h4>
                            <div className='text-center'>
                                {value.league !== value.title && !value.title.includes("REMIX") && !value.iconUrl.includes("pogo") ?
                                    <div className='league'>
                                        <img alt='img-league' height={140} src={APIService.getAssetPokeGo(
                                            leaguesData.data.find(item => item.title === value.league).iconUrl
                                        )}>
                                        </img>
                                        <span className={'badge-league '+value.league.toLowerCase()}>
                                            <div className="sub-badge">
                                                <img alt='img-league' height={50} src={APIService.getAssetPokeGo(value.iconUrl)}></img>
                                            </div>
                                        </span>
                                    </div>
                                    :
                                    <div><img alt='img-league' height={140} src={APIService.getAssetPokeGo(value.iconUrl)}></img></div>
                                }
                            </div>
                            <h5 className='title-leagues element-top'>Conditions</h5>
                            <ul style={{listStyleType: "inherit"}}>
                            <li style={{fontWeight: 500}}>
                                <h6><b>Max CP:</b> <span>{value.conditions.max_cp}</span></h6>
                            </li>
                            {value.conditions.max_level &&
                                <li style={{fontWeight: 500}}>
                                    <h6><b>Max Level:</b> <span>{value.conditions.max_level}</span></h6>
                                </li>
                            }
                            {value.conditions.timestamp &&
                                <li>
                                    <h6 className='title-leagues'>Event time</h6>
                                    <span style={{fontWeight: 500}}>Start Date: {getTime(value.conditions.timestamp.start)}</span>
                                    {value.conditions.timestamp.end &&
                                    <span style={{fontWeight: 500}}>
                                        <br></br>End Date: {getTime(value.conditions.timestamp.end)}
                                    </span>
                                    }
                                </li>
                            }
                            <li style={{fontWeight: 500}}>
                                <h6 className='title-leagues'>Unique Selected</h6>
                                {value.conditions.unique_selected ?
                                <DoneIcon sx={{color: 'green'}}/>
                                :
                                <CloseIcon sx={{color: 'red'}}/>
                                }
                            </li>
                            {value.conditions.unique_type &&
                            <li style={{fontWeight: 500}} className='unique-type'>
                                <h6 className='title-leagues'>Unique Type</h6>
                                <Type arr={value.conditions.unique_type}/>
                            </li>
                            }
                            {value.conditions.whiteList.length !== 0 &&
                            <li style={{fontWeight: 500}}>
                                <h6 className='title-leagues text-success'>White List</h6>
                                {value.conditions.whiteList.map((item, index) => (
                                    <Link target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                                        <img className='pokemon-sprite-medium' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}></img>
                                        <span className='caption'>{splitAndCapitalize(item.name.toLowerCase(), "_", " ")}</span>
                                    </Link>
                                ))}
                            </li>
                            }
                            {value.conditions.banned.length !== 0 &&
                            <li style={{fontWeight: 500}}>
                                <h6 className='title-leagues text-danger'>Ban List</h6>
                                {value.conditions.banned.map((item, index) => (
                                    <Link target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                                        <img className='pokemon-sprite-medium' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}></img>
                                        <span className='caption'>{splitAndCapitalize(item.name.toLowerCase(), "_", " ")}</span>
                                    </Link>
                                ))}
                            </li>
                            }
                            </ul>
                            </div>
                            <LeaveToggle eventKey={index} />
                        </Accordion.Body>
                    </Accordion.Item>
                ))
                }
            </Accordion>
        </div>
    )
}

export default Leagues;