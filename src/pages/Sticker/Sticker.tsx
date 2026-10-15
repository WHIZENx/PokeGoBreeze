import { CircularProgress, Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import './Sticker.scss';
import ButtonMui from '../../components/Commons/Buttons/ButtonMui';
import InputMuiSearch from '../../components/Commons/Inputs/InputMuiSearch';
import SelectMui from '../../components/Commons/Selects/SelectMui';
import { ISticker } from '../../core/models/sticker.model';
import { GlobalType } from '../../enums/type.enum';
import APIService from '../../services/api.service';
import { isNotEmpty, toNumber } from '../../utils/extension';
import { useTitle } from '../../utils/hooks/useTitle';
import useSkipStalePageRequest from '../../utils/hooks/useSkipStalePageRequest';
import { splitAndCapitalize } from '../../utils/utils';
import { useSnackbar } from '../../contexts/snackbar.context';
import { ShopType } from './enums/sticker-type.enum';

interface PokemonStickerModel {
  id?: number;
  name: string;
}

interface StickerApiResponse {
  data: {
    stickers: ISticker[];
    stickerAssets?: Record<string, string>;
    pokemonOptions: PokemonStickerModel[];
  };
  meta: { total: number; pages: number };
}

const validShopType = (value: number) => (Object.values(ShopType).includes(value) ? value : ShopType.All);
const validPokemonId = (value: number) =>
  Number.isInteger(value) && value >= GlobalType.None ? value : GlobalType.All;
const stickerName = (value: string) => splitAndCapitalize(value.toLowerCase(), '_', ' ');

const Sticker = () => {
  useTitle({
    title: 'PokéGO Breeze - Stickers List',
    description:
      'Complete collection of all stickers available in Pokémon GO. Find rare and event-exclusive stickers for your collection.',
    keywords: ['Pokémon GO stickers', 'sticker collection', 'rare stickers', 'event stickers', 'Pokémon stickers'],
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q')?.trim() ?? '');
  const [id, setId] = useState(validPokemonId(toNumber(searchParams.get('pokemon'))));
  const [shopType, setShopType] = useState(validShopType(toNumber(searchParams.get('shop'))));
  const [stickers, setStickers] = useState<ISticker[]>([]);
  const [selectPokemon, setSelectPokemon] = useState<PokemonStickerModel[]>([]);
  const [stickerAssets, setStickerAssets] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const latestRequestRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch) {
      next.set('q', debouncedSearch);
    }
    if (id !== GlobalType.All) {
      next.set('pokemon', String(id));
    }
    if (shopType !== ShopType.All) {
      next.set('shop', String(shopType));
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [debouncedSearch, id, searchParams, setSearchParams, shopType]);

  useEffect(() => {
    const nextSearch = searchParams.get('q') ?? '';
    const nextId = validPokemonId(toNumber(searchParams.get('pokemon')));
    const nextShop = validShopType(toNumber(searchParams.get('shop')));
    setSearchTerm(nextSearch);
    setDebouncedSearch(nextSearch.trim());
    setId(nextId);
    setShopType(nextShop);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    setPages(1);
    setLoading(true);
  }, [debouncedSearch, id, shopType]);

  const skipStalePageRequest = useSkipStalePageRequest(page, `${debouncedSearch}|${id}|${shopType}`);

  useEffect(() => {
    if (skipStalePageRequest) {
      return;
    }
    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    APIService.getFetchUrl<StickerApiResponse>(
      APIService.getStickers({ q: debouncedSearch, pokemonId: id, shop: shopType, page, limit: 100 }),
      { signal: controller.signal }
    )
      .then(({ data }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        if (page === 1) {
          setSelectPokemon(data.data.pokemonOptions);
          setStickerAssets(data.data.stickerAssets ?? {});
        } else {
          setStickerAssets((current) => ({ ...current, ...(data.data.stickerAssets ?? {}) }));
        }
        setStickers((current) => (page === 1 ? data.data.stickers : [...current, ...data.data.stickers]));
        setTotal(data.meta.total);
        setPages(data.meta.pages);
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          setFailed(true);
          showSnackbar(`Unable to load stickers: ${error}`, 'error');
        }
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [debouncedSearch, id, page, shopType, showSnackbar, skipStalePageRequest]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && page < pages) {
          setPage((current) => current + 1);
        }
      },
      { rootMargin: '500px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, page, pages]);

  const pokemonOptions = useMemo(
    () => [
      { value: GlobalType.All, label: 'All Pokémon' },
      { value: GlobalType.None, label: 'No Pokémon' },
      ...selectPokemon.map((value) => ({
        value: toNumber(value.id),
        label: `#${value.id} ${splitAndCapitalize(value.name, '_', ' ')}`,
      })),
    ],
    [selectPokemon]
  );
  const hasFilters = Boolean(debouncedSearch || id !== GlobalType.All || shopType !== ShopType.All);
  const isRefreshing = loading && page === 1 && isNotEmpty(stickers);
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setId(GlobalType.All);
    setShopType(ShopType.All);
  };

  return (
    <main className="sticker-page tw-container tw-p-3" data-testid="sticker-page">
      <section
        className="sticker-filters"
        aria-label="Sticker filters"
        data-testid="sticker-filters"
        data-pokemon-option-count={pokemonOptions.length}
      >
        <div className="sticker-filter-field sticker-search-field">
          <label htmlFor="sticker-search">Search</label>
          <InputMuiSearch
            id="sticker-search"
            value={searchTerm}
            placeholder="Sticker ID or Pokémon name"
            onChange={setSearchTerm}
          />
        </div>
        <div className="sticker-filter-field">
          <label id="sticker-pokemon-label">Pokémon</label>
          <SelectMui
            aria-labelledby="sticker-pokemon-label"
            data-testid="sticker-pokemon-select"
            value={id}
            onChangeSelect={setId}
            menuItems={pokemonOptions}
            fullWidth
          />
        </div>
        <div className="sticker-filter-field sticker-shop-filter">
          <label id="sticker-shop-label">Shop availability</label>
          <ToggleButtonGroup
            aria-labelledby="sticker-shop-label"
            exclusive
            fullWidth
            size="small"
            value={shopType}
            onChange={(_, value: ShopType | null) => value !== null && setShopType(value)}
          >
            <ToggleButton value={ShopType.All}>All</ToggleButton>
            <ToggleButton value={ShopType.Available}>Available</ToggleButton>
            <ToggleButton value={ShopType.Unavailable}>Unavailable</ToggleButton>
          </ToggleButtonGroup>
        </div>
        <ButtonMui
          className="sticker-reset"
          variant="outlined"
          disabled={!hasFilters}
          onClick={clearFilters}
          startIcon={<RestartAltIcon />}
          label="Reset"
        />
      </section>

      <div className="sticker-results-heading" aria-live="polite">
        <b>{total} results</b>
        {stickers.length > 0 && <span className="caption">Showing {stickers.length}</span>}
      </div>

      {loading && page === 1 && !isNotEmpty(stickers) ? (
        <div className="sticker-grid" aria-label="Loading stickers">
          {Array.from({ length: 12 }, (_, index) => (
            <Skeleton key={index} className="sticker-card-skeleton" variant="rounded" />
          ))}
        </div>
      ) : failed && !isNotEmpty(stickers) ? (
        <div className="sticker-empty" role="alert">
          <b>Unable to load stickers.</b>
          <span>Try changing the filters or reload the page.</span>
        </div>
      ) : !isNotEmpty(stickers) ? (
        <div className="sticker-empty">
          <CollectionsIcon />
          <b>No stickers found</b>
          <span>Try another sticker ID, Pokémon, or shop filter.</span>
          {hasFilters && <ButtonMui variant="outlined" onClick={clearFilters} label="Clear filters" />}
        </div>
      ) : (
        <div
          className={`sticker-grid${isRefreshing ? ' is-refreshing' : ''}`}
          data-testid="sticker-grid"
          aria-busy={isRefreshing}
        >
          {stickers.map((value) => (
            <article
              key={value.id}
              className="sticker-card"
              data-testid="sticker-card"
              data-sticker-id={value.id}
              data-pokemon-id={value.pokemonId ?? ''}
              data-shop={String(value.isShop)}
            >
              <div className="sticker-artwork">
                <span className={`sticker-shop-status ${value.isShop ? 'is-available' : ''}`}>
                  {value.isShop && <ShoppingCartIcon fontSize="inherit" />}
                  {value.isShop ? 'Shop' : 'Not in shop'}
                </span>
                <img
                  height={112}
                  alt={`${stickerName(value.id)} sticker`}
                  src={value.stickerUrl ?? APIService.getSticker(stickerAssets?.[value.id] ?? value.id.toLowerCase())}
                  data-testid="sticker-image"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.dataset.fallback = 'true';
                    event.currentTarget.src = APIService.getPokeIconSprite();
                  }}
                />
              </div>
              <div className="sticker-card-body">
                <h3 title={stickerName(value.id)}>{stickerName(value.id)}</h3>
                <span className="sticker-pokemon">
                  {value.pokemonId
                    ? `#${value.pokemonId} ${splitAndCapitalize(value.pokemonName, '_', ' ')}`
                    : 'No Pokémon assigned'}
                </span>
                <div className="sticker-meta">
                  <span className="sticker-max-badge">
                    Max <b>{value.maxCount}</b>
                  </span>
                  {value.isShop ? (
                    <span
                      className="sticker-pack-list"
                      aria-label={`Available in packs of ${value.pack.join(' and ')}`}
                    >
                      {value.pack.map((amount) => (
                        <span key={amount} className="sticker-pack-badge">
                          ×{amount}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="sticker-load-more" data-testid="sticker-load-more">
        {loading && page > 1 && <CircularProgress size={28} />}
      </div>
    </main>
  );
};

export default Sticker;
