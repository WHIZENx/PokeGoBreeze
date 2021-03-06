import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell, tableCellClasses, styled } from '@mui/material';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Type from '../../components/Sprites/Type/Type';
import APIService from '../../services/API.service';

import { splitAndCapitalize } from '../../util/Utils';
import { calculateCP, calculateStatsByTag } from '../../util/Calculate';

import loading from '../../assets/loading.png';
import './Home.css'
import { Link } from 'react-router-dom';

import pokemonData from '../../data/pokemon.json';
import typesData from '../../data/type_effectiveness.json';

const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: 'rgb(64, 159, 241)',
      color: '#f1ffff',
      fontWeight: 'bolder',
      fontSize: 18,
      minWidth: 150,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

const StyledTableRow = styled(TableRow)(() => ({
    '& th': {
        backgroundColor: '#f1ffff',
        color: '#0571c2',
        fontWeight: 'bolder',
        minWidth: 350,
        paddingTop: 0,
        paddingBottom: 0,
    },
    '& td': {
        paddingTop: 0,
        paddingBottom: 0,
        '&:first-of-type': {
            width: 60,
            padding: 0,
        },
        '&:nth-of-type(2)': {
            minWidth: 140,
        },
        '&:nth-of-type(6), &:nth-of-type(7), &:nth-of-type(8)': {
            minWidth: 85,
            width: 85,
        },
        '&:nth-of-type(9)': {
            minWidth: 100,
            width: 85,
        },
    },
}));

