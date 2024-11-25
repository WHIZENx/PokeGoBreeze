import React, { Fragment, useCallback, useState } from 'react';

import { HundoRate, marks, PokeGoSlider, splitAndCapitalize } from '../../../util/utils';
import { calculateCP, predictCPList, predictStat } from '../../../util/calculate';

import DataTable, { ConditionalStyles, TableColumn } from 'react-data-table-component';
import data from '../../../data/cp_multiplier.json';

import '../../../components/Find/FormSelect.scss';
import { useSnackbar } from 'notistack';
import { Box, Rating } from '@mui/material';
import Find from '../../../components/Find/Find';
import { MAX_IV, MIN_IV } from '../../../util/constants';
import {
  IPredictStatsModel,
  IPredictStatsCalculate,
  IPredictCPModel,
  IPredictCPCalculate,
  PredictStatsModel,
  PredictCPModel,
} from '../../../util/models/calculate.model';
import { useSelector } from 'react-redux';
import { SearchingState } from '../../../store/models/state.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { getValueOrDefault, isNotEmpty, toFloatWithPadding, toNumber } from '../../../util/extension';
import { VariantType } from '../../../enums/type.enum';

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
    name: 'Level',
    selector: (row) => row.level,
    sortable: true,
  },
  {
    name: 'ATK',
    selector: (row) => row.atk,
    sortable: true,
  },
  {
    name: 'DEF',
    selector: (row) => row.def,
    sortable: true,
  },
  {
    name: 'STA',
    selector: (row) => row.sta,
    sortable: true,
  },
  {
    name: 'HP',
    selector: (row) => row.hp,
    sortable: true,
  },
  {
    name: 'Percent',
    selector: (row) => row.percent,
    sortable: true,
  },
];

const columnsCP: TableColumn<IPredictCPModel>[] = [
  {
    name: 'Level',
    selector: (row) => row.level,
    sortable: true,
  },
  {
    name: 'CP',
    selector: (row) => row.CP,
    sortable: true,
  },
  {
    name: 'HP',
    selector: (row) => row.hp,
    sortable: true,
  },
];

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
];

