import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell, tableCellClasses, styled } from '@mui/material';
import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
import Type from '../../components/Sprits/Type';
import APIService from '../../services/API.service';

import { calBaseATK, calBaseDEF, calBaseSTA, calculateCP } from '../../components/Calculate/Calculate';

import './Home.css'
import { Link } from 'react-router-dom';

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
        minWidth: 300,
        paddingTop: 0,
        paddingBottom: 0,
    },
    '& td': {
        paddingTop: 0,
        paddingBottom: 0,
        '&:first-of-type': {
            minWidth: 140,
        },
        '&:nth-of-type(4), &:nth-of-type(5), &:nth-of-type(6)': {
            minWidth: 85,
            width: 85,
        },
    },
}));

const Home = () => {

    const types = ["Bug","Dark","Dragon","Electric","Fairy","Fighting","Fire","Flying","Ghost","Grass","Ground","Ice","Normal","Poison","Psychic","Rock","Steel","Water"]

    const tableRow = createRef(null);
    const dataList = useRef(null);
    const [listOfPokemon, setListOfPokemon] = useState([]);

    const [selectTypes, setSelectTypes] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchMaxCP, setSearchMaxCP] = useState('');

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = useCallback((string) => {
        return string.split("-").map(text => capitalize(text)).join(" ");
    }, []);


    useEffect(() => {
        const fetchMyAPI = async () => {
            // const result = await Promise.all([...Array(startPokemon).keys()].map(async (n) => (await APIService.getPokeInfo(n+1)).data));
            let result = Object.values((await APIService.getFetchUrl('https://itsjavi.com/pokemon-assets/assets/data/pokemon.json')).data);
            result = result.slice(0, result.length-3);
            result = result.map(item => {
                const atk  = calBaseATK(item.baseStats, true);
                const def  = calBaseDEF(item.baseStats, true);
                const sta  = calBaseSTA(item.baseStats, true);
                return {
                    id: item.num,
                    name: item.name,
                    types: item.types,
                    sprite: item.sprite.toLowerCase(),
                    baseSpecies: item.baseSpecies,
                    atk: atk,
                    def: def,
                    sta: sta,
                    minCP: calculateCP(atk, def, sta, 1),
                    maxCP: calculateCP(atk, def, sta, 50)
                }
            });
            dataList.current = result
            setListOfPokemon(result);
        }

        if (dataList.current) {
            setListOfPokemon(dataList.current.filter(item => {
                const boolFilterType = item.types.map(item => selectTypes.includes(item)).filter(bool => bool === true).length === selectTypes.length;
                const boolFilterPoke =  searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm);
                const boolFilterCP =  searchMaxCP === '' || item.maxCP <= searchMaxCP;
                return boolFilterType && boolFilterPoke && boolFilterCP;
            }));
        } else fetchMyAPI();
    }, [searchTerm, searchMaxCP, selectTypes]);

    const addTypeArr = (value) => {
        if (selectTypes.includes(value)) {
            return setSelectTypes([...selectTypes].filter(item => item !== value));
        }
        else setSelectTypes([...selectTypes].slice(0, 1));
        return setSelectTypes(oldArr => [...oldArr, value]);
    }

    return (
        <div className='container'>
            <div className='border-types center w-100'>
                <div className='head-types'>Filter By Types (Maximum 2)</div>
                <div className='row w-100' style={{margin: 0}}>
                    {types.map((item, index) => (
                        <div key={index} className="col img-group" style={{margin: 0, padding: 0}}>
                            <button value={item} onClick={() => addTypeArr(item)} className={'btn-select-type w-100 border-types'+(selectTypes.includes(item) ? " select-type" : "")} style={{padding: 10}}>
                                <Type arr={[item]}/>
                            </button>
                        </div>
                    ))
                    }
                </div>
                <div className='row w-100' style={{margin: 0}}>
                    <div className='col border-input' style={{padding: 0}}>
                        <div className='head-types'>Search Name or ID</div>
                        <input type="text" className='w-100 form-control' placeholder='Enter name or ID'
                        value={searchTerm}
                        onInput={e => setSearchTerm(e.target.value)}></input>
                    </div>
                    <div className='col border-input' style={{padding: 0}}>
                        <div className='head-types'>Maximum CP</div>
                        <input type="number" className='w-100 form-control' placeholder='Enter Maximum CP'
                        value={searchMaxCP}
                        min={10}
                        onInput={e => {
                            if (e.target.value === '') setSearchMaxCP(e.target.value)
                            else setSearchMaxCP(parseInt(e.target.value))
                        }}></input>
                    </div>
                </div>
            </div>
            <TableContainer>
                <Table sx={{ border: '1px solid #b8d4da' }} aria-label="pokemon table" stickyHeader >
                    <TableHead>
                    <TableRow ref={tableRow}>
                        <StyledTableCell>Pokémon Name</StyledTableCell>
                        <StyledTableCell align="center">Types</StyledTableCell>
                        <StyledTableCell align="center">Min CP</StyledTableCell>
                        <StyledTableCell align="center">MAX CP</StyledTableCell>
                        <StyledTableCell align="center" colSpan={3}>Base Stats</StyledTableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {listOfPokemon.map((row, index) => (
                        <StyledTableRow key={index}>
                            <StyledTableCell component="th" scope="row">#{row.id} <img height={60}
                            alt='img-pokemon'
                            src={APIService.getPokeIconSprite(row.sprite, true)}
                            onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(row.baseSpecies)}}>
                            </img> <Link to={"pokemon/"+row.id}>{splitAndCapitalize(row.name)}</Link></StyledTableCell>
                            <StyledTableCell align="center" component="td"><Type height={30} arr={row.types}/></StyledTableCell>
                            <StyledTableCell align="center" component="td">{row.minCP}</StyledTableCell>
                            <StyledTableCell align="center" component="td">{row.maxCP}</StyledTableCell>
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
                        </StyledTableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Home;