import React, { useState, useEffect, useRef } from 'react';
import APIService from '../../../services/api.service';
import {
  camelCase,
  capitalize,
  createDataRows,
  generateParamForm,
  getItemSpritePath,
  splitAndCapitalize,
} from '../../../utils/utils';
import './Types.scss';
import { computeBgType } from '../../../utils/compute';
import { ColumnType, PokemonType } from '../../../enums/type.enum';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ICombat } from '../../../core/models/combat.model';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import { combineClasses, getPropertyName, getValueOrDefault, toNumber } from '../../../utils/extension';
import { ItemName } from '../../News/enums/item-type.enum';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import { IStyleSheetData } from '../../models/page.model';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import { getTypeEffective } from '../../../utils/helpers/options-context.helpers';
import SelectTypeComponent from '../../../components/Commons/Selects/SelectType';
import InputReleased from '../../../components/Commons/Inputs/InputReleased';
import TabsPanel from '../../../components/Commons/Tabs/TabsPanel';
import useSkipStalePageRequest from '../../../utils/hooks/useSkipStalePageRequest';

const nameSort = (rowA: IPokemonData | ICombat, rowB: IPokemonData | ICombat) => {
  const a = getValueOrDefault(String, rowA.name.toLowerCase());
  const b = getValueOrDefault(String, rowB.name.toLowerCase());
  return a === b ? 0 : a > b ? 1 : -1;
};

