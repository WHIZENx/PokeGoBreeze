import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { capitalize, convertName, splitAndCapitalize } from '../../../util/Utils';
import { rankMove } from '../../../util/Calculate';

import './MoveTable.scss';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from '@mui/material';
import { StoreState } from '../../../store/models/state.model';
import { Combat, CombatPokemon } from '../../../core/models/combat.model';

const TableMove = (props: { data: any; statATK: any; statDEF: any; statSTA: any; form: any; id?: number; maxHeight?: number | string }) => {
  const theme = useTheme();
  const data = useSelector((state: StoreState) => state.store.data);
  const [move, setMove]: any = useState({ data: [] });
  const [moveOrigin, setMoveOrigin]: any = useState(null);

  const [stateSorted, setStateSorted]: any = useState({
    offensive: {
      fast: false,
      charged: false,
      eff: true,
      sortBy: 'eff',
    },
    defensive: {
      fast: false,
      charged: false,
      eff: true,
      sortBy: 'eff',
    },
  });

  const filterMoveType = (combat: CombatPokemon | undefined) => {
    if (!combat) {
      return setMoveOrigin(null);
    }
    return setMoveOrigin({
      fastMoves: combat.quickMoves.map((move) => data?.combat?.find((item) => item.name === move)),
      chargedMoves: combat.cinematicMoves.map((move) => data?.combat?.find((item) => item.name === move)),
      eliteFastMoves: combat.eliteQuickMoves.map((move) => data?.combat?.find((item) => item.name === move)),
      eliteChargedMoves: combat.eliteCinematicMoves.map((move) => data?.combat?.find((item) => item.name === move)),
      purifiedMoves: combat.purifiedMoves.map((move) => data?.combat?.find((item) => item.name === move)),
      shadowMoves: combat.shadowMoves.map((move) => data?.combat?.find((item) => item.name === move)),
    });
  };

  const findMove = useCallback(() => {
    const combatPoke = data?.pokemonCombat?.filter((item) =>
      props.form?.id
        ? item.id === parseInt(props.data?.species.url.split('/')[6])
        : item.name ===
          (typeof props.form === 'string' ? props.form : props.form?.name)?.toUpperCase().replaceAll('-', '_').replace('ARMOR', 'A')
    );
    if (combatPoke) {
      if (combatPoke.length === 1) {
        filterMoveType(combatPoke[0]);
        return setMove(setRankMove(combatPoke[0]));
      } else if (combatPoke.length === 0 && props.id) {
        const combatPoke: any = data?.pokemonCombat?.filter((item) => (item.id === props.id ?? 0) && item.baseSpecies === item.name);
        filterMoveType(combatPoke[0]);
        return setMove(setRankMove(combatPoke[0]));
      }

      const result = combatPoke.find((item) => props.form && item.name === convertName(props.form?.name ?? props.form));
      if (result === undefined) {
        filterMoveType(combatPoke.find((item) => item.name === item.baseSpecies));
        setMove(setRankMove(combatPoke[0]));
      } else {
        filterMoveType(result);
        setMove(setRankMove(result));
      }
    }
  }, [data, props.data, props.statATK, props.statDEF, props.statSTA, props.form]);

  const setRankMove = (result: CombatPokemon) => {
    return rankMove(
      data?.options,
      data?.typeEff,
      data?.weatherBoost,
      data?.combat ?? [],
      result,
      props.statATK,
      props.statDEF,
      props.statSTA,
      props.data?.types.map((item: { type: { name: string } }) => capitalize(item?.type?.name ?? item))
    );
  };

  useEffect(() => {
    if (props.form) {
      findMove();
    }
  }, [findMove, props.form]);

  const renderBestMovesetTable = (value: any, max: number, type: string) => {
    return (
      <tr>
        <td className="text-origin" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
          <Link to={'../move/' + value.fmove.id} className="d-block">
            <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
              <img width={20} height={20} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(value.fmove.type))} />
            </div>
            <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.fmove.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}</span>
            <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
              {value.fmove.elite && (
                <span className="type-icon-small ic elite-ic">
                  <span>Elite</span>
                </span>
              )}
            </span>
          </Link>
        </td>
        <td className="text-origin" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
          <Link to={'../move/' + value.cmove.id} className="d-block">
            <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
              <img width={20} height={20} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(value.cmove.type))} />
            </div>
            <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.cmove.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}</span>
            <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
              {value.cmove.elite && (
                <span className="type-icon-small ic elite-ic">
                  <span>Elite</span>
                </span>
              )}
              {value.cmove.shadow && (
                <span className="type-icon-small ic shadow-ic">
                  <span>Shadow</span>
                </span>
              )}
              {value.cmove.purified && (
                <span className="type-icon-small ic purified-ic">
                  <span>Purified</span>
                </span>
              )}
            </span>
          </Link>
        </td>
        <td className="text-center" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
          {Math.round((value.eDPS[type] * 100) / max)}
        </td>
      </tr>
    );
  };

  const renderMoveSetTable = (data: Combat[]) => {
    return (
      <Fragment>
        {data?.map((value: Combat, index: React.Key) => (
          <tr key={index}>
            <td className="text-origin" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
              <Link to={'../move/' + value.id} className="d-block">
                <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
                  <img width={20} height={20} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(value.type))} />
                </div>
                <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}</span>
                <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
                  {value.elite && (
                    <span className="type-icon-small ic elite-ic">
                      <span>Elite</span>
                    </span>
                  )}
                  {value.shadow && (
                    <span className="type-icon-small ic shadow-ic">
                      <span>Shadow</span>
                    </span>
                  )}
                  {value.purified && (
                    <span className="type-icon-small ic purified-ic">
                      <span>Purified</span>
                    </span>
                  )}
                </span>
              </Link>
            </td>
          </tr>
        ))}
      </Fragment>
    );
  };

  const arrowSort = (table: string, type: string) => {
    const sortedTable = stateSorted[table];
    if (stateSorted[table].sortBy === type) {
      stateSorted[table][type] = !stateSorted[table][type];
    }
    stateSorted[table].sortBy = type;
    return setStateSorted({
      ...stateSorted,
      sortedTable,
    });
  };

  return (
    <Tabs defaultActiveKey="movesList" className="lg-2">
      <Tab eventKey="movesList" title="Moves List">
        <div className="row w-100" style={{ margin: 0, border: '2px solid #b8d4da', background: '#f1ffff' }}>
          <div className="col-xl table-moves-col" style={{ padding: 0, maxHeight: props.maxHeight }}>
            <table className="table-info table-movesets">
              <colgroup className="main-move" />
              <thead>
                <tr className="text-center">
                  <th className="table-sub-header">Fast Moves</th>
                </tr>
              </thead>
              <tbody>{moveOrigin && renderMoveSetTable(moveOrigin.fastMoves.concat(moveOrigin.eliteFastMoves))}</tbody>
            </table>
          </div>
          <div className="col-xl table-moves-col" style={{ padding: 0, maxHeight: props.maxHeight }}>
            <table className="table-info table-moves">
              <colgroup className="main-move" />
              <thead>
                <tr className="text-center">
                  <th className="table-sub-header">Charged Moves</th>
                </tr>
              </thead>
              <tbody>
                {moveOrigin &&
                  renderMoveSetTable(
                    moveOrigin.chargedMoves.concat(moveOrigin.eliteChargedMoves, moveOrigin.purifiedMoves, moveOrigin.shadowMoves)
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </Tab>
      <Tab eventKey="bestEffList" title="Best Moves List">
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl table-moves-col" style={{ padding: 0, maxHeight: props.maxHeight }}>
            <table className="table-info table-moves">
              <colgroup className="main-move" />
              <colgroup className="main-move" />
              <thead>
                <tr className="text-center">
                  <th className="table-sub-header" colSpan={3}>
                    Best Moves Offensive
                  </th>
                </tr>
                <tr className="text-center">
                  <th className="table-column-head main-move cursor-pointer" onClick={() => arrowSort('offensive', 'fast')}>
                    Fast
                    <span style={{ opacity: stateSorted.offensive.sortBy === 'fast' ? 1 : 0.3 }}>
                      {stateSorted.offensive.fast ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                  <th className="table-column-head main-move cursor-pointer" onClick={() => arrowSort('offensive', 'charged')}>
                    Charge
                    <span style={{ opacity: stateSorted.offensive.sortBy === 'charged' ? 1 : 0.3 }}>
                      {stateSorted.offensive.charged ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                  <th className="table-column-head cursor-pointer" onClick={() => arrowSort('offensive', 'eff')}>
                    %
                    <span style={{ opacity: stateSorted.offensive.sortBy === 'eff' ? 1 : 0.3 }}>
                      {stateSorted.offensive.eff ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...move.data]
                  .sort((a, b) => {
                    const sortedBy = stateSorted.offensive.sortBy;
                    if (sortedBy === 'eff') {
                      return stateSorted.offensive.eff ? b.eDPS.offensive - a.eDPS.offensive : a.eDPS.offensive - b.eDPS.offensive;
                    } else {
                      if (a[sortedBy === 'fast' ? 'fmove' : 'cmove'].name < b[sortedBy === 'fast' ? 'fmove' : 'cmove'].name) {
                        return stateSorted.offensive[sortedBy] ? -1 : 1;
                      } else if (a[sortedBy === 'fast' ? 'fmove' : 'cmove'].name > b[sortedBy === 'fast' ? 'fmove' : 'cmove'].name) {
                        return stateSorted.offensive[sortedBy] ? 1 : -1;
                      }
                      return 0;
                    }
                  })
                  .map((value, index: React.Key) => (
                    <Fragment key={index}>{renderBestMovesetTable(value, move.maxOff, 'offensive')}</Fragment>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="col-xl table-moves-col" style={{ padding: 0, maxHeight: props.maxHeight }}>
            <table className="table-info table-moves">
              <colgroup className="main-move" />
              <colgroup className="main-move" />
              <thead>
                <tr className="text-center">
                  <th className="table-sub-header" colSpan={3}>
                    Best Moves Defensive
                  </th>
                </tr>
                <tr className="text-center">
                  <th className="table-column-head main-move cursor-pointer" onClick={() => arrowSort('defensive', 'fast')}>
                    Fast
                    <span style={{ opacity: stateSorted.defensive.sortBy === 'fast' ? 1 : 0.3 }}>
                      {stateSorted.defensive.fast ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                  <th className="table-column-head main-move cursor-pointer" onClick={() => arrowSort('defensive', 'charged')}>
                    Charge
                    <span style={{ opacity: stateSorted.defensive.sortBy === 'charged' ? 1 : 0.3 }}>
                      {stateSorted.defensive.charged ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                  <th className="table-column-head cursor-pointer" onClick={() => arrowSort('defensive', 'eff')}>
                    %
                    <span className="cursor-pointer" style={{ opacity: stateSorted.defensive.sortBy === 'eff' ? 1 : 0.3 }}>
                      {stateSorted.defensive.eff ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...move.data]
                  .sort((a, b) => {
                    const sortedBy = stateSorted.defensive.sortBy;
                    if (sortedBy === 'eff') {
                      return stateSorted.defensive.eff ? b.eDPS.defensive - a.eDPS.defensive : a.eDPS.defensive - b.eDPS.defensive;
                    } else {
                      if (a[sortedBy === 'fast' ? 'fmove' : 'cmove'].name < b[sortedBy === 'fast' ? 'fmove' : 'cmove'].name) {
                        return stateSorted.defensive[sortedBy] ? -1 : 1;
                      } else if (a[sortedBy === 'fast' ? 'fmove' : 'cmove'].name > b[sortedBy === 'fast' ? 'fmove' : 'cmove'].name) {
                        return stateSorted.defensive[sortedBy] ? 1 : -1;
                      }
                      return 0;
                    }
                  })
                  .map((value, index: React.Key) => (
                    <Fragment key={index}>{renderBestMovesetTable(value, move.maxDef, 'defensive')}</Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </Tab>
    </Tabs>
  );
};

export default TableMove;
