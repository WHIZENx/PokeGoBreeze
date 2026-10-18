import { Checkbox, Skeleton } from '@mui/material';
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
      '&:not(:last-of-type)': {
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: 'var(--custom-table-background-sub-head-border)',
      },
    },
  },
  cells: {
    style: {
      '&:not(:last-of-type)': {
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: 'var(--custom-table-background-sub-head-border)',
        color: 'var(--text-primary)',
      },
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: 'var(--custom-table-background-sub-head-border)',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0.25rem 0.5rem',
      fontWeight: 'normal',
      '&:first-of-type': {
        fontSize: '0.75rem',
      },
      '&:last-of-type': {
        fontWeight: 'bold',
        color: 'var(--custom-table-background-sub-head-text)',
        fontSize: '1rem',
      },
    },
  },
  rows: {
    style: {
      color: 'var(--text-primary)',
      backgroundColor: 'transparent',
      '&:not(:last-of-type)': {
        borderBottomColor: 'var(--background-table-divided)',
      },
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
  const { findAssetForm } = useAssets();
  const { optionsCounter, setCounterOptions } = useOptionStore();
  const [counterList, setCounterList] = useState<ICounterModel[]>([]);
  const [showFrame, setShowFrame] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [ratioSortOrder, setRatioSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const latestRequestRef = useRef(0);
  const hasResolvedCountersRef = useRef(false);
  const resolvedCounterRequestKeyRef = useRef('');
  const searchTermRef = useRef('');

  const [options, setOptions] = useState(optionsCounter);

  const { isMatch, isSearchId, showMegaPrimal, releasedGO, enableBest } = options;
  const defense = toNumber(props.pokemonData?.statsGO?.def);
  const targetPokemonType = props.pokemonType ?? props.pokemonData?.pokemonType ?? PokemonType.Normal;
  const typesKey = props.pokemonData?.types?.join(',') ?? '';
  const counterRequestKey = [
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
  const hasValidCounterTarget = defense > 0 && Boolean(typesKey);
  const isCounterTargetPending = props.pokemonData === undefined;
  const hasFreshCounters = resolvedCounterRequestKeyRef.current === counterRequestKey;
  const isUpdating = Boolean(
    props.isLoading || isCounterTargetPending || showFrame || (hasValidCounterTarget && !hasFreshCounters)
  );

  const resetPagination = useCallback(() => {
    setPage(1);
    setResetPaginationToggle((value) => !value);
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
    `${defense}|${targetPokemonType}|${typesKey}|${showMegaPrimal}|${releasedGO}|${enableBest}|${isSearchId}|${isMatch}|${ratioSortOrder}`
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
          <b className="move-link-text tw-mr-1 tw-pt-1 tw-text-wrap tw-text-sm">
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
          <b className="move-link-text tw-mr-1 tw-pt-1 tw-text-wrap tw-text-sm">
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
        <div className="tw-flex tw-flex-col tw-items-center tw-leading-tight">
          <span>
            {toFloatWithPadding(row.ratio, 2, FloatPaddingOption.setOptions({ maxValue: 100, maxLength: 6 }))}
          </span>
          <span className="tw-text-xs tw-font-normal tw-text-[var(--text-secondary)]">
            {toFloatWithPadding(row.dps, 2)} DPS
          </span>
        </div>
      ),
      sortable: true,
      width: '20%',
    }
  );

  useEffect(() => {
    if (skipStalePageRequest || props.isLoading) {
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
        limit: 100,
      }),
      { signal: controller.signal }
    )
      .then(({ data }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        hasResolvedCountersRef.current = true;
        resolvedCounterRequestKeyRef.current = counterRequestKey;
        setCounterList(data.data.map((row) => new CounterModel(row)));
        setTotalRows(data.meta.total);
        setShowFrame(false);
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          hasResolvedCountersRef.current = true;
          resolvedCounterRequestKeyRef.current = counterRequestKey;
          setShowFrame(false);
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
    hasValidCounterTarget,
    counterRequestKey,
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
      </div>
      <div
        className={combineClasses('tw-relative counter-table-content', isUpdating ? 'is-loading' : '')}
        aria-busy={isUpdating}
      >
        {isUpdating && (
          <div className="slide-container !tw-left-0 !tw-right-0 !tw-bottom-0 !tw-top-[41px] !tw-p-0 !tw-w-full !tw-h-auto !tw-absolute tw-z-2">
            <Skeleton variant="rectangular" animation="wave" className="!tw-w-full !tw-h-full !tw-m-0 !tw-p-0" />
          </div>
        )}
        <CustomDataTable
          className="table-counter-container"
          keyField="tableKey"
          customColumns={columns}
          defaultSortFieldId={ColumnType.Percent}
          defaultSortAsc={false}
          isShowSearch
          isAutoSearch
          menuItems={menuItems}
          searchFunction={(item, searchTerm) =>
            isInclude(formatPokemonDisplayName(item.pokemonName), searchTerm, IncludeMode.IncludeIgnoreCaseSensitive) ||
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
          onChangePage={setPage}
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
          noDataComponent={null}
          paginationPerPage={100}
          data={counterList}
          isXFixed
          isShowModalOptions
          titleModalOptions="Pokémon counter options"
          customOptionsModal={modalOptions}
        />
      </div>
    </div>
  );
};

export default Counter;
