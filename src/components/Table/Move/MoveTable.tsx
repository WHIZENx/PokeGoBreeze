import React, { Fragment, useEffect, useState } from 'react';
import { getAllMoves, getKeyWithData, splitAndCapitalize } from '../../../util/utils';
import { rankMove } from '../../../util/calculate';

import './MoveTable.scss';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { StoreState } from '../../../store/models/state.model';
import { Combat, ICombat } from '../../../core/models/combat.model';
import {
  IPokemonQueryMove,
  IPokemonQueryRankMove,
  PokemonQueryRankMove,
} from '../../../util/models/pokemon-top-move.model';
import { ITableMoveComponent } from '../../models/component.model';
import {
  combineClasses,
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isEqual,
  isNotEmpty,
  isUndefined,
  toFloatWithPadding,
  toNumber,
} from '../../../util/extension';
import { TableType, TypeSorted } from './enums/table-type.enum';
import { MoveType, PokemonType } from '../../../enums/type.enum';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import { FloatPaddingOption } from '../../../util/models/extension.model';
import { IPokemonDetail } from '../../../core/models/API/info.model';
import IconType from '../../Sprites/Icon/Type/Type';

interface PokemonMoves {
  fastMoves: ICombat[];
  chargedMoves: ICombat[];
  eliteFastMoves: ICombat[];
  eliteChargedMoves: ICombat[];
  purifiedMoves: ICombat[];
  shadowMoves: ICombat[];
  specialMoves: ICombat[];
  exclusiveMoves: ICombat[];
  dynamaxMoves: ICombat[];
}

interface ISortModel {
  fast: boolean;
  charged: boolean;
  effective: boolean;
  sortBy: TypeSorted;
}

class SortModel implements ISortModel {
  fast = false;
  charged = false;
  effective = false;
  sortBy = TypeSorted.Effective;
}

interface ITableSort {
  offensive: ISortModel;
  defensive: ISortModel;
  disableSortFM: boolean;
  disableSortCM: boolean;
}

class TableSort implements ITableSort {
  offensive = new SortModel();
  defensive = new SortModel();
  disableSortFM = true;
  disableSortCM = true;

  constructor({ ...props }: ITableSort) {
    Object.assign(this, props);
  }
}

