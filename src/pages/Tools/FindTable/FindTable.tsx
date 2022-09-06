import React, { Fragment, useCallback, useEffect, useState } from "react";

import { HundoRate, marks, PokeGoSlider } from "../../../util/Utils";
import { calculateCP, predictCPList, predictStat } from "../../../util/Calculate";

import DataTable from 'react-data-table-component';
import data from "../../../data/cp_multiplier.json";

import '../../../components/Select/Find/Tools.css';
import { useSnackbar } from "notistack";
import { Box, Rating } from "@mui/material";
import Find from "../../../components/Select/Find/Find";


const columnsIV: any = [
    {
        name: 'Level',
        selector: (row: { level: any; }) => row.level,
        sortable: true,
    },
    {
        name: 'ATK',
        selector: (row: { atk: any; }) => row.atk,
        sortable: true,
    },
    {
        name: 'DEF',
        selector: (row: { def: any; }) => row.def,
        sortable: true,
    },
    {
        name: 'STA',
        selector: (row: { sta: any; }) => row.sta,
        sortable: true,
    },
    {
        name: 'HP',
        selector: (row: { hp: any; }) => row.hp,
        sortable: true,
    },
    {
        name: 'Percent',
        selector: (row: { percent: any; }) => row.percent,
        sortable: true,
    },
];

const columnsCP: any = [
    {
        name: 'Level',
        selector: (row: { level: any; }) => row.level,
        sortable: true,
    },
    {
        name: 'CP',
        selector: (row: { cp: any; }) => row.cp,
        sortable: true,
    },
    {
        name: 'HP',
        selector: (row: { hp: any; }) => row.hp,
        sortable: true,
    },
];

const conditionalRowStyles = [
    {
        when: (row: { percent: number; }) => row.percent === 100,
        style: {
          backgroundColor: 'rgb(236, 200, 200)',
        },
    },
    {
      when: (row: { percent: number; }) => row.percent > 80 && row.percent < 100,
      style: {
        backgroundColor: 'rgb(236, 200, 236)',
      },
    },
    {
        when: (row: { percent: number; }) => row.percent > 64 && row.percent <= 80,
        style: {
          backgroundColor: 'rgb(200, 236, 200)',
        },
    },
    {
        when: (row: { percent: number; }) => row.percent > 51 && row.percent <= 64,
        style: {
          backgroundColor: 'rgb(236, 236, 200)',
        },
    },
];

