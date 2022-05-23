import { useCallback, useEffect, useState } from "react";
import Find from "../Find";

import { Box, Slider, styled } from "@mui/material";
import evoData from "../../../data/evolution_pokemon_go.json";
import pokeImageList from '../../../data/assets_pokemon_go.json';

import './FineBattle.css';
import APIService from "../../../services/API.service";
import { queryStatesEvoChain, splitAndCapitalize } from "../../../components/Calculate/Calculate";

const marks = [...Array(16).keys()].map(n => {return {value: n, label: n.toString()}});

const PokeGoSlider = styled(Slider)(() => ({
    color: '#ee9219',
    height: 18,
    padding: '13px 0',
    '& .MuiSlider-thumb': {
      height: 18,
      width: 18,
      backgroundColor: '#ee9219',
      '&:hover, &.Mui-focusVisible, &.Mui-active': {
        boxShadow: 'none',
      },
      '&:before': {
        boxShadow: 'none',
      },
      '& .airbnb-bar': {
        height: 12,
        width: 1,
        backgroundColor: 'currentColor',
        marginLeft: 1,
        marginRight: 1,
      },
    },
    '& .MuiSlider-track': {
      height: 18,
      border: 'none',
      borderTopRightRadius: '1px',
      borderBottomRightRadius: '1px',
    },
    '& .MuiSlider-rail': {
      color: 'lightgray',
      opacity: 0.5,
      height: 18,
    },
    '& .MuiSlider-valueLabel': {
        lineHeight: 1.2,
        fontSize: 12,
        background: 'unset',
        padding: 0,
        width: 32,
        height: 32,
        borderRadius: '50% 50% 50% 0',
        backgroundColor: '#ee9219',
        transformOrigin: 'bottom left',
        transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
        '&:before': { display: 'none' },
        '&.MuiSlider-valueLabelOpen': {
          transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
        },
        '& > *': {
          transform: 'rotate(45deg)',
        },
    },
    '& .MuiSlider-mark': {
        backgroundColor: '#bfbfbf',
        height: 13,
        width: 1,
        '&.MuiSlider-markActive': {
          opacity: 1,
          backgroundColor: '#fff',
          height: 13
        },
    },
}));

const FindBattle = () => {

    const [id, setId] = useState(1);
    const [name, setName] = useState('Bulbasaur');

    const [searchCP, setSearchCP] = useState('');

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [ATKIv, setATKIv] = useState(0);
    const [DEFIv, setDEFIv] = useState(0);
    const [STAIv, setSTAIv] = useState(0);

    const [evoChain, setEvoChain] = useState([]);

    const clearArrStats = () => {
        setSearchCP('');
    }

    const currEvoChain = useCallback((currId, arr) => {
        if (currId.length === 0) return arr;
        let curr = evoData.find(item => currId.includes(item.id));
        if (!arr.map(i => i.id).includes(curr.id)) arr.push(curr);
        return currEvoChain(curr.evo_list.map(i => i.evo_to_id), arr)
    }, []);

    const prevEvoChain = useCallback((obj, arr) => {
        if (!arr.map(i => i.id).includes(obj.id)) arr.push(obj);
        obj.evo_list.forEach(i => {
            currEvoChain([i.evo_to_id], arr)
        });
        let curr = evoData.filter(item => item.evo_list.find(i => obj.id === i.evo_to_id));
        if (curr.length === 0) return arr
        else if (curr.length === 1) return prevEvoChain(curr[0], arr)
        else return curr.map(item => prevEvoChain(item, arr));
    }, [currEvoChain]);

    const getEvoChain = useCallback((id) => {
        setEvoChain([]);
        let curr = evoData.filter(item => item.evo_list.find(i => id === i.evo_to_id));
        if (curr.length === 0) curr = evoData.filter(item => id === item.id);
        return curr.map(item => prevEvoChain(item, []));
    }, [prevEvoChain]);

    const searchStatsPoke = useCallback(() => {
        let arr = []
        let data = getEvoChain(id);
        data.forEach(item => {
            let tempArr = []
            item.forEach(value => {
                tempArr.push(queryStatesEvoChain(id, value, searchCP, ATKIv, DEFIv, STAIv))
            });
            arr.push(tempArr);
        });
    }, [searchCP, ATKIv, DEFIv, STAIv, getEvoChain, id]);

    const onSearchStatsPoke = useCallback((e) => {
        e.preventDefault();
        searchStatsPoke();
    }, [searchStatsPoke]);

    useEffect(() => {
        console.log(name,statATK,statDEF,statSTA);
    }, [name,statATK,statDEF,statSTA]);

    const getImageList = (id, name) => {
        let img = pokeImageList.find(item => item.id === id).image.find(item => name.includes(item.form));
        if (!img) img = pokeImageList.find(item => item.id === id).image[0];
        return img.default;
    };

    return (
        <div className="container">
            <Find clearStats={clearArrStats} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setId={setId} setName={setName}/>
            <h1 id ="main" className='center'>Find Stats Battle</h1>
            <form className="element-top" onSubmit={onSearchStatsPoke.bind(this)}>
                <div className="form-group d-flex justify-content-center center">
                    <Box sx={{ width: '50%', minWidth: 350 }}>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">CP</span>
                            </div>
                        <input required value={searchCP} type="number" min={10} className="form-control" aria-label="cp" aria-describedby="input-cp" placeholder="Enter CP"
                        onInput={e => setSearchCP(e.target.value)}></input>
                        </div>
                    </Box>
                </div>
                <div className="form-group d-flex justify-content-center center">
                    <Box sx={{ width: '50%', minWidth: 300 }}>
                        <div className="d-flex justify-content-between">
                            <b>ATK</b>
                            <b>{ATKIv}</b>
                        </div>
                        <PokeGoSlider
                            value={ATKIv}
                            aria-label="ATK marks"
                            defaultValue={0}
                            min={0}
                            max={15}
                            step={1}
                            valueLabelDisplay="auto"
                            marks={marks}
                            onChange={(e,v) => setATKIv(v)}
                        />
                        <div className="d-flex justify-content-between">
                            <b>DEF</b>
                            <b>{DEFIv}</b>
                        </div>
                        <PokeGoSlider
                            value={DEFIv}
                            aria-label="DEF marks"
                            defaultValue={0}
                            min={0}
                            max={15}
                            step={1}
                            valueLabelDisplay="auto"
                            marks={marks}
                            onChange={(e,v) => setDEFIv(v)}
                        />
                        <div className="d-flex justify-content-between">
                            <b>STA</b>
                            <b>{STAIv}</b>
                        </div>
                        <PokeGoSlider
                            value={STAIv}
                            aria-label="STA marks"
                            defaultValue={0}
                            min={0}
                            max={15}
                            step={1}
                            valueLabelDisplay="auto"
                            marks={marks}
                            onChange={(e,v) => setSTAIv(v)}
                        />
                    </Box>
                </div>
                <div className="form-group d-flex justify-content-center center element-top">
                    <button type="submit" className="btn btn-primary">Search</button>
                </div>
            </form>
            <div className="center element-top">
            {evoChain.map((value, index) => (
                <div className="evo-content" key={index}>
                    {value.sort((a,b) => a.id - b.id).map((item, index) => (
                        <div className="d-inline-block evo-item-desc" key={index}>
                            <img alt='pokemon-model' height={100} src={APIService.getPokemonModel(getImageList(item.id, item.name))}></img>
                            <div><b>#{item.id} {splitAndCapitalize(item.name.toLowerCase(), "_", " ")}</b></div>
                        </div>
                    ))}
                </div>
            ))}
            </div>
        </div>
    )
}

export default FindBattle;