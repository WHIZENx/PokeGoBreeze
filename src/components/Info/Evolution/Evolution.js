import { Badge } from "@mui/material";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SecurityUpdateIcon from '@mui/icons-material/SecurityUpdate';
import CallMadeIcon from '@mui/icons-material/CallMade';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PetsIcon from '@mui/icons-material/Pets';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Fragment, useCallback, useEffect, useState } from "react";
import Xarrow from "react-xarrows";
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";

import evoData from "../../../data/evolution_pokemon_go.json";
import pokemonData from "../../../data/pokemon.json";
import pokemonName from "../../../data/pokemon_names.json";

import "./Evolution.css";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { capitalize, splitAndCapitalize } from "../../../util/Utils";
import { computeCandyBgColor, computeCandyColor } from "../../../util/Compute";

import { OverlayTrigger } from "react-bootstrap";
import PopoverConfig from "../../../components/Popover/PopoverConfig";

const theme = createTheme({
    palette: {
      neutral: {
        main: '#a6efff80',
        contrastText: 'gray',
        fontSize: 10
      },
    },
});

const Evolution = ({evolution, onLoad, setOnLoad, forme, region, formDefault, evolution_url, id, onSetIDPoke, gen}) => {

    const [arrEvoList, setArrEvoList] = useState([]);

    const getEvoChain = useCallback((data) => {
        if (data.length === 0) return false;
        let evoList = data.map(item => {
            return item && evoData.filter(e => e.id === parseInt(item.species.url.split("/")[6]));
        })[0];
        let currForm = formDefault ?
        forme.form_name === "" && ["Alola", "Galar"].includes(region) ?
        region : forme.form_name : forme.form_name;
        if (!evoList) {
            const pokemon = evoData.find(e => e.id === id);
            if (pokemon) return setArrEvoList(oldArr => [...oldArr, [{name: splitAndCapitalize(pokemon.name, "_", " "), id: pokemon.id, baby: false, form: pokemon.form ?? null}]]);
            return setArrEvoList(oldArr => [...oldArr, [{name: pokemonName[id].name, id: id, baby: false, form: null}]]);
        } else if (evoList.length > 1) {
            let evoInJSON = evoList.find(item => item.name.includes(currForm.toUpperCase()));
            if (evoInJSON) {
                let evoInAPI = data.find(item => parseInt(item.species.url.split("/")[6]) === evoInJSON.id);
                if (evoInJSON.evo_list.length !== evoInAPI.evolves_to.length) {
                    let tempData =[]
                    if (evoInAPI.evolves_to.length > 0) {
                        evoInJSON.evo_list.forEach(item => {
                            evoInAPI.evolves_to.forEach(value => {
                                if (parseInt(value.species.url.split("/")[6]) === item.evo_to_id) return tempData.push(value);
                            });
                        });
                    } else {
                        evoInJSON.evo_list.forEach(item => {
                            const pokemonToEvo = evoData.find(e => e.id === item.evo_to_id && e.form === item.evo_to_form);
                            tempData.push({...evoInAPI,
                                species: {
                                    name: pokemonToEvo.name.toLowerCase(),
                                    url: `https://pokeapi.co/api/v2/pokemon-species/${pokemonToEvo.id}/`
                                }
                            })
                        });
                    }
                    data = [evoInAPI].map(item => ({...item, evolves_to: tempData}));
                }
            }
        } else {
            let evoInJSON = evoList.find(item => item.name.includes(currForm.toUpperCase()));
            if (!evoInJSON && ["Alola", "Galar"].includes(region)) evoInJSON = evoList.find(item => item.name.includes(""))
            if (evoInJSON) {
                let evoInAPI = data.find(item => parseInt(item.species.url.split("/")[6]) === evoInJSON.id);
                if (evoInJSON.evo_list.length !== evoInAPI.evolves_to.length) {
                    let tempArr = [];
                    evoInJSON.evo_list.forEach(value =>
                        data.forEach(item => {
                            item.evolves_to.forEach(i => {
                                if (["kubfu", "rockruff"].includes(forme.name) || value.evo_to_form.toLowerCase().replaceAll("_", "-") === currForm) tempArr.push({...i, form: value.evo_to_form.toLowerCase().replaceAll("_", "-")});
                            });
                        })
                    );
                    data = [evoInAPI].map(item => ({...item, evolves_to: tempArr}));
                }
            }
        }
        setArrEvoList(oldArr => [...oldArr, data.map(item => {
            return {name: item.species.name, id: parseInt(item.species.url.split("/")[6]), baby: item.is_baby, form: item.form ?? null}
        })]);
        return data.map(item => getEvoChain(item.evolves_to))
    }, [formDefault, forme, region, id]);

    const formatEvoChain = (pokemon) => {
        return {
            name: pokemon.baseSpecies ? pokemon.baseSpecies.toLowerCase() : pokemon.name.toLowerCase(),
            id: pokemon.num, baby: pokemon.isBaby, form: pokemon.forme ?? "", gmax: false,
            sprite: pokemon.name.toLowerCase().replace("%", "")
        }
    }

    const getPrevEvoChainJSON = useCallback((name, arr) => {
        if (!name) return;
        const pokemon = Object.values(pokemonData).find(pokemon => pokemon.name === name);
        arr.unshift([formatEvoChain(pokemon)]);
        return getPrevEvoChainJSON(pokemon.prevo, arr);
    }, []);

    const getCurrEvoChainJSON = useCallback((prev, arr) => {
        let evo = []
        prev.evos.forEach(name => {
            const pokemon = Object.values(pokemonData).find(pokemon => pokemon.name === name);
            evo.push(formatEvoChain(pokemon));
        });
        arr.push(evo);
    }, []);

    const getNextEvoChainJSON = useCallback((evos, arr) => {
        if (evos.length === 0) return;
        arr.push(evos.map(name => {
            const pokemon = Object.values(pokemonData).find(pokemon => pokemon.name === name);
            return formatEvoChain(pokemon);
        }));
        evos.forEach(name => {
            const pokemon = Object.values(pokemonData).find(pokemon => pokemon.name === name);
            getNextEvoChainJSON(pokemon.evos, arr)
        });
    }, []);

    const getEvoChainJSON = useCallback((id, forme) => {
        let form = forme.form_name === "" || forme.form_name.includes("mega") ? null : forme.form_name;
        if (forme.form_name === "10") form += "%";
        if (forme.name === "necrozma-dawn") form += "-wings";
        else if (forme.name === "necrozma-dusk") form += "-mane";
        let pokemon = Object.values(pokemonData).find(pokemon => pokemon.num === id && (pokemon.forme ? pokemon.forme.toLowerCase() : pokemon.forme) === form);
        if (!pokemon) pokemon = Object.values(pokemonData).find(pokemon => pokemon.num === id && pokemon.forme === null);
        let prevEvo = [], curr = [], evo = [];
        getPrevEvoChainJSON(pokemon.prevo, prevEvo);
        const prev = Object.values(pokemonData).find(p => p.name === pokemon.prevo);
        if (prev) getCurrEvoChainJSON(prev, curr);
        else curr.push([formatEvoChain(pokemon)]);
        getNextEvoChainJSON(pokemon.evos, evo);
        const result = prevEvo.concat(curr).concat(evo);

        return setArrEvoList(result);
    }, [getPrevEvoChainJSON, getCurrEvoChainJSON, getNextEvoChainJSON]);

    const getGmaxChain = useCallback((id, form) => {
        return setArrEvoList([
            [{name: form.name.replace("-gmax", ""), id: id, baby: false, form: 'normal', gmax: true, sprite: form.name.replace("-gmax", "").replace("-single-strike", "")}],
            [{name: form.name.replace("-gmax", ""), id: id, baby: false, form: 'gmax', gmax: true, sprite: form.name.replace("-gmax", "-gigantamax").replace("-single-strike", "")}]
        ]);
    }, []);

    useEffect(() => {
        // const fetchEvolution = async () => {
        //     const data = (await APIService.getFetchUrl(evolution_url)).data;
        //     setArrEvoList([]);
        //     if (forme.form_name !== "gmax") getEvoChain([data.chain]);
        //     else getGmaxChain(id, forme);
        // }

        const fetchEvolutionJSON = () => {
            if (forme.form_name !== "gmax") getEvoChainJSON(id, forme);
            else getGmaxChain(id, forme);
        }
        if (id && forme && gen) fetchEvolutionJSON();
    }, [forme, id, gen, getGmaxChain, getEvoChainJSON]);

    const handlePokeID = (id) => {
        if (id !== id.toString()) onSetIDPoke(parseInt(id));
    };

    const getQuestEvo = (prevId, form) => {
        try {
            return evoData
            .find(item => item.evo_list
                .find(value => value.evo_to_form.includes(form) && value.evo_to_id === prevId))
                .evo_list
                .find(item => item.evo_to_form.includes(form) && item.evo_to_id === prevId)
        } catch (error) {
            try {
                return evoData
                .find(item => item.evo_list
                    .find(value => value.evo_to_id === prevId))
                    .evo_list
                    .find(item => item.evo_to_id === prevId)
            } catch (error) {
                return {
                    candyCost: 0,
                    quest: {}
                };
            }
        }
    }

    const renderImgGif = (value) => {
        return (
            <img className="pokemon-sprite" id="img-pokemon" alt="img-pokemon"
            src={APIService.getPokemonAsset("pokemon-animation", "all", value.sprite, "gif")}
            onError={(e) => {
                e.onerror=null;
                APIService.getFetchUrl(e.target.currentSrc)
                .then(() => {
                    e.target.src=APIService.getPokeSprite(value.id);
                })
                .catch(() => {
                    e.target.src=APIService.getPokeFullSprite(value.id);
                });
            }}/>
        )
    }

    const renderImageEvo = (value, chain, evo, index, evoCount) => {
        let form = value.form ?? forme.form_name;
        let offsetY = 35;
        offsetY += value.baby ? 20 : 0;
        offsetY += arrEvoList.length === 1 ? 20 : 0;

        let startAnchor = index > 0 ? {position: "bottom", offset: {y: offsetY}} : {position: "right", offset: {x: -8}};
        let data = getQuestEvo(parseInt(value.id), form.toUpperCase());
        return (
            <Fragment>
                <span id={"evo-"+evo+"-"+index}>
                    {evo > 0 &&
                    <Xarrow
                    labels={{end:
                        (<div className="position-absolute" style={{left: -40}}>
                            {!value.gmax && <span className="d-flex align-items-center caption" style={{width: 'max-content'}}>
                                <div className="bg-poke-candy" style={{backgroundColor: computeCandyBgColor(value.id)}}>
                                    <div className="poke-candy" style={{background: computeCandyColor(value.id), width: 20, height: 20}}></div>
                                </div>
                                <span style={{marginLeft: 2}}>{`x${data.candyCost}`}</span>
                            </span>}
                            {Object.keys(data.quest).length > 0 &&
                                <Fragment>
                                    {data.quest.randomEvolution && <span className="caption"><QuestionMarkIcon fontSize="small"/></span>}
                                    {data.quest.genderRequirement && <span className="caption">
                                    {form === "male" ?
                                    <MaleIcon fontSize="small" />
                                    :
                                    <Fragment>{form === "female" ?
                                        <FemaleIcon fontSize="small" />
                                        :
                                        <Fragment>{data.quest.genderRequirement === "MALE" ? <MaleIcon fontSize="small" /> : <FemaleIcon fontSize="small" />}</Fragment>
                                    }</Fragment>}
                                    </span>}
                                    {data.quest.kmBuddyDistanceRequirement && <span className="caption">
                                        {data.quest.mustBeBuddy ?
                                        <div className="d-flex align-items-end"><DirectionsWalkIcon fontSize="small"/><PetsIcon sx={{fontSize: '1rem'}} /></div> :
                                        <DirectionsWalkIcon fontSize="small"/>} {`${data.quest.kmBuddyDistanceRequirement}km`}
                                    </span>}
                                    {data.quest.onlyDaytime && <span className="caption"><WbSunnyIcon fontSize="small" /></span>}
                                    {data.quest.onlyNighttime && <span className="caption"><DarkModeIcon fontSize="small" /></span>}
                                    {data.quest.evolutionItemRequirement && <img alt='img-item-required' height={20} src={APIService.getItemEvo(data.quest.evolutionItemRequirement)}/>}
                                    {data.quest.lureItemRequirement && <img alt='img-troy-required' height={20} src={APIService.getItemTroy(data.quest.lureItemRequirement)}/>}
                                    {data.quest.onlyUpsideDown && <span className="caption"><SecurityUpdateIcon fontSize="small" /></span>}
                                    {data.quest.condition && <span className="caption">
                                        {data.quest.condition.desc === "THROW_TYPE" &&
                                        <Fragment>
                                            <CallMadeIcon fontSize="small" />
                                            <span>{`${capitalize(data.quest.condition.throwType.toLowerCase())} x${data.quest.goal}`}</span>
                                        </Fragment>
                                        }
                                        {data.quest.condition.desc === "POKEMON_TYPE" &&
                                        <div className="d-flex align-items-center" style={{marginTop: 5}}>
                                            {data.quest.condition.pokemonType.map((value, index) => (
                                                <img key={index} alt='img-stardust' height={20} src={APIService.getTypeSprite(value)}
                                                onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeSprite(0)}}/>
                                            ))}
                                            <span style={{marginLeft: 2}}>{`x${data.quest.goal}`}</span>
                                        </div>
                                        }
                                        {data.quest.condition.desc === "WIN_RAID_STATUS" &&
                                        <Fragment>
                                            <SportsMartialArtsIcon fontSize="small" />
                                            <span>{`x${data.quest.goal}`}</span>
                                        </Fragment>
                                        }
                                    </span>}
                                    {data.quest.type && data.quest.type === "BUDDY_EARN_AFFECTION_POINTS" && <span className="caption">
                                        <Fragment>
                                            <FavoriteIcon fontSize="small" sx={{color:'red'}}/>
                                            <span>{`x${data.quest.goal}`}</span>
                                        </Fragment>
                                    </span>}
                                    {data.quest.type && data.quest.type === "BUDDY_FEED" && <span className="caption">
                                        <Fragment>
                                            <RestaurantIcon fontSize="small"/>
                                            <span>{`x${data.quest.goal}`}</span>
                                        </Fragment>
                                    </span>}
                                </Fragment>
                            }
                        </div>)
                    }}
                    strokeWidth={2} path="grid" startAnchor={startAnchor} endAnchor={{position: "left", offset: {x: 8}}}
                    start={`evo-${evo-1}-${chain.length > 1 ? 0 : index}`} end={`evo-${evo}-${chain.length > 1 ? index : 0}`} />}
                    {evoCount > 1 ?
                    <Fragment>
                    {(chain.length > 1) || (chain.length === 1 && form.form_name !== "") ?
                        <Fragment>
                        {form !== "" && !form.includes("mega") ?
                        <ThemeProvider theme={theme}>
                            <Badge color="neutral" overlap="circular" badgeContent={splitAndCapitalize(form, "-", " ")} anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}>
                                <Badge color="primary" overlap="circular" badgeContent={evo+1} sx={{width: 96}}>
                                    {renderImgGif(value)}
                                </Badge>
                            </Badge>
                        </ThemeProvider>
                        :
                        <Badge color="primary" overlap="circular" badgeContent={evo+1} sx={{width: 96}}>
                            {renderImgGif(value)}
                        </Badge>
                        }
                        </Fragment>
                        :
                        <Badge color="primary" overlap="circular" badgeContent={evo+1} sx={{width: 96}}>
                            {renderImgGif(value)}
                        </Badge>
                    }
                    </Fragment>
                    :
                    <Fragment>
                        {renderImgGif(value)}
                    </Fragment>
                    }
                    <div id="id-pokemon" style={{color: 'black'}}><b>#{value.id}</b></div>
                    <div><b className="link-title">{splitAndCapitalize(value.name, "-", " ")}</b></div>
                </span>
                {value.baby && <span className="caption text-danger">(Baby)</span>}
                {arrEvoList.length === 1 && <span className="caption text-danger">(No Evolution)</span>}
                <p>{value.id === id && <span className="caption">Current</span>}</p>
            </Fragment>
        )
    }

    return (
        <Fragment>
            <h4 className="title-evo"><b>Evolution Chain</b>
            <OverlayTrigger
                    placement='auto'
                    overlay={<PopoverConfig id="popover-info-evo">
                        <span className="info-evo">
                            <span className="d-block caption">- <img alt='img-stardust' height={20} src={APIService.getItemSprite("Item_1301")}/> : Candy of pokemon.</span>
                            <span className="d-block caption">- <QuestionMarkIcon fontSize="small"/> : Random evolution.</span>
                            <span className="d-block caption">- <MaleIcon fontSize="small" />/<FemaleIcon fontSize="small" /> : Only once gender can evolution.</span>
                            <span className="d-block caption">- <DirectionsWalkIcon fontSize="small"/><PetsIcon sx={{fontSize: '1rem'}} /> : Walk together with buddy.</span>
                            <span className="d-block caption">- <DirectionsWalkIcon fontSize="small"/> : Buddy walk with trainer.</span>
                            <span className="d-block caption">- <WbSunnyIcon fontSize="small" /> : Evolution during at day.</span>
                            <span className="d-block caption">- <DarkModeIcon fontSize="small" /> : Evolution during at night.</span>
                            <span className="d-block caption">- <img alt='img-troy-required' height={20} src={APIService.getItemTroy("")}/> : Evolution in lure module.</span>
                            <span className="d-block caption">- <SecurityUpdateIcon fontSize="small" /> : Evolution at upside down phone.</span>
                            <span className="d-block caption">- <CallMadeIcon fontSize="small" /> : Throw pokeball with condition.</span>
                            <span className="d-block caption">- <img alt='img-stardust' height={20} src={APIService.getPokeSprite(0)}/> : Catch pokemon with type.</span>
                            <span className="d-block caption">- <SportsMartialArtsIcon fontSize="small" /> : Win raid.</span>
                            <span className="d-block caption">- <FavoriteIcon fontSize="small" sx={{color:'red'}}/> : Evolution with affection points.</span>
                            <span className="d-block caption">- <RestaurantIcon fontSize="small"/> : Buddy feed.</span>
                        </span>
                    </PopoverConfig>}>
                <span className="tooltips-info">
                    <InfoOutlinedIcon color="primary"/>
                </span>
            </OverlayTrigger>
            </h4>
            <div className="evo-container scroll-evolution">
                <ul className="ul-evo d-inline-flex" style={{columnGap: arrEvoList.length > 0 ? window.innerWidth/(6.5*arrEvoList.length) : 0}}>
                    {arrEvoList.map((values, evo) => (
                        <li key={evo} className='img-form-gender-group li-evo' >
                            <ul className="ul-evo d-flex flex-column">
                                {values.map((value, index) => (
                                    <li key={index} className='img-form-gender-group img-evo-group li-evo'>
                                        {onSetIDPoke ?
                                        <div className="select-evo" onClick={() => {handlePokeID(value.id)}} title={`#${value.id} ${splitAndCapitalize(value.name, "-", " ")}`}>
                                            {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                                        </div>
                                        :
                                        <Link className="select-evo" to={"/pokemon/"+value.id} onClick={() => {handlePokeID(value.id)}} title={`#${value.id} ${splitAndCapitalize(value.name, "-", " ")}`}>
                                            {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                                        </Link>
                                        }
                                    </li>
                                ))
                                }
                            </ul>
                        </li>
                    ))
                    }
                </ul>
            </div>
        </Fragment>
    )
}

export default Evolution;