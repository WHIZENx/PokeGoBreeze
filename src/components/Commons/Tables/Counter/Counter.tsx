import { useSnackbar } from '../../../../contexts/snackbar.context';
import { getApiErrorMessage } from '../../../../services/api-error';
// @refresh reset
import { Checkbox } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import APIService from '../../../../services/api.service';
import {
  createDataRows,
  generateParamForm,
  getKeyWithData,
  getValidPokemonImgPath,
  splitAndCapitalize,
} from '../../../../utils/utils';

import './Counter.scss';
import { hasPokemonCounterStats } from '../../../../utils/pokemon-detail-form';
import { TableStyles } from 'react-data-table-component';
import { CounterModel, ICounterModel } from './models/counter.model';
import { ICounterComponent } from '../../../models/component.model';
import { ColumnType, MoveType, PokemonType } from '../../../../enums/type.enum';
import { TableColumnModify } from '../../../../utils/models/overrides/data-table.model';
import {
  combineClasses,
  isEqual,
  isInclude,
  isNotEmpty,
  toFloatWithPadding,
  toNumber,
} from '../../../../utils/extension';
import { LinkToTop } from '../../../Link/LinkToTop';
import PokemonIconType from '../../../Sprites/PokemonIconType/PokemonIconType';
import { FloatPaddingOption } from '../../../../utils/models/extension.model';
import IconType from '../../../Sprites/Icon/Type/Type';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import useSkipStalePageRequest from '../../../../utils/hooks/useSkipStalePageRequest';
import { IncludeMode } from '../../../../utils/enums/string.enum';
import {
  battleStab,
  defaultDamageConst,
  defaultDamageMultiply,
  defaultEnergyPerHpLost,
  defaultPokemonLevel,
  maxIv,
} from '../../../../utils/helpers/options-context.helpers';
import useAssets from '../../../../composables/useAssets';
import useOptionStore from '../../../../composables/useOptions';
import InputReleased from '../../Inputs/InputReleased';
import FormControlMui from '../../Forms/FormControlMui';
import { IMenuItem } from '../../models/menu.model';
import { ProcessedDataPage } from '../../../../services/processed-data.service';
import { formatPokemonDisplayName } from '../../../../utils/pokemon-display-name';
import TableEmptyState from '../TableEmptyState';
import TableLoadingProgress from '../TableLoadingProgress';

const COUNTER_ROWS_PER_PAGE = 20;

interface CounterSnapshot {
  rows: ICounterModel[];
  totalRows: number;
}

let latestCounterSnapshot: CounterSnapshot | undefined;

const customStyles: TableStyles = {
  table: {
    style: {
      backgroundColor: 'transparent',
    },
  },
  tableWrapper: {
    style: {
      backgroundColor: 'transparent',
    },
  },
  responsiveWrapper: {
    style: {
      backgroundColor: 'transparent',
    },
  },
  head: {
    style: {
      height: '2.25rem',
    },
  },
  header: {
    style: {
      justifyContent: 'center',
      textAlign: 'center',
      padding: 0,
    },
  },
  headRow: {
    style: {
      backgroundColor: 'var(--table-info) !important',
      color: 'var(--text-primary) !important',
      fontSize: '1rem',
      fontWeight: 'bolder',
      justifyContent: 'center',
      minHeight: '2.25rem',
    },
  },
  headCells: {
    style: {
      height: '2.25rem',
      justifyContent: 'center',
      padding: '5px 10px',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: 'var(--custom-table-background-sub-head-border)',
    },
  },
  cells: {
    style: {
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: 'var(--custom-table-background-sub-head-border)',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0.5rem',
      fontWeight: 'normal',
    },
  },
  rows: {
    style: {
      color: 'var(--text-primary)',
      backgroundColor: 'transparent',
      minHeight: '6rem',
    },
    stripedStyle: {
      color: 'var(--text-primary)',
      backgroundColor: 'transparent',
    },
    highlightOnHoverStyle: {
      backgroundColor: 'var(--background-table-hover)',
    },
  },
  pagination: {
    style: {
      color: 'var(--text-primary)',
      backgroundColor: 'transparent',
      borderTopColor: 'var(--background-table-divided)',
    },
  },
  noData: {
    style: {
      color: 'var(--text-primary)',
      backgroundColor: 'transparent',
    },
  },
  progress: {
    style: {
      backgroundColor: 'transparent',
    },
  },
};