const FindTable = () => {

    const [name, setName] = useState('Bulbasaur');

    const [searchCP, setSearchCP]: any = useState('');

    const [searchATKIv, setSearchATKIv]: any = useState(0);
    const [searchDEFIv, setSearchDEFIv]: any = useState(0);
    const [searchSTAIv, setSearchSTAIv]: any = useState(0);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [preIvArr, setPreIvArr]: any = useState(null);
    const [preCpArr, setPreCpArr]: any = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    const findStatsIv = useCallback(() => {
        if (parseInt(searchCP) < 10) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = predictStat(statATK, statDEF, statSTA, searchCP);
        setPreIvArr(result);
    }, [enqueueSnackbar, searchCP, statATK, statDEF, statSTA]);

    const onFindStats = useCallback((e: { preventDefault: () => void; }) => {
        findStatsIv()
        e.preventDefault();
    }, [findStatsIv]);

    const clearArrStats = () => {
        setPreIvArr(null);
        setPreCpArr(null);
        setSearchCP('');
        setSearchATKIv(0);
        setSearchDEFIv(0);
        setSearchSTAIv(0);
    }

    useEffect(() => {
        document.title = "Find CP&IV - Tool";
    }, []);

    const findStatsCP = useCallback(() => {
        if (searchATKIv < 0 || searchATKIv > 15 || searchDEFIv < 0 || searchDEFIv > 15 || searchSTAIv < 0 || searchSTAIv > 15) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = predictCPList(statATK, statDEF, statSTA, searchATKIv, searchDEFIv, searchSTAIv);
        setPreCpArr(result);
    }, [enqueueSnackbar, statATK, statDEF, statSTA, searchATKIv, searchDEFIv, searchSTAIv]);

    const onFindCP = useCallback((e: { preventDefault: () => void; }) => {
        findStatsCP()
        e.preventDefault();
    }, [findStatsCP]);

    const showResultTableIV = () => {
        const avgPercent = (Object.values(preIvArr.result).reduce((a: any, b: any) => a + b.percent, 0) as any) / preIvArr.result.length
        const avgHP = (Object.values(preIvArr.result).reduce((a: any, b: any) => a + b.hp, 0) as any) / preIvArr.result.length
        const fourStar = preIvArr.result.filter((item: { percent: number; }) => item.percent === 100).length
        const threeStar = preIvArr.result.filter((item: { percent: number; }) => item.percent > 80 && item.percent < 100).length
        const twoStar = preIvArr.result.filter((item: { percent: number; }) => item.percent > 64 && item.percent <= 80).length
        const oneStar = preIvArr.result.filter((item: { percent: number; }) => item.percent > 51 && item.percent <= 64).length
        const zeroStar = preIvArr.result.filter((item: { percent: number; }) => item.percent <= 51).length
        return (
            <Fragment>
                {preIvArr.result.length > 0 &&
                    <Fragment>
                    <p className="element-top">All of result: <b>{preIvArr.result.length}</b></p>
                    <p className="element-top">Average of percent: <b>{parseFloat(avgPercent.toFixed(2))}</b></p>
                    <p className="element-top">Average of HP: <b>{Math.round(avgHP)}</b></p>
                    <div className="d-inline-block text-center four-star">
                        <HundoRate name="hundo-rate" value={3} max={3} readOnly />
                        <hr style={{margin: 0}}/>
                        <div><b>{fourStar}</b></div>
                    </div>
                    <div className="d-inline-block text-center three-star">
                        <Rating name="three-rate" value={3} max={3} readOnly />
                        <hr style={{margin: 0}}/>
                        <div><b>{threeStar}</b></div>
                    </div>
                    <div className="d-inline-block text-center two-star">
                        <Rating name="two-rate" value={2} max={3} readOnly />
                        <hr style={{margin: 0}}/>
                        <div><b>{twoStar}</b></div>
                    </div>
                    <div className="d-inline-block text-center one-star">
                        <Rating name="one-rate" value={1} max={3} readOnly />
                        <hr style={{margin: 0}}/>
                        <div><b>{oneStar}</b></div>
                    </div>
                    <div className="d-inline-block text-center zero-star">
                        <Rating name="zero-rate" value={0} max={3} readOnly />
                        <hr style={{margin: 0}}/>
                        <div><b>{zeroStar}</b></div>
                    </div>
                    </Fragment>
                }
                {preIvArr.result.length > 0 ?
                <DataTable
                    title={"Levels/IV for CP: "+preIvArr.cp}
                    columns={columnsIV}
                    data={preIvArr.result}
                    pagination
                    defaultSortFieldId={6}
                    defaultSortAsc={false}
                    conditionalRowStyles={conditionalRowStyles}
                    highlightOnHover
                />
                : <p className="element-top text-danger text-center">At CP: <b>{preIvArr.cp}</b> impossible found in <b>{name}</b></p>
                }
            </Fragment>
        )
    }

    const showResultTableCP = () => {
        const avgCp = (Object.values(preCpArr.result).reduce((a: any, b: any) => a + b.cp, 0) as any) / preCpArr.result.length
        const avgHP = (Object.values(preCpArr.result).reduce((a: any, b: any) => a + b.hp, 0) as any) / preCpArr.result.length
        return (
            <Fragment>
                {preCpArr.result.length > 0 &&
                <Fragment>
                    <p className="element-top">Average of CP: <b>{Math.round(avgCp)}</b></p>
                    <p className="element-top">Average of HP: <b>{Math.round(avgHP)}</b></p>
                    <DataTable
                        title={"Levels/CP for IV: "+preCpArr.IV.atk+"/"+preCpArr.IV.def+"/"+preCpArr.IV.sta}
                        columns={columnsCP}
                        data={preCpArr.result}
                        pagination
                        defaultSortFieldId={1}
                        highlightOnHover
                        striped
                    />
                </Fragment>
                }
            </Fragment>
        )
    }

    const findMinMax = () => {
        const columns = [
            {
                name: 'Level',
                selector: (row: { level: any; }) => row.level,
                sortable: true,
            },
            {
                name: 'MIN CP',
                selector: (row: { minCP: any; }) => row.minCP,
                sortable: true,
            },
            {
                name: 'MAX CP',
                selector: (row: { maxCP: any; }) => row.maxCP,
                sortable: true,
            },
        ];

        const dataTable = data.map(item => {
            return {level: item.level,
                minCP: calculateCP(statATK, statDEF, statSTA, item.level),
                maxCP: calculateCP(statATK+15, statDEF+15, statSTA+15, item.level)
            }
        });

        return (
            <DataTable
                title="Pokémon MIN/MAX CP"
                columns={columns}
                data={dataTable}
                pagination
                defaultSortFieldId={1}
                striped
                highlightOnHover
            />
        )
    }

    return (
        <Fragment>
            <div className="container element-top">
                <Find hide={true} clearStats={clearArrStats} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setName={setName}/>
                <h1 id ="main" className='text-center'>Find IV</h1>
                <form className="d-flex justify-content-center element-top" onSubmit={onFindStats.bind(this)}>
                    <Box sx={{ width: '50%', minWidth: 350 }}>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                            <span className="input-group-text">CP</span>
                        </div>
                        <input required value={searchCP} type="number" min={10} className="form-control" aria-label="cp" aria-describedby="input-cp" placeholder="Enter CP"
                        onInput={(e: any) => setSearchCP(e.target.value)}/>
                        </div>
                        <div className="btn-search d-flex justify-content-center text-center">
                            <button type="submit" className="btn btn-primary">Search</button>
                        </div>
                    </Box>
                </form>
                {preIvArr ?
                    <Fragment>
                    {showResultTableIV()}
                    </Fragment>
                    : <p>None</p>
                }
                <hr/>
                <h1 id ="main" className='text-center'>Find CP</h1>
                <form id="formCP" className="element-top" onSubmit={onFindCP.bind(this)}>
                    <div className="form-group d-flex justify-content-center text-center">
                        <Box sx={{ width: '50%', minWidth: 300 }}>
                            <div className="d-flex justify-content-between">
                                <b>ATK</b>
                                <b>{searchATKIv}</b>
                            </div>
                            <PokeGoSlider
                                value={searchATKIv}
                                aria-label="ATK marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e: any,v: any) => setSearchATKIv(v)}
                            />
                            <div className="d-flex justify-content-between">
                                <b>DEF</b>
                                <b>{searchDEFIv}</b>
                            </div>
                            <PokeGoSlider
                                value={searchDEFIv}
                                aria-label="DEF marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e,v) => setSearchDEFIv(v)}
                            />
                            <div className="d-flex justify-content-between">
                                <b>STA</b>
                                <b>{searchSTAIv}</b>
                            </div>
                            <PokeGoSlider
                                value={searchSTAIv}
                                aria-label="STA marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e,v) => setSearchSTAIv(v)}
                            />
                        </Box>
                    </div>
                    <div className="form-group d-flex justify-content-center text-center element-top">
                        <button type="submit" className="btn btn-primary">Search</button>
                    </div>
                </form>
                {preCpArr ?
                    <Fragment>
                    {showResultTableCP()}
                    </Fragment>
                    : <p>None</p>
                }
                <hr/>
                <div className="element-top">
                    {findMinMax()}
                </div>
            </div>
        </Fragment>
    )
}

export default FindTable;