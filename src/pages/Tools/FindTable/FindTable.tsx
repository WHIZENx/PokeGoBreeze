import React, { Fragment, useCallback, useState } from 'react';

import { HundoRate, isInvalidIV, marks, PokeGoSlider, splitAndCapitalize } from '../../../utils/utils';
import { calculateCP, predictCPList, predictStat } from '../../../utils/calculate';

import { ConditionalStyles, TableColumn, TableStyles } from 'react-data-table-component';
import dataCPM from '../../../data/cp_multiplier.json';

import '../../../components/Find/FormSelect.scss';
import { useSnackbar } from 'notistack';
import { Box, Rating } from '@mui/material';
import Find from '../../../components/Find/Find';
import {
  IPredictStatsModel,
  IPredictStatsCalculate,
  IPredictCPModel,
  IPredictCPCalculate,
  PredictStatsModel,
  PredictCPModel,
} from '../../../utils/models/calculate.model';
import { useSelector } from 'react-redux';
import { SearchingState } from '../../../store/models/state.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { getValueOrDefault, isEqual, isNotEmpty, toFloatWithPadding, toNumber } from '../../../utils/extension';
import { ColumnType, VariantType } from '../../../enums/type.enum';
import CustomDataTable from '../../../components/Table/CustomDataTable/CustomDataTable';
import { minCp, minIv, maxIv, minLevel, maxLevel } from '../../../utils/helpers/context.helpers';

interface IFindCP {
  level: number;
  minCP: number;
  maxCP: number;
}

class FindCP implements IFindCP {
  level = 0;
  minCP = 0;
  maxCP = 0;

  constructor({ ...props }: IFindCP) {
    Object.assign(this, props);
  }
}

const columnsIV: TableColumn<IPredictStatsModel>[] = [
  {
    id: ColumnType.Level,
    name: 'Level',
    selector: (row) => row.level,
    sortable: true,
  },
  {
    id: ColumnType.Atk,
    name: 'ATK',
    selector: (row) => row.atk,
    sortable: true,
  },
  {
    id: ColumnType.Def,
    name: 'DEF',
    selector: (row) => row.def,
    sortable: true,
  },
  {
    id: ColumnType.Sta,
    name: 'STA',
    selector: (row) => row.sta,
    sortable: true,
  },
  {
    id: ColumnType.Hp,
    name: 'HP',
    selector: (row) => row.hp,
    sortable: true,
  },
  {
    id: ColumnType.Percent,
    name: 'Percent',
    selector: (row) => row.percent,
    sortable: true,
  },
];

const columnsCP: TableColumn<IPredictCPModel>[] = [
  {
    id: ColumnType.Level,
    name: 'Level',
    selector: (row) => row.level,
    sortable: true,
  },
  {
    id: ColumnType.CP,
    name: 'CP',
    selector: (row) => row.CP,
    sortable: true,
  },
  {
    id: ColumnType.Hp,
    name: 'HP',
    selector: (row) => row.hp,
    sortable: true,
  },
];

const customStyles: TableStyles = {
  rows: {
    highlightOnHoverStyle: {
      color: 'white !important',
    },
  },
  cells: {
    style: {
      color: 'black',
    },
  },
};

const conditionalRowStyles: ConditionalStyles<IPredictStatsModel>[] = [
  {
    when: (row) => row.percent === 100,
    style: {
      backgroundColor: '#ecc8c8',
    },
  },
  {
    when: (row) => row.percent > 80 && row.percent < 100,
    style: {
      backgroundColor: '#ecc8ec',
    },
  },
  {
    when: (row) => row.percent > 64 && row.percent <= 80,
    style: {
      backgroundColor: '#c8ecc8',
    },
  },
  {
    when: (row) => row.percent > 51 && row.percent <= 64,
    style: {
      backgroundColor: '#ececc8',
    },
  },
  {
    when: (row) => row.percent <= 51,
    style: {
      backgroundColor: '#d7d7d7',
    },
  },
];

const columns: TableColumn<IFindCP>[] = [
  {
    id: ColumnType.Level,
    name: 'Level',
    selector: (row) => row.level,
    sortable: true,
  },
  {
    id: ColumnType.MinCP,
    name: 'MIN CP',
    selector: (row) => row.minCP,
    sortable: true,
  },
  {
    id: ColumnType.MaxCP,
    name: 'MAX CP',
    selector: (row) => row.maxCP,
    sortable: true,
  },
];