const Counter = (props: ICounterComponent) => {
  const { showSnackbar } = useSnackbar();
  const { findAssetForm } = useAssets();
  const { optionsCounter, setCounterOptions } = useOptionStore();
  const initialSnapshotRef = useRef(latestCounterSnapshot);
  const [counterList, setCounterList] = useState<ICounterModel[]>(() => initialSnapshotRef.current?.rows ?? []);
  const [showFrame, setShowFrame] = useState(true);
  const [totalRows, setTotalRows] = useState(() => initialSnapshotRef.current?.totalRows ?? 0);
  const [page, setPage] = useState(1);
  const [ratioSortOrder, setRatioSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const currentPageRef = useRef(1);
  const latestRequestRef = useRef(0);
  const hasResolvedCountersRef = useRef(false);
  const resolvedCounterRequestKeyRef = useRef('');
  const searchTermRef = useRef('');

  const [options, setOptions] = useState(optionsCounter);

  const { isMatch, isSearchId, showMegaPrimal, releasedGO, enableBest } = options;
  const defense = toNumber(props.pokemonData?.statsGO?.def);
  const targetPokemonType = props.pokemonType ?? props.pokemonData?.pokemonType ?? PokemonType.Normal;
  const typesKey = props.pokemonData?.types?.join(',') ?? '';
  const counterTargetKey = [
    props.pokemonData?.id,
    props.pokemonData?.pokemonId,
    props.pokemonData?.fullName,
    props.pokemonData?.form,
    targetPokemonType,
  ].join('|');
  const counterRequestKey = [
    counterTargetKey,
    defense,
    targetPokemonType,
    typesKey,
    showMegaPrimal,
    releasedGO,
    enableBest,
    isSearchId,
    isMatch,
    searchTerm,
    ratioSortOrder,
    page,
  ].join('|');
  const hasValidCounterTarget = hasPokemonCounterStats(props.pokemonData);
  const isCanonicalCounterTargetReady = Boolean(props.pokemonData?.fullName && props.pokemonData?.form !== undefined);
  const isCounterTargetPending = props.pokemonData === undefined || !isCanonicalCounterTargetReady;
  const hasFreshCounters = resolvedCounterRequestKeyRef.current === counterRequestKey;
  const isUpdating = Boolean(
    props.isLoading || isCounterTargetPending || (hasValidCounterTarget && (showFrame || !hasFreshCounters))
  );

  const resetPagination = useCallback(() => {
    if (currentPageRef.current === 1) {
      return;
    }
    currentPageRef.current = 1;
    setPage(1);
    setResetPaginationToggle((value) => !value);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    currentPageRef.current = nextPage;
    setPage(nextPage);
  }, []);

  const handleSearchTermChange = useCallback(
    (value: string) => {
      if (searchTermRef.current === value) {
        return;
      }
      searchTermRef.current = value;
      setSearchTerm(value);
      resetPagination();
    },
    [resetPagination]
  );

  useEffect(() => {
    resetPagination();
  }, [
    counterTargetKey,
    defense,
    targetPokemonType,
    typesKey,
    showMegaPrimal,
    releasedGO,
    enableBest,
    isSearchId,
    isMatch,
    ratioSortOrder,
    resetPagination,
  ]);

  const skipStalePageRequest = useSkipStalePageRequest(
    page,
    `${counterTargetKey}|${defense}|${targetPokemonType}|${typesKey}|${showMegaPrimal}|${releasedGO}|${enableBest}|${isSearchId}|${isMatch}|${ratioSortOrder}`
  );

  const menuItems = createDataRows<IMenuItem<ICounterModel>>(
    {
      label: (
        <FormControlMui
          control={
            <Checkbox checked={isSearchId} onChange={(_, check) => setOptions({ ...options, isSearchId: check })} />
          }
          label="Search Pokémon Id"
        />
      ),
    },
    {
      label: (
        <FormControlMui
          control={
            <Checkbox
              checked={isMatch}
              onChange={(_, check) => setOptions({ ...options, isMatch: check })}
              disabled={!isSearchId}
            />
          }
          label="Match Pokémon"
        />
      ),
    }
  );

  const columns = createDataRows<TableColumnModify<ICounterModel>>(
    {
      id: ColumnType.Pokemon,
      name: 'Pokémon',
      selector: (row) => {
        const assets = findAssetForm(row.pokemonId, row.pokemonForm);
        return (
          <LinkToTop to={`/pokemon/${row.pokemonId}${generateParamForm(row.pokemonForm, row.pokemonType)}`}>
            <div className="tw-flex tw-justify-center">
              <div className="filter-shadow-hover tw-relative group-pokemon-sprite">
                <PokemonIconType pokemonType={row.pokemonType} size={30}>
                  <img
                    className="pokemon-sprite-counter"
                    alt="Pokémon Image"
                    src={APIService.getPokemonModel(assets, row.pokemonId)}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, row.pokemonId, assets);
                    }}
                  />
                </PokemonIconType>
              </div>
            </div>
            <span className="caption text-overflow !tw-text-default tw-font-medium">
              #{row.pokemonId} {formatPokemonDisplayName(row.pokemonName)}
            </span>
          </LinkToTop>
        );
      },
      width: '30%',
    },
    {
      id: ColumnType.FastMove,
      name: 'Fast',
      selector: (row) => (
        <LinkToTop to={`../move/${row.fMove.id}`} className="tw-grid">
          <div className="tw-mr-1 tw-align-text-bottom">
            <IconType width={28} height={28} alt="Pokémon GO Type Logo" type={row.fMove.type} />
          </div>
          <b className="move-link-text tw-mr-1 tw-pt-1 tw-break-normal tw-text-wrap tw-text-sm">
            {splitAndCapitalize(row.fMove.name.toLowerCase(), '_', ' ')}
          </b>
          <span className="tw-w-full">
            {row.fMove.moveType !== MoveType.None && (
              <span
                className={combineClasses(
                  'type-icon-small ic',
                  `${getKeyWithData(MoveType, row.fMove.moveType)?.toLowerCase()}-ic`
                )}
              >
                {getKeyWithData(MoveType, row.fMove.moveType)}
              </span>
            )}
          </span>
        </LinkToTop>
      ),
      width: '25%',
    },
    {
      id: ColumnType.ChargedMove,
      name: 'Charged',
      selector: (row) => (
        <LinkToTop to={`../move/${row.cMove.id}`} className="tw-grid">
          <div className="tw-mr-1 tw-align-text-bottom">
            <IconType width={28} height={28} alt="Pokémon GO Type Logo" type={row.cMove.type} />
          </div>
          <b className="move-link-text tw-mr-1 tw-pt-1 tw-break-normal tw-text-wrap tw-text-sm">
            {splitAndCapitalize(row.cMove.name.toLowerCase(), '_', ' ')}
          </b>
          <span className="tw-w-full">
            {row.cMove.moveType !== MoveType.None && (
              <span
                className={combineClasses(
                  'type-icon-small ic',
                  `${getKeyWithData(MoveType, row.cMove.moveType)?.toLowerCase()}-ic`
                )}
              >
                {getKeyWithData(MoveType, row.cMove.moveType)}
              </span>
            )}
          </span>
        </LinkToTop>
      ),
      width: '25%',
    },
    {
      id: ColumnType.Percent,
      name: '%',
      selector: (row) => (
        <div
          className="tw-flex tw-w-full tw-min-w-0 tw-flex-col tw-items-center tw-leading-tight"
          data-testid="counter-performance"
        >
          <span className="tw-whitespace-nowrap tw-font-bold">
            {toFloatWithPadding(row.ratio, 2, FloatPaddingOption.setOptions({ maxValue: 100, maxLength: 6 }))}
          </span>
          <span className="tw-flex tw-min-w-0 tw-flex-col tw-items-center tw-whitespace-nowrap tw-text-xs tw-font-normal tw-text-foreground-secondary sm:tw-flex-row sm:tw-gap-1">
            <span>{toFloatWithPadding(row.dps, 2)}</span>
            <span>DPS</span>
          </span>
        </div>
      ),
      sortable: true,
      width: '20%',
    }
  );

  useEffect(() => {
    if (skipStalePageRequest || props.isLoading || isCounterTargetPending) {
      return;
    }
    if (hasResolvedCountersRef.current && resolvedCounterRequestKeyRef.current === counterRequestKey) {
      setShowFrame(false);
      return;
    }
    if (!hasValidCounterTarget) {
      latestRequestRef.current += 1;
      setShowFrame(false);
      return;
    }
    const requestId = ++latestRequestRef.current;
    setShowFrame(true);
    const controller = new AbortController();
    APIService.getFetchUrl<ProcessedDataPage<ICounterModel>>(
      APIService.getCounters({
        def: defense,
        pokemonType: targetPokemonType,
        types: typesKey,
        iv: maxIv(),
        level: defaultPokemonLevel(),
        stab: battleStab(),
        damageMultiply: defaultDamageMultiply(),
        damageConst: defaultDamageConst(),
        energyPerHpLost: defaultEnergyPerHpLost(),
        showMegaPrimal,
        released: releasedGO,
        best: enableBest,
        searchId: isSearchId,
        matchId: isMatch,
        q: searchTerm,
        sort: 'ratio',
        order: ratioSortOrder,
        page,
        limit: COUNTER_ROWS_PER_PAGE,
      }),
      { signal: controller.signal }
    )
      .then(({ data }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        const rows = data.data.map((row) => new CounterModel(row));
        latestCounterSnapshot = {
          rows,
          totalRows: data.meta.total,
        };
        hasResolvedCountersRef.current = true;
        resolvedCounterRequestKeyRef.current = counterRequestKey;
        setCounterList(rows);
        setTotalRows(data.meta.total);
        setShowFrame(false);
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          hasResolvedCountersRef.current = false;
          resolvedCounterRequestKeyRef.current = counterRequestKey;
          setCounterList([]);
          setTotalRows(0);
          setShowFrame(false);
          showSnackbar(getApiErrorMessage(error, 'Unable to load Pokémon counters.'), 'error');
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    defense,
    targetPokemonType,
    typesKey,
    showMegaPrimal,
    releasedGO,
    enableBest,
    isSearchId,
    isMatch,
    searchTerm,
    ratioSortOrder,
    page,
    skipStalePageRequest,
    props.isLoading,
    isCounterTargetPending,
    hasValidCounterTarget,
    counterRequestKey,
    showSnackbar,
  ]);

  useEffect(() => {
    setCounterOptions(options);
  }, [options]);

  const modalOptions = () => (
    <form>
      <InputReleased
        releasedGO={releasedGO}
        setReleaseGO={(check) => setOptions({ ...options, releasedGO: check })}
        isDisabled={!isNotEmpty(counterList)}
        isAvailable={releasedGO && !showFrame}
        isBlock={showFrame}
      />
      <FormControlMui
        control={
          <Checkbox
            disabled={!isNotEmpty(counterList)}
            checked={showMegaPrimal}
            onChange={(_, check) => setOptions({ ...options, showMegaPrimal: check })}
          />
        }
        label={`${getKeyWithData(PokemonType, PokemonType.Mega)}/${getKeyWithData(PokemonType, PokemonType.Primal)}`}
      />
      <FormControlMui
        control={
          <Checkbox
            disabled={!isNotEmpty(counterList)}
            checked={enableBest}
            onChange={(_, check) => setOptions({ ...options, enableBest: check })}
          />
        }
        label={'Filter best move sets'}
      />
    </form>
  );

  return (
    <div className="table-info">
      <div className="sub-header input-group tw-items-center tw-justify-center">
        <span className="sub-title">Best Pokémon Counter</span>
        <TableLoadingProgress loading={isUpdating} label="Loading Pokémon counters" />
      </div>
      <div className="tw-relative" aria-busy={isUpdating}>
        {isUpdating && isNotEmpty(counterList) && (
          <div
            className="tw-absolute tw-inset-0 tw-z-10 tw-cursor-wait"
            data-testid="counter-stale-interaction-guard"
            aria-hidden="true"
          />
        )}
        {!props.isLoading && !isCounterTargetPending && !hasValidCounterTarget ? (
          <TableEmptyState
            spacious
            testId="counter-missing-stats-empty-state"
            title="Counter data unavailable"
            description="This form is missing the Pokémon GO Defense or typing required to calculate counters."
          />
        ) : (
          <CustomDataTable
            className="table-counter-container"
            keyField="tableKey"
            customColumns={columns}
            columnSeparator="full"
            headerSeparator="full"
            defaultSortFieldId={ColumnType.Percent}
            defaultSortAsc={false}
            isShowSearch
            isAutoSearch
            menuItems={menuItems}
            searchFunction={(item, searchTerm) =>
              isInclude(
                formatPokemonDisplayName(item.pokemonName),
                searchTerm,
                IncludeMode.IncludeIgnoreCaseSensitive
              ) ||
              (isSearchId && (isMatch ? isEqual(item.pokemonId, searchTerm) : isInclude(item.pokemonId, searchTerm)))
            }
            pagination
            paginationServer
            sortServer
            paginationTotalRows={totalRows}
            onSort={(column, direction) => {
              if (column.id === ColumnType.Percent) {
                setRatioSortOrder(direction === 'asc' ? 'asc' : 'desc');
              }
            }}
            onChangePage={handlePageChange}
            paginationDefaultPage={1}
            paginationResetDefaultPage={resetPaginationToggle}
            onSearchTermChange={handleSearchTermChange}
            debounceTime={300}
            customDataStyles={customStyles}
            inputPlaceholder="Search Pokémon"
            fixedHeader
            paginationComponentOptions={{
              noRowsPerPage: true,
            }}
            paginationPerPage={COUNTER_ROWS_PER_PAGE}
            data={counterList}
            noDataComponent={isUpdating ? <div aria-hidden="true" className="tw-h-24" /> : undefined}
            isXFixed
            isShowModalOptions
            titleModalOptions="Pokémon counter options"
            customOptionsModal={modalOptions}
          />
        )}
      </div>
    </div>
  );
};

export default Counter;
