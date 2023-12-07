import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { findAssetForm } from '../../util/Compute';
import { StoreState } from '../../store/models/state.model';
import { PokemonDataModel } from '../../core/models/pokemon.model';

const CardPokemonLarge = (props: {
  value?: PokemonDataModel;
  id: number;
  name: string;
  elite?: boolean;
  shadow?: boolean;
  purified?: boolean;
  special?: boolean;
}) => {
  const assets = useSelector((state: StoreState) => state.store?.data?.assets);

  return (
    <Fragment>
      {props.value ? (
        <div className="d-flex align-items-center">
          <div style={{ width: 64, marginRight: 15 }}>
            <img
              className="pokemon-sprite-medium"
              alt="img-pokemon"
              src={
                findAssetForm(assets ?? [], props.id, props.name)
                  ? APIService.getPokemonModel(findAssetForm(assets ?? [], props.id, props.name))
                  : APIService.getPokeFullSprite(props.id)
              }
            />
          </div>
          <div>
            <b>{props.name ?? props.value}</b> {props.elite && <span className="type-icon-small ic elite-ic">Elite</span>}
            {props.shadow && <span className="type-icon-small ic shadow-ic">Shadow</span>}
            {props.purified && <span className="type-icon-small ic purified-ic">Purified</span>}
            {props.special && <span className="type-icon-small ic special-ic">Special</span>}
          </div>
        </div>
      ) : (
        <Fragment>
          <div className="d-flex justify-content-center align-items-center w-100" style={{ height: 64 }}>
            <b>- Select -</b>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default CardPokemonLarge;