const TableMove = (props: ITableMoveComponent) => {
  const data = useSelector((state: StoreState) => state.store.data);
  const [move, setMove] = useState<IPokemonQueryRankMove>(new PokemonQueryRankMove());
  const [moveOrigin, setMoveOrigin] = useState<PokemonMoves>();

  const [stateSorted, setStateSorted] = useState(
    new TableSort({
      offensive: {
        fast: false,
        charged: false,
        effective: true,
        sortBy: TypeSorted.Effective,
      },
      defensive: {
        fast: false,
        charged: false,
        effective: true,
        sortBy: TypeSorted.Effective,
      },
      disableSortFM: true,
      disableSortCM: true,
    })
  );

  const { offensive, defensive, disableSortFM, disableSortCM } = stateSorted;

  const filterUnknownMove = (moves: string[] | undefined) => {
    return getValueOrDefault(
      Array,
      moves
        ?.map((move) => data.combats.find((item) => isEqual(item.name, move)) ?? new Combat())
        .filter((move) => move.id > 0)
    );
  };

  const filterMoveType = (pokemon: Partial<IPokemonDetail> | undefined) => {
    if (!pokemon) {
      setMoveOrigin(undefined);
      setMove(new PokemonQueryRankMove());
      return;
    }
    setMoveOrigin({
      fastMoves: filterUnknownMove(pokemon.quickMoves),
      chargedMoves: filterUnknownMove(pokemon.cinematicMoves),
      eliteFastMoves: filterUnknownMove(pokemon.eliteQuickMoves),
      eliteChargedMoves: filterUnknownMove(pokemon.eliteCinematicMoves),
      purifiedMoves: pokemon.pokemonType === PokemonType.Shadow ? [] : filterUnknownMove(pokemon.purifiedMoves),
      shadowMoves: pokemon.pokemonType === PokemonType.Purified ? [] : filterUnknownMove(pokemon.shadowMoves),
      specialMoves: filterUnknownMove(pokemon.specialMoves),
      exclusiveMoves: filterUnknownMove(pokemon.exclusiveMoves),
      dynamaxMoves: filterUnknownMove(pokemon.dynamaxMoves),
    });
    setMove(
      setRankMove({
        ...pokemon,
        purifiedMoves: pokemon.pokemonType === PokemonType.Shadow ? [] : pokemon.purifiedMoves,
        shadowMoves: pokemon.pokemonType === PokemonType.Purified ? [] : pokemon.shadowMoves,
      })
    );
  };

  const setRankMove = (result: Partial<IPokemonDetail>) => {
    return rankMove(
      data.options,
      data.typeEff,
      data.weatherBoost,
      data.combats,
      result,
      result.statsGO?.atk,
      result.statsGO?.def,
      result.statsGO?.sta,
      result.types
    );
  };

  useEffect(() => {
    if (!isUndefined(props.pokemonData?.pokemonType)) {
      setMoveOrigin(undefined);
      setMove(new PokemonQueryRankMove());
      if (props.pokemonData && isNotEmpty(getAllMoves(props.pokemonData))) {
        filterMoveType(props.pokemonData);
      }
    }
  }, [props.pokemonData, props.pokemonData?.pokemonType]);

  const renderTable = (table: TableType) => {
    const tableType = getPropertyName<TableSort, 'defensive' | 'offensive'>(stateSorted, (o) =>
      table === TableType.Offensive ? o.offensive : o.defensive
    );
    const max = table === TableType.Offensive ? move.maxOff : move.maxDef;
    return (
      <div className="col-xl table-moves-col" style={{ padding: 0, maxHeight: props.maxHeight }}>
        <table className="table-info table-moves">
          <colgroup className="main-move" />
          <colgroup className="main-move" />
          <thead>
            <tr className="text-center">
              <th className="table-sub-header" colSpan={3}>
                {`Best Moves ${getKeyWithData(TableType, table)}`}
              </th>
            </tr>
            <tr className="text-center">
              <th
                className="table-column-head main-move cursor-pointer"
                onClick={() => arrowSort(table, TypeSorted.Fast)}
              >
                Fast
                {!disableSortFM && (
                  <span style={{ opacity: stateSorted[tableType].sortBy === TypeSorted.Fast ? 1 : 0.3 }}>
                    {stateSorted[tableType].fast ? (
                      <ArrowDropDownIcon fontSize="small" />
                    ) : (
                      <ArrowDropUpIcon fontSize="small" />
                    )}
                  </span>
                )}
              </th>
              <th
                className="table-column-head main-move cursor-pointer"
                onClick={() => arrowSort(table, TypeSorted.Charge)}
              >
                Charged
                {!disableSortCM && (
                  <span style={{ opacity: stateSorted[tableType].sortBy === TypeSorted.Charge ? 1 : 0.3 }}>
                    {stateSorted[tableType].charged ? (
                      <ArrowDropDownIcon fontSize="small" />
                    ) : (
                      <ArrowDropUpIcon fontSize="small" />
                    )}
                  </span>
                )}
              </th>
              <th className="table-column-head cursor-pointer" onClick={() => arrowSort(table, TypeSorted.Effective)}>
                %
                <span style={{ opacity: stateSorted[tableType].sortBy === TypeSorted.Effective ? 1 : 0.3 }}>
                  {stateSorted[tableType].effective ? (
                    <ArrowDropDownIcon fontSize="small" />
                  ) : (
                    <ArrowDropUpIcon fontSize="small" />
                  )}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {move.data
              .sort((a, b) => sortFunc(a, b, table))
              .map((value, index) => (
                <Fragment key={index}>{renderBestMovesetTable(value, max, table)}</Fragment>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBestMovesetTable = (value: IPokemonQueryMove, max: number | undefined, type: TableType) => {
    const tableType = getPropertyName<TableSort, 'defensive' | 'offensive'>(stateSorted, (o) =>
      type === TableType.Offensive ? o.offensive : o.defensive
    );
    const ratio = toFloatWithPadding(
      (value.eDPS[tableType] * 100) / toNumber(max, 1),
      2,
      FloatPaddingOption.setOptions({ maxValue: 100, maxLength: 6 })
    );
    return (
      <tr>
        <td className="text-origin theme-table-primary">
          <LinkToTop to={`../move/${value.fMove.id}`} className="d-block">
            <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
              <IconType width={20} height={20} alt="type-logo" type={value.fMove.type} />
            </div>
            <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.fMove.name.toLowerCase(), '_', ' ')}</span>
            <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
              {value.fMove.moveType !== MoveType.None && (
                <span
                  className={combineClasses(
                    'type-icon-small ic',
                    `${getKeyWithData(MoveType, value.fMove.moveType)?.toLowerCase()}-ic`
                  )}
                >
                  {getKeyWithData(MoveType, value.fMove.moveType)}
                </span>
              )}
            </span>
          </LinkToTop>
        </td>
        <td className="text-origin theme-table-primary">
          <LinkToTop to={`../move/${value.cMove.id}`} className="d-block">
            <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
              <IconType width={20} height={20} alt="type-logo" type={value.cMove.type} />
            </div>
            <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.cMove.name.toLowerCase(), '_', ' ')}</span>
            <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
              {value.cMove.moveType !== MoveType.None && (
                <span
                  className={combineClasses(
                    'type-icon-small ic',
                    `${getKeyWithData(MoveType, value.cMove.moveType)?.toLowerCase()}-ic`
                  )}
                >
                  {getKeyWithData(MoveType, value.cMove.moveType)}
                </span>
              )}
            </span>
          </LinkToTop>
        </td>
        <td className="text-center theme-table-primary">{ratio}</td>
      </tr>
    );
  };

  const renderMoveSetTable = (data: ICombat[]) => (
    <Fragment>
      {data.map((value, index) => (
        <tr key={index}>
          <td className="text-origin theme-table-primary">
            <LinkToTop to={`../move/${value.id}`} className="d-block">
              <div className="d-inline-block" style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
                <IconType width={20} height={20} alt="type-logo" type={value.type} />
              </div>
              <span style={{ marginRight: 5 }}>{splitAndCapitalize(value.name.toLowerCase(), '_', ' ')}</span>
              <span style={{ width: 'max-content', verticalAlign: 'text-bottom' }}>
                {value.moveType !== MoveType.None && (
                  <span
                    className={combineClasses(
                      'type-icon-small ic',
                      `${getKeyWithData(MoveType, value.moveType)?.toLowerCase()}-ic`
                    )}
                  >
                    {getKeyWithData(MoveType, value.moveType)}
                  </span>
                )}
              </span>
            </LinkToTop>
          </td>
        </tr>
      ))}
    </Fragment>
  );

  const arrowSort = (table: TableType, type: TypeSorted) => {
    if (type !== TypeSorted.Effective && (disableSortFM || disableSortCM)) {
      return;
    }
    const sortedColumn = getPropertyName<SortModel, 'fast' | 'charged' | 'effective'>(offensive || defensive, (o) =>
      type === TypeSorted.Charge ? o.charged : type === TypeSorted.Effective ? o.effective : o.fast
    );
    if (table === TableType.Offensive) {
      if (offensive.sortBy === type) {
        const prev = offensive[sortedColumn];
        offensive[sortedColumn] = !prev;
      }
      offensive.sortBy = type;
    } else if (table === TableType.Defensive) {
      if (defensive.sortBy === type) {
        const prev = defensive[sortedColumn];
        defensive[sortedColumn] = !prev;
      }
      defensive.sortBy = type;
    }
    return setStateSorted({
      ...stateSorted,
      offensive,
      defensive,
    });
  };

  const sortFunc = (rowA: IPokemonQueryMove, rowB: IPokemonQueryMove, table: TableType) => {
    const tableType = getPropertyName<TableSort, 'defensive' | 'offensive'>(stateSorted, (o) =>
      table === TableType.Offensive ? o.offensive : o.defensive
    );
    const sortedBy = stateSorted[tableType].sortBy;
    const result = stateSorted[tableType] as unknown as DynamicObj<boolean | TypeSorted>;
    const sortedColumn = getPropertyName<SortModel, 'fast' | 'charged' | 'effective'>(offensive || defensive, (o) =>
      sortedBy === TypeSorted.Charge ? o.charged : sortedBy === TypeSorted.Effective ? o.effective : o.fast
    );
    if (sortedBy === TypeSorted.Effective) {
      return result[sortedColumn]
        ? rowB.eDPS[tableType] - rowA.eDPS[tableType]
        : rowA.eDPS[tableType] - rowB.eDPS[tableType];
    }
    if (result[sortedColumn]) {
      const tempRowA = rowA;
      rowA = rowB;
      rowB = tempRowA;
    }
    const combatType = getPropertyName<IPokemonQueryMove, 'fMove' | 'cMove'>(rowA || rowB, (o) =>
      sortedBy === TypeSorted.Charge ? o.cMove : o.fMove
    );
    const a = rowA[combatType].name.toLowerCase();
    const b = rowB[combatType].name.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
  };

  return (
    <Tabs defaultActiveKey="movesList" className="lg-2">
      <Tab eventKey="movesList" title="Moves List">
        <div className="row w-100 theme-table-info-bg" style={{ margin: 0 }}>
          <div className="col-xl table-moves-col" style={{ padding: 0, maxHeight: props.maxHeight }}>
            <table className="table-info table-moves">
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
                      moveOrigin.specialMoves,
                      moveOrigin.exclusiveMoves,
                      moveOrigin.dynamaxMoves
                    )
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </Tab>
      <Tab eventKey="bestEffList" title="Best Moves List">
        <div className="row w-100" style={{ margin: 0 }}>
          {renderTable(TableType.Offensive)}
          {renderTable(TableType.Defensive)}
        </div>
      </Tab>
    </Tabs>
  );
};

export default TableMove;
