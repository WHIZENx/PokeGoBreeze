import React, { Fragment, useRef, useState } from 'react';
import { getKeyWithData, splitAndCapitalize } from '../../../../utils/utils';

import './MoveTable.scss';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
import Tooltips from '../../Tooltips/Tooltips';
import {
  formatMaxMoveLevelSummary,
  formatMaxMoveUpgradeCosts,
  getMaxMoveVariantLabel,
} from '../../../../utils/max-move';
import useDataStore from '../../../../composables/useDataStore';

const formatMinuteOfDay = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

const formatMaxBattleLevel = (battleLevel: string) => {
  const match = battleLevel.match(/LEVEL_(\d+)$/);
  const level = match?.[1] ?? '';
  if (battleLevel.startsWith('BREAD_DOUGH_BATTLE_LEVEL_')) {
    return `Gigantamax Tier ${level}`;
  }
  if (battleLevel.startsWith('BREAD_SPECIAL_BATTLE_LEVEL_')) {
    return `Special Battle Tier ${level}`;
  }
  if (battleLevel.startsWith('BREAD_BATTLE_LEVEL_')) {
    return `Tier ${level}`;
  }
  return splitAndCapitalize(battleLevel.toLowerCase(), '_', ' ');
};

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
  const { optionsData } = useDataStore();
  const cachedMoveData = useRef(props.moveData);
  const cachedRankMoveData = useRef(props.rankMoveData);
  const isLoading = props.isLoading ?? (!props.moveData || !props.rankMoveData);
  // Keep previous rows only during a request, not after an empty result.
  if (props.moveData || !isLoading) {
    cachedMoveData.current = props.moveData;
  }
  if (props.rankMoveData || !isLoading) {
    cachedRankMoveData.current = props.rankMoveData;
  }

  const move = props.rankMoveData ?? cachedRankMoveData.current ?? emptyMoveRanking;
  const moveOrigin = props.moveData ?? cachedMoveData.current;
  const showMaxMoves = Boolean(moveOrigin?.dynamaxMoves.length);

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
      <div className="table-moves-col tw-min-w-0" style={{ maxHeight: props.maxHeight }}>
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
            {[...move.data]
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
            <span className="tw-inline-flex tw-items-center">
              <LinkToTop to={`../move/${value.id}`} className="tw-inline-flex tw-items-center">
                <span className="tw-inline-flex tw-mr-1 tw-align-text-bottom">
                  <IconType width={20} height={20} alt="Pokémon GO Type Logo" type={value.type} />
                </span>
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
              {value.maxMoveLevels?.length || value.maxMoveCosts?.length ? (
                <Tooltips
                  hideBackground
                  arrow
                  colorArrow="var(--custom-pop-over)"
                  title={
                    <div className="popover-info tw-max-w-80">
                      {value.maxMoveLevels?.length ? (
                        <span className="tw-block tw-text-sm">
                          {getMaxMoveVariantLabel(value)} · Lv. 1–4: {formatMaxMoveLevelSummary(value)}
                        </span>
                      ) : null}
                      {value.maxMoveCosts?.length ? (
                        <span className="tw-block tw-mt-2 tw-text-sm">
                          Training: {formatMaxMoveUpgradeCosts(value)}
                        </span>
                      ) : null}
                    </div>
                  }
                >
                  <button
                    type="button"
                    aria-label={`${splitAndCapitalize(value.name.toLowerCase(), '_', ' ')} Max Move information`}
                    className="tooltips-info tw-inline-flex tw-ml-1 tw-p-0 tw-border-0 tw-bg-transparent"
                  >
                    <InfoOutlinedIcon color="primary" fontSize="small" />
                  </button>
                </Tooltips>
              ) : null}
            </span>
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
              renderChildren: () => (
                <div
                  className={combineClasses(
                    'tw-grid tw-grid-cols-1 tw-items-start tw-w-full tw-bg-table-info',
                    showMaxMoves ? 'lg:tw-grid-cols-3' : 'lg:tw-grid-cols-2'
                  )}
                >
                  <div className="table-moves-col tw-min-w-0" style={{ maxHeight: props.maxHeight }}>
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
                  <div className="table-moves-col tw-min-w-0" style={{ maxHeight: props.maxHeight }}>
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
                              moveOrigin.exclusiveMoves
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                  {showMaxMoves && moveOrigin && (
                    <div className="table-moves-col tw-min-w-0" style={{ maxHeight: props.maxHeight }}>
                      <table className="table-moves">
                        <colgroup className="main-move" />
                        <thead>
                          <tr className="tw-text-center">
                            <th className="table-sub-header">
                              <span className="tw-inline-flex tw-items-center tw-justify-center tw-gap-1.5">
                                <span>Max Moves (Max Battles only)</span>
                                {optionsData.maxBattle.enabled ? (
                                  <Tooltips
                                    arrow
                                    hideBackground
                                    colorArrow="var(--custom-pop-over)"
                                    placement="bottom"
                                    title={
                                      <div className="popover-info tw-w-80 tw-max-w-[calc(100vw-2rem)] tw-text-left tw-text-sm tw-font-normal">
                                        <div>
                                          <b className="tw-block tw-text-base">Max Battle Details</b>
                                          <span className="caption">Current in-game limits and requirements</span>
                                        </div>

                                        <section className="tw-mt-3 tw-border-0 tw-border-t tw-border-solid tw-border-gray-400 tw-pt-2">
                                          <b className="tw-block tw-mb-1">Max Particles</b>
                                          <div className="tw-grid tw-grid-cols-2 tw-gap-x-3 tw-gap-y-1">
                                            <span>Walk distance</span>
                                            <span className="tw-text-right">
                                              {optionsData.maxBattle.mp.walkDistanceMeters / 1000} km · +
                                              {optionsData.maxBattle.mp.walkReward} MP
                                            </span>
                                            <span>Power Spot</span>
                                            <span className="tw-text-right">
                                              +{optionsData.maxBattle.mp.powerSpotReward} MP
                                            </span>
                                            <span>First Power Spot</span>
                                            <span className="tw-text-right">
                                              +{optionsData.maxBattle.mp.firstPowerSpotBonus} MP bonus
                                            </span>
                                            <span>Daily collection limit</span>
                                            <span className="tw-text-right">
                                              {optionsData.maxBattle.mp.dailyLimit} MP
                                            </span>
                                            <span>Storage capacity</span>
                                            <span className="tw-text-right">
                                              {optionsData.maxBattle.mp.capacity} MP
                                            </span>
                                          </div>
                                        </section>

                                        <section className="tw-mt-3 tw-border-0 tw-border-t tw-border-solid tw-border-gray-400 tw-pt-2">
                                          <b className="tw-block tw-mb-1">Access and Lobby</b>
                                          <div className="tw-grid tw-grid-cols-2 tw-gap-x-3 tw-gap-y-1">
                                            <span>Trainer requirement</span>
                                            <span className="tw-text-right">
                                              Level {optionsData.maxBattle.minimumPlayerLevel}+
                                            </span>
                                            <span>Available hours</span>
                                            <span className="tw-text-right">
                                              {formatMinuteOfDay(optionsData.maxBattle.availability.startMinute)}–
                                              {formatMinuteOfDay(optionsData.maxBattle.availability.endMinute)} local
                                            </span>
                                            <span>Max Battle lobby</span>
                                            <span className="tw-text-right">
                                              {optionsData.maxBattle.lobby.maxPlayers} Trainers
                                            </span>
                                            <span>Gigantamax lobby</span>
                                            <span className="tw-text-right">
                                              {optionsData.maxBattle.lobby.maxGmaxPlayers} Trainers
                                            </span>
                                          </div>
                                        </section>

                                        {optionsData.maxBattle.entryCosts.length ? (
                                          <section className="tw-mt-3 tw-border-0 tw-border-t tw-border-solid tw-border-gray-400 tw-pt-2">
                                            <b className="tw-block tw-mb-1">Entry Cost</b>
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-x-3 tw-gap-y-1">
                                              {optionsData.maxBattle.entryCosts.map((cost) => (
                                                <Fragment key={cost.battleLevel}>
                                                  <span>{formatMaxBattleLevel(cost.battleLevel)}</span>
                                                  <span className="tw-text-right">{cost.local} MP</span>
                                                </Fragment>
                                              ))}
                                            </div>
                                          </section>
                                        ) : null}
                                      </div>
                                    }
                                  >
                                    <button
                                      type="button"
                                      aria-label="Show Max Battle details"
                                      className="tooltips-info tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-border-0 tw-bg-transparent tw-p-0 tw-text-white tw-opacity-90 hover:tw-opacity-100 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-white"
                                    >
                                      <InfoOutlinedIcon className="!tw-text-[18px]" />
                                    </button>
                                  </Tooltips>
                                ) : null}
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>{renderMoveSetTable(moveOrigin.dynamaxMoves)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              ),
            },
            {
              label: 'Best Moves List',
              renderChildren: () => (
                <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-items-start tw-w-full">
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
