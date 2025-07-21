import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { TableColumn } from 'react-data-table-component';

import { createDataRows, marks, PokeGoSlider, splitAndCapitalize } from '../../../utils/utils';
import { calStatsProd, sortStatsProd } from '../../../utils/calculate';

import Find from '../../../components/Find/Find';
import { leaguesTeamBattle } from '../../../utils/constants';
import { IBattleBaseStats } from '../../../utils/models/calculate.model';
import DynamicInputCP from '../../../components/Commons/Input/DynamicInputCP';
import { useTitle } from '../../../utils/hooks/useTitle';
import { isNotEmpty, isNumber, toFloat, toFloatWithPadding, toNumber } from '../../../utils/extension';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { ColumnType, VariantType } from '../../../enums/type.enum';
import { useSnackbar } from 'notistack';
import { FloatPaddingOption } from '../../../utils/models/extension.model';
import { debounce } from 'lodash';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../../components/Commons/Table/CustomDataTable/CustomDataTable';
import { maxIv, minCp, minIv, statsDelay } from '../../../utils/helpers/options-context.helpers';
import useSearch from '../../../composables/useSearch';
import ButtonMui from '../../../components/Commons/Button/ButtonMui';
import ButtonGroupLeague from '../../../components/Commons/Button/ButtonGroupLeague';

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
  const [filterStatsBattle, setFilterStatsBattle] = useState<IBattleBaseStats[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const controller = new AbortController();
    if (isNotEmpty(statsBattle)) {
      setStatsBattle([]);
      setIsLoading(true);
    }
    if (
      toNumber(searchingToolCurrentDetails?.statsGO?.atk) > 0 &&
      toNumber(searchingToolCurrentDetails?.statsGO?.def) > 0 &&
      toNumber(searchingToolCurrentDetails?.statsGO?.sta) > 0
    ) {
      calculateStats(controller.signal)
        .then((data) => {
          setStatsBattle(data);
        })
        .catch(() => setStatsBattle([]));
    }
    return () => controller.abort();
  }, [
    searchingToolCurrentDetails?.statsGO?.atk,
    searchingToolCurrentDetails?.statsGO?.def,
    searchingToolCurrentDetails?.statsGO?.sta,
  ]);

  const calculateStats = (signal: AbortSignal, delay = statsDelay()) => {
    return new Promise<IBattleBaseStats[]>((resolve, reject) => {
      let result: IBattleBaseStats[] = [];

      const abortHandler = () => {
        debouncedResolve.cancel();
        reject();
      };

      const resolveHandler = () => {
        if (signal instanceof AbortSignal) {
          signal.removeEventListener('abort', abortHandler);
        }
        result = calStatsProd(
          toNumber(searchingToolCurrentDetails?.statsGO?.atk),
          toNumber(searchingToolCurrentDetails?.statsGO?.def),
          toNumber(searchingToolCurrentDetails?.statsGO?.sta),
          minCp(),
          BattleLeagueCPType.InsMaster,
          true
        );
        resolve(result);
      };

      const debouncedResolve = debounce(resolveHandler, delay);

      debouncedResolve();

      if (signal instanceof AbortSignal) {
        signal.addEventListener('abort', abortHandler, { once: true });
      }
    });
  };

  useEffect(() => {
    if (isNotEmpty(statsBattle)) {
      setIsLoading(true);
      setTimeout(() => {
        const result = statsBattle.filter((stats) => toNumber(stats.CP) <= battleLeague);
        setFilterStatsBattle(sortStatsProd(result));
        setIsLoading(false);
      }, 500);
    }
  }, [statsBattle, battleLeague]);

  const clearStats = () => {
    setIsLoading(true);
    setStatsBattle([]);
    setFilterStatsBattle([]);
    setSearchCP('');
    setATKIv(0);
    setDEFIv(0);
    setSTAIv(0);
  };

  const onSearchStatsPoke = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isNumber(searchCP)) {
        const result = statsBattle.filter((stats) => toNumber(stats.CP) <= battleLeague);
        setFilterStatsBattle(result);
        return;
      }
      if (toNumber(searchCP) < minCp()) {
        enqueueSnackbar(`Please input CP greater than or equal to ${minCp()}`, { variant: VariantType.Error });
        return;
      }
      if (isNotEmpty(statsBattle)) {
        const result = statsBattle.filter(
          (stats) =>
            toNumber(stats.CP) === toNumber(searchCP) &&
            stats.IV &&
            stats.IV.atkIV === ATKIv &&
            stats.IV.defIV === DEFIv &&
            stats.IV.staIV === STAIv
        );
        setFilterStatsBattle(result);
      }
    },
    [searchCP, statsBattle, ATKIv, DEFIv, STAIv]
  );

  return (
    <div className="container" style={{ minHeight: 1650 }}>
      <Find isHide clearStats={clearStats} />
      <h1 id="main" className="text-center">
        Stats Battle Table
      </h1>
      <div className="d-flex justify-content-center w-100">
        <div className="w-100 overflow-x-auto">
          <div className="w-fit-content" style={{ margin: '0 auto' }}>
            <ButtonGroupLeague
              className="my-3"
              isFullWidth
              isLoaded={true}
              leagues={leaguesTeamBattle
                .filter((value) => value.cp.length > 0)
                .map((value) => value.cp)
                .flat()}
              onClick={(value) => setBattleLeague(value)}
              value={battleLeague}
            />
          </div>
        </div>
      </div>
      <form className="mt-2" onSubmit={onSearchStatsPoke.bind(this)}>
        <div className="form-group d-flex justify-content-center text-center">
          <Box className="w-50" sx={{ minWidth: 350 }}>
            <div className="input-group mb-3 justify-content-center">
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
        <div className="form-group d-flex justify-content-center text-center">
          <Box className="w-50" sx={{ minWidth: 300 }}>
            <div className="d-flex justify-content-between">
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
            <div className="d-flex justify-content-between">
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
            <div className="d-flex justify-content-between">
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
        <div className="form-group d-flex justify-content-center text-center mt-2">
          <ButtonMui type="submit" label="Search" />
        </div>
      </form>
      <CustomDataTable
        title={`Stat Battle for ${splitAndCapitalize(searchingToolCurrentDetails?.fullName, '_', ' ')}`}
        columns={columnsStats}
        data={filterStatsBattle}
        pagination
        defaultSortFieldId={ColumnType.Level}
        striped
        highlightOnHover
        progressPending={isLoading}
        progressComponent={<CircularProgressTable />}
      />
    </div>
  );
};

export default StatsInfo;
