import { Badge, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

import { getKeyWithData, splitAndCapitalize } from '../../util/utils';

import './Sticker.scss';
import APIService from '../../services/API.service';
import React, { Fragment, useEffect, useState } from 'react';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Form, OverlayTrigger } from 'react-bootstrap';
import CustomPopover from '../../components/Popover/CustomPopover';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { ISticker } from '../../core/models/sticker.model';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { isIncludeList, isNotEmpty, toNumber } from '../../util/extension';
import { GlobalType } from '../../enums/type.enum';
import { ShopType } from './enums/sticker-type.enum';

interface PokemonStickerModel {
  id?: number;
  name: string;
}

const Sticker = () => {
  useChangeTitle('Stickers List');
  const [id, setId] = useState(GlobalType.All);
  const [shopType, setShopType] = useState(ShopType.All);
  const [pokemonStickerFilter, setPokemonStickerFilter] = useState<ISticker[]>([]);

  const pokeStickerList = useSelector((state: StoreState) => state.store.data.stickers);

  const [selectPokemon, setSelectPokemon] = useState<PokemonStickerModel[]>([]);

  useEffect(() => {
    if (isNotEmpty(pokeStickerList) && !isNotEmpty(selectPokemon)) {
      const result = pokeStickerList
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
  }, [pokeStickerList, selectPokemon]);

  useEffect(() => {
    if (isNotEmpty(pokeStickerList)) {
      setPokemonStickerFilter(
        pokeStickerList
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
  }, [id, shopType, pokeStickerList]);

  return (
    <div className="container p-3">
      <h2 className="title-leagues mb-3">Sticker List</h2>
      <hr />
      <div className="w-25 input-group border-input" style={{ minWidth: 300 }}>
        <span className="input-group-text">Find Sticker</span>
        <Form.Select className="form-control input-search" value={id} onChange={(e) => setId(toNumber(e.target.value))}>
          <option value={GlobalType.All}>{getKeyWithData(GlobalType, GlobalType.All)}</option>
          <option value={GlobalType.None}>{getKeyWithData(GlobalType, GlobalType.None)}</option>
          {selectPokemon
            .filter((value) => toNumber(value.id) > 0)
            .map((value, index) => (
              <option key={index} value={toNumber(value.id)}>{`#${value.id} ${splitAndCapitalize(
                value.name,
                '_',
                ' '
              )}`}</option>
            ))}
        </Form.Select>
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
