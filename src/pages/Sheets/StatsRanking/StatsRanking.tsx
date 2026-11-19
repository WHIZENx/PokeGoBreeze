import React, { useEffect, useRef, useState } from 'react';
import { Checkbox } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSearchParams } from 'react-router-dom';
import { ConditionalStyles, TableStyles } from 'react-data-table-component';

import APIService from '../../../services/api.service';
import '../../../components/Info/PokemonDetailLayout.scss';
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
import { useTitle } from '../../../utils/hooks/useTitle';
import { Params } from '../../../utils/constants';
import { ColumnType, PokemonType, TypeAction } from '../../../enums/type.enum';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import { getValueOrDefault, isEqual, isNullOrUndefined, toNumber } from '../../../utils/extension';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import type {
  PokemonBundleVariety,
  PokemonGoFormCatalogEntry,
  PokemonMoveRanking,
} from '../../../core/models/API/pokemon-bundle.model';
import { PokemonSprite } from '../../../core/models/API/form.model';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import useSkipStalePageRequest from '../../../utils/hooks/useSkipStalePageRequest';
import CustomDataTable from '../../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import TableLoadingProgress from '../../../components/Commons/Tables/TableLoadingProgress';
import { IMenuItem } from '../../../components/Commons/models/menu.model';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import InputReleased from '../../../components/Commons/Inputs/InputReleased';
import FormControlMui from '../../../components/Commons/Forms/FormControlMui';
import PokemonTableIcon from '../../../components/Sprites/PokemonTableIcon/PokemonTableIcon';
import { formatPokemonDisplayName } from '../../../utils/pokemon-display-name';
import { usePreloadedImage } from '../../../utils/hooks/usePreloadedImage';
import PokemonDetailHero from '../../../components/Info/PokemonDetailHero';
import { getPokemonClassificationLabels } from '../../../components/Info/ClassificationBadge';
import StableHeightSection from '../../../components/Layout/StableHeightSection';
import { buildPokemonDetailHeroTable } from '../../../utils/pokemon-detail-hero';
import {
  buildPokemonDetailProfilePresentation,
  findPokemonDetailMoveRanking,
} from '../../../utils/pokemon-detail-presentation';

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
const defaultPerPages = 20;

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
  pokemonGoForms: PokemonGoFormCatalogEntry[];
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
  const hasSelectedPokemonRef = useRef(false);
  const locatedRouteRef = useRef('');
  const skipSyncedPageRequestRef = useRef(false);
  const rankingTableRef = useRef<HTMLElement>(null);
  const pendingTableScrollRef = useRef(false);
  const { isMatch, releasedGO } = filters;

  const paramId = searchParams.get(Params.Id) ?? '';
  const paramForm = searchParams.get(Params.Form) ?? '';
  const paramFormType = searchParams.get(Params.FormType) ?? '';
  const paramStatsType = searchParams.get(Params.StatsType) ?? '';
  const sortId = getSortId(paramStatsType);
  const routeTarget = `${paramId}|${paramForm}|${paramFormType}|${paramStatsType}`;
  const selectedId = select?.num;
  const selectedBundle = selectedId && pokemonBundle?.id === selectedId ? pokemonBundle.data : undefined;
  const selectedOfficialImage = selectedId ? APIService.getPokeOfficialArtwork(selectedId) : undefined;
  const selectedImageForm = convertPokemonImageName(
    select && isEqual(select.baseForme, select.form) ? '' : select?.form
  );
  const selectedHybridImage = selectedId ? APIService.getPokeFullSprite(selectedId, selectedImageForm) : undefined;
  const selectedProfile =
    selectedId && selectedBundle
      ? buildPokemonDetailProfilePresentation({
          canonicalForms: selectedBundle.varieties.flatMap(({ forms }) => forms),
          pokemonGoForms: selectedBundle.pokemonGoForms,
          selection: {
            num: selectedId,
            form: select?.form ?? 'NORMAL',
            fullName: select?.fullName,
            pokemonType: select?.pokemonType,
          },
          getCanonicalImage: (form) => getPreferredPokemonFormSprite(PokemonSprite.setDetails(form.sprites)),
          getPokemonGoImage: (form) =>
            form.asset?.default ? APIService.getPokemonModel(form.asset.default) : undefined,
          officialImage: selectedOfficialImage,
          hybridImage: selectedHybridImage,
          fullAssetImage: APIService.getPokeFullAsset(selectedId),
        })
      : undefined;
  const selectedPreferredImage = selectedProfile?.preferredImage;
  const selectedImageCandidates = selectedProfile?.imageCandidates ?? [];
  const { displayedUrl: selectedImage, isLoading: isSelectedImageLoading } = usePreloadedImage(
    selectedImageCandidates,
    APIService.getPokeSprite(),
    [selectedPreferredImage, selectedOfficialImage, selectedHybridImage]
  );
  const showSelectedImageSkeleton = !selectedId || loading || !selectedBundle || isSelectedImageLoading;
  const profileModifier =
    select?.pokemonType === PokemonType.Shadow
      ? 'shadow'
      : select?.pokemonType === PokemonType.Purified
        ? 'purified'
        : '';
  const classificationLabels = getPokemonClassificationLabels({
    isReady: !loading && Boolean(select),
    pokemonClass: select?.pokemonClass,
    pokemonType: select?.pokemonType,
    isBaby: select?.isBaby,
  });
  const moveRanking =
    select && selectedBundle
      ? findPokemonDetailMoveRanking(selectedBundle.moveRankings, {
          num: select.num,
          form: select.form ?? 'NORMAL',
          fullName: select.fullName,
          pokemonType: select.pokemonType ?? PokemonType.Normal,
        })
      : undefined;

  const applySelection = (row: IPokemonStatsRanking) => {
    hasSelectedPokemonRef.current = true;
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
          pokemonGoForms: data.data.pokemonGo?.forms ?? [],
          varieties: data.data.varieties,
        };
        pokemonBundleCache.current.set(selectedId, bundle);
        setPokemonBundle({ id: selectedId, data: bundle });
      })
      .catch((error) => {
        if (!APIService.isCancel(error)) {
          setPokemonBundle({ id: selectedId, data: { moveRankings: [], pokemonGoForms: [], varieties: [] } });
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
        if (locate && data.selected) {
          applySelection(data.selected);
        } else if (!paramId && !hasSelectedPokemonRef.current) {
          const initialRow = data.data[0];
          if (initialRow) {
            applySelection(initialRow);
          }
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

  useEffect(() => {
    if (loading || !select || !pendingTableScrollRef.current) {
      return;
    }
    pendingTableScrollRef.current = false;
    const frameId = window.requestAnimationFrame(() => {
      rankingTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [loading, select]);

  const applyPokemonSelectionParams = (next: URLSearchParams, row: IPokemonStatsRanking) => {
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
  };

  const setFilterParams = (row: IPokemonStatsRanking) => {
    applySelection(row);
    const next = new URLSearchParams(searchParams);
    applyPokemonSelectionParams(next, row);
    setSearchParams(next);
  };

  const selectStatRanking = (statType: TypeAction) => {
    if (!select) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    applyPokemonSelectionParams(next, select);
    next.set(Params.StatsType, statType.toString());
    const isCurrentDescendingRanking =
      getSortId(paramStatsType) === getSortId(statType.toString()) && sortOrder === 'desc';
    if (isCurrentDescendingRanking && next.toString() === searchParams.toString()) {
      rankingTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    pendingTableScrollRef.current = true;
    locatedRouteRef.current = '';
    setLoading(true);
    setSortOrder('desc');
    setPage(1);
    setResetPaginationToggle((value) => !value);
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
    <div className="tw-pb-3 tw-relative poke-container tw-container tw-text-default">
      <PokemonDetailHero
        imageSrc={selectedImage}
        isImageLoading={showSelectedImageSkeleton}
        imageTestId="stats-ranking-profile-image"
        imageSkeletonTestId="stats-ranking-profile-image-skeleton"
        profileModifier={profileModifier}
        classificationLabels={classificationLabels}
        table={buildPokemonDetailHeroTable(select, !loading && Boolean(select))}
      />
      <div className="pokemon-detail-sections tw-grid tw-gap-4 xl:tw-grid-cols-2">
        <section className="pokemon-detail-section" data-testid="stats-ranking-stats-section">
          <h4 className="info-title">
            <b>Pokémon stats</b>
          </h4>
          <StableHeightSection isLoading={loading || !select} minHeight={190}>
            <Stats
              statATK={select?.atk}
              statDEF={select?.def}
              statSTA={select?.sta}
              statProd={select?.prod}
              id={select?.num}
              form={select?.form}
              isLoading={loading || !select}
              onStatSelect={selectStatRanking}
            />
          </StableHeightSection>
        </section>
        <section className="pokemon-detail-section" data-testid="stats-ranking-battle-section">
          <h4 className="info-title">
            <b>Battle data</b>
          </h4>
          <StableHeightSection isLoading={!select || movesLoading} minHeight={220}>
            <TableMove
              moveData={moveRanking?.moves}
              rankMoveData={moveRanking?.bestMoves}
              cacheScope="stats-ranking"
              pokemonType={select?.pokemonType}
              compactLayout
              isLoading={!select || movesLoading || pokemonBundle?.id !== select.num}
              maxHeight={400}
            />
          </StableHeightSection>
        </section>
        <section
          ref={rankingTableRef}
          className="pokemon-detail-section xl:tw-col-span-2 tw-scroll-mt-20"
          data-testid="stats-ranking-table-section"
        >
          <h4 className="info-title tw-relative tw-pb-1">
            <b>Stats ranking</b>
            <TableLoadingProgress loading={loading} label="Loading Stats rankings" />
          </h4>
          <div className="tw-relative" aria-busy={loading}>
            <CustomDataTable
              customColumns={columnPokemon}
              data={rows}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationResetDefaultPage={resetPaginationToggle}
              paginationDefaultPage={page}
              paginationPerPage={rowsPerPage}
              paginationRowsPerPageOptions={[20, 50, 100]}
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
              noDataComponent={loading ? <div aria-hidden="true" className="tw-h-24" /> : undefined}
              conditionalRowStyles={conditionalRowStyles}
              customDataStyles={getCustomThemeDataTable(customStyles)}
              isShowSearch
              inputPlaceholder="Search Pokémon Name, Form or ID"
              onSearchTermChange={setSearchTerm}
              debounceTime={300}
              menuItems={menuItems}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatsRanking;
