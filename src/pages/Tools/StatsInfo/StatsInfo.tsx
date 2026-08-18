import { Box } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TableColumn } from 'react-data-table-component';

import { createDataRows, marks, PokeGoSlider, splitAndCapitalize } from '../../../utils/utils';
import Find from '../../../components/Find/Find';
import { leaguesTeamBattle } from '../../../utils/constants';
import { IBattleBaseStats } from '../../../utils/models/calculate.model';
import DynamicInputCP from '../../../components/Commons/Inputs/DynamicInputCP';
import { useTitle } from '../../../utils/hooks/useTitle';
import { isNumber, toFloat, toFloatWithPadding, toNumber } from '../../../utils/extension';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { ColumnType } from '../../../enums/type.enum';
import { FloatPaddingOption } from '../../../utils/models/extension.model';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import { maxIv, maxLevel, minCp, minIv, minLevel, stepLevel } from '../../../utils/helpers/options-context.helpers';
import useSearch from '../../../composables/useSearch';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import ButtonGroupLeague from '../../../components/Commons/Buttons/ButtonGroupLeague';
import { useSnackbar } from '../../../contexts/snackbar.context';
import APIService from '../../../services/api.service';
import { ProcessedDataPage } from '../../../services/processed-data.service';

const numSortStatsProd = (rowA: IBattleBaseStats, rowB: IBattleBaseStats) => {
  const a = toFloat(toNumber(rowA.stats?.statPROD) / 1000);
  const b = toFloat(toNumber(rowB.stats?.statPROD) / 1000);
  return a - b;
};

const numSortStatsProdsPercent = (rowA: IBattleBaseStats, rowB: IBattleBaseStats) => {
  const a = toFloat(rowA.ratio);
  const b = toFloat(rowB.ratio);
  return a - b;
};

export const columnsStats = createDataRows<TableColumn<IBattleBaseStats>>(
  {
    id: ColumnType.Ranking,
    name: 'Rank',
    selector: (row) => toNumber(row.rank),
    sortable: true,
  },
  {
    id: ColumnType.Level,
    name: 'Level',
    selector: (row) => toNumber(row.level),
    sortable: true,
  },
  {
    id: ColumnType.Atk,
    name: 'IV ATK',
    selector: (row) => toNumber(row.IV?.atkIV),
    sortable: true,
  },
  {
    id: ColumnType.Def,
    name: 'IV DEF',
    selector: (row) => toNumber(row.IV?.defIV),
    sortable: true,
  },
  {
    id: ColumnType.Sta,
    name: 'IV STA',
    selector: (row) => toNumber(row.IV?.staIV),
    sortable: true,
  },
  {
    id: ColumnType.CP,
    name: 'CP',
    selector: (row) => toNumber(row.CP),
    sortable: true,
  },
  {
    id: ColumnType.Prod,
    name: 'Stat Prod (*1000)',
    selector: (row) => toFloatWithPadding(toNumber(row.stats?.statPROD) / 1000, 2),
    sortable: true,
    sortFunction: numSortStatsProd,
  },
  {
    id: ColumnType.PercentProd,
    name: 'Stat Prod (%)',
    selector: (row) => toFloatWithPadding(row.ratio, 2, FloatPaddingOption.setOptions({ maxValue: 100, maxLength: 6 })),
    sortable: true,
    sortFunction: numSortStatsProdsPercent,
  }
);

