import React, { useEffect, useRef, useState } from 'react';
import { Checkbox } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSearchParams } from 'react-router-dom';
import { ConditionalStyles, TableStyles } from 'react-data-table-component';

import APIService from '../../../services/api.service';
import './StatsRanking.scss';
import {
  capitalize,
  convertPokemonImageName,
  createDataRows,
  generateParamForm,
  getCustomThemeDataTable,
  getKeyWithData,
  getValidPokemonImgPath,
  isSpecialFormType,
  splitAndCapitalize,
} from '../../../utils/utils';
import Stats from '../../../components/Info/Stats/Stats';
import TableMove from '../../../components/Commons/Tables/Move/MoveTable';
import { IPokemonStatsRanking } from '../../../core/models/stats.model';
import PokemonTable from '../../../components/Commons/Tables/Pokemon/PokemonTable';
import { useTitle } from '../../../utils/hooks/useTitle';
import { Params } from '../../../utils/constants';
import { ColumnType, PokemonType, TypeAction } from '../../../enums/type.enum';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import { getValueOrDefault, isEqual, isNullOrUndefined, toNumber } from '../../../utils/extension';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { IPokemonDetail, PokemonDetail } from '../../../core/models/API/info.model';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import { IMenuItem } from '../../../components/Commons/models/menu.model';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import usePokemon from '../../../composables/usePokemon';
import InputReleased from '../../../components/Commons/Inputs/InputReleased';
import FormControlMui from '../../../components/Commons/Forms/FormControlMui';

