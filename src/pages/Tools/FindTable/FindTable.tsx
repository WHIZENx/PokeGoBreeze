import { getApiErrorMessage } from '../../../services/api-error';
import React, { Fragment, useCallback, useEffect, useState } from 'react';

import { createDataRows, HundoRate, isInvalidIV, marks, PokeGoSlider, splitAndCapitalize } from '../../../utils/utils';

import { ConditionalStyles, TableColumn, TableStyles } from 'react-data-table-component';
import { Box, Rating } from '@mui/material';
import Find from '../../../components/Find/Find';
import './FindTable.scss';
import {
  IPredictStatsModel,
  IPredictStatsCalculate,
  IPredictCPModel,
  IPredictCPCalculate,
} from '../../../utils/models/calculate.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { getValueOrDefault, isEqual, isNotEmpty, toFloatWithPadding, toNumber } from '../../../utils/extension';
import { ColumnType } from '../../../enums/type.enum';
import CustomDataTable from '../../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import {
  minCp,
  minIv,
  maxIv,
  minLevel,
  maxLevel,
  maxPokemonLevel,
  stepLevel,
} from '../../../utils/helpers/options-context.helpers';
import useSearch from '../../../composables/useSearch';
import InputMui from '../../../components/Commons/Inputs/InputMui';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import { useSnackbar } from '../../../contexts/snackbar.context';
import { pokemonGoAppraisalStars } from './appraisal';
import { useFindTable } from './useFindTable';
import TableLoadingProgress from '../../../components/Commons/Tables/TableLoadingProgress';

interface IFindCP {
  level: number;
  minCP: number;
  maxCP: number;
}

const columnsIV = createDataRows<TableColumn<IPredictStatsModel>>(
  {
    id: ColumnType.Level,
    name: 'Level',
    selector: (row) => row.level,
    cell: (row) => (row.level > maxPokemonLevel() ? `${row.level} (Best Buddy)` : row.level),
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
  }
);

const columnsCP = createDataRows<TableColumn<IPredictCPModel>>(
  {
    id: ColumnType.Level,
    name: 'Level',
    selector: (row) => row.level,
    cell: (row) => (row.level > maxPokemonLevel() ? `${row.level} (Best Buddy)` : row.level),
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
  }
);

const customStyles: TableStyles = {
  rows: {
    style: {
      color: 'black',
    },
  },
  cells: {
    style: {
      color: 'inherit',
    },
  },
};

const conditionalRowStyles = createDataRows<ConditionalStyles<IPredictStatsModel>>(
  {
    when: (row) => pokemonGoAppraisalStars(row) === 4,
    style: {
      backgroundColor: '#ecc8c8',
    },
  },
  {
    when: (row) => pokemonGoAppraisalStars(row) === 3,
    style: {
      backgroundColor: '#ecc8ec',
    },
  },
  {
    when: (row) => pokemonGoAppraisalStars(row) === 2,
    style: {
      backgroundColor: '#c8ecc8',
    },
  },
  {
    when: (row) => pokemonGoAppraisalStars(row) === 1,
    style: {
      backgroundColor: '#ececc8',
    },
  },
  {
    when: (row) => pokemonGoAppraisalStars(row) === 0,
    style: {
      backgroundColor: '#d7d7d7',
    },
  }
);

const columns = createDataRows<TableColumn<IFindCP>>(
  {
    id: ColumnType.Level,
    name: 'Level',
    selector: (row) => row.level,
    cell: (row) => (row.level > maxPokemonLevel() ? `${row.level} (Best Buddy)` : row.level),
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
  }
);

const tableTitle = (title: string, loading: boolean) => (
  <div className="tw-relative tw-w-full tw-py-3">
    {title}
    <TableLoadingProgress loading={loading} />
  </div>
);

