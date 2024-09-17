import { Badge, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

import { splitAndCapitalize } from '../../util/utils';

import './Sticker.scss';
import APIService from '../../services/API.service';
import React, { Fragment, useEffect, useState } from 'react';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Form, OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../components/Popover/PopoverConfig';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { ISticker } from '../../core/models/sticker.model';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { getValueOrDefault, isNotEmpty } from '../../util/extension';

interface PokemonStickerModel {
  id?: number | null;
  name: string;
}

const Sticker = () => {
  useChangeTitle('Stickers List');
  const [id, setId] = useState(0);
  const [shopType, setShopType] = useState(0);
  const [pokemonStickerFilter, setPokemonStickerFilter] = useState<ISticker[]>([]);

  const pokeStickerList = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.stickers));

  const [selectPokemon, setSelectPokemon] = useState<PokemonStickerModel[]>([]);

  useEffect(() => {
    if (isNotEmpty(pokeStickerList) && !isNotEmpty(selectPokemon)) {
      const result = pokeStickerList
        .reduce((prev: PokemonStickerModel[], curr) => {
          if (curr.pokemonName && !prev.map((obj) => obj.name).includes(curr.pokemonName)) {
            prev.push({
              id: curr.pokemonId,
              name: curr.pokemonName,
            });
          }
          return prev;
        }, [])
        .sort((a, b) => getValueOrDefault(Number, a.id) - getValueOrDefault(Number, b.id));
      setSelectPokemon(result);
    }
  }, [pokeStickerList, selectPokemon]);

  useEffect(() => {
    if (isNotEmpty(pokeStickerList)) {
      setPokemonStickerFilter(
        pokeStickerList
          .filter((item) => {
            if (!shopType) {
              return true;
            } else if (shopType === 2) {
              return !item.shop;
            }
            return item.shop;
          })
          .filter((item) => {
            if (!id) {
              return true;
            } else if (id === -1) {
              return !item.pokemonId;
            }
            return item.pokemonId === id;
          })
      );
    }
  }, [id, shopType, pokeStickerList]);

  return (
    <div className="container" style={{ padding: 15 }}>
      <h2 className="title-leagues" style={{ marginBottom: 15 }}>
        Sticker List
      </h2>
      <hr />
      <div className="w-25 input-group border-input" style={{ minWidth: 300 }}>
        <span className="input-group-text">Find Sticker</span>
        <Form.Select className="form-control input-search" value={id} onChange={(e) => setId(parseInt(e.target.value))}>
          <option value={0}>All</option>
          <option value={-1}>None</option>
          {selectPokemon.map((value, index) => (
            <option key={index} value={getValueOrDefault(Number, value.id)}>{`#${value.id} ${splitAndCapitalize(
              value.name,
              '_',
              ' '
            )}`}</option>
          ))}
        </Form.Select>
      </div>
      <FormControl className="element-top">
        <FormLabel>Filter sticker shopping</FormLabel>
        <RadioGroup row={true} value={shopType} onChange={(e) => setShopType(parseInt(e.target.value))}>
          <FormControlLabel value={0} control={<Radio />} label="All" />
          <FormControlLabel value={1} control={<Radio />} label="Available" />
          <FormControlLabel value={2} control={<Radio />} label="Unavailable" />
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
                    <PopoverConfig id={`popover-sticker-${index}`}>
                      {value.shop ? <span>Available in shop sell pack: {value.pack.join(', ')}</span> : <span>Unavailable in shop</span>}
                    </PopoverConfig>
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
                        alt="img-sticker"
                        src={value.stickerUrl ?? APIService.getSticker(value.id.toLowerCase())}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
                        }}
                      />
                    </Badge>
                    {value.shop && (
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
