import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

import './PokemonModel.scss';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../util/Utils';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material';
import { StoreState } from '../../../store/models/state.model';
import { Asset } from '../../../core/models/asset.model';

const PokemonModel = (props: { id: number; name: string }) => {
  const theme = useTheme();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);

  const [pokeAssets, setPokeAssets]: any = useState([]);
  const gender: any = useRef(null);
  const sound: any = useRef(null);

  const getImageList = useCallback(
    (id: number) => {
      sound.current = data?.assets?.find((item) => item.id === id);
      const model: Asset = sound.current;
      const detail = data?.details?.find((item) => item.id === id);
      gender.current = detail ? detail.gender : null;
      return model
        ? [...new Set(model.image.map((item: { form: string }) => item.form))].map((value) => {
            return {
              form: value,
              image: model.image.filter((item: { form: string }) => value === item.form),
            };
          })
        : [];
    },
    [data?.assets]
  );

  useEffect(() => {
    setPokeAssets(getImageList(props.id));
  }, [getImageList, props.id]);

  return (
    <div className="element-top">
      <h4 className="title-evo">
        <b>{'Assets of ' + splitAndCapitalize(props.name, '-', ' ') + ' in Pokémon Go'}</b>
        <img style={{ marginLeft: 5 }} width={36} height={36} alt="pokemon-go-icon" src={APIService.getPokemonGoIcon(icon ?? 'Standard')} />
      </h4>
      <div>
        {pokeAssets.map((assets: { image: any[]; form: string }, index: React.Key) => (
          <div key={index} className="d-inline-block group-model text-center">
            {assets.image.map((value, index: React.Key) => (
              <div key={index} className="d-inline-block" style={{ width: value.gender === 3 ? '100%' : 'auto' }}>
                <div className="sub-group-model">
                  {gender.current && !gender.current.genderlessPercent && (
                    <div className="gender">
                      {value.gender === 3 ? (
                        <Fragment>
                          {gender.current.malePercent !== 0 && <MaleIcon sx={{ color: 'blue' }} />}
                          {gender.current.FemalePercent !== 0 && <FemaleIcon sx={{ color: 'red' }} />}
                        </Fragment>
                      ) : (
                        <Fragment>
                          {value.gender === 1 ? <MaleIcon sx={{ color: 'blue' }} /> : <FemaleIcon sx={{ color: 'red' }} />}
                        </Fragment>
                      )}
                    </div>
                  )}
                  <div className="model text-center" style={{ minWidth: value.shiny ? '50%' : '100%' }}>
                    <div className="d-flex w-100 justify-content-center">
                      <div style={{ width: 80 }}>
                        <img className="pokemon-sprite-model" alt="pokemon-model" src={APIService.getPokemonModel(value.default)} />
                      </div>
                    </div>
                    <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
                      Default
                    </span>
                  </div>
                  {value.shiny && (
                    <div className="model text-center">
                      <div className="d-flex w-100 justify-content-center">
                        <div style={{ width: 80 }}>
                          <img className="pokemon-sprite-model" alt="pokemon-model" src={APIService.getPokemonModel(value.shiny)} />
                        </div>
                      </div>
                      <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
                        Shiny
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="desc text-black">
              {splitAndCapitalize((props.id === 150 && assets.form === 'A' ? 'ARMOR' : assets.form).toLowerCase(), '_', ' ')}
            </div>
          </div>
        ))}
        {pokeAssets.length === 0 && (
          <div className="text-danger" style={{ marginBottom: 15 }}>
            &emsp;Assets in Pokémon Go unavailable
          </div>
        )}
      </div>
      <h4 className="title-evo">
        <b>{'Sound of ' + splitAndCapitalize(props.name, '_', ' ')}</b>
      </h4>
      {/* <h6>Pokémon Origin:</h6>
            <audio className="w-100" controls style={{height: 30}}>
                <source src={APIService.getSoundCryPokemon(props.name)} type="audio/aif"></source>
                Your browser does not support the audio element.
            </audio>
            <h6>Pokémon GO:</h6> */}
      {!sound.current || sound.current.sound.cry.length === 0 ? (
        <div className="text-danger">&emsp;Sound in Pokémon Go unavailable.</div>
      ) : (
        <ul style={{ margin: 0 }}>
          {sound.current.sound.cry.map((value: { form: string; path: string }, index: React.Key) => (
            <li key={index} style={{ listStyleType: 'disc' }}>
              <h6>Form: {splitAndCapitalize(value.form, '_', ' ')}</h6>
              <audio src={APIService.getSoundPokemonGO(value.path)} className="w-100" controls={true} style={{ height: 30 }}>
                <source type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PokemonModel;