const columnPokemon = createDataRows<TableColumnModify<IPokemonStatsRanking>>(
  {
    id: ColumnType.None,
    name: '',
    selector: (row) => (
      <LinkToTop
        to={`/pokemon/${row.num}${generateParamForm(row.form, row.pokemonType)}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
        <VisibilityIcon className="view-pokemon tw-text-default" fontSize="small" />
      </LinkToTop>
    ),
    width: '55px',
  },
  { id: ColumnType.Ranking, name: 'Ranking', selector: (row) => toNumber(row.rank), width: '80px' },
  { id: ColumnType.Id, name: 'ID', selector: (row) => row.num, width: '80px' },
  {
    id: ColumnType.Released,
    name: 'Released',
    selector: (row) => (row.releasedGO ? <DoneIcon color="success" /> : <CloseIcon color="error" />),
    width: '80px',
  },
  {
    id: ColumnType.Name,
    name: 'Pokémon Name',
    selector: (row) => (
      <PokemonIconType pokemonType={row.pokemonType} size={24}>
        <img
          height={48}
          alt="Pokémon Image"
          className="tw-mr-2"
          src={APIService.getPokeIconSprite(row.sprite, false)}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name.replaceAll('_', '-'), '-', ' ')}
      </PokemonIconType>
    ),
    minWidth: '200px',
  },
  {
    id: ColumnType.Type,
    name: 'Type(s)',
    selector: (row) =>
      getValueOrDefault<string[]>(Array, row.types).map((value, index) => (
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
  { id: ColumnType.Atk, name: 'ATK', selector: (row) => toNumber(row.atk.attack), sortable: true, width: '100px' },
  { id: ColumnType.Def, name: 'DEF', selector: (row) => toNumber(row.def.defense), sortable: true, width: '100px' },
  { id: ColumnType.Sta, name: 'STA', selector: (row) => toNumber(row.sta.stamina), sortable: true, width: '100px' },
  {
    id: ColumnType.Prod,
    name: 'Stat Prod',
    selector: (row) => toNumber(row.prod.product),
    sortable: true,
    width: '150px',
  }
);

const customStyles: TableStyles = { rows: { style: { cursor: 'pointer' } } };
const defaultPerPages = 25;

class Filter {
  isMatch = false;
  releasedGO = false;

  static create(value: Filter) {
    return Object.assign(new Filter(), value);
  }
}

interface StatsRankingResponse {
  data: IPokemonStatsRanking[];
  selected?: IPokemonStatsRanking;
  meta: { page: number; total: number; pages: number };
}

const getSortId = (statsType: string | null) => {
  switch (toNumber(statsType)) {
    case TypeAction.Atk:
      return ColumnType.Atk;
    case TypeAction.Def:
      return ColumnType.Def;
    case TypeAction.Sta:
      return ColumnType.Sta;
    default:
      return ColumnType.Prod;
  }
};

const getStatsType = (column: ColumnType) => {
  if (column === ColumnType.Atk) {
    return TypeAction.Atk;
  }
  if (column === ColumnType.Def) {
    return TypeAction.Def;
  }
  if (column === ColumnType.Sta) {
    return TypeAction.Sta;
  }
  return TypeAction.Prod;
};

const getSortField = (column: ColumnType) => {
  if (column === ColumnType.Atk) {
    return 'atk';
  }
  if (column === ColumnType.Def) {
    return 'def';
  }
  if (column === ColumnType.Sta) {
    return 'sta';
  }
  return 'prod';
};

const StatsRanking = () => {
  useTitle({
    title: 'PokéGO Breeze - Stats Ranking',
    description:
      'View comprehensive Pokémon GO stat rankings to identify the strongest Pokémon for battles and raids. Compare attack, defense, stamina, and overall performance.',
    keywords: [
      'Pokémon stats ranking',
      'strongest Pokémon',
      'best attackers',
      'best defenders',
      'Pokémon GO ranking',
      'stat comparison',
    ],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { getPokemonDetails } = usePokemon();
  const [select, setSelect] = useState<IPokemonStatsRanking>();
  const selectedRef = useRef<IPokemonStatsRanking>();
  const [pokemon, setPokemon] = useState<IPokemonDetail>();
  const [rows, setRows] = useState<IPokemonStatsRanking[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPerPages);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState(new Filter());
  const [loading, setLoading] = useState(true);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const latestRequestRef = useRef(0);
  const locatedRouteRef = useRef('');
  const { isMatch, releasedGO } = filters;

  const paramId = searchParams.get(Params.Id) ?? '';
  const paramForm = searchParams.get(Params.Form) ?? '';
  const paramFormType = searchParams.get(Params.FormType) ?? '';
  const paramStatsType = searchParams.get(Params.StatsType) ?? '';
  const sortId = getSortId(paramStatsType);
  const routeTarget = `${paramId}|${paramForm}|${paramFormType}|${paramStatsType}`;

  const applySelection = (row: IPokemonStatsRanking) => {
    selectedRef.current = row;
    setSelect(row);
    const details = getPokemonDetails(row.num, row.fullName, row.pokemonType, true);
    details.pokemonType = row.pokemonType ?? PokemonType.Normal;
    setPokemon(PokemonDetail.setData(details));
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setResetPaginationToggle((value) => !value);
  }, [debouncedSearch, isMatch, releasedGO]);

  useEffect(() => {
    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    const locate = Boolean(paramId) && locatedRouteRef.current !== routeTarget;
    setLoading(true);
    APIService.getFetchUrl<StatsRankingResponse>(
      APIService.getStatsRanking({
        q: debouncedSearch,
        match: isMatch,
        released: releasedGO,
        sort: getSortField(sortId),
        order: sortOrder,
        page,
        limit: rowsPerPage,
        id: paramId,
        form: paramForm,
        formType: paramFormType,
        locate,
      }),
      { signal: controller.signal }
    )
      .then(({ data }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        if (locate) {
          locatedRouteRef.current = routeTarget;
        }
        setRows(data.data);
        setTotalRows(data.meta.total);
        if (data.meta.page !== page) {
          setPage(data.meta.page);
          setResetPaginationToggle((value) => !value);
        }
        if (data.selected) {
          applySelection(data.selected);
        } else if (!selectedRef.current && data.data[0]) {
          applySelection(data.data[0]);
        }
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          setRows([]);
          setTotalRows(0);
        }
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [
    debouncedSearch,
    isMatch,
    releasedGO,
    sortId,
    sortOrder,
    page,
    rowsPerPage,
    paramId,
    paramForm,
    paramFormType,
    routeTarget,
  ]);

  const setFilterParams = (row: IPokemonStatsRanking) => {
    applySelection(row);
    const next = new URLSearchParams(searchParams);
    next.set(Params.Id, row.num.toString());
    const form = row.form?.replace(formNormal(), '').toLowerCase().replaceAll('_', '-');
    if (form) {
      next.set(Params.Form, form);
    } else {
      next.delete(Params.Form);
    }
    if (isSpecialFormType(row.pokemonType)) {
      next.set(Params.FormType, getKeyWithData(PokemonType, row.pokemonType).toLowerCase());
    } else {
      next.delete(Params.FormType);
    }
    setSearchParams(next);
  };

  const conditionalRowStyles = createDataRows<ConditionalStyles<IPokemonStatsRanking>>(
    { when: () => true, style: { backgroundColor: 'var(--table-primary)' } },
    {
      when: (row) =>
        !isNullOrUndefined(select) && row.fullName === select.fullName && row.pokemonType === select.pokemonType,
      style: { backgroundColor: 'var(--table-highlight-row)', fontWeight: 'bold' },
    }
  );

  const menuItems = createDataRows<IMenuItem<IPokemonStatsRanking>>(
    {
      label: (
        <FormControlMui
          control={
            <Checkbox
              checked={isMatch}
              onChange={(_, checked) => setFilters(Filter.create({ ...filters, isMatch: checked }))}
            />
          }
          label="Match Pokémon"
        />
      ),
    },
    {
      label: (
        <InputReleased
          releasedGO={releasedGO}
          setReleaseGO={(checked) => setFilters(Filter.create({ ...filters, releasedGO: checked }))}
          isAvailable={releasedGO}
          inputMode="checkbox"
        />
      ),
    }
  );

  return (
    <div className="tw-pb-3 tw-relative poke-container tw-container">
      <div className="tw-w-full tw-inline-block tw-align-middle tw-my-3">
        <div className="tw-flex tw-justify-center tw-w-full">
          <div className="tw-inline-block img-desc">
            <img
              className="pokemon-main-sprite !tw-align-baseline"
              alt="Image Pokemon"
              src={APIService.getPokeFullSprite(
                select?.num,
                convertPokemonImageName(select && isEqual(select.baseForme, select.form) ? '' : select?.form)
              )}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getValidPokemonImgPath(event.currentTarget.src, select?.num);
              }}
            />
          </div>
        </div>
        <div className="row tw-w-full !tw-mt-2 !tw-m-0">
          <div className="xl:tw-w-5/12 !tw-p-0">
            <PokemonTable
              id={select?.num}
              gen={select?.gen}
              formName={`${select?.name}${isSpecialFormType(select?.pokemonType) ? '-' + getKeyWithData(PokemonType, select?.pokemonType) : ''}`}
              region={select?.region}
              version={select?.version}
              weight={select?.weightKg}
              height={select?.heightM}
              className="table-stats-ranking"
              isLoadedForms={!loading && Boolean(select)}
            />
          </div>
          {select && (
            <div className="xl:tw-w-7/12 !tw-p-0">
              <TableMove pokemonData={pokemon} maxHeight={400} />
            </div>
          )}
        </div>
      </div>
      <Stats
        statATK={select?.atk}
        statDEF={select?.def}
        statSTA={select?.sta}
        statProd={select?.prod}
        id={select?.num}
        form={select?.form}
        isDisabled
      />
      <CustomDataTable
        customColumns={columnPokemon}
        data={rows}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationResetDefaultPage={resetPaginationToggle}
        paginationDefaultPage={page}
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[25, 50, 100]}
        defaultSortFieldId={sortId}
        defaultSortAsc={sortOrder === 'asc'}
        sortServer
        highlightOnHover
        onRowClicked={setFilterParams}
        onSort={(column, direction) => {
          const columnId = toNumber(column.id) as ColumnType;
          setSortOrder(direction === 'asc' ? 'asc' : 'desc');
          setPage(1);
          setResetPaginationToggle((value) => !value);
          const next = new URLSearchParams(searchParams);
          next.set(Params.StatsType, getStatsType(columnId).toString());
          setSearchParams(next);
        }}
        onChangePage={setPage}
        onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
          setRowsPerPage(currentRowsPerPage);
          setPage(currentPage);
        }}
        conditionalRowStyles={conditionalRowStyles}
        customDataStyles={getCustomThemeDataTable(customStyles)}
        progressPending={loading}
        progressComponent={<CircularProgressTable />}
        isShowSearch
        inputPlaceholder="Search Pokémon Name or ID"
        onSearchTermChange={setSearchTerm}
        debounceTime={300}
        menuItems={menuItems}
      />
    </div>
  );
};

export default StatsRanking;
