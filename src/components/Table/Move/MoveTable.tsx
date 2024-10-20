/* eslint-disable no-unused-vars */
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { capitalize, convertPokemonAPIDataName, splitAndCapitalize } from '../../../util/utils';
import { rankMove } from '../../../util/calculate';

import './MoveTable.scss';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from '@mui/material';
import { StoreState } from '../../../store/models/state.model';
import { Combat, ICombat } from '../../../core/models/combat.model';
import { FORM_GMAX, FORM_PURIFIED, FORM_SHADOW, SHADOW_ATK_BONUS, SHADOW_DEF_BONUS } from '../../../util/constants';
import { IPokemonQueryMove, IPokemonQueryRankMove, PokemonQueryRankMove } from '../../../util/models/pokemon-top-move.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ITableMoveComponent } from '../../models/component.model';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { DynamicObj, getValueOrDefault, isEqual, isNotEmpty, isUndefined } from '../../../util/extension';
import { EqualMode } from '../../../util/enums/string.enum';
import { TableType, TypeSorted } from './enums/table-type.enum';

interface PokemonMoves {
  fastMoves: ICombat[];
  chargedMoves: ICombat[];
  eliteFastMoves: ICombat[];
  eliteChargedMoves: ICombat[];
  purifiedMoves: ICombat[];
  shadowMoves: ICombat[];
  specialMoves: ICombat[];
}

interface ISortModel {
  fast: boolean;
  charged: boolean;
  eff: boolean;
  sortBy: TypeSorted;
}

class SortModel implements ISortModel {
  fast = false;
  charged = false;
  eff = false;
  sortBy = TypeSorted.Eff;
}

interface ITableSort {
  offensive: ISortModel;
  defensive: ISortModel;
}

class TableSort implements ITableSort {
  offensive = new SortModel();
  defensive = new SortModel();

  constructor({ ...props }: ITableSort) {
    Object.assign(this, props);
  }
}

