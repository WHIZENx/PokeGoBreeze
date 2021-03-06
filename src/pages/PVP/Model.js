import { Fragment } from "react"
import { Link } from "react-router-dom";
import TypeEffectiveSelect from "../../components/Effective/TypeEffectiveSelect";
import Stats from "../../components/Info/Stats/Stats";
import Hexagon from "../../components/Sprites/Hexagon/Hexagon";
import IVbar from "../../components/Sprites/IVBar/IVBar";
import Type from "../../components/Sprites/Type/Type";
import APIService from "../../services/API.service";
import { calculateCP, calStatsProd } from "../../util/Calculate";
import { computeBgType, computeCandyBgColor, computeCandyColor, findAssetForm } from "../../util/Compute";
import { convertNameRankingToForm, convertNameRankingToOri, splitAndCapitalize } from "../../util/Utils";

import CircleIcon from '@mui/icons-material/Circle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import StairsIcon from '@mui/icons-material/Stairs';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BoltIcon from '@mui/icons-material/Bolt';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import SpokeIcon from '@mui/icons-material/Spoke';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import PersonIcon from '@mui/icons-material/Person';

export const Keys = (pokemonData, data, cp, type) => {

    const renderItemList = (data, bgtype) => {
        const name = convertNameRankingToOri(data.opponent, convertNameRankingToForm(data.opponent));
        const pokemon = pokemonData.find(pokemon => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(pokemon.num, pokemon.name);

        return (
            <Link to={`/pvp/${cp}/${type}/${data.opponent.replaceAll("_", "-")}`} target="_blank" className="list-item-ranking" style={{backgroundImage: computeBgType(pokemon.types, data.opponent.includes("_shadow"))}}>
                <div className="container d-flex align-items-center" style={{columnGap: 10}}>
                    <div className="d-flex justify-content-center">
                        <span className="d-inline-block position-relative filter-shadow" style={{width: 50}}>
                            {data.opponent.includes("_shadow") && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                            <img alt='img-league' className="pokemon-sprite-accordion" src={ form ? APIService.getPokemonModel(form) :APIService.getPokeFullSprite(id)}/>
                        </span>
                    </div>
                    <div>
                        <b className='text-white text-shadow'>#{id} {splitAndCapitalize(name, "-", " ")}</b>
                        <Type shadow={true} hideText={true} height={20} arr={pokemon.types} />
                    </div>
                </div>
                <div style={{marginRight: 15}}>
                    <span className="ranking-score score-ic text-white text-shadow filter-shadow" style={{backgroundColor: bgtype === 0 ? 'lightgreen' : 'lightcoral'}}>{data.rating}</span>
                </div>
            </Link>
        )
    }

    return (
        <div className="row" style={{margin: 0}}>
            <div className="col-lg-6 element-top" style={{padding: 0}}>
                <div className="title-item-ranking">
                    <h4 className='text-white text-shadow'>Best Matchups</h4>
                    <div style={{marginRight: 15}}>
                        <span className="ranking-score score-ic">Rating</span>
                    </div>
                </div>
                {data.matchups.sort((a,b) => b.rating-a.rating).map((matchup, index) => (
                    <Fragment key={index}>{renderItemList(matchup, 1)}</Fragment>
                ))}
            </div>
            <div className="col-lg-6 element-top" style={{padding: 0}}>
                <div className="title-item-ranking">
                    <h4 className='text-white text-shadow'>Best Counters</h4>
                    <div style={{marginRight: 15}}>
                        <span className="ranking-score score-ic">Rating</span>
                    </div>
                </div>
                {data.counters.sort((a,b) => a.rating-b.rating).map((counter, index) => (
                    <Fragment key={index}>{renderItemList(counter, 0)}</Fragment>
                ))}
            </div>
        </div>
    )
}

export const OverAllStats = (data, statsRanking, cp) => {

    const calculateStatsTopRank = (stats) => {
        const maxCP = parseInt(cp);

        if (maxCP === 10000) {
            const cp = calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 50);
            const buddyCP = calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 51);
            return {
                "50": {cp: cp},
                "51": {cp: buddyCP},
            };
        } else {
            const minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
            const allStats = calStatsProd(stats.atk, stats.def, stats.sta, minCP, maxCP);
            return allStats[allStats.length-1];
        }
    }

    const renderTopStats = (stats, id) => {
        const maxCP = parseInt(cp);
        const currStats = calculateStatsTopRank(stats);
        return (
            <ul className='element-top'>
                <li className='element-top'>
                    CP: <b>{maxCP === 10000 ? `${currStats["50"].cp}-${currStats["51"].cp}` : `${currStats.CP}`}</b>
                </li>
                <li className={currStats.level <= 40 ? 'element-top' : ''}>
                    Level: <b>{maxCP === 10000 ? "50-51" : `${currStats.level}`} </b>
                    {(currStats.level > 40 || maxCP === 10000) &&
                    <b>
                    (
                        <div className="position-relative d-inline-block filter-shadow">
                            <div className="bg-poke-xl-candy" style={{background: computeCandyBgColor(id), width: 30, height: 30}}></div>
                            <div className="poke-xl-candy" style={{background: computeCandyColor(id), width: 30, height: 30}}></div>
                        </div>
                        XL Candy required)</b>
                    }
                </li>
                <li className='element-top'>
                    <IVbar title="Attack" iv={maxCP === 10000 ? 15 : currStats.IV.atk} style={{maxWidth: 500}}/>
                    <IVbar title="Defense" iv={maxCP === 10000 ? 15 : currStats.IV.def} style={{maxWidth: 500}}/>
                    <IVbar title="HP" iv={maxCP === 10000 ? 15 : currStats.IV.sta} style={{maxWidth: 500}}/>
                </li>
            </ul>
        )
    }

    return (
        <div className="row w-100" style={{margin: 0}}>
            {data.scores && <div className="col-lg-4 d-flex justify-content-center" style={{padding: 10}}>
                <div>
                    <h5><b>Overall Performance</b></h5>
                    <Hexagon animation={0} borderSize={320} size={180}
                    stats={{
                        lead: data.scores[0],
                        atk: data.scores[4],
                        cons: data.scores[5],
                        closer: data.scores[1],
                        charger: data.scores[3],
                        switching: data.scores[2]
                    }}/>
                </div>
            </div>}
            <div className={(data.scores ? "col-lg-8 ":"")+"container status-ranking"}>
                <div>
                    <h5><b>Overall Stats</b></h5>
                    <Stats statATK={data.atk}
                        statDEF={data.def}
                        statSTA={data.sta}
                        pokemonStats={statsRanking.current}/>
                </div>
                <div>
                    <h5><b>Top Rank League</b></h5>
                    {renderTopStats(data.stats, data.id)}
                </div>
            </div>
        </div>
    )
}

