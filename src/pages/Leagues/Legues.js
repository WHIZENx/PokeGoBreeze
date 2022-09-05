import Type from '../../components/Sprites/Type/Type';

import { Accordion, Form, useAccordionButton } from 'react-bootstrap';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import APIService from '../../services/API.service';

import './Leagues.css';
import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTime, splitAndCapitalize, capitalize } from '../../util/Utils';
import { rankIconCenterName, rankIconName } from '../../util/Compute';
import { useSelector } from 'react-redux';
import { Badge } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Modal, Button } from 'react-bootstrap';

const Leagues = () => {

    const dataStore = useSelector((state) => state.store.data);
    const [rank, setRank] = useState(1);
    const [showData, setShowData] = useState(null);

    const getAssetPokeGo = (id, form) => {
        try {
            let data = dataStore.assets.find(item => item.id === id).image.find(item => item.form === form);
            return data ? APIService.getPokemonModel(data.default) : APIService.getPokemonModel(dataStore.assets.find(item => item.id === id).image[0].default);
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

    const [show, setShow] = useState(false);

    const handleShow = (type, track) => {
        let result = [];
        if (type === "pokemon") {
            setShow(true);
            Object.values(dataStore.leagues.season.rewards.pokemon).forEach(value => {
                if (value.rank <= rank) {
                    result.push(...value[track.toLowerCase()].map(item => {
                        if (item.guaranteedLimited) {
                            return {
                                ...item,
                                rank: value.rank
                            }
                        }
                        return item;
                    }))
                }
            })
        }
        setShowData(result.sort((a,b) => a.id-b.id));
    }

    const handleClose = () => {
        setShow(false);
        setShowData(null);
    }

    return (
        <div className='container' style={{padding: 15}}>
            <h2 className='title-leagues' style={{marginBottom: 15}}>Battle Leagues List</h2>
            <hr/>
            <div className='row' style={{rowGap: 10, margin: 0}}>
                <div className='col-md-8 d-flex justify-content-start align-items-center' style={{padding: 0}}>
                    <span style={{fontWeight: 500}}>
                        <span>Season Date: {getTime(dataStore.leagues.season.timestamp.start)}</span> <span>- {getTime(dataStore.leagues.season.timestamp.end)}</span>
                    </span>
                </div>
                <div className='col-md-4 d-flex justify-content-end' style={{padding: 0}}>
                <Form.Select onChange={(e) => setRank(parseInt(e.target.value))} defaultValue={rank}>
                    {Object.keys(dataStore.leagues.season.rewards.rank).map((value, index) => (
                        <option key={index} value={value}>Rank {value}</option>
                    ))
                    }
                </Form.Select>
                </div>
            </div>
            <div className='d-flex justify-content-center element-top'>
                <div className='season-league'>
                    <div className='group-rank-league reward-league text-center'>
                        <div className='rank-header'>Season {dataStore.leagues.season.season}</div>
                        <Badge color="primary" className='position-relative d-inline-block img-link' overlap="circular" badgeContent={null} sx={{paddingTop: '1.5rem !important', paddingBottom: '0.5rem !important', maxWidth: 64}}>
                            <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getPokeOtherLeague("BattleIconColor")}/>
                            <span className='caption text-black'>Free</span>
                        </Badge>
                        <hr/>
                        <Badge color="primary" className='position-relative d-inline-block img-link' overlap="circular" badgeContent={null} sx={{paddingBottom: '1.5rem !important', maxWidth: 64}}>
                            <img className='pokemon-sprite-medium' alt='img-pokemon' src={APIService.getItemSprite("Item_1402")}/>
                            <span className='caption text-black'>Premium</span>
                        </Badge>
                    </div>
                    {dataStore.leagues.season.rewards.rank[rank].free.map((value, index) => (
                        <Fragment key={index}>
                            <div className='group-rank-league text-center'>
                                <div className='rank-header'>Win Stack {value.step}</div>
                                <Badge color="primary" className='position-relative d-inline-block img-link' overlap="circular" badgeContent={value.count} max={10000}
                                sx={{paddingBottom: (value.type === "pokemon" || value.type === "itemLoot" ? '0 !important' : '1.5rem !important'), paddingTop: '1.5rem !important', minWidth: 64}}>
                                    {value.type === "pokemon" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getIconSprite("ic_grass")}/>
                                        <span className='caption text-black'>Random Pokemon</span>
                                        <VisibilityIcon className="view-pokemon" sx={{fontSize: '1rem', color: 'black'}} onClick={() => handleShow(value.type, "FREE", value.step)}/>
                                    </Fragment>
                                    }
                                    {value.type === "itemLoot" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getIconSprite("btn_question_02_normal_white_shadow")}/>
                                        <span className='caption text-black'>Random Item</span>
                                        <VisibilityIcon className="view-pokemon" sx={{fontSize: '1rem', color: 'black'}} onClick={() => handleShow(value.type, "FREE", value.step)}/>
                                    </Fragment>
                                    }
                                    {value.type === "ITEM_RARE_CANDY" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getItemSprite("Item_1301")}/>
                                        <span className='caption text-black'>Rare Candy</span>
                                    </Fragment>
                                    }
                                    {value.type === "stardust" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getItemSprite("stardust_painted")}/>
                                        <span className='caption text-black'>Stardust</span>
                                    </Fragment>
                                    }
                                    {value.type === "ITEM_MOVE_REROLL_SPECIAL_ATTACK" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getItemSprite("Item_1202")}/>
                                        <span className='caption text-black'>TM Charge Move</span>
                                    </Fragment>
                                    }
                                </Badge>
                                <hr style={{marginTop: 0}}/>
                                <Badge color="primary" className='position-relative d-inline-block img-link' overlap="circular" badgeContent={dataStore.leagues.season.rewards.rank[rank].premium[index].count} max={10000}
                                sx={{paddingBottom: (dataStore.leagues.season.rewards.rank[rank].premium[index].type === "pokemon" || dataStore.leagues.season.rewards.rank[rank].premium[index].type === "itemLoot" ? '0 !important' : '1.5rem !important'), minWidth: 64}}>
                                    {dataStore.leagues.season.rewards.rank[rank].premium[index].type === "pokemon" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getIconSprite("ic_grass")}/>
                                        <span className='caption text-black'>Random Pokemon</span>
                                        <VisibilityIcon className="view-pokemon" sx={{fontSize: '1rem', color: 'black'}} onClick={() => handleShow(dataStore.leagues.season.rewards.rank[rank].premium[index].type, "PREMIUM", value.step)}/>
                                    </Fragment>
                                    }
                                    {dataStore.leagues.season.rewards.rank[rank].premium[index].type === "itemLoot" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getIconSprite("btn_question_02_normal_white_shadow")}/>
                                        <span className='caption text-black'>Random Item</span>
                                        <VisibilityIcon className="view-pokemon" sx={{fontSize: '1rem', color: 'black'}} onClick={() => handleShow(dataStore.leagues.season.rewards.rank[rank].premium[index].type, "PREMIUM", value.step)}/>
                                    </Fragment>
                                    }
                                    {dataStore.leagues.season.rewards.rank[rank].premium[index].type === "ITEM_RARE_CANDY" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getItemSprite("Item_1301")}/>
                                        <span className='caption text-black'>Rare Candy</span>
                                    </Fragment>
                                    }
                                    {dataStore.leagues.season.rewards.rank[rank].premium[index].type === "stardust" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getItemSprite("stardust_painted")}/>
                                        <span className='caption text-black'>Stardust</span>
                                    </Fragment>
                                    }
                                    {dataStore.leagues.season.rewards.rank[rank].premium[index].type === "ITEM_MOVE_REROLL_SPECIAL_ATTACK" &&
                                    <Fragment>
                                        <img className='pokemon-sprite-medium' style={{width: 64}} alt='img-pokemon' src={APIService.getItemSprite("Item_1202")}/>
                                        <span className='caption text-black'>TM Charge Move</span>
                                    </Fragment>
                                    }
                                </Badge>
                            </div>
                        </Fragment>
                    ))
                    }
                </div>
            </div>
            <Accordion alwaysOpen style={{marginTop: 15}}>
                {dataStore.leagues.data.map((value, index) => (
                    <Accordion.Item key={index} eventKey={index}>
                        <Accordion.Header className={dataStore.leagues.allowLeagues.includes(value.id) ? "league-opened" : ""}>
                            <div className='d-flex align-items-center' style={{columnGap: 10}}>
                                <img alt='img-league' height={50} src={APIService.getAssetPokeGo(value.iconUrl)}/>
                                <b className={value.enabled ? "" : "text-danger"}>{(value.id.includes("SEEKER") && ["GREAT_LEAGUE", "ULTRA_LEAGUE", "MASTER_LEAGUE"].includes(value.title) ? splitAndCapitalize(value.id.replace("VS_","").toLowerCase(), "_", " ") : splitAndCapitalize(value.title.toLowerCase(), "_", " ")) +
                                (value.id.includes("SAFARI_ZONE") ? ` ${value.id.split("_")[3]} ${capitalize(value.id.split("_")[4].toLowerCase())}` : "")} {dataStore.leagues.allowLeagues.includes(value.id) && <span className='d-inline-block caption text-success'>(Opened)</span>}</b>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body className='league-body'>
                            <div className='sub-body'>
                            <h4 className='title-leagues'>{splitAndCapitalize(value.id.toLowerCase(), "_", " ")}</h4>
                            <div className='text-center'>
                                {value.league !== value.title && !value.title.includes("REMIX") && !value.iconUrl.includes("pogo") ?
                                    <div className='league'>
                                        <img alt='img-league' height={140} src={APIService.getAssetPokeGo(
                                            dataStore.leagues.data.find(item => item.title === value.league).iconUrl
                                        )}/>
                                        <span className={'badge-league '+value.league.toLowerCase()}>
                                            <div className="sub-badge">
                                                <img alt='img-league' height={50} src={APIService.getAssetPokeGo(value.iconUrl)}/>
                                            </div>
                                        </span>
                                    </div>
                                    :
                                    <div><img alt='img-league' height={140} src={APIService.getAssetPokeGo(value.iconUrl)}/></div>
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
                                <Type arr={value.conditions.unique_type} style={{marginLeft: 15}}/>
                            </li>
                            }
                            {value.conditions.whiteList.length !== 0 &&
                            <li style={{fontWeight: 500}}>
                                <h6 className='title-leagues text-success'>White List</h6>
                                {value.conditions.whiteList.map((item, index) => (
                                    <Link target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                                        <div className="d-flex justify-content-center">
                                            <span style={{width: 64}}>
                                                <img className='pokemon-sprite-medium filter-shadow-hover' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}/>
                                            </span>
                                        </div>
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
                                        <div className="d-flex justify-content-center">
                                            <span style={{width: 64}}>
                                                <img className='pokemon-sprite-medium filter-shadow-hover' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}/>
                                            </span>
                                        </div>
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

            {showData &&
            <Modal size="lg" show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                <Modal.Title>
                    <span>{rank > 20 &&
                    <div className='combat-league'>
                        <img className='main-combat-league' alt='img-pokemon' src={rankIconName(rank)}/>
                        <span className='combat-center-league'>
                            <img alt='img-league' height={24} src={rankIconCenterName(rank)}/>
                        </span>
                    </div>
                    }</span>
                    Rank {rank}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='text-center'>
                    <h5 style={{textDecoration: 'underline'}}>Random Pokemon</h5>
                    {showData.filter(item => !item.guaranteedLimited).map((item, index) => (
                        <Link target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                            <div className="d-flex justify-content-center">
                                <span style={{width: 64}}>
                                    <img className='pokemon-sprite-medium filter-shadow-hover' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}/>
                                </span>
                            </div>
                            <span className='caption'>{splitAndCapitalize(item.name.toLowerCase(), "_", " ")}</span>
                        </Link>
                    ))}
                    {showData.filter(item => item.guaranteedLimited && item.rank === rank).length > 0 &&
                    <Fragment>
                        <hr />
                        <h5 style={{textDecoration: 'underline'}}>Garanteed Pokemon in first time</h5>
                        {showData.filter(item => item.guaranteedLimited && item.rank === rank).map((item, index) => (
                        <Link target="_blank" className='img-link text-center' key={index} to={"/pokemon/" + item.id} title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), "_", " ")}`}>
                            <div className="d-flex justify-content-center">
                                <span style={{width: 64}}>
                                    <img className='pokemon-sprite-medium filter-shadow-hover' alt='img-pokemon' src={getAssetPokeGo(item.id, item.form)}/>
                                </span>
                            </div>
                            <span className='caption'>{splitAndCapitalize(item.name.toLowerCase(), "_", " ")}</span>
                        </Link>
                    ))}
                    </Fragment>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
            }
        </div>
    )
}

export default Leagues;