const StatsInfo = () => {
  useTitle({
    title: 'Stats Battle League - Tool',
    description:
      'Analyze Pokémon GO battle league stats with our comprehensive tool. Compare Pokémon performance, CP values, and optimal IVs for competitive play.',
    keywords: ['battle league stats', 'PVP stats', 'Pokémon GO battle stats', 'CP optimization', 'PVP IV calculator'],
  });
  const { searchingToolCurrentDetails } = useSearch();

  const [searchCP, setSearchCP] = useState('');

  const [ATKIv, setATKIv] = useState(0);
  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [battleLeague, setBattleLeague] = useState(BattleLeagueCPType.Little);

  const [statsBattle, setStatsBattle] = useState<IBattleBaseStats[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [submittedSearch, setSubmittedSearch] = useState<{
    cp: number;
    atkIv: number;
    defIv: number;
    staIv: number;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const latestRequestRef = useRef(0);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setPage(1);
    setSubmittedSearch(undefined);
  }, [
    searchingToolCurrentDetails?.statsGO?.atk,
    searchingToolCurrentDetails?.statsGO?.def,
    searchingToolCurrentDetails?.statsGO?.sta,
  ]);

  useEffect(() => {
    const requestId = ++latestRequestRef.current;
    const atk = toNumber(searchingToolCurrentDetails?.statsGO?.atk);
    const def = toNumber(searchingToolCurrentDetails?.statsGO?.def);
    const sta = toNumber(searchingToolCurrentDetails?.statsGO?.sta);
    if (atk <= 0 || def <= 0 || sta <= 0) {
      setStatsBattle([]);
      setTotalRows(0);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    const params: Record<string, string | number> = {
      atk,
      def,
      sta,
      minCp: minCp(),
      maxCp: battleLeague || BattleLeagueCPType.InsMaster,
      minLevel: minLevel(),
      maxLevel: maxLevel(),
      step: stepLevel(),
      minIv: minIv(),
      maxIv: maxIv(),
      page,
      limit: rowsPerPage,
      ...(submittedSearch ?? {}),
    };
    APIService.getFetchUrl<ProcessedDataPage<IBattleBaseStats>>(APIService.getIvRank(params), {
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        setStatsBattle(data.data);
        setTotalRows(data.meta.total);
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          showSnackbar('Unable to load server-calculated IV rankings.', 'error');
        }
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    searchingToolCurrentDetails?.statsGO?.atk,
    searchingToolCurrentDetails?.statsGO?.def,
    searchingToolCurrentDetails?.statsGO?.sta,
    battleLeague,
    page,
    rowsPerPage,
    submittedSearch,
  ]);

  const clearStats = () => {
    setIsLoading(true);
    setStatsBattle([]);
    setTotalRows(0);
    setPage(1);
    setSubmittedSearch(undefined);
    setSearchCP('');
    setATKIv(0);
    setDEFIv(0);
    setSTAIv(0);
  };

  const onSearchStatsPoke = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isNumber(searchCP)) {
        setSubmittedSearch(undefined);
        setPage(1);
        return;
      }
      if (toNumber(searchCP) < minCp()) {
        showSnackbar(`Please input CP greater than or equal to ${minCp()}`, 'error');
        return;
      }
      setSubmittedSearch({ cp: toNumber(searchCP), atkIv: ATKIv, defIv: DEFIv, staIv: STAIv });
      setPage(1);
    },
    [searchCP, ATKIv, DEFIv, STAIv, showSnackbar]
  );

  return (
    <div className="tw-container" style={{ minHeight: 1650 }}>
      <Find isHide clearStats={clearStats} />
      <h1 id="main" className="tw-text-center">
        Stats Battle Table
      </h1>
      <div className="tw-flex tw-justify-center tw-w-full">
        <div className="tw-w-full tw-overflow-x-auto">
          <div className="tw-w-fit tw-mx-auto tw-my-0">
            <ButtonGroupLeague
              className="tw-my-3"
              isFullWidth
              isLoaded={true}
              leagues={leaguesTeamBattle
                .filter((value) => value.cp.length > 0)
                .map((value) => value.cp)
                .flat()}
              onClick={(value) => {
                setBattleLeague(value);
                setPage(1);
              }}
              value={battleLeague}
            />
          </div>
        </div>
      </div>
      <form className="tw-mt-2" onSubmit={onSearchStatsPoke.bind(this)}>
        <div className="form-group tw-flex tw-justify-center tw-text-center">
          <Box className="tw-w-1/2" sx={{ minWidth: 350 }}>
            <div className="input-group tw-mb-3 tw-justify-center">
              <DynamicInputCP
                statATK={searchingToolCurrentDetails?.statsGO?.atk}
                statDEF={searchingToolCurrentDetails?.statsGO?.def}
                statSTA={searchingToolCurrentDetails?.statsGO?.sta}
                ivAtk={ATKIv}
                ivDef={DEFIv}
                ivSta={STAIv}
                searchCP={searchCP}
                setSearchCP={setSearchCP}
                label="Input CP"
                width="50%"
                minWidth={350}
              />
            </div>
          </Box>
        </div>
        <div className="form-group tw-flex tw-justify-center tw-text-center">
          <Box className="tw-w-1/2 tw-min-w-75">
            <div className="tw-flex tw-justify-between">
              <b>ATK</b>
              <b>{ATKIv}</b>
            </div>
            <PokeGoSlider
              value={ATKIv}
              aria-label="ATK marks"
              defaultValue={minIv()}
              min={minIv()}
              max={maxIv()}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(_, v) => {
                setSearchCP('');
                setATKIv(v as number);
              }}
            />
            <div className="tw-flex tw-justify-between">
              <b>DEF</b>
              <b>{DEFIv}</b>
            </div>
            <PokeGoSlider
              value={DEFIv}
              aria-label="DEF marks"
              defaultValue={minIv()}
              min={minIv()}
              max={maxIv()}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(_, v) => {
                setSearchCP('');
                setDEFIv(v as number);
              }}
            />
            <div className="tw-flex tw-justify-between">
              <b>STA</b>
              <b>{STAIv}</b>
            </div>
            <PokeGoSlider
              value={STAIv}
              aria-label="STA marks"
              defaultValue={minIv()}
              min={minIv()}
              max={maxIv()}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(_, v) => {
                setSearchCP('');
                setSTAIv(v as number);
              }}
            />
          </Box>
        </div>
        <div className="form-group tw-flex tw-justify-center tw-text-center tw-mt-2">
          <ButtonMui type="submit" label="Search" />
        </div>
      </form>
      <CustomDataTable
        title={`Stat Battle for ${splitAndCapitalize(searchingToolCurrentDetails?.fullName, '_', ' ')}`}
        columns={columnsStats}
        data={statsBattle}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[25, 50, 100, 250]}
        onChangePage={setPage}
        onChangeRowsPerPage={(value) => {
          setRowsPerPage(value);
          setPage(1);
        }}
        defaultSortFieldId={ColumnType.Ranking}
        striped
        highlightOnHover
        progressPending={isLoading}
        progressComponent={<CircularProgressTable />}
      />
    </div>
  );
};

export default StatsInfo;