const Home = () => {

    const types = Object.keys(typesData);

    const tableScrollID = useRef(1);

    const pokeList = useMemo(() => {return []}, []);
    const [dataList, setDataList] = useState([]);
    const dataListFilter = useRef(null);
    const [listOfPokemon, setListOfPokemon] = useState([]);

    const [selectTypes, setSelectTypes] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchMaxCP, setSearchMaxCP] = useState('');

    useEffect(() => {
        document.title = "Pokedex - Home";
    }, []);

    useEffect(() => {
        const fetchPokemon = async () => {
            if (pokeList.length === 0) {
                // const result = await Promise.all([...Array(startPokemon).keys()].map(async (n) => (await APIService.getPokeInfo(n+1)).data));
                // let result = Object.values((await APIService.getFetchUrl('https://itsjavi.com/pokemon-assets/assets/data/pokemon.json')).data);
                let result = Object.values(pokemonData);
                result = result.map(item => {
                    let stats = calculateStatsByTag(item.baseStats, item.forme);
                    return {
                        id: item.num,
                        name: item.name,
                        forme: item.forme,
                        types: item.types,
                        color: item.color.toLowerCase(),
                        sprite: item.sprite.toLowerCase(),
                        baseSpecies: item.baseSpecies,
                        baseStats: item.baseStats,
                        atk: stats.atk,
                        def: stats.def,
                        sta: stats.sta,
                        minCP: calculateCP(stats.atk, stats.def, stats.sta, 1),
                        maxCP_40: calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 40),
                        maxCP_50: calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 50),
                    }
                }).sort((a,b) => a.id-b.id);
                result.shift();
                pokeList.push(...result);
                setDataList(result);
            }
        }
        fetchPokemon();

        tableScrollID.current = 1;
        const result = dataList.filter(item => {
            const boolFilterType = item.types.map(item => selectTypes.includes(item)).filter(bool => bool === true).length === selectTypes.length;
            const boolFilterPoke =  searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm);
            const boolFilterCP =  searchMaxCP === '' || item.maxCP_40 <= searchMaxCP || item.maxCP_50 <= searchMaxCP;
            return boolFilterType && boolFilterPoke && boolFilterCP;
        })
        dataListFilter.current = result;
        setListOfPokemon(result.slice(0,20));

        const onScroll = e => {
            const scrollTop = e.target.documentElement.scrollTop;
            const fullHeight = e.target.documentElement.offsetHeight;
            const windowHeight = window.innerHeight;
            if (scrollTop+windowHeight >= fullHeight*0.6) {
                tableScrollID.current += 1
                setListOfPokemon(oldArr => [...oldArr, ...dataListFilter.current.slice(tableScrollID.current*10, tableScrollID.current*10+10)])
            }
          };
          window.addEventListener("scroll", onScroll);
          return () => window.removeEventListener("scroll", onScroll);
    }, [searchTerm, searchMaxCP, selectTypes, pokeList, dataList]);

    const listenScrollEvent = (ele) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop >= (fullHeight*tableScrollID.current)*0.8) {
            tableScrollID.current += 1
            setListOfPokemon(oldArr => [...oldArr, ...dataListFilter.current.slice(tableScrollID.current*10, tableScrollID.current*10+10)])
        }
    }

    const addTypeArr = (value) => {
        if (selectTypes.includes(value)) {
            return setSelectTypes([...selectTypes].filter(item => item !== value));
        }
        else setSelectTypes([...selectTypes].slice(0, 1));
        return setSelectTypes(oldArr => [...oldArr, value]);
    }

    const setTableHeight = () => {
        const headHight = document.documentElement.getElementsByClassName('head-filter')[0];
        const navbarHeight = document.documentElement.getElementsByClassName('navbar')[0];
        const fullHeight = window.innerHeight;
        if (headHight && navbarHeight) {
            if (headHight.clientHeight > fullHeight/2) return '100%'
            return fullHeight-headHight.clientHeight-navbarHeight.clientHeight-2
        }
    }

    return (
        <Fragment>
            <div className='head-filter border-types text-center w-100'>
                <div className='head-types'>Filter By Types (Maximum 2)</div>
                <div className='row w-100' style={{margin: 0}}>
                    {types.map((item, index) => (
                        <div key={index} className="col img-group" style={{margin: 0, padding: 0}}>
                            <button value={item} onClick={() => addTypeArr(item)} className={'btn-select-type w-100 border-types'+(selectTypes.includes(item) ? " select-type" : "")} style={{padding: 10}}>
                                <Type block={true} arr={[item]}/>
                            </button>
                        </div>
                    ))
                    }
                </div>
                <div className='row w-100' style={{margin: 0}}>
                    <div className='col border-input' style={{padding: 0}}>
                        <div className='head-types'>Search Name or ID</div>
                        <input type="text" className='w-100 form-control input-search' placeholder='Enter Name or ID'
                        value={searchTerm}
                        onInput={e => setSearchTerm(e.target.value)}/>
                    </div>
                    <div className='col border-input' style={{padding: 0}}>
                        <div className='head-types'>Maximum CP</div>
                        <input type="number" className='w-100 form-control input-search' placeholder='Enter Maximum CP'
                        value={searchMaxCP}
                        min={10}
                        onInput={e => {
                            if (e.target.value === '') setSearchMaxCP(e.target.value)
                            else setSearchMaxCP(parseInt(e.target.value))
                        }}/>
                    </div>
                </div>
            </div>
            <TableContainer sx={{height: setTableHeight()}} onScroll={listenScrollEvent.bind(this)}>
                <Table sx={{ border: '1px solid #b8d4da' }} aria-label="pokemon table" stickyHeader >
                    <TableHead>
                    <TableRow>
                        <StyledTableCell>Pok??mon Name</StyledTableCell>
                        <StyledTableCell align="center">Color</StyledTableCell>
                        <StyledTableCell align="center">Types</StyledTableCell>
                        <StyledTableCell align="center">Min CP</StyledTableCell>
                        <StyledTableCell align="center">
                            <div>Max CP</div>
                            <span className='text-danger' style={{fontSize: 12}}>LV. 40</span>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                            <div>Max CP</div>
                            <span className='text-danger' style={{fontSize: 12}}>LV. 50</span>
                        </StyledTableCell>
                        <StyledTableCell align="center" colSpan={3}>Base Stats</StyledTableCell>
                        <StyledTableCell align="center">Total Stats</StyledTableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {pokeList.length > 0 ?
                            <Fragment>
                                {listOfPokemon.length === 0 ?
                                <StyledTableRow>
                                    <StyledTableCell align="center" component="td" colSpan={7}>
                                        <div><span>No match pok??mon found</span></div>
                                    </StyledTableCell>
                                </StyledTableRow>
                                :
                                <Fragment>
                                {listOfPokemon.map((row, index) => (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell component="th" scope="row">
                                            <Link to={`/pokemon/${row.id}${row.forme ? `?form=${row.forme.toLowerCase()}`: ""}`} target="_blank">
                                            #{row.id} <img height={60} alt='img-pokemon'
                                            src={APIService.getPokeIconSprite(row.sprite, true)}
                                            onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(row.baseSpecies)}}/>
                                             {splitAndCapitalize(row.name, "-", " ")}
                                            </Link>
                                        </StyledTableCell>
                                        <StyledTableCell align="center" component="td">
                                            <div style={{width: '100%', height: '100%', backgroundColor: row.color}}>
                                        </div></StyledTableCell>
                                        <StyledTableCell align="center" component="td"><Type hideText={true} block={true} height={40} arr={row.types}/></StyledTableCell>
                                        <StyledTableCell align="center" component="td">{row.minCP}</StyledTableCell>
                                        <StyledTableCell align="center" component="td">{row.maxCP_40}</StyledTableCell>
                                        <StyledTableCell align="center" component="td">{row.maxCP_50}</StyledTableCell>
                                        <StyledTableCell align="center" component="td">
                                            <div>{row.atk}</div>
                                            <span className='text-success' style={{fontSize: 10}}>Attack</span>
                                        </StyledTableCell>
                                        <StyledTableCell align="center" component="td">
                                            <div>{row.def}</div>
                                            <span className='text-danger' style={{fontSize: 10}}>Defense</span>
                                        </StyledTableCell>
                                        <StyledTableCell align="center" component="td">
                                            <div>{row.sta}</div>
                                            <span className='text-info' style={{fontSize: 10}}>Stamina</span>
                                        </StyledTableCell>
                                        <StyledTableCell align="center" component="td"><b>{row.atk+row.def+row.sta}</b></StyledTableCell>
                                    </StyledTableRow>
                                ))}
                                </Fragment>
                                }
                            </Fragment>
                        :
                            <StyledTableRow>
                                <StyledTableCell align="center" component="td" colSpan={7} sx={{height: window.innerHeight/2}}>
                                    <div className='loading-group'>
                                        <img className="loading" width={64} height={64} alt='img-pokemon' src={loading}/>
                                        <span className='caption text-black' style={{fontSize: 20}}><b>Loading...</b></span>
                                    </div>
                                </StyledTableCell>
                            </StyledTableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Fragment>
    );
}

export default Home;