const FindTable = () => {
  useTitle({
    title: 'Find CP&IV - Tool',
    description:
      'Find specific CP and IV combinations for any Pokémon in Pokémon GO. Our advanced search tool helps you locate perfect IVs and optimal CP values.',
    keywords: ['Find CP', 'Find IV', 'Pokémon GO CP search', 'IV finder', 'CP calculator', 'optimal Pokémon stats'],
  });
  const pokemon = useSelector((state: SearchingState) => state.searching.toolSearching?.current?.pokemon);

  const [searchCP, setSearchCP] = useState('');

  const [searchATKIv, setSearchATKIv] = useState(0);
  const [searchDEFIv, setSearchDEFIv] = useState(0);
  const [searchSTAIv, setSearchSTAIv] = useState(0);

  const [preIvArr, setPreIvArr] = useState<IPredictStatsCalculate>();
  const [preCpArr, setPreCpArr] = useState<IPredictCPCalculate>();

  const { enqueueSnackbar } = useSnackbar();

  const findStatsIv = useCallback(() => {
    if (!pokemon) {
      return;
    }
    if (toNumber(searchCP) < minCp()) {
      return enqueueSnackbar(`Please input CP greater than or equal to ${minCp()}`, { variant: VariantType.Error });
    }
    const result = predictStat(
      toNumber(pokemon.statsGO?.atk),
      toNumber(pokemon.statsGO?.def),
      toNumber(pokemon.statsGO?.sta),
      searchCP
    );
    if (!isNotEmpty(result.result)) {
      setPreIvArr(undefined);
      const name = splitAndCapitalize(pokemon.fullName, '_', ' ');
      return enqueueSnackbar(`At CP: ${result.CP} impossible found in ${name}`, { variant: VariantType.Error });
    }
    setPreIvArr(result);
  }, [enqueueSnackbar, pokemon, searchCP]);

  const onFindStats = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      findStatsIv();
      e.preventDefault();
    },
    [findStatsIv]
  );

  const clearArrStats = () => {
    setPreIvArr(undefined);
    setPreCpArr(undefined);
    setSearchCP('');
    setSearchATKIv(0);
    setSearchDEFIv(0);
    setSearchSTAIv(0);
  };

  const findStatsCP = useCallback(() => {
    if (!pokemon) {
      return;
    }
    if (isInvalidIV(searchATKIv) || isInvalidIV(searchDEFIv) || isInvalidIV(searchSTAIv)) {
      enqueueSnackbar(`Please input IV between ${minIv()} - ${maxIv()}.`, { variant: VariantType.Error });
      return;
    }
    const result = predictCPList(
      toNumber(pokemon.statsGO?.atk),
      toNumber(pokemon.statsGO?.def),
      toNumber(pokemon.statsGO?.sta),
      searchATKIv,
      searchDEFIv,
      searchSTAIv
    );
    setPreCpArr(result);
  }, [enqueueSnackbar, pokemon, searchATKIv, searchDEFIv, searchSTAIv]);

  const onFindCP = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      findStatsCP();
      e.preventDefault();
    },
    [findStatsCP]
  );

  const renderStar = (star: number | undefined, starAmount: number, style: string) => (
    <div className="d-inline-block text-center">
      <div className={`${style}-star`}>
        {isEqual(style, 'four') ? (
          <HundoRate name="hundo-rate" value={starAmount} max={3} readOnly />
        ) : (
          <Rating name={`${style}-rate`} value={starAmount} max={3} readOnly />
        )}
        <hr className="m-0" />
        <div>
          <b className="text-black text-shadow">{star}</b>
        </div>
      </div>
      <p>{toFloatWithPadding((toNumber(star) * 100) / toNumber(preIvArr?.result.length, 1), 2)}%</p>
    </div>
  );

  const showResultTableIV = () => {
    const avgPercent =
      Object.values(preIvArr?.result ?? new PredictStatsModel()).reduce((a, b) => a + b.percent, 0) /
      toNumber(preIvArr?.result.length, 1);
    const avgHP =
      Object.values(preIvArr?.result ?? new PredictStatsModel()).reduce((a, b) => a + b.hp, 0) /
      toNumber(preIvArr?.result.length, 1);
    const fourStar = preIvArr?.result.filter((item) => item.percent === 100).length;
    const threeStar = preIvArr?.result.filter((item) => item.percent > 80 && item.percent < 100).length;
    const twoStar = preIvArr?.result.filter((item) => item.percent > 64 && item.percent <= 80).length;
    const oneStar = preIvArr?.result.filter((item) => item.percent > 51 && item.percent <= 64).length;
    const zeroStar = preIvArr?.result.filter((item) => item.percent <= 51).length;
    return (
      <Fragment>
        {isNotEmpty(preIvArr?.result) && (
          <Fragment>
            <p className="mt-2">
              All of result: <b>{preIvArr?.result.length}</b>
            </p>
            <p className="mt-2">
              Average of percent: <b>{toFloatWithPadding(avgPercent, 2)}</b>
            </p>
            <p className="mt-2">
              Average of HP: <b>{Math.round(avgHP)}</b>
            </p>
            {renderStar(fourStar, 3, 'four')}
            {renderStar(threeStar, 3, 'three')}
            {renderStar(twoStar, 2, 'two')}
            {renderStar(oneStar, 1, 'one')}
            {renderStar(zeroStar, 0, 'zero')}
          </Fragment>
        )}
        <CustomDataTable
          title={`Levels/IV for CP: ${preIvArr?.CP}`}
          columns={columnsIV}
          data={getValueOrDefault(Array, preIvArr?.result)}
          pagination
          defaultSortFieldId={ColumnType.Percent}
          defaultSortAsc={false}
          conditionalRowStyles={conditionalRowStyles}
          highlightOnHover
          customDataStyles={customStyles}
        />
      </Fragment>
    );
  };

  const showResultTableCP = () => {
    const avgCp =
      Object.values(preCpArr?.result ?? new PredictCPModel()).reduce((a, b) => a + b.CP, 0) /
      toNumber(preCpArr?.result.length, 1);
    const avgHP =
      Object.values(preCpArr?.result ?? new PredictCPModel()).reduce((a, b) => a + b.hp, 0) /
      toNumber(preCpArr?.result.length, 1);
    return (
      <Fragment>
        {isNotEmpty(preCpArr?.result) && (
          <Fragment>
            <p className="mt-2">
              Average of CP: <b>{Math.round(avgCp)}</b>
            </p>
            <p className="mt-2">
              Average of HP: <b>{Math.round(avgHP)}</b>
            </p>
            <CustomDataTable
              title={`Levels/CP for IV: ${preCpArr?.IV.atkIV}/${preCpArr?.IV.defIV}/${preCpArr?.IV.staIV}`}
              columns={columnsCP}
              data={getValueOrDefault(Array, preCpArr?.result)}
              pagination
              defaultSortFieldId={ColumnType.Level}
              highlightOnHover
              striped
            />
          </Fragment>
        )}
      </Fragment>
    );
  };

  const findMinMax = () => {
    if (!pokemon) {
      return;
    }
    const statATK = toNumber(pokemon.statsGO?.atk);
    const statDEF = toNumber(pokemon.statsGO?.def);
    const statSTA = toNumber(pokemon.statsGO?.sta);
    const dataTable = dataCPM
      .filter((item) => item.level >= minLevel() && item.level <= maxLevel())
      .map((item) => {
        return new FindCP({
          level: item.level,
          minCP: calculateCP(statATK, statDEF, statSTA, item.level),
          maxCP: calculateCP(statATK + maxIv(), statDEF + maxIv(), statSTA + maxIv(), item.level),
        });
      });

    return (
      <CustomDataTable
        title="Pokémon MIN/MAX CP"
        columns={columns}
        data={dataTable}
        pagination
        defaultSortFieldId={ColumnType.Level}
        striped
        highlightOnHover
      />
    );
  };

  return (
    <Fragment>
      <div className="container mt-2">
        <Find isHide clearStats={clearArrStats} />
        <h1 id="main" className="text-center">
          Find IV
        </h1>
        <form className="d-flex justify-content-center mt-2" onSubmit={onFindStats.bind(this)}>
          <Box className="w-50" sx={{ minWidth: 350 }}>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">CP</span>
              </div>
              <input
                required
                value={searchCP}
                type="number"
                min={minCp()}
                className="form-control"
                aria-label="cp"
                aria-describedby="input-cp"
                placeholder="Enter CP"
                onInput={(e) => setSearchCP(e.currentTarget.value)}
              />
            </div>
            <div className="btn-search d-flex justify-content-center text-center">
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </Box>
        </form>
        {preIvArr && <Fragment>{showResultTableIV()}</Fragment>}
        <hr />
        <h1 id="main" className="text-center">
          Find CP
        </h1>
        <form id="formCP" className="mt-2" onSubmit={onFindCP.bind(this)}>
          <div className="form-group d-flex justify-content-center text-center">
            <Box className="w-50" sx={{ minWidth: 300 }}>
              <div className="d-flex justify-content-between">
                <b>ATK</b>
                <b>{searchATKIv}</b>
              </div>
              <PokeGoSlider
                value={searchATKIv}
                aria-label="ATK marks"
                defaultValue={minIv()}
                min={minIv()}
                max={maxIv()}
                step={1}
                valueLabelDisplay="auto"
                marks={marks}
                onChange={(_, v) => setSearchATKIv(v as number)}
              />
              <div className="d-flex justify-content-between">
                <b>DEF</b>
                <b>{searchDEFIv}</b>
              </div>
              <PokeGoSlider
                value={searchDEFIv}
                aria-label="DEF marks"
                defaultValue={minIv()}
                min={minIv()}
                max={maxIv()}
                step={1}
                valueLabelDisplay="auto"
                marks={marks}
                onChange={(_, v) => setSearchDEFIv(v as number)}
              />
              <div className="d-flex justify-content-between">
                <b>STA</b>
                <b>{searchSTAIv}</b>
              </div>
              <PokeGoSlider
                value={searchSTAIv}
                aria-label="STA marks"
                defaultValue={minIv()}
                min={minIv()}
                max={maxIv()}
                step={1}
                valueLabelDisplay="auto"
                marks={marks}
                onChange={(_, v) => setSearchSTAIv(v as number)}
              />
            </Box>
          </div>
          <div className="form-group d-flex justify-content-center text-center mt-2">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
        {preCpArr && <Fragment>{showResultTableCP()}</Fragment>}
        <hr />
        <div className="mt-2">{findMinMax()}</div>
      </div>
    </Fragment>
  );
};

export default FindTable;