const FindTable = () => {
  useChangeTitle('Find CP&IV - Tool');
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);
  const [name, setName] = useState(splitAndCapitalize(searching?.fullName, '-', ' '));

  const [searchCP, setSearchCP] = useState('');

  const [searchATKIv, setSearchATKIv] = useState(0);
  const [searchDEFIv, setSearchDEFIv] = useState(0);
  const [searchSTAIv, setSearchSTAIv] = useState(0);

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [preIvArr, setPreIvArr] = useState<IPredictStatsCalculate>();
  const [preCpArr, setPreCpArr] = useState<IPredictCPCalculate>();

  const { enqueueSnackbar } = useSnackbar();

  const findStatsIv = useCallback(() => {
    if (toNumber(searchCP) < 10) {
      return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: VariantType.Error });
    }
    const result = predictStat(statATK, statDEF, statSTA, searchCP);
    if (!isNotEmpty(result.result)) {
      setPreIvArr(undefined);
      return enqueueSnackbar(`At CP: ${result.CP} impossible found in ${name}`, { variant: VariantType.Error });
    }
    setPreIvArr(result);
  }, [enqueueSnackbar, name, searchCP, statATK, statDEF, statSTA]);

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
    if (
      searchATKIv < MIN_IV ||
      searchATKIv > MAX_IV ||
      searchDEFIv < MIN_IV ||
      searchDEFIv > MAX_IV ||
      searchSTAIv < MIN_IV ||
      searchSTAIv > MAX_IV
    ) {
      return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: VariantType.Error });
    }
    const result = predictCPList(statATK, statDEF, statSTA, searchATKIv, searchDEFIv, searchSTAIv);
    setPreCpArr(result);
  }, [enqueueSnackbar, statATK, statDEF, statSTA, searchATKIv, searchDEFIv, searchSTAIv]);

  const onFindCP = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      findStatsCP();
      e.preventDefault();
    },
    [findStatsCP]
  );

  const showResultTableIV = () => {
    const avgPercent =
      Object.values(preIvArr?.result ?? new PredictStatsModel()).reduce((a, b) => a + b.percent, 0) / toNumber(preIvArr?.result.length, 1);
    const avgHP =
      Object.values(preIvArr?.result ?? new PredictStatsModel()).reduce((a, b) => a + b.hp, 0) / toNumber(preIvArr?.result.length, 1);
    const fourStar = preIvArr?.result.filter((item) => item.percent === 100).length;
    const threeStar = preIvArr?.result.filter((item) => item.percent > 80 && item.percent < 100).length;
    const twoStar = preIvArr?.result.filter((item) => item.percent > 64 && item.percent <= 80).length;
    const oneStar = preIvArr?.result.filter((item) => item.percent > 51 && item.percent <= 64).length;
    const zeroStar = preIvArr?.result.filter((item) => item.percent <= 51).length;
    return (
      <Fragment>
        {isNotEmpty(preIvArr?.result) && (
          <Fragment>
            <p className="element-top">
              All of result: <b>{preIvArr?.result.length}</b>
            </p>
            <p className="element-top">
              Average of percent: <b>{toFloatWithPadding(avgPercent, 2)}</b>
            </p>
            <p className="element-top">
              Average of HP: <b>{Math.round(avgHP)}</b>
            </p>
            <div className="d-inline-block text-center">
              <div className="four-star">
                <HundoRate name="hundo-rate" value={3} max={3} readOnly={true} />
                <hr style={{ margin: 0 }} />
                <div>
                  <b>{fourStar}</b>
                </div>
              </div>
              <p>{toFloatWithPadding((toNumber(fourStar) * 100) / toNumber(preIvArr?.result.length, 1), 2)}%</p>
            </div>
            <div className="d-inline-block text-center">
              <div className="three-star">
                <Rating name="three-rate" value={3} max={3} readOnly={true} />
                <hr style={{ margin: 0 }} />
                <div>
                  <b>{threeStar}</b>
                </div>
              </div>
              <p>{toFloatWithPadding((toNumber(threeStar) * 100) / toNumber(preIvArr?.result.length, 1), 2)}%</p>
            </div>
            <div className="d-inline-block text-center">
              <div className="two-star">
                <Rating name="two-rate" value={2} max={3} readOnly={true} />
                <hr style={{ margin: 0 }} />
                <div>
                  <b>{twoStar}</b>
                </div>
              </div>
              <p>{toFloatWithPadding((toNumber(twoStar) * 100) / toNumber(preIvArr?.result.length, 1), 2)}%</p>
            </div>
            <div className="d-inline-block text-center">
              <div className="one-star">
                <Rating name="one-rate" value={1} max={3} readOnly={true} />
                <hr style={{ margin: 0 }} />
                <div>
                  <b>{oneStar}</b>
                </div>
              </div>
              <p>{toFloatWithPadding((toNumber(oneStar) * 100) / toNumber(preIvArr?.result.length, 1), 2)}%</p>
            </div>
            <div className="d-inline-block text-center">
              <div className="zero-star">
                <Rating name="zero-rate" value={0} max={3} readOnly={true} />
                <hr style={{ margin: 0 }} />
                <div>
                  <b>{zeroStar}</b>
                </div>
              </div>
              <p>{toFloatWithPadding((toNumber(zeroStar) * 100) / toNumber(preIvArr?.result.length, 1), 2)}%</p>
            </div>
          </Fragment>
        )}
        <DataTable
          title={`Levels/IV for CP: ${preIvArr?.CP}`}
          columns={columnsIV}
          data={getValueOrDefault(Array, preIvArr?.result)}
          pagination={true}
          defaultSortFieldId={6}
          defaultSortAsc={false}
          conditionalRowStyles={conditionalRowStyles}
          highlightOnHover={true}
        />
      </Fragment>
    );
  };

  const showResultTableCP = () => {
    const avgCp =
      Object.values(preCpArr?.result ?? new PredictCPModel()).reduce((a, b) => a + b.CP, 0) / toNumber(preCpArr?.result.length, 1);
    const avgHP =
      Object.values(preCpArr?.result ?? new PredictCPModel()).reduce((a, b) => a + b.hp, 0) / toNumber(preCpArr?.result.length, 1);
    return (
      <Fragment>
        {preCpArr && isNotEmpty(preCpArr.result) && (
          <Fragment>
            <p className="element-top">
              Average of CP: <b>{Math.round(avgCp)}</b>
            </p>
            <p className="element-top">
              Average of HP: <b>{Math.round(avgHP)}</b>
            </p>
            <DataTable
              title={`Levels/CP for IV: ${preCpArr.IV.atk}/${preCpArr.IV.def}/${preCpArr.IV.sta}`}
              columns={columnsCP}
              data={preCpArr.result}
              pagination={true}
              defaultSortFieldId={1}
              highlightOnHover={true}
              striped={true}
            />
          </Fragment>
        )}
      </Fragment>
    );
  };

  const findMinMax = () => {
    const columns: TableColumn<IFindCP>[] = [
      {
        name: 'Level',
        selector: (row) => row.level,
        sortable: true,
      },
      {
        name: 'MIN CP',
        selector: (row) => row.minCP,
        sortable: true,
      },
      {
        name: 'MAX CP',
        selector: (row) => row.maxCP,
        sortable: true,
      },
    ];

    const dataTable = data.map((item) => {
      return new FindCP({
        level: item.level,
        minCP: calculateCP(statATK, statDEF, statSTA, item.level),
        maxCP: calculateCP(statATK + MAX_IV, statDEF + MAX_IV, statSTA + MAX_IV, item.level),
      });
    });

    return (
      <DataTable
        title="Pokémon MIN/MAX CP"
        columns={columns}
        data={dataTable}
        pagination={true}
        defaultSortFieldId={1}
        striped={true}
        highlightOnHover={true}
      />
    );
  };

  return (
    <Fragment>
      <div className="container element-top">
        <Find
          isHide={true}
          clearStats={clearArrStats}
          setStatATK={setStatATK}
          setStatDEF={setStatDEF}
          setStatSTA={setStatSTA}
          setName={setName}
        />
        <h1 id="main" className="text-center">
          Find IV
        </h1>
        <form className="d-flex justify-content-center element-top" onSubmit={onFindStats.bind(this)}>
          <Box sx={{ width: '50%', minWidth: 350 }}>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">CP</span>
              </div>
              <input
                required={true}
                value={searchCP}
                type="number"
                min={10}
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
                defaultValue={MIN_IV}
                min={MIN_IV}
                max={MAX_IV}
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
                defaultValue={MIN_IV}
                min={MIN_IV}
                max={MAX_IV}
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
                defaultValue={MIN_IV}
                min={MIN_IV}
                max={MAX_IV}
                step={1}
                valueLabelDisplay="auto"
                marks={marks}
                onChange={(_, v) => setSearchSTAIv(v as number)}
              />
            </Box>
          </div>
          <div className="form-group d-flex justify-content-center text-center element-top">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
        {preCpArr && <Fragment>{showResultTableCP()}</Fragment>}
        <hr />
        <div className="element-top">{findMinMax()}</div>
      </div>
    </Fragment>
  );
};

export default FindTable;