const TableMove = (props: ITableMoveComponent) => {
  const theme = useTheme<ThemeModify>();
  const data = useSelector((state: StoreState) => state.store.data);
  const [move, setMove] = useState<IPokemonQueryRankMove>(new PokemonQueryRankMove());
  const [moveOrigin, setMoveOrigin] = useState<PokemonMoves>();

  const [stateSorted, setStateSorted] = useState(
    new TableSort({
      offensive: {
        fast: false,
        charged: false,
        eff: true,
        sortBy: TypeSorted.Eff,
      },
      defensive: {
        fast: false,
        charged: false,
        eff: true,
        sortBy: TypeSorted.Eff,
      },
    })
  );

  const { offensive, defensive } = stateSorted;

  const filterUnknownMove = (moves: string[] | undefined) => {
    return getValueOrDefault(
      Array,
      moves?.map((move) => data?.combat?.find((item) => isEqual(item.name, move)) ?? new Combat()).filter((move) => move.id > 0)
    );
  };

  const filterMoveType = (combat: IPokemonData | undefined) => {
    if (!combat) {
      return setMoveOrigin(undefined);
    }
    return setMoveOrigin({
      fastMoves: filterUnknownMove(combat.quickMoves),
      chargedMoves: filterUnknownMove(combat.cinematicMoves),
      eliteFastMoves: filterUnknownMove(combat.eliteQuickMove),
      eliteChargedMoves: filterUnknownMove(combat.eliteCinematicMove),
      purifiedMoves: props.form?.isShadow ? [] : filterUnknownMove(combat.purifiedMoves),
      shadowMoves: props.form?.isPurified ? [] : filterUnknownMove(combat.shadowMoves),
      specialMoves: filterUnknownMove(combat.specialMoves),
    });
  };

  const findMove = useCallback(() => {
    const combatPoke = data?.pokemon?.filter((item) =>
      props.form?.id || props.form?.isShadow || props.form?.isPurified
        ? item.num === getValueOrDefault(Number, props.data?.num)
        : isEqual(
            item.fullName,
            (typeof props.form === 'string' ? props.form : props.form?.name)?.replaceAll('-', '_'),
            EqualMode.IgnoreCaseSensitive
          )
    );
    if (isNotEmpty(combatPoke)) {
      if (
        combatPoke?.length === 1 ||
        isEqual(typeof props.form === 'string' ? props.form : props.form?.formName, FORM_GMAX, EqualMode.IgnoreCaseSensitive)
      ) {
        filterMoveType(combatPoke?.at(0));
        return setMove(setRankMove(combatPoke?.at(0)));
      } else if (!isNotEmpty(combatPoke) && props.id) {
        const combatPoke = data?.pokemon?.filter(
          (item) => item.num === getValueOrDefault(Number, props.id) && isEqual(item.baseSpecies, item.name)
        );
        filterMoveType(combatPoke?.at(0));
        return setMove(setRankMove(combatPoke?.at(0)));
      }

      const formName = convertPokemonAPIDataName(props.form?.name);
      const result = combatPoke?.find((item) => props.form && isEqual(item.fullName, formName));
      if (isUndefined(result)) {
        filterMoveType(combatPoke?.find((item) => isEqual(item.name, item.baseSpecies)));
        setMove(setRankMove(combatPoke?.at(0)));
      } else {
        filterMoveType(result);
        setMove(setRankMove(result));
      }
    }
  }, [data, props.data, props.statATK, props.statDEF, props.statSTA]);

  const setRankMove = (result: IPokemonData | undefined) => {
    return rankMove(
      data?.options,
      data?.typeEff,
      data?.weatherBoost,
      getValueOrDefault(Array, data?.combat),
      result,
      props.statATK * (props.form?.isShadow ? SHADOW_ATK_BONUS(data?.options) : 1),
      props.statDEF * (props.form?.isShadow ? SHADOW_DEF_BONUS(data?.options) : 1),
      props.statSTA,
      getValueOrDefault(
        Array,
        props.data?.types?.map((type) => capitalize(type))
      )
    );
  };

  useEffect(() => {
    setMoveOrigin(undefined);
    setMove(new PokemonQueryRankMove());
    if (props.form) {
      findMove();
    }
  }, [findMove, props.form]);

  const renderBestMovesetTable = (value: IPokemonQueryMove, max: number, type: TableType) => {
    return (
      <tr>
        <td className="text-origin" style={{ backgroundColor: theme.palette.background.tablePrimary }}>
          <Link to={`../move/${value.fMove.id}`} className="d-block">
            <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
              <img width={20} height={20} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(value.fMove.type))} />
            </div>
            <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.fMove.name.toLowerCase(), '_', ' ')}</span>
            <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
              {value.fMove.elite && (
                <span className="type-icon-small ic elite-ic">
                  <span>Elite</span>
                </span>
              )}
            </span>
          </Link>
        </td>
        <td className="text-origin" style={{ backgroundColor: theme.palette.background.tablePrimary }}>
          <Link to={`../move/${value.cMove.id}`} className="d-block">
            <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
              <img width={20} height={20} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(value.cMove.type))} />
            </div>
            <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.cMove.name.toLowerCase(), '_', ' ')}</span>
            <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
              {value.cMove.elite && (
                <span className="type-icon-small ic elite-ic">
                  <span>Elite</span>
                </span>
              )}
              {value.cMove.shadow && (
                <span className="type-icon-small ic shadow-ic">
                  <span>{capitalize(FORM_SHADOW)}</span>
                </span>
              )}
              {value.cMove.purified && (
                <span className="type-icon-small ic purified-ic">
                  <span>{capitalize(FORM_PURIFIED)}</span>
                </span>
              )}
              {value.cMove.special && (
                <span className="type-icon-small ic special-ic">
                  <span>Special</span>
                </span>
              )}
            </span>
          </Link>
        </td>
        <td className="text-center" style={{ backgroundColor: theme.palette.background.tablePrimary }}>
          {Math.round(((type === TableType.Offensive ? value.eDPS.offensive : value.eDPS.defensive) * 100) / max)}
        </td>
      </tr>
    );
  };

  const renderMoveSetTable = (data: ICombat[]) => {
    return (
      <Fragment>
        {data.map((value, index) => (
          <tr key={index}>
            <td className="text-origin" style={{ backgroundColor: theme.palette.background.tablePrimary }}>
              <Link to={`../move/${value.id}`} className="d-block">
                <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
                  <img width={20} height={20} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(value.type))} />
                </div>
                <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.name.toLowerCase(), '_', ' ')}</span>
                <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
                  {value.elite && (
                    <span className="type-icon-small ic elite-ic">
                      <span>Elite</span>
                    </span>
                  )}
                  {value.shadow && (
                    <span className="type-icon-small ic shadow-ic">
                      <span>{capitalize(FORM_SHADOW)}</span>
                    </span>
                  )}
                  {value.purified && (
                    <span className="type-icon-small ic purified-ic">
                      <span>{capitalize(FORM_PURIFIED)}</span>
                    </span>
                  )}
                  {value.special && (
                    <span className="type-icon-small ic special-ic">
                      <span>Special</span>
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

  const arrowSort = (table: TableType, type: TypeSorted) => {
    if (table === TableType.Offensive) {
      if (offensive.sortBy === type) {
        const prev = (offensive as unknown as DynamicObj<boolean>)[type];
        (offensive as unknown as DynamicObj<boolean>)[type] = !prev;
      }
      offensive.sortBy = type;
    } else if (table === TableType.Defensive) {
      if (defensive.sortBy === type) {
        const prev = (defensive as unknown as DynamicObj<boolean>)[type];
        (defensive as unknown as DynamicObj<boolean>)[type] = !prev;
      }
      defensive.sortBy = type;
    }
    return setStateSorted({
      ...stateSorted,
      offensive,
      defensive,
    });
  };

  const sortFunc = (rowA: IPokemonQueryMove, rowB: IPokemonQueryMove, type: TableType) => {
    const sortedBy = stateSorted[type].sortBy;
    const sortedColumn = sortedBy === TypeSorted.Fast ? 'fMove' : 'cMove';
    const result = stateSorted[type] as unknown as DynamicObj<boolean | string>;
    if (sortedBy === TypeSorted.Eff) {
      return stateSorted[type].eff ? rowB.eDPS[type] - rowA.eDPS[type] : rowA.eDPS[type] - rowB.eDPS[type];
    }
    const a = getValueOrDefault(String, rowA[sortedColumn]?.name.toLowerCase());
    const b = getValueOrDefault(String, rowB[sortedColumn]?.name.toLowerCase());
    return a === b ? 0 : a > b ? (result[sortedBy] ? 1 : -1) : result[sortedBy] ? -1 : 1;
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
                    moveOrigin.chargedMoves.concat(
                      moveOrigin.eliteChargedMoves,
                      moveOrigin.purifiedMoves,
                      moveOrigin.shadowMoves,
                      moveOrigin.specialMoves
                    )
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
                  <th
                    className="table-column-head main-move cursor-pointer"
                    onClick={() => arrowSort(TableType.Offensive, TypeSorted.Fast)}
                  >
                    Fast
                    <span style={{ opacity: stateSorted.offensive.sortBy === TypeSorted.Fast ? 1 : 0.3 }}>
                      {stateSorted.offensive.fast ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                  <th
                    className="table-column-head main-move cursor-pointer"
                    onClick={() => arrowSort(TableType.Offensive, TypeSorted.Charge)}
                  >
                    Charged
                    <span style={{ opacity: stateSorted.offensive.sortBy === TypeSorted.Charge ? 1 : 0.3 }}>
                      {stateSorted.offensive.charged ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                  <th className="table-column-head cursor-pointer" onClick={() => arrowSort(TableType.Offensive, TypeSorted.Eff)}>
                    %
                    <span style={{ opacity: stateSorted.offensive.sortBy === TypeSorted.Eff ? 1 : 0.3 }}>
                      {stateSorted.offensive.eff ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {move.data
                  .sort((a, b) => sortFunc(a, b, TableType.Offensive))
                  .map((value, index) => (
                    <Fragment key={index}>
                      {renderBestMovesetTable(value, getValueOrDefault(Number, move.maxOff), TableType.Offensive)}
                    </Fragment>
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
                  <th
                    className="table-column-head main-move cursor-pointer"
                    onClick={() => arrowSort(TableType.Defensive, TypeSorted.Fast)}
                  >
                    Fast
                    <span style={{ opacity: stateSorted.defensive.sortBy === TypeSorted.Fast ? 1 : 0.3 }}>
                      {stateSorted.defensive.fast ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                  <th
                    className="table-column-head main-move cursor-pointer"
                    onClick={() => arrowSort(TableType.Defensive, TypeSorted.Charge)}
                  >
                    Charged
                    <span style={{ opacity: stateSorted.defensive.sortBy === TypeSorted.Charge ? 1 : 0.3 }}>
                      {stateSorted.defensive.charged ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                  <th className="table-column-head cursor-pointer" onClick={() => arrowSort(TableType.Defensive, TypeSorted.Eff)}>
                    %
                    <span className="cursor-pointer" style={{ opacity: stateSorted.defensive.sortBy === TypeSorted.Eff ? 1 : 0.3 }}>
                      {stateSorted.defensive.eff ? <ArrowDropDownIcon fontSize="small" /> : <ArrowDropUpIcon fontSize="small" />}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {move.data
                  .sort((a, b) => sortFunc(a, b, TableType.Defensive))
                  .map((value, index) => (
                    <Fragment key={index}>
                      {renderBestMovesetTable(value, getValueOrDefault(Number, move.maxDef), TableType.Defensive)}
                    </Fragment>
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
