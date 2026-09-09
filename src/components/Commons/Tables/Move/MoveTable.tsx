import React, { Fragment, useRef, useState } from 'react';
import { getKeyWithData, splitAndCapitalize } from '../../../../utils/utils';

import './MoveTable.scss';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ICombat } from '../../../../core/models/combat.model';
import { IPokemonQueryMove, IPokemonQueryRankMove } from '../../../../utils/models/pokemon-top-move.model';
import { ITableMoveComponent } from '../../models/component.model';
import { combineClasses, DynamicObj, getPropertyName, toFloatWithPadding, toNumber } from '../../../../utils/extension';
import { TableType, TypeSorted } from './enums/table-type.enum';
import { MoveType } from '../../../../enums/type.enum';
import { LinkToTop } from '../../../Link/LinkToTop';
import { FloatPaddingOption } from '../../../../utils/models/extension.model';
import IconType from '../../../Sprites/Icon/Type/Type';
import TabsPanel from '../../Tabs/TabsPanel';
import CircularProgress from '@mui/material/CircularProgress';

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

const emptyMoveRanking: IPokemonQueryRankMove = { data: [] };

const TableMove = (props: ITableMoveComponent) => {
  const cachedMoveData = useRef(props.moveData);
  const cachedRankMoveData = useRef(props.rankMoveData);
  if (props.moveData) {
    cachedMoveData.current = props.moveData;
  }
  if (props.rankMoveData) {
    cachedRankMoveData.current = props.rankMoveData;
  }

  const move = props.rankMoveData ?? cachedRankMoveData.current ?? emptyMoveRanking;
  const moveOrigin = props.moveData ?? cachedMoveData.current;
  const isLoading = Boolean(props.isLoading || !props.moveData || !props.rankMoveData);

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

  const renderTable = (table: TableType) => {
    const tableType = getPropertyName<TableSort, 'defensive' | 'offensive'>(stateSorted, (o) =>
      table === TableType.Offensive ? o.offensive : o.defensive
    );
    const max = table === TableType.Offensive ? move.maxOff : move.maxDef;
    return (
      <div className="xl:tw-flex-1 table-moves-col !tw-p-0" style={{ maxHeight: props.maxHeight }}>
        <table className="table-moves">
          <colgroup className="main-move" />
          <colgroup className="main-move" />
          <thead>
            <tr className="tw-text-center">
              <th className="table-sub-header" colSpan={3}>
                {`Best Moves ${getKeyWithData(TableType, table)}`}
              </th>
            </tr>
            <tr className="tw-text-center">
              <th
                className="table-column-head main-move tw-cursor-pointer"
                onClick={() => arrowSort(table, TypeSorted.Fast)}
              >
                Fast
                {!disableSortFM && (
                  <span className={stateSorted[tableType].sortBy === TypeSorted.Fast ? 'opacity-100' : 'opacity-30'}>
                    {stateSorted[tableType].fast ? (
                      <ArrowDropDownIcon fontSize="small" />
                    ) : (
                      <ArrowDropUpIcon fontSize="small" />
                    )}
                  </span>
                )}
              </th>
              <th
                className="table-column-head main-move tw-cursor-pointer"
                onClick={() => arrowSort(table, TypeSorted.Charge)}
              >
                Charged
                {!disableSortCM && (
                  <span className={stateSorted[tableType].sortBy === TypeSorted.Charge ? 'opacity-100' : 'opacity-30'}>
                    {stateSorted[tableType].charged ? (
                      <ArrowDropDownIcon fontSize="small" />
                    ) : (
                      <ArrowDropUpIcon fontSize="small" />
                    )}
                  </span>
                )}
              </th>
              <th
                className="table-column-head tw-cursor-pointer"
                onClick={() => arrowSort(table, TypeSorted.Effective)}
              >
                %
                <span className={stateSorted[tableType].sortBy === TypeSorted.Effective ? 'opacity-100' : 'opacity-30'}>
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
        <td className="text-origin tw-bg-table-primary">
          <LinkToTop to={`../move/${value.fMove.id}`} className="tw-block">
            <div className="tw-inline-block tw-mr-1 tw-align-text-bottom">
              <IconType width={20} height={20} alt="Pokémon GO Type Logo" type={value.fMove.type} />
            </div>
            <span className="tw-mr-1">{splitAndCapitalize(value.fMove.name.toLowerCase(), '_', ' ')}</span>
            <span className="tw-w-max tw-align-text-bottom">
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
        <td className="text-origin tw-bg-table-primary">
          <LinkToTop to={`../move/${value.cMove.id}`} className="tw-block">
            <div className="tw-inline-block tw-mr-1 tw-align-text-bottom">
              <IconType width={20} height={20} alt="Pokémon GO Type Logo" type={value.cMove.type} />
            </div>
            <span className="tw-mr-1">{splitAndCapitalize(value.cMove.name.toLowerCase(), '_', ' ')}</span>
            <span className="tw-w-max tw-align-text-bottom">
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
        <td className="tw-text-center tw-bg-table-primary">{ratio}</td>
      </tr>
    );
  };

  const renderMoveSetTable = (data: ICombat[]) => (
    <Fragment>
      {data.map((value, index) => (
        <tr key={index}>
          <td className="text-origin tw-bg-table-primary">
            <LinkToTop to={`../move/${value.id}`} className="tw-block">
              <div className="tw-inline-block tw-mr-1 tw-align-text-bottom">
                <IconType width={20} height={20} alt="Pokémon GO Type Logo" type={value.type} />
              </div>
              <span className="tw-mr-1">{splitAndCapitalize(value.name.toLowerCase(), '_', ' ')}</span>
              <span className="tw-w-max tw-align-text-bottom">
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
      const newOffensive = { ...offensive };
      if (offensive.sortBy === type) {
        newOffensive[sortedColumn] = !offensive[sortedColumn];
      }
      newOffensive.sortBy = type;
      return setStateSorted({ ...stateSorted, offensive: newOffensive });
    } else if (table === TableType.Defensive) {
      const newDefensive = { ...defensive };
      if (defensive.sortBy === type) {
        newDefensive[sortedColumn] = !defensive[sortedColumn];
      }
      newDefensive.sortBy = type;
      return setStateSorted({ ...stateSorted, defensive: newDefensive });
    }
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
    <div className="move-tables-wrapper" aria-busy={isLoading}>
      <div className={combineClasses('move-tables-content', isLoading ? 'is-loading' : '')}>
        <TabsPanel
          tabs={[
            {
              label: 'Moves List',
              children: (
                <div className="row tw-w-full tw-bg-table-info !tw-m-0">
                  <div className="xl:tw-flex-1 table-moves-col !tw-p-0" style={{ maxHeight: props.maxHeight }}>
                    <table className="table-moves">
                      <colgroup className="main-move" />
                      <thead>
                        <tr className="tw-text-center">
                          <th className="table-sub-header">Fast Moves</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moveOrigin && renderMoveSetTable(moveOrigin.fastMoves.concat(moveOrigin.eliteFastMoves))}
                      </tbody>
                    </table>
                  </div>
                  <div className="xl:tw-flex-1 table-moves-col !tw-p-0" style={{ maxHeight: props.maxHeight }}>
                    <table className="table-moves">
                      <colgroup className="main-move" />
                      <thead>
                        <tr className="tw-text-center">
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
              ),
            },
            {
              label: 'Best Moves List',
              children: (
                <div className="row tw-w-full !tw-m-0">
                  {renderTable(TableType.Offensive)}
                  {renderTable(TableType.Defensive)}
                </div>
              ),
            },
          ]}
          className="lg-2"
        />
      </div>
      {isLoading && (
        <div className="move-tables-loading" role="status" aria-live="polite">
          <CircularProgress size={28} />
          <span>Loading moves...</span>
        </div>
      )}
    </div>
  );
};

export default TableMove;
