import { Box } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

import { marks, PokeGoSlider, splitAndCapitalize } from '../../../util/utils';
import { calStatsProd } from '../../../util/calculate';

import Find from '../../../components/Find/Find';
import { MIN_IV, MAX_IV } from '../../../util/constants';
import { IBattleBaseStats } from '../../../util/models/calculate.model';
import DynamicInputCP from '../../../components/Input/DynamicInputCP';
import { useSelector } from 'react-redux';
import { SearchingState } from '../../../store/models/state.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { combineClasses, toFloat, toFloatWithPadding, toNumber } from '../../../util/extension';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../util/compute';
import { BattleLeagueCPType } from '../../../util/enums/compute.enum';

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
    selector: (row) => toFloatWithPadding(row.ratio, 2),
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

  const currStatBattle = useRef<IBattleBaseStats[]>([]);
  const [battleLeague, setBattleLeague] = useState(BattleLeagueCPType.Little);

  const [statsBattle, setStatsBattle] = useState<IBattleBaseStats[]>([]);

  useEffect(() => {
    const battleTable = calStatsProd(statATK, statDEF, statSTA, 0, battleLeague);
    currStatBattle.current = battleTable;
    setStatsBattle(battleTable);
  }, [statATK, statDEF, statSTA, battleLeague]);

  const clearStats = () => {
    setBattleLeague(BattleLeagueCPType.Little);
    setSearchCP('');
    setATKIv(0);
    setDEFIv(0);
    setSTAIv(0);
  };

  const clearStatsPoke = useCallback(() => {
    setStatsBattle(calStatsProd(statATK, statDEF, statSTA, 0, battleLeague));
  }, [battleLeague, statATK, statDEF, statSTA]);

  const searchStatsPoke = useCallback(() => {
    setStatsBattle(
      [...currStatBattle.current].filter(
        (item) => item.CP === toNumber(searchCP) && item.IV && item.IV.atk === ATKIv && item.IV.def === DEFIv && item.IV.sta === STAIv
      )
    );
  }, [searchCP, ATKIv, DEFIv, STAIv]);

  const onSearchStatsPoke = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      searchStatsPoke();
    },
    [searchStatsPoke]
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
      <div className="d-flex text-center" style={{ marginTop: 15, marginBottom: 15, gap: 10, overflowX: 'auto' }}>
        <button
          className={combineClasses('btn btn-form', battleLeague === BattleLeagueCPType.Little ? 'form-selected' : '')}
          style={{ height: 200 }}
          onClick={() => setBattleLeague(BattleLeagueCPType.Little)}
        >
          <img alt="img-league" width={128} height={128} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Little)} />
          <div>
            <b>{getPokemonBattleLeagueName(BattleLeagueCPType.Little)}</b>
          </div>
          <span className="text-danger">CP below {BattleLeagueCPType.Little}</span>
        </button>
        <button
          className={combineClasses('btn btn-form', battleLeague === BattleLeagueCPType.Great ? 'form-selected' : '')}
          style={{ height: 200 }}
          onClick={() => setBattleLeague(BattleLeagueCPType.Great)}
        >
          <img alt="img-league" width={128} height={128} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Great)} />
          <div>
            <b>{getPokemonBattleLeagueName(BattleLeagueCPType.Great)}</b>
          </div>
          <span className="text-danger">CP below {BattleLeagueCPType.Great}</span>
        </button>
        <button
          className={combineClasses('btn btn-form', battleLeague === BattleLeagueCPType.Ultra ? 'form-selected' : '')}
          style={{ height: 200 }}
          onClick={() => setBattleLeague(BattleLeagueCPType.Ultra)}
        >
          <img alt="img-league" width={128} height={128} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Ultra)} />
          <div>
            <b>{getPokemonBattleLeagueName(BattleLeagueCPType.Ultra)}</b>
          </div>
          <span className="text-danger">CP below {BattleLeagueCPType.Ultra}</span>
        </button>
        <button
          className={combineClasses('btn btn-form', battleLeague === 0 ? 'form-selected' : '')}
          style={{ height: 200 }}
          onClick={() => setBattleLeague(0)}
        >
          <img alt="img-league" width={128} height={128} src={getPokemonBattleLeagueIcon()} />
          <div>
            <b>{getPokemonBattleLeagueName()}</b>
          </div>
          <span className="text-danger">No limit CP</span>
        </button>
      </div>
      <form className="element-top" onSubmit={onSearchStatsPoke.bind(this)}>
        <div className="form-group d-flex justify-content-center text-center">
          <Box sx={{ width: '50%', minWidth: 350 }}>
            <div className="input-group mb-3">
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
          <button type="button" className="btn btn-danger" style={{ marginRight: 15 }} onClick={() => clearStatsPoke()}>
            Clear
          </button>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>
      <DataTable
        title={`Stat Battle for ${name}`}
        columns={columnsStats}
        data={statsBattle}
        pagination={true}
        defaultSortFieldId={1}
        striped={true}
        highlightOnHover={true}
      />
    </div>
  );
};

export default StatsTable;
