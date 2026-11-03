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
  getPreferredPokemonFormSprite,
  isSpecialFormType,
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
import type { PokemonBundleVariety, PokemonMoveRanking } from '../../../core/models/API/pokemon-bundle.model';
import { PokemonSprite } from '../../../core/models/API/form.model';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import useSkipStalePageRequest from '../../../utils/hooks/useSkipStalePageRequest';
import CustomDataTable from '../../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import { IMenuItem } from '../../../components/Commons/models/menu.model';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import InputReleased from '../../../components/Commons/Inputs/InputReleased';
import FormControlMui from '../../../components/Commons/Forms/FormControlMui';
import BackdropMui from '../../../components/Commons/Backdrops/BackdropMui';
import PokemonTableIcon from '../../../components/Sprites/PokemonTableIcon/PokemonTableIcon';
import { formatPokemonDisplayName } from '../../../utils/pokemon-display-name';
import { usePreloadedImage } from '../../../utils/hooks/usePreloadedImage';
import PokemonProfileImageSkeleton from '../../../components/Info/PokemonProfileImageSkeleton';
import { normalizePokemonFormIdentity } from '../../../utils/pokemon-form-identity';

const columnPokemon = createDataRows<TableColumnModify<IPokemonStatsRanking>>(
  {
    id: ColumnType.None,
    name: '',
    selector: (row) => (
      <LinkToTop
        to={`/pokemon/${row.num}${generateParamForm(row.form, row.pokemonType)}`}
        title={`#${row.num} ${formatPokemonDisplayName(row.name)}`}
        funcOnClick={(event) => event.stopPropagation()}
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
    selector: (row) => (
      <span className="tw-inline-flex" data-tag="allowRowEvents">
        {row.releasedGO ? (
          <DoneIcon className="tw-pointer-events-none" color="success" />
        ) : (
          <CloseIcon className="tw-pointer-events-none" color="error" />
        )}
      </span>
    ),
    width: '80px',
  },
  {
    id: ColumnType.Name,
    name: 'Pokémon Name',
    selector: (row) => (
      <>
        <span className="tw-relative tw-mr-2 tw-inline-flex tw-items-center" data-tag="allowRowEvents">
          <PokemonIconType
            pokemonType={row.pokemonType}
            size={24}
            className="!tw-bottom-0 !tw-right-0 tw-z-[1] tw-pointer-events-none"
          >
            <PokemonTableIcon {...row} className="tw-pointer-events-none" />
          </PokemonIconType>
        </span>
        {formatPokemonDisplayName(row.name)}
      </>
    ),
    minWidth: '200px',
  },
  {
    id: ColumnType.Type,
    name: 'Type(s)',
    selector: (row) => (
      <span className="tw-inline-flex" data-tag="allowRowEvents">
        {getValueOrDefault<string[]>(Array, row.types).map((value, index) => (
          <IconType
            key={index}
            width={25}
            height={25}
            className="tw-mr-2 tw-pointer-events-none"
            alt="Pokémon GO Type Logo"
            title={capitalize(value)}
            type={value}
          />
        ))}
      </span>
    ),
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

interface StatsRankingPokemonBundle {
  moveRankings: PokemonMoveRanking[];
  varieties: PokemonBundleVariety[];
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
  const [select, setSelect] = useState<IPokemonStatsRanking>();
  const [pokemonBundle, setPokemonBundle] = useState<{ id: number; data: StatsRankingPokemonBundle }>();
  const [movesLoading, setMovesLoading] = useState(false);
  const pokemonBundleCache = useRef(new Map<number, StatsRankingPokemonBundle>());
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
  const skipSyncedPageRequestRef = useRef(false);
  const { isMatch, releasedGO } = filters;

  const paramId = searchParams.get(Params.Id) ?? '';
  const paramForm = searchParams.get(Params.Form) ?? '';
  const paramFormType = searchParams.get(Params.FormType) ?? '';
  const paramStatsType = searchParams.get(Params.StatsType) ?? '';
  const sortId = getSortId(paramStatsType);
  const routeTarget = `${paramId}|${paramForm}|${paramFormType}|${paramStatsType}`;
  const selectedId = select?.num;
  const selectedBundle = selectedId && pokemonBundle?.id === selectedId ? pokemonBundle.data : undefined;
  const selectedFormIdentity = normalizePokemonFormIdentity(selectedId ?? 0, select?.form ?? 'NORMAL');
  const selectedForm = selectedBundle?.varieties
    .flatMap(({ forms }) => forms)
    .find((form) => {
      const formIdentity = normalizePokemonFormIdentity(
        selectedId ?? 0,
        form.form_name || (form.is_default ? 'NORMAL' : form.name)
      );
      return formIdentity === selectedFormIdentity;
    });
  const fallbackForm = selectedBundle?.varieties.flatMap(({ forms }) => forms).find((form) => form.is_default);
  const selectedPreferredImage = getPreferredPokemonFormSprite(
    PokemonSprite.setDetails((selectedForm ?? fallbackForm)?.sprites)
  );
  const selectedOfficialImage = selectedId ? APIService.getPokeOfficialArtwork(selectedId) : undefined;
  const selectedImageForm = convertPokemonImageName(
    select && isEqual(select.baseForme, select.form) ? '' : select?.form
  );
  const selectedHybridImage = selectedId ? APIService.getPokeFullSprite(selectedId, selectedImageForm) : undefined;
  const selectedImageCandidates =
    selectedId && selectedBundle
      ? [selectedPreferredImage, selectedOfficialImage, selectedHybridImage, APIService.getPokeFullAsset(selectedId)]
      : [];
  const { displayedUrl: selectedImage, isLoading: isSelectedImageLoading } = usePreloadedImage(
    selectedImageCandidates,
    APIService.getPokeSprite(),
    [selectedPreferredImage, selectedOfficialImage, selectedHybridImage]
  );
  const showSelectedImageSkeleton = !selectedId || loading || !selectedBundle || isSelectedImageLoading;
  const moveRanking =
    select && selectedBundle
      ? selectedBundle.moveRankings.find(
          (item) =>
            item.pokemonType === (select.pokemonType ?? PokemonType.Normal) &&
            ((select.fullName && isEqual(item.fullName, select.fullName)) ||
              (select.form && isEqual(item.form, select.form)))
        )
      : undefined;

  const applySelection = (row: IPokemonStatsRanking) => {
    setSelect(row);
  };

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    const cached = pokemonBundleCache.current.get(selectedId);
    if (cached) {
      setPokemonBundle({ id: selectedId, data: cached });
      setMovesLoading(false);
      return;
    }
    const controller = new AbortController();
    setPokemonBundle(undefined);
    setMovesLoading(true);
    APIService.getPokemonBundle(selectedId, { signal: controller.signal })
      .then(({ data }) => {
        const bundle = {
          moveRankings: data.data.moveRankings ?? [],
          varieties: data.data.varieties,
        };
        pokemonBundleCache.current.set(selectedId, bundle);
        setPokemonBundle({ id: selectedId, data: bundle });
      })
      .catch((error) => {
        if (!APIService.isCancel(error)) {
          setPokemonBundle({ id: selectedId, data: { moveRankings: [], varieties: [] } });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMovesLoading(false);
        }
      });
    return () => controller.abort();
  }, [selectedId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setResetPaginationToggle((value) => !value);
  }, [debouncedSearch, isMatch, releasedGO]);

  const skipStalePageRequest = useSkipStalePageRequest(page, JSON.stringify([debouncedSearch, isMatch, releasedGO]));

  useEffect(() => {
    if (skipSyncedPageRequestRef.current) {
      skipSyncedPageRequestRef.current = false;
      return;
    }
    if (skipStalePageRequest) {
      return;
    }
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
          skipSyncedPageRequestRef.current = true;
          setPage(data.meta.page);
          setResetPaginationToggle((value) => !value);
        }
        if (data.selected) {
          applySelection(data.selected);
        } else if (data.data[0]) {
          applySelection(data.data[0]);
        } else {
          setSelect(undefined);
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
    skipStalePageRequest,
  ]);

  const setFilterParams = (row: IPokemonStatsRanking) => {
    applySelection(row);
    const next = new URLSearchParams(searchParams);
    next.set(Params.Id, row.num.toString());
    const form = (row.form ?? '').replace(formNormal(), '').toLowerCase().replaceAll('_', '-');
    if (form) {
      next.set(Params.Form, form);
    } else {
      next.delete(Params.Form);
    }
    const formType = getKeyWithData(PokemonType, row.pokemonType);
    if (isSpecialFormType(row.pokemonType) && formType) {
      next.set(Params.FormType, formType.toLowerCase());
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
          <div
            className="tw-inline-flex tw-items-center tw-justify-center img-desc"
            aria-busy={showSelectedImageSkeleton}
            data-testid="stats-ranking-profile-image"
          >
            {showSelectedImageSkeleton ? (
              <PokemonProfileImageSkeleton testId="stats-ranking-profile-image-skeleton" />
            ) : (
              <img className="pokemon-main-sprite !tw-align-baseline" alt="Image Pokemon" src={selectedImage} />
            )}
          </div>
        </div>
        <div className="tw-grid tw-grid-cols-1 xl:tw-grid-cols-12 tw-w-full !tw-mt-2">
          <div className="xl:tw-col-span-5 tw-min-w-0">
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
            <div className="xl:tw-col-span-7 tw-min-w-0">
              <TableMove
                moveData={moveRanking?.moves}
                rankMoveData={moveRanking?.bestMoves}
                pokemonType={select.pokemonType}
                isLoading={movesLoading || pokemonBundle?.id !== select.num}
                maxHeight={400}
              />
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
      <div className="tw-relative">
        <BackdropMui open={loading && rows.length > 0} isShowOnAbove={false} />
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
          progressPending={loading && rows.length === 0}
          progressComponent={<CircularProgressTable />}
          isShowSearch
          inputPlaceholder="Search Pokémon Name, Form or ID"
          onSearchTermChange={setSearchTerm}
          debounceTime={300}
          menuItems={menuItems}
        />
      </div>
    </div>
  );
};

export default StatsRanking;