const FindTable = () => {
  useTitle({
    title: 'Find CP&IV - Tool',
    description:
      'Find specific CP and IV combinations for any Pokémon in Pokémon GO. Our advanced search tool helps you locate perfect IVs and optimal CP values.',
    keywords: ['Find CP', 'Find IV', 'Pokémon GO CP search', 'IV finder', 'CP calculator', 'optimal Pokémon stats'],
  });
  const { searchingToolCurrentDetails } = useSearch();

  const [searchCP, setSearchCP] = useState('');

  const [searchATKIv, setSearchATKIv] = useState(0);
  const [searchDEFIv, setSearchDEFIv] = useState(0);
  const [searchSTAIv, setSearchSTAIv] = useState(0);

  const { showSnackbar } = useSnackbar();
  const ivTable = useFindTable<IPredictStatsModel, IPredictStatsCalculate>(
    'percent',
    (error) => showSnackbar(getApiErrorMessage(error, 'Unable to calculate IVs.'), 'error'),
    (result) => {
      const name = splitAndCapitalize(searchingToolCurrentDetails?.fullName ?? '', '_', ' ');
      showSnackbar(`No IV combination gives ${name} CP ${result.CP}.`, 'info');
    }
  );
  const cpTable = useFindTable<IPredictCPModel, IPredictCPCalculate>('level', (error) =>
    showSnackbar(getApiErrorMessage(error, 'Unable to calculate CP.'), 'error')
  );
  const minMaxTable = useFindTable<IFindCP, { result: IFindCP[] }>('level', (error) =>
    showSnackbar(getApiErrorMessage(error, 'Unable to calculate CP.'), 'error')
  );
  const { data: preIvArr, summary: ivSummary } = ivTable;
  const { data: preCpArr, summary: cpSummary } = cpTable;
  const { submit: submitMinMax, clear: clearMinMax } = minMaxTable;

  const calculationParams = useCallback(
    () => ({
      atk: toNumber(searchingToolCurrentDetails?.statsGO?.atk),
      def: toNumber(searchingToolCurrentDetails?.statsGO?.def),
      sta: toNumber(searchingToolCurrentDetails?.statsGO?.sta),
      minLevel: minLevel(),
      maxLevel: maxLevel(),
      step: stepLevel(),
      minIv: minIv(),
      maxIv: maxIv(),
      minCp: minCp(),
    }),
    [searchingToolCurrentDetails]
  );

  const findStatsIv = useCallback(() => {
    if (!searchingToolCurrentDetails) {
      return;
    }
    if (toNumber(searchCP) < minCp()) {
      return showSnackbar(`Please input CP greater than or equal to ${minCp()}`, 'error');
    }
    ivTable.submit({ ...calculationParams(), mode: 'iv', cp: searchCP });
  }, [searchingToolCurrentDetails, searchCP, calculationParams, ivTable.submit]);

  const onFindStats = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      findStatsIv();
      e.preventDefault();
    },
    [findStatsIv]
  );

  const clearArrStats = useCallback(() => {
    ivTable.clear();
    cpTable.clear();
    setSearchCP('');
    setSearchATKIv(0);
    setSearchDEFIv(0);
    setSearchSTAIv(0);
  }, [ivTable.clear, cpTable.clear]);

  const findStatsCP = useCallback(() => {
    if (!searchingToolCurrentDetails) {
      return;
    }
    if (isInvalidIV(searchATKIv) || isInvalidIV(searchDEFIv) || isInvalidIV(searchSTAIv)) {
      showSnackbar(`Please input IV between ${minIv()} - ${maxIv()}.`, 'error');
      return;
    }
    cpTable.submit({
      ...calculationParams(),
      mode: 'cp',
      atkIv: searchATKIv,
      defIv: searchDEFIv,
      staIv: searchSTAIv,
    });
  }, [searchingToolCurrentDetails, searchATKIv, searchDEFIv, searchSTAIv, calculationParams, cpTable.submit]);

  useEffect(() => {
    if (!searchingToolCurrentDetails) {
      clearMinMax();
      return;
    }
    submitMinMax({ ...calculationParams(), mode: 'minmax' });
  }, [searchingToolCurrentDetails, calculationParams, submitMinMax, clearMinMax]);

  const onFindCP = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      findStatsCP();
      e.preventDefault();
    },
    [findStatsCP]
  );

  const renderStar = (star: number | undefined, starAmount: number, style: string) => (
    <div className="tw-inline-block tw-text-center">
      <div className={`${style}-star`}>
        {isEqual(style, 'four') ? (
          <HundoRate name="hundo-rate" value={starAmount} max={3} readOnly />
        ) : (
          <Rating name={`${style}-rate`} value={starAmount} max={3} readOnly />
        )}
        <hr className="!tw-m-0" />
        <div>
          <b className={isEqual(style, 'zero') ? 'tw-text-default' : 'tw-text-black'}>{star}</b>
        </div>
      </div>
      <p>{toFloatWithPadding((toNumber(star) * 100) / (ivSummary?.total || 1), 2)}%</p>
    </div>
  );

  const showResultTableIV = () => {
    return (
      <Fragment>
        {isNotEmpty(preIvArr?.result) && (
          <Fragment>
            <p className="tw-mt-2">
              All of result: <b>{ivSummary?.total}</b>
            </p>
            <p className="tw-mt-2">
              Average of percent: <b>{toFloatWithPadding(ivSummary?.averagePercent ?? 0, 2)}</b>
            </p>
            <p className="tw-mt-2">
              Average of HP: <b>{Math.round(ivSummary?.averageHp ?? 0)}</b>
            </p>
            {renderStar(ivSummary?.stars[4], 3, 'four')}
            {renderStar(ivSummary?.stars[3], 3, 'three')}
            {renderStar(ivSummary?.stars[2], 2, 'two')}
            {renderStar(ivSummary?.stars[1], 1, 'one')}
            {renderStar(ivSummary?.stars[0], 0, 'zero')}
          </Fragment>
        )}
        <div className="find-iv-result-table">
          <CustomDataTable
            filteredEmptyState
            title={tableTitle(`Levels/IV for CP: ${preIvArr?.CP}`, ivTable.loading)}
            columns={columnsIV}
            data={getValueOrDefault(Array, preIvArr?.result)}
            {...ivTable.tableProps}
            defaultSortFieldId={ColumnType.Percent}
            defaultSortAsc={false}
            conditionalRowStyles={conditionalRowStyles}
            highlightOnHover
            customDataStyles={customStyles}
          />
        </div>
      </Fragment>
    );
  };

  const showResultTableCP = () => {
    return (
      <Fragment>
        {isNotEmpty(preCpArr?.result) && (
          <Fragment>
            <p className="tw-mt-2">
              Average of CP: <b>{Math.round(cpSummary?.averageCp ?? 0)}</b>
            </p>
            <p className="tw-mt-2">
              Average of HP: <b>{Math.round(cpSummary?.averageHp ?? 0)}</b>
            </p>
          </Fragment>
        )}
        <CustomDataTable
          filteredEmptyState
          title={tableTitle(
            `Levels/CP for IV: ${preCpArr?.IV.atkIV}/${preCpArr?.IV.defIV}/${preCpArr?.IV.staIV}`,
            cpTable.loading
          )}
          columns={columnsCP}
          data={getValueOrDefault(Array, preCpArr?.result)}
          {...cpTable.tableProps}
          defaultSortFieldId={ColumnType.Level}
          highlightOnHover
          striped
        />
      </Fragment>
    );
  };

  const findMinMax = () => {
    if (!searchingToolCurrentDetails) {
      return;
    }
    return (
      <CustomDataTable
        title={tableTitle('Pokémon MIN/MAX CP', minMaxTable.loading)}
        columns={columns}
        data={minMaxTable.data?.result ?? []}
        {...minMaxTable.tableProps}
        defaultSortFieldId={ColumnType.Level}
        striped
        highlightOnHover
      />
    );
  };

  return (
    <Fragment>
      <div className="tw-container tw-mt-2">
        <Find isHide clearStats={clearArrStats} />
        <h1 id="main" className="tw-text-center">
          Find IV
        </h1>
        <form className="tw-flex tw-justify-center tw-mt-2" onSubmit={onFindStats.bind(this)}>
          <Box className="tw-w-1/2">
            <div className="-tw-ml-4 tw-w-[calc(100%+2rem)]">
              <InputMui
                labelPrepend="CP"
                className="tw-mb-3 tw-justify-center"
                fullWidth
                placeholder="Enter CP"
                value={searchCP}
                onChange={(value) => setSearchCP(value)}
                inputProps={{
                  type: 'number',
                  min: minCp(),
                  max: 100000,
                  step: 1,
                  required: true,
                }}
              />
            </div>
            <div className="tw-flex tw-justify-center tw-text-center">
              <ButtonMui type="submit" label="Search" />
            </div>
          </Box>
        </form>
        {preIvArr && <Fragment>{showResultTableIV()}</Fragment>}
        <hr />
        <h1 id="main" className="tw-text-center">
          Find CP
        </h1>
        <form id="formCP" className="tw-mt-2" onSubmit={onFindCP.bind(this)}>
          <div className="form-group tw-flex tw-justify-center tw-text-center">
            <Box className="tw-w-1/2 tw-min-w-75">
              <div className="tw-flex tw-justify-between">
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
              <div className="tw-flex tw-justify-between">
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
              <div className="tw-flex tw-justify-between">
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
          <div className="form-group tw-flex tw-justify-center tw-text-center tw-mt-2">
            <ButtonMui type="submit" label="Search" />
          </div>
        </form>
        {preCpArr && <Fragment>{showResultTableCP()}</Fragment>}
        <hr />
        <div className="tw-mt-2">{findMinMax()}</div>
      </div>
    </Fragment>
  );
};

export default FindTable;
