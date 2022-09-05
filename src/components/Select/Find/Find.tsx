import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { sortStatsPokemon } from "../../../util/Calculate";
import APIService from "../../../services/API.service";
import Tools from "./Tools";

import pokemonData from '../../../data/pokemon.json';
import pokeListName from '../../../data/pokemon_names.json';
import { convertArrStats } from "../../../util/Utils";

const Find = (props: { setId: (arg0: number) => void; setName: (arg0: any) => void; clearStats: () => void; setStatATK: (arg0: any) => void; setStatDEF: (arg0: any) => void; setStatSTA: (arg0: any) => void; hide: any; raid: any; setRaid: any; tier: any; setTier: any; setForm: any; setUrlEvo: any; title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; swap: any; }) => {

    const [startIndex, setStartIndex] = useState(0);
    const firstInit = 20;
    const eachCounter = 10;
    const cardHeight = 65;

    const initialize = useRef(false);
    const [dataPri, setDataPri]: any = useState(null);
    const stats = useRef(sortStatsPokemon(convertArrStats(pokemonData)));

    const [id, setId] = useState(1);

    const [pokemonList, setPokemonList] = useState([]);
    const pokeList: any = useMemo(() => {return []}, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    useEffect(() => {
        if (!initialize.current) {
            setDataPri(pokemonData);
            initialize.current = true
        }
        if (pokeList.length === 0) {
            pokeList.push(...Object.values(pokeListName).filter((item: any) => item.id > 0).map((item: any) => { return {id: item.id, name: item.name, sprites: APIService.getPokeSprite(item.id)}}));
            setPokemonList(pokeList);
        }

        const results = pokemonList.filter((item: any) => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm));
        setPokemonListFilter(results);
    }, [pokeList, pokemonList, searchTerm]);

    const listenScrollEvent = (ele: { currentTarget: { scrollTop: any; offsetHeight: any; }; }) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop*1.1 >= fullHeight*(startIndex+1)) setStartIndex(startIndex+1);
    }

    const getInfoPoke = (value: any) => {
        setId(value.id);
        if (props.setId) props.setId(value.id);
        if (props.setName) props.setName((pokeList as any).find((item: any) => item.id === value.id)?.name);
        if (props.clearStats) props.clearStats();
    };

    const handleSetStats = (type: string, value: any) => {
        if (type === "atk" && props.setStatATK) props.setStatATK(value)
        else if (type === "def" && props.setStatDEF) props.setStatDEF(value)
        else if (type === "sta" && props.setStatSTA) props.setStatSTA(value)
    }

    const decId = () => {
        setTimeout(() => {
            setId(id-1);
            if (props.setId) props.setId(id-1);
            if (props.setName) props.setName((pokeList as any).find((item: any) => item.id === id-1)?.name);
            if (props.clearStats) props.clearStats();
        }, 300);
        props.clearStats();
    }

    const incId = () => {
        setTimeout(() => {
            setId(id+1);
            if (props.setId) props.setId(id+1);
            if (props.setName) props.setName((pokeList as any).find((item: any) => item.id === id+1)?.name);
            if (props.clearStats) props.clearStats();
        }, 300);
        props.clearStats();
    }

    const searchPokemon = () => {
        return (
            <div className="col d-flex justify-content-center" style={{height: Math.min(eachCounter, pokemonListFilter.slice(0, firstInit + eachCounter*startIndex).length+1)*cardHeight, maxHeight: eachCounter*cardHeight}}>
                <div className="btn-group-search">
                    <input type="text" className="form-control" aria-label="search" aria-describedby="input-search" placeholder="Enter Name or ID"
                    value={searchTerm} onInput={(e: any) => setSearchTerm(e.target.value)}/>
                </div>
                <div className="result tools" onScroll={listenScrollEvent.bind(this)}>
                    <Fragment>
                        {pokemonListFilter.slice(0, firstInit + eachCounter*startIndex).map((value: any, index) => (
                            <div className={"container card-pokemon "+(value.id===id ? "selected": "")} key={ index } onMouseDown={() => getInfoPoke(value)}>
                                <b>#{value.id}</b>
                                <img width={36} height={36} className='img-search' alt='img-pokemon' src={value.sprites}
                                onError={(e: any) => {
                                    e.onerror=null;
                                    APIService.getFetchUrl(e.target.currentSrc)
                                    .then(() => {
                                        e.target.src=APIService.getPokeSprite(0);
                                    })
                                    .catch(() => {
                                        e.target.src=APIService.getPokeIconSprite("unknown-pokemon");
                                    });
                                }}/>
                                {value.name}
                            </div>
                        ))}
                    </Fragment>
                </div>
            </div>
        )
    }

    const showPokemon = () => {
        return (
            <div className="col d-flex justify-content-center text-center">
                <div>
                { pokeList.length > 0 && dataPri && stats.current &&
                    <Fragment>
                        <Tools hide={props.hide} raid={props.raid} setRaid={props.setRaid} tier={props.tier} setTier={props.setTier} setForm={props.setForm} count={pokeList.length} id={id} name={pokeList.find((item: any) => item.id === id).name} data={dataPri} stats={stats.current} onHandleSetStats={handleSetStats} onClearStats={props.clearStats} onSetPrev={decId} onSetNext={incId} setUrlEvo={props.setUrlEvo}/>
                    </Fragment>
                }
                </div>
            </div>
        )
    }

    return (
        <div className="container element-top">
            <h1 id ="main" className='text-center' style={{marginBottom: 15}}>{props.title ? props.title : "Pokémon GO Tools"}</h1>
            <div className="row search-container">
            {props.swap ?
                <Fragment>
                    {showPokemon()}
                    {searchPokemon()}
                </Fragment>
            :
                <Fragment>
                    {searchPokemon()}
                    {showPokemon()}
                </Fragment>
            }
            </div>
        </div>
    )
}

export default Find;