const columnPokemon = createDataRows<TableColumnModify<IPokemonData>>(
  {
    id: ColumnType.Id,
    name: 'ID',
    selector: (row) => row.num,
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Name,
    name: 'Pokémon Name',
    selector: (row) => (
      <LinkToTop
        to={`/pokemon/${row.num}${generateParamForm(row.form)}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
        <img
          height={48}
          alt="Pokémon Image"
          className="tw-mr-2"
          src={APIService.getPokeIconSprite(row.sprite, false)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name, '-', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    id: ColumnType.Type,
    name: 'Type(s)',
    selector: (row) =>
      row.types.map((value, index) => (
        <IconType
          key={index}
          width={25}
          height={25}
          className="tw-mr-2"
          alt="Pokémon GO Type Logo"
          title={capitalize(value)}
          type={value}
        />
      )),
    width: '150px',
  },
  {
    id: ColumnType.Atk,
    name: 'ATK',
    selector: (row) => row.statsGO.atk,
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Def,
    name: 'DEF',
    selector: (row) => row.statsGO.def,
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Sta,
    name: 'STA',
    selector: (row) => row.statsGO.sta,
    sortable: true,
    width: '100px',
  }
);

const columnMove = createDataRows<TableColumnModify<ICombat>>(
  {
    id: ColumnType.Type,
    name: 'ID',
    selector: (row) => row.id,
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Name,
    name: 'Move Name',
    selector: (row) => (
      <LinkToTop
        className="tw-flex tw-items-center"
        to={`/move/${row.id}`}
        title={`${splitAndCapitalize(row.name, '_', ' ')}`}
      >
        {splitAndCapitalize(row.name, '_', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    id: ColumnType.PowerPVE,
    name: 'Power PVE',
    selector: (row) => row.pvePower,
    sortable: true,
    width: '120px',
  },
  {
    id: ColumnType.PowerPVP,
    name: 'Power PVP',
    selector: (row) => row.pvpPower,
    sortable: true,
    width: '120px',
  },
  {
    id: ColumnType.EnergyPVE,
    name: 'Energy PVE',
    selector: (row) => `${row.pveEnergy > 0 ? '+' : ''}${row.pveEnergy}`,
    sortable: true,
    width: '120px',
  },
  {
    id: ColumnType.EnergyPVP,
    name: 'Energy PVP',
    selector: (row) => `${row.pvpEnergy > 0 ? '+' : ''}${row.pvpEnergy}`,
    sortable: true,
    width: '120px',
  }
);

type TypeResultKind = 'pokemon-single' | 'pokemon-dual' | 'fast' | 'charged';

interface TypeCounts {
  pokemon: number;
  typedPokemon: number;
  singlePokemon: number;
  dualPokemon: number;
  fastMoves: number;
  typedFastMoves: number;
  chargedMoves: number;
  typedChargedMoves: number;
}

interface TypePage<T> {
  data: T[];
  meta: { total: number; counts: TypeCounts };
}

const typeSortField = (kind: TypeResultKind, columnId: string | number | undefined) => {
  switch (Number(columnId)) {
    case ColumnType.Id:
      return kind.startsWith('pokemon') ? 'num' : 'id';
    case ColumnType.Type:
      return kind.startsWith('pokemon') ? 'name' : 'id';
    case ColumnType.Atk:
      return 'atk';
    case ColumnType.Def:
      return 'def';
    case ColumnType.Sta:
      return 'sta';
    case ColumnType.PowerPVE:
      return 'pvePower';
    case ColumnType.PowerPVP:
      return 'pvpPower';
    case ColumnType.EnergyPVE:
      return 'pveEnergy';
    case ColumnType.EnergyPVP:
      return 'pvpEnergy';
    default:
      return 'name';
  }
};

const useTypeResult = <T,>(kind: TypeResultKind, type: string, released: boolean) => {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<TypeCounts>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState({ field: 'name', order: 'asc' as 'asc' | 'desc' });
  const [loading, setLoading] = useState(true);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setResetPaginationToggle((value) => !value);
  }, [kind, type, released, debouncedSearch]);

  const skipStalePageRequest = useSkipStalePageRequest(page, JSON.stringify([kind, type, released, debouncedSearch]));

  useEffect(() => {
    if (skipStalePageRequest) {
      return;
    }
    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    setLoading(true);
    APIService.getFetchUrl<TypePage<T>>(
      APIService.getTypesData({
        kind,
        type,
        released,
        q: debouncedSearch,
        page,
        limit: 50,
        sort: sort.field,
        order: sort.order,
      }),
      { signal: controller.signal }
    )
      .then(({ data: result }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        setData(result.data);
        setTotal(result.meta.total);
        setCounts(result.meta.counts);
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          setData([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [kind, type, released, debouncedSearch, page, sort, skipStalePageRequest]);

  const onSort = (columnId: string | number | undefined, order: 'asc' | 'desc') => {
    setSort({ field: typeSortField(kind, columnId), order });
    setPage(1);
    setResetPaginationToggle((value) => !value);
  };
  return { data, total, counts, page, setPage, setSearch, loading, onSort, resetPaginationToggle };
};

const SearchTypes = (props: IStyleSheetData) => {
  const typesEffective = getTypeEffective();
  const [releasedGO, setReleaseGO] = useState(true);

  const [currentType, setCurrentType] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));
  const singlePokemon = useTypeResult<IPokemonData>('pokemon-single', currentType, releasedGO);
  const dualPokemon = useTypeResult<IPokemonData>('pokemon-dual', currentType, releasedGO);
  const fastMoves = useTypeResult<ICombat>('fast', currentType, releasedGO);
  const chargedMoves = useTypeResult<ICombat>('charged', currentType, releasedGO);
  const counts = singlePokemon.counts ?? dualPokemon.counts ?? fastMoves.counts ?? chargedMoves.counts;

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'PokéGO Breeze - Type',
    description: 'Explore Pokémon type information, effectiveness, and related Pokémon and moves in Pokémon GO.',
    keywords: ['Pokémon GO', 'type effectiveness', 'type chart', 'Pokemon types', 'PokéGO Breeze'],
  });

  useTitle(titleProps);

  useEffect(() => {
    if (currentType) {
      setTitleProps({
        title: `${capitalize(currentType)} Type - Strengths, Weaknesses & Pokémon | PokéGO Breeze`,
        description: `Complete ${capitalize(currentType)}-type guide for Pokémon GO: type effectiveness chart, best ${capitalize(currentType)}-type Pokémon, and all ${capitalize(currentType)}-type moves.`,
        keywords: [
          'Pokémon GO',
          `${currentType} type`,
          `${currentType} Pokémon`,
          `${currentType} moves`,
          `${currentType} weakness`,
          `${currentType} effectiveness`,
          'PokéGO Breeze',
        ],
        image: APIService.getTypeSprite(currentType),
      });
    }
  }, [currentType]);

  return (
    <div className="tw-container tw-mt-2">
      <div className="tw-flex tw-justify-end">
        <SelectTypeComponent
          title="Select Type"
          data={typesEffective}
          currentType={currentType}
          setCurrentType={setCurrentType}
          filterType={[currentType]}
        />
      </div>
      <InputReleased
        releasedGO={releasedGO}
        setReleaseGO={(check) => setReleaseGO(check)}
        isAvailable={releasedGO}
        label={<b>{`Filter from ${toNumber(counts?.pokemon)} Pokémon`}</b>}
      />
      <div className="row">
        <div className="xl:tw-w-1/3 !tw-mt-2">
          <div
            className={combineClasses(
              'tw-flex tw-flex-col tw-items-center type-info-container',
              `${currentType.toLowerCase()}-border`
            )}
            style={{ background: computeBgType(currentType, PokemonType.Normal, props.styleSheet) }}
          >
            <div className="filter-shadow tw-w-32">
              <img
                className="sprite-type-large tw-p-3 tw-rounded-full tw-bg-black"
                alt="Pokémon GO Type Logo"
                src={APIService.getTypeHqSprite(currentType)}
              />
            </div>
            <span
              className={combineClasses(
                currentType.toLowerCase(),
                'type-select-bg tw-flex tw-items-center filter-shadow tw-mt-2 tw-w-max'
              )}
            >
              <div className="tw-w-3 tw-contents">
                <img
                  className="pokemon-sprite-small sprite-type-select filter-shadow"
                  alt="Pokémon GO Type Logo"
                  src={APIService.getTypeHqSprite(currentType)}
                />
              </div>
              <span className="filter-shadow">{capitalize(currentType)}</span>
            </span>
            <span className="tw-mt-2 tw-text-white text-shadow-black">
              <img alt="Icon Item" height={36} src={getItemSpritePath(ItemName.PokeBall)} />
              <b>{` Pokémon: ${toNumber(counts?.typedPokemon)} (${
                toNumber(counts?.typedPokemon) > 0 &&
                toNumber(counts?.pokemon) > 0 &&
                Math.round((toNumber(counts?.typedPokemon) * 100) / toNumber(counts?.pokemon, 1))
              }%)`}</b>
              <ul className="list-style-disc">
                <li>
                  <b>{`Legacy Type: ${toNumber(counts?.singlePokemon)} (${
                    toNumber(counts?.typedPokemon) > 0 &&
                    Math.round((toNumber(counts?.singlePokemon) * 100) / toNumber(counts?.pokemon, 1))
                  }%)`}</b>
                </li>
                <li>
                  <b>{`Include Type: ${toNumber(counts?.dualPokemon)} (${
                    toNumber(counts?.typedPokemon) > 0 &&
                    Math.round((toNumber(counts?.dualPokemon) * 100) / toNumber(counts?.pokemon, 1))
                  }%)`}</b>
                </li>
              </ul>
            </span>
            <span className="tw-mt-2 tw-text-white text-shadow-black">
              <img alt="Icon Item" height={36} src={APIService.getItemSprite('Item_1201')} />
              <b>{` Fast Moves: ${toNumber(counts?.typedFastMoves)}/${toNumber(counts?.fastMoves)} (${Math.round(
                (toNumber(counts?.typedFastMoves) * 100) / toNumber(counts?.fastMoves, 1)
              )}%)`}</b>
            </span>
            <span className="tw-mt-2 tw-text-white text-shadow-black">
              <img alt="Icon Item" height={36} src={APIService.getItemSprite('Item_1202')} />
              <b>{` Charged Moves: ${toNumber(counts?.typedChargedMoves)}/${toNumber(counts?.chargedMoves)} (${Math.round(
                (toNumber(counts?.typedChargedMoves) * 100) / toNumber(counts?.chargedMoves, 1)
              )}%)`}</b>
            </span>
          </div>
        </div>
        <div className="xl:tw-w-2/3 !tw-mt-2">
          <TabsPanel
            tabs={[
              {
                label: 'Pokémon Legacy Type List',
                children: (
                  <CustomDataTable
                    customColumns={columnPokemon}
                    data={singlePokemon.data}
                    pagination
                    paginationServer
                    paginationTotalRows={singlePokemon.total}
                    paginationResetDefaultPage={singlePokemon.resetPaginationToggle}
                    paginationPerPage={50}
                    paginationComponentOptions={{ noRowsPerPage: true }}
                    onChangePage={singlePokemon.setPage}
                    sortServer
                    onSort={(column, direction) => singlePokemon.onSort(column.id, direction)}
                    defaultSortFieldId={ColumnType.Name}
                    highlightOnHover
                    striped
                    progressPending={singlePokemon.loading}
                    progressComponent={<CircularProgressTable />}
                    isShowSearch
                    inputPlaceholder="Search Pokémon Name or ID"
                    onSearchTermChange={singlePokemon.setSearch}
                    debounceTime={300}
                  />
                ),
              },
              {
                label: 'Pokémon Include Types List',
                children: (
                  <CustomDataTable
                    customColumns={columnPokemon}
                    data={dualPokemon.data}
                    pagination
                    paginationServer
                    paginationTotalRows={dualPokemon.total}
                    paginationResetDefaultPage={dualPokemon.resetPaginationToggle}
                    paginationPerPage={50}
                    paginationComponentOptions={{ noRowsPerPage: true }}
                    onChangePage={dualPokemon.setPage}
                    sortServer
                    onSort={(column, direction) => dualPokemon.onSort(column.id, direction)}
                    defaultSortFieldId={ColumnType.Name}
                    highlightOnHover
                    striped
                    progressPending={dualPokemon.loading}
                    progressComponent={<CircularProgressTable />}
                    isShowSearch
                    inputPlaceholder="Search Pokémon Name or ID"
                    onSearchTermChange={dualPokemon.setSearch}
                    debounceTime={300}
                  />
                ),
              },
              {
                label: 'Fast Move List',
                children: (
                  <CustomDataTable
                    customColumns={columnMove}
                    data={fastMoves.data}
                    pagination
                    paginationServer
                    paginationTotalRows={fastMoves.total}
                    paginationResetDefaultPage={fastMoves.resetPaginationToggle}
                    paginationPerPage={50}
                    paginationComponentOptions={{ noRowsPerPage: true }}
                    onChangePage={fastMoves.setPage}
                    sortServer
                    onSort={(column, direction) => fastMoves.onSort(column.id, direction)}
                    defaultSortFieldId={ColumnType.Name}
                    highlightOnHover
                    striped
                    progressPending={fastMoves.loading}
                    progressComponent={<CircularProgressTable />}
                    isShowSearch
                    inputPlaceholder="Search Move Name or ID"
                    onSearchTermChange={fastMoves.setSearch}
                    debounceTime={300}
                  />
                ),
              },
              {
                label: 'Charged Move List',
                children: (
                  <CustomDataTable
                    customColumns={columnMove}
                    data={chargedMoves.data}
                    pagination
                    paginationServer
                    paginationTotalRows={chargedMoves.total}
                    paginationResetDefaultPage={chargedMoves.resetPaginationToggle}
                    paginationPerPage={50}
                    paginationComponentOptions={{ noRowsPerPage: true }}
                    onChangePage={chargedMoves.setPage}
                    sortServer
                    onSort={(column, direction) => chargedMoves.onSort(column.id, direction)}
                    defaultSortFieldId={ColumnType.Name}
                    highlightOnHover
                    striped
                    progressPending={chargedMoves.loading}
                    progressComponent={<CircularProgressTable />}
                    isShowSearch
                    inputPlaceholder="Search Move Name or ID"
                    onSearchTermChange={chargedMoves.setSearch}
                    debounceTime={300}
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchTypes;
