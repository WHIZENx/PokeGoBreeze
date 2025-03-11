import { Box, CircularProgress } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

import { marks, PokeGoSlider, splitAndCapitalize } from '../../../util/utils';
import { calStatsProd, sortStatsProd } from '../../../util/calculate';

import Find from '../../../components/Find/Find';
import { MIN_IV, MAX_IV, MIN_CP, leaguesTeamBattle } from '../../../util/constants';
import { IBattleBaseStats } from '../../../util/models/calculate.model';
import DynamicInputCP from '../../../components/Input/DynamicInputCP';
import { useSelector } from 'react-redux';
import { SearchingState } from '../../../store/models/state.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { combineClasses, isNotEmpty, isNumber, toFloat, toFloatWithPadding, toNumber } from '../../../util/extension';
import { BattleLeagueCPType } from '../../../util/enums/compute.enum';
import { VariantType } from '../../../enums/type.enum';
import { useSnackbar } from 'notistack';
import { FloatPaddingOption } from '../../../util/models/extension.model';

const numSortStatsProd = (rowA: IBattleBaseStats, rowB: IBattleBaseStats) => {
  const a = toFloat(toNumber(rowA.statsProds) / 1000);
  const b = toFloat(toNumber(rowB.statsProds) / 1000);
  return a - b;
};

const numSortStatsProdsPercent = (rowA: IBattleBaseStats, rowB: IBattleBaseStats) => {
  const a = toFloat(rowA.ratio);
  const b = toFloat(rowB.ratio);
  return a - b;
};

export const columnsStats: TableColumn<IBattleBaseStats>[] = [
  {
    name: 'Rank',
    selector: (row) => toNumber(row.rank),
    sortable: true,
  },
  {
    name: 'Level',
    selector: (row) => toNumber(row.level),
    sortable: true,
  },
  {
    name: 'IV ATK',
    selector: (row) => toNumber(row.IV?.atk),
    sortable: true,
  },
  {
    name: 'IV DEF',
    selector: (row) => toNumber(row.IV?.def),
    sortable: true,
  },
  {
    name: 'IV STA',
    selector: (row) => toNumber(row.IV?.sta),
    sortable: true,
  },
  {
    name: 'CP',
    selector: (row) => toNumber(row.CP),
    sortable: true,
  },
  {
    name: 'Stat Prod (*1000)',
    selector: (row) => toFloatWithPadding(toNumber(row.statsProds) / 1000, 2),
    sortable: true,
    sortFunction: numSortStatsProd,
  },
  {
    name: 'Stat Prod (%)',
    selector: (row) => toFloatWithPadding(row.ratio, 2, FloatPaddingOption.setOptions({ maxValue: 100 })),
    sortable: true,
    sortFunction: numSortStatsProdsPercent,
  },
];

const StatsTable = () => {
  useChangeTitle('Stats Battle League - Tool');
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);
  const [name, setName] = useState(splitAndCapitalize(searching?.fullName, '-', ' '));

  const [searchCP, setSearchCP] = useState('');

  const [ATKIv, setATKIv] = useState(0);
  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

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
    if (statATK > 0 && statDEF > 0 && statSTA > 0) {
      calculateStats(controller.signal)
        .then((data) => {
          setStatsBattle(data);
        })
        .catch(() => setStatsBattle([]));
    }
    return () => controller.abort();
  }, [statATK, statDEF, statSTA]);

  const calculateStats = (signal: AbortSignal, delay = 3000) => {
    return new Promise<IBattleBaseStats[]>((resolve, reject) => {
      let result: IBattleBaseStats[] = [];
      let timeout: NodeJS.Timeout | number;
      const abortHandler = () => {
        clearTimeout(timeout);
        reject();
      };

      const resolveHandler = () => {
        if (signal instanceof AbortSignal) {
          signal.removeEventListener('abort', abortHandler);
        }
        result = calStatsProd(statATK, statDEF, statSTA, MIN_CP, BattleLeagueCPType.InsMaster, true);
        resolve(result);
      };

      timeout = setTimeout(resolveHandler, delay, result);

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
      if (toNumber(searchCP) < MIN_CP) {
        enqueueSnackbar(`Please input CP greater than or equal to ${MIN_CP}`, { variant: VariantType.Error });
        return;
      }
      if (isNotEmpty(statsBattle)) {
        const result = statsBattle.filter(
          (stats) =>
            toNumber(stats.CP) === toNumber(searchCP) &&
            stats.IV &&
            stats.IV.atk === ATKIv &&
            stats.IV.def === DEFIv &&
            stats.IV.sta === STAIv
        );
        setFilterStatsBattle(result);
      }
    },
    [searchCP, statsBattle, ATKIv, DEFIv, STAIv]
  );

  return (
    <div className="container" style={{ minHeight: 1650 }}>
      <Find
        isHide={true}
        clearStats={clearStats}
        setStatATK={setStatATK}
        setStatDEF={setStatDEF}
        setStatSTA={setStatSTA}
        setName={setName}
      />
      <h1 id="main" className="text-center">
        Stats Battle Table
      </h1>
      <div className="w-100" style={{ overflowX: 'auto' }}>
        <div style={{ width: 'fit-content', margin: '0 auto' }}>
          <div className="d-flex text-center" style={{ marginTop: 15, marginBottom: 15, gap: 10 }}>
            {leaguesTeamBattle.map((value, index) => (
              <button
                key={index}
                className={combineClasses('btn btn-form', battleLeague === value.cp[0] ? 'form-selected' : '')}
                style={{ height: 200 }}
                onClick={() => setBattleLeague(value.cp[0])}
              >
                <img alt="img-league" width={128} height={128} src={value.logo} />
                <div>
                  <b>{value.name}</b>
                </div>
                <span className="text-danger">CP below {value.cp[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <form className="element-top" onSubmit={onSearchStatsPoke.bind(this)}>
        <div className="form-group d-flex justify-content-center text-center">
          <Box sx={{ width: '50%', minWidth: 350 }}>
            <div className="input-group mb-3" style={{ justifyContent: 'center' }}>
              <DynamicInputCP
                statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
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
          <Box sx={{ width: '50%', minWidth: 300 }}>
            <div className="d-flex justify-content-between">
              <b>ATK</b>
              <b>{ATKIv}</b>
            </div>
            <PokeGoSlider
              value={ATKIv}
              aria-label="ATK marks"
              defaultValue={MIN_IV}
              min={MIN_IV}
              max={MAX_IV}
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
              defaultValue={MIN_IV}
              min={MIN_IV}
              max={MAX_IV}
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
              defaultValue={MIN_IV}
              min={MIN_IV}
              max={MAX_IV}
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
        <div className="form-group d-flex justify-content-center text-center element-top">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>
      <DataTable
        title={`Stat Battle for ${name}`}
        columns={columnsStats}
        data={filterStatsBattle}
        pagination={true}
        defaultSortFieldId={1}
        striped={true}
        highlightOnHover={true}
        progressPending={isLoading}
        progressComponent={
          <div style={{ margin: 10 }}>
            <CircularProgress />
          </div>
        }
      />
    </div>
  );
};

export default StatsTable;
