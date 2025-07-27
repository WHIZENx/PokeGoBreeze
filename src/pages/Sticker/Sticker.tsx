import { Badge, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

import { getKeyWithData, splitAndCapitalize } from '../../utils/utils';

import './Sticker.scss';
import APIService from '../../services/api.service';
import React, { Fragment, useEffect, useState } from 'react';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { OverlayTrigger } from 'react-bootstrap';
import CustomPopover from '../../components/Commons/Popovers/CustomPopover';
import { ISticker } from '../../core/models/sticker.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { isIncludeList, isNotEmpty, toNumber } from '../../utils/extension';
import { GlobalType } from '../../enums/type.enum';
import { ShopType } from './enums/sticker-type.enum';
import useDataStore from '../../composables/useDataStore';
import SelectMui from '../../components/Commons/Selects/SelectMui';

interface PokemonStickerModel {
  id?: number;
  name: string;
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

  const { stickersData } = useDataStore();

  const [selectPokemon, setSelectPokemon] = useState<PokemonStickerModel[]>([]);

  useEffect(() => {
    if (isNotEmpty(stickersData) && !isNotEmpty(selectPokemon)) {
      const result = stickersData
        .reduce((prev: PokemonStickerModel[], curr) => {
          if (
            curr.pokemonName &&
            !isIncludeList(
              prev.map((obj) => obj.name),
              curr.pokemonName
            )
          ) {
            prev.push({
              id: curr.pokemonId,
              name: curr.pokemonName,
            });
          }
          return prev;
        }, [])
        .sort((a, b) => toNumber(a.id) - toNumber(b.id));
      setSelectPokemon(result);
    }
  }, [stickersData, selectPokemon]);

  useEffect(() => {
    if (isNotEmpty(stickersData)) {
      setPokemonStickerFilter(
        stickersData
          .filter((item) => {
            if (shopType === ShopType.All) {
              return true;
            } else if (shopType === ShopType.Unavailable) {
              return !item.isShop;
            }
            return item.isShop;
          })
          .filter((item) => {
            if (id === GlobalType.All) {
              return true;
            } else if (id === GlobalType.None) {
              return !item.pokemonId;
            }
            return item.pokemonId === id;
          })
      );
    }
  }, [id, shopType, stickersData]);

  return (
    <div className="container p-3">
      <h2 className="title-leagues mb-3">Sticker List</h2>
      <hr />
      <div className="w-25 input-group" style={{ minWidth: 300 }}>
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
      <FormControl className="mt-2">
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
          {!isNotEmpty(pokemonStickerFilter) ? (
            <p>No sticker was found.</p>
          ) : (
            <Fragment>
              {pokemonStickerFilter.map((value, index) => (
                <OverlayTrigger
                  key={index}
                  placement="auto"
                  overlay={
                    <CustomPopover id={`popover-sticker-${index}`}>
                      {value.isShop ? (
                        <span>Available in shop sell pack: {value.pack.join(', ')}</span>
                      ) : (
                        <span>Unavailable in shop</span>
                      )}
                    </CustomPopover>
                  }
                >
                  <div className="sticker-detail position-relative">
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
                </OverlayTrigger>
              ))}
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sticker;