export const TypeEffective = (types) => {

    return (
        <div className='row text-white'>
            <div className='col-lg-4' style={{marginBottom: 15}}>
                <div className='h-100'>
                    <h6 className='d-flex justify-content-center weakness-bg-text'><b>Weakness</b></h6>
                    <hr className='w-100'/>
                    {<TypeEffectiveSelect effect={0} types={types}/>}
                </div>
                <hr className='w-100' style={{margin: 0}}/>
            </div>
            <div className='col-lg-4' style={{marginBottom: 15}}>
                <div className='h-100'>
                    <h6 className='d-flex justify-content-center neutral-bg-text'><b>Neutral</b></h6>
                    <hr className='w-100'/>
                    {<TypeEffectiveSelect effect={1} types={types}/>}
                </div>
                <hr className='w-100' style={{margin: 0}}/>
            </div>
            <div className='col-lg-4' style={{marginBottom: 15}}>
                <div className='h-100'>
                    <h6 className='d-flex justify-content-center resistance-bg-text'><b>Resistance</b></h6>
                    <hr className='w-100'/>
                    {<TypeEffectiveSelect effect={2} types={types}/>}
                </div>
                <hr className='w-100' style={{margin: 0}}/>
            </div>
        </div>
    )
}

export const MoveSet = (moves, combatList, combatData) => {

    const findArchetype = (archetype) => {
        return (
            ["General", "Nuke", "Spam/Bait", "High Energy", "Low Quality", "Debuff", "Boost", "Fast Charge", "Heavy Damage", "Multipurpose", "Self-Debuff"].map((value, index) => (
                <Fragment key={index}>
                    {archetype.includes(value) && !(archetype.includes("Self-Debuff") && value === "Debuff") &&
                    <div className="filter-shadow" title={value} key={index}>
                        {value === "General" && <CircleIcon/>}
                        {value === "Nuke" && <RocketLaunchIcon sx={{color: 'gray'}} />}
                        {value === "Spam/Bait" && <BakeryDiningIcon sx={{color: 'pink'}}/>}
                        {value === "High Energy" && <EnergySavingsLeafIcon sx={{color: 'orange'}}/>}
                        {value === "Low Quality" && <StairsIcon sx={{color: 'lightgray'}}/>}
                        {value === "Debuff" && <ArrowDownwardIcon sx={{color: 'lightcoral'}}/>}
                        {value === "Boost" && <ArrowUpwardIcon sx={{color: 'lightgreen'}}/>}
                        {value === "Fast Charge" && <BoltIcon sx={{color: '#f8d030'}}/>}
                        {value === "Heavy Damage" && <BrokenImageIcon sx={{color: 'brown'}}/>}
                        {value === "Multipurpose" && <SpokeIcon sx={{color: 'lightskyblue'}}/>}
                        {value === "Self-Debuff" &&
                        <div className="position-relative">
                            <PersonIcon sx={{color: 'black'}}/>
                            <KeyboardDoubleArrowDownIcon fontSize="small" className="position-absolute" sx={{color: 'red', left: '50%', bottom: 0}}/>
                        </div>
                        }
                    </div>
                    }
                </Fragment>
            ))
        )
    }

    const findMove = (name, uses) => {
        const oldName = name;
        if (name.includes("HIDDEN_POWER")) name = "HIDDEN_POWER";
        let move = combatData.find(move => move.name === name);
        if (oldName.includes("HIDDEN_POWER")) move = {...move, type: oldName.split("_")[2]};

        let elite = false;
        if (combatList.ELITE_QUICK_MOVES.includes(name)) elite = true;
        if (combatList.ELITE_CINEMATIC_MOVES.includes(name)) elite = true;

        return (
            <Link to={`/moves/${move.id}`} target="_blank" className={(move.type.toLowerCase())+' filter-shadow-hover text-white type-rank-item d-flex align-items-center justify-content-between'}>
                <div className='d-flex' style={{columnGap: 10}}>
                    <img className="filter-shadow" width={24} height={24} alt='img-pokemon' src={APIService.getTypeSprite(move.type)}/>
                    <span className='filter-shadow'>{splitAndCapitalize(oldName, "_", " ")} {elite && <b className="filter-shadow">*</b>}</span>
                </div>
                <div className="d-flex align-items-center" style={{columnGap: 10}}>
                    {move.archetype && findArchetype(move.archetype)}
                    <span className="ranking-score score-ic filter-shadow">{uses}</span>
                </div>
            </Link>
        )
    }

    return (
        <div className='row' style={{margin: 0}}>
            <div className='col-xl-6' style={{padding: 0, backgroundColor: 'lightgray'}}>
                <div className='moves-title'>Fast Moves</div>
                <div className='type-rank-list'>
                    {moves.fastMoves.map(move => {
                        if (!move.uses) move.uses = 0;
                        return move;
                    }).sort((a,b) => b.uses-a.uses).map((value, index) => (
                        <Fragment key={index}>{findMove(value.moveId, value.uses)}</Fragment>
                    ))}
                </div>
            </div>
            <div className='col-xl-6' style={{padding: 0, backgroundColor: 'lightgray'}}>
                <div className='moves-title'>Charged Moves</div>
                <div className='type-rank-list'>
                    {moves.chargedMoves.map(move => {
                        if (move.moveId === "FUTURE_SIGHT") move.moveId = "FUTURESIGHT";
                        if (move.moveId === "TECHNO_BLAST_DOUSE") move.moveId = "TECHNO_BLAST_WATER";
                        if (!move.uses) move.uses = 0;
                        return move;
                    }).sort((a,b) => b.uses-a.uses).map((value, index) => (
                        <Fragment key={index}>{findMove(value.moveId, value.uses)}</Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}