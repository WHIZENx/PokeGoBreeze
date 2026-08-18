import { Badge, CircularProgress, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

import { getKeyWithData, splitAndCapitalize } from '../../utils/utils';

import './Sticker.scss';
import APIService from '../../services/api.service';
import React, { Fragment, useEffect, useRef, useState } from 'react';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { ISticker } from '../../core/models/sticker.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { isNotEmpty, toNumber } from '../../utils/extension';
import { GlobalType } from '../../enums/type.enum';
import { ShopType } from './enums/sticker-type.enum';
import SelectMui from '../../components/Commons/Selects/SelectMui';
import Tooltips from '../../components/Commons/Tooltips/Tooltips';
import { useSnackbar } from '../../contexts/snackbar.context';
import useSkipStalePageRequest from '../../utils/hooks/useSkipStalePageRequest';

interface PokemonStickerModel {
  id?: number;
  name: string;
}

interface StickerApiResponse {
  data: { stickers: ISticker[]; pokemonOptions: PokemonStickerModel[] };
  meta: { total: number; pages: number };
}

const Sticker = () => {
  useTitle({
    title: 'PokéGO Breeze - Stickers List',
    description:
      'Complete collection of all stickers available in Pokémon GO. Find rare and event-exclusive stickers for your collection.',
    keywords: ['Pokémon GO stickers', 'sticker collection', 'rare stickers', 'event stickers', 'Pokémon stickers'],
  });
  const [id, setId] = useState(GlobalType.All);
  const [shopType, setShopType] = useState(ShopType.All);
  const [pokemonStickerFilter, setPokemonStickerFilter] = useState<ISticker[]>([]);
  const [selectPokemon, setSelectPokemon] = useState<PokemonStickerModel[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const latestRequestRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setPage(1);
    setPokemonStickerFilter([]);
  }, [id, shopType]);

  const skipStalePageRequest = useSkipStalePageRequest(page, `${id}|${shopType}`);

  useEffect(() => {
    if (skipStalePageRequest) {
      return;
    }
    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    setLoading(true);
    APIService.getFetchUrl<StickerApiResponse>(
      APIService.getStickers({ pokemonId: id, shop: shopType, page, limit: 100 }),
      { signal: controller.signal }
    )
      .then(({ data }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        setSelectPokemon(data.data.pokemonOptions);
        setPokemonStickerFilter((current) => (page === 1 ? data.data.stickers : [...current, ...data.data.stickers]));
        setTotal(data.meta.total);
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          setPokemonStickerFilter([]);
          setTotal(0);
          showSnackbar(`Unable to load stickers: ${error}`, 'error');
        }
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [id, shopType, page, skipStalePageRequest]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && pokemonStickerFilter.length < total) {
          setPage((current) => current + 1);
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, pokemonStickerFilter.length, total]);

  return (
    <div className="tw-container tw-p-3">
      <h2 className="title-leagues tw-mb-3">Sticker List</h2>
      <hr />
      <div className="tw-w-1/4 input-group tw-min-w-75">
        <span className="input-group-text">Find Sticker</span>
        <SelectMui
          formSx={{ width: 200 }}
          value={id}
          onChangeSelect={(value) => setId(value)}
          isNoneBorder
          menuItems={[
            { value: GlobalType.All, label: getKeyWithData(GlobalType, GlobalType.All) },
            { value: GlobalType.None, label: getKeyWithData(GlobalType, GlobalType.None) },
            ...selectPokemon.map((value) => ({
              value: toNumber(value.id),
              label: `#${value.id} ${splitAndCapitalize(value.name, '_', ' ')}`,
            })),
          ]}
        />
      </div>
      <FormControl className="!tw-mt-2">
        <FormLabel>Filter sticker shopping</FormLabel>
        <RadioGroup row value={shopType} onChange={(e) => setShopType(toNumber(e.target.value))}>
          <FormControlLabel value={ShopType.All} control={<Radio />} label="All" />
          <FormControlLabel value={ShopType.Available} control={<Radio />} label="Available" />
          <FormControlLabel value={ShopType.Unavailable} control={<Radio />} label="Unavailable" />
        </RadioGroup>
      </FormControl>
      <div className="sticker-container">
        <h5>
          <span>Sticker</span>
        </h5>
        <div className="sticker-group">
          {loading && !isNotEmpty(pokemonStickerFilter) ? (
            <CircularProgress />
          ) : !isNotEmpty(pokemonStickerFilter) ? (
            <p>No sticker was found.</p>
          ) : (
            <Fragment>
              {pokemonStickerFilter.map((value, index) => (
                <Tooltips
                  key={index}
                  hideBackground
                  arrow
                  colorArrow="var(--custom-pop-over)"
                  title={
                    <div className="popover-info">
                      {value.isShop ? (
                        <span>Available in shop sell pack: {value.pack.join(', ')}</span>
                      ) : (
                        <span>Unavailable in shop</span>
                      )}
                    </div>
                  }
                >
                  <div className="sticker-detail tw-relative">
                    <Badge
                      color="primary"
                      overlap="circular"
                      badgeContent={value.pokemonId ? splitAndCapitalize(value.pokemonName, '_', ' ') : undefined}
                    >
                      <img
                        height={64}
                        alt="Image Sticker"
                        src={value.stickerUrl ?? APIService.getSticker(value.id.toLowerCase())}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = APIService.getPokeIconSprite();
                        }}
                      />
                    </Badge>
                    {value.isShop && (
                      <span className="icon-shop">
                        <ShoppingCartIcon fontSize="small" sx={{ color: 'white' }} />
                      </span>
                    )}
                    <span className="caption">{splitAndCapitalize(value.id.toLowerCase(), '_', ' ')}</span>
                  </div>
                </Tooltips>
              ))}
            </Fragment>
          )}
        </div>
        <div ref={loadMoreRef} className="tw-flex tw-justify-center tw-items-center tw-min-h-10 tw-mt-3">
          {loading && isNotEmpty(pokemonStickerFilter) && <CircularProgress size={26} />}
        </div>
      </div>
    </div>
  );
};

export default Sticker;
