import React, { Fragment, useEffect, useRef, useState } from 'react';

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

import './PokemonModel.scss';
import APIService from '../../../services/API.service';
import { capitalize, getValidPokemonImgPath, splitAndCapitalize } from '../../../util/utils';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material';
import { SearchingState, StoreState } from '../../../store/models/state.model';
import { IAsset } from '../../../core/models/asset.model';
import { IPokemonModelComponent, PokemonModelComponent } from './models/pokemon-model.model';
import { PokemonGender } from '../../../core/models/pokemon.model';
import { IAssetPokemonModelComponent } from '../../models/component.model';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { isNotEmpty, UniqValueInArray } from '../../../util/extension';
import { GenderType } from '../../../core/enums/asset.enum';

const PokemonAssetComponent = (props: IAssetPokemonModelComponent) => {
  const theme = useTheme<ThemeModify>();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const assets = useSelector((state: StoreState) => state.store.data.assets);
  const pokemonData = useSelector((state: SearchingState) => state.searching.pokemon);

  const [pokeAssets, setPokeAssets] = useState<IPokemonModelComponent[]>([]);
  const gender = useRef<PokemonGender>();
  const sound = useRef<IAsset>();

  const getImageList = () => {
    sound.current = assets.find((item) => item.id === pokemonData?.num);
    const model = sound.current;
    gender.current = {
      malePercent: pokemonData?.genderRatio.M,
      femalePercent: pokemonData?.genderRatio.F,
      genderlessPercent: Number(pokemonData?.genderRatio.M === 0 && pokemonData?.genderRatio.F === 0),
    };
    const result = UniqValueInArray(model?.image.map((item) => item.form)).map((value) => new PokemonModelComponent(value, model?.image));
    return result;
  };

  useEffect(() => {
    if (isNotEmpty(assets) && pokemonData) {
      setPokeAssets(getImageList());
    }
  }, [assets, pokemonData]);

  return (
    <div className="element-top position-relative">
      <h4 className="title-evo">
        <b>{`Assets of ${splitAndCapitalize(pokemonData?.pokemonId, '-', ' ')} in Pokémon GO`}</b>
        <img style={{ marginLeft: 5 }} width={36} height={36} alt="pokemon-go-icon" src={APIService.getPokemonGoIcon(icon)} />
      </h4>
      {!props.isLoadedForms ? (
        <div className="ph-item w-100" style={{ padding: 0, margin: 0, height: 176 }}>
          <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: '#fafafa' }} />
        </div>
      ) : (
        <div>
          {pokeAssets.map((assets, index) => (
            <div key={index} className="d-inline-block group-model text-center">
              {assets.image.map((value, index) => (
                <div key={index} className="d-inline-block" style={{ width: value.gender === GenderType.GenderLess ? '100%' : 'auto' }}>
                  <div className="sub-group-model">
                    {gender.current && !gender.current.genderlessPercent && (
                      <div className="gender">
                        {value.gender === GenderType.GenderLess ? (
                          <Fragment>
                            {gender.current.malePercent !== 0 && <MaleIcon sx={{ color: 'blue' }} />}
                            {gender.current.femalePercent !== 0 && <FemaleIcon sx={{ color: 'red' }} />}
                          </Fragment>
                        ) : (
                          <Fragment>
                            {value.gender === GenderType.Male ? <MaleIcon sx={{ color: 'blue' }} /> : <FemaleIcon sx={{ color: 'red' }} />}
                          </Fragment>
                        )}
                      </div>
                    )}
                    <div className="model text-center" style={{ minWidth: value.shiny ? '50%' : '100%' }}>
                      <div className="d-flex w-100 justify-content-center">
                        <div style={{ width: 80 }}>
                          <img
                            className="pokemon-sprite-model"
                            alt="pokemon-model"
                            src={APIService.getPokemonModel(value.default, value.pokemonId)}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, value.pokemonId, value.default);
                            }}
                          />
                        </div>
                      </div>
                      <span className="caption" style={{ color: theme.palette.customText.caption }}>
                        Default
                      </span>
                    </div>
                    {value.shiny && (
                      <div className="model text-center">
                        <div className="d-flex w-100 justify-content-center">
                          <div style={{ width: 80 }}>
                            <img
                              className="pokemon-sprite-model"
                              alt="pokemon-model"
                              src={APIService.getPokemonModel(value.shiny, value.pokemonId)}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, value.pokemonId, value.shiny);
                              }}
                            />
                          </div>
                        </div>
                        <span className="caption" style={{ color: theme.palette.customText.caption }}>
                          Shiny
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="desc text-black">{splitAndCapitalize(assets.form, '_', ' ')}</div>
            </div>
          ))}
          {!isNotEmpty(pokeAssets) && (
            <div className="text-danger" style={{ marginBottom: 15 }}>
              &emsp;Assets in Pokémon GO unavailable
            </div>
          )}
        </div>
      )}
      <h4 className="title-evo">
        <b>{`Sound of ${splitAndCapitalize(pokemonData?.pokemonId, '_', ' ')}`}</b>
      </h4>
      <h6>Pokémon Origin:</h6>
      {!props.isLoadedForms ? (
        <div className="ph-item w-100" style={{ padding: 0, margin: 0, height: 65 }}>
          <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: '#fafafa' }} />
        </div>
      ) : (
        <Fragment>
          {!isNotEmpty(props.originSoundCry) ? (
            <div className="text-danger">&emsp;Sound in Pokémon unavailable.</div>
          ) : (
            <ul style={{ margin: 0 }}>
              {props.originSoundCry.map((value, index) => (
                <li key={index} style={{ listStyleType: 'disc' }}>
                  <h6>Form: {splitAndCapitalize(value.form, '_', ' ')}</h6>
                  <ul style={{ margin: 0 }}>
                    {Object.entries(value.cries).map(([k, v], i) => (
                      <Fragment key={i}>
                        {v && (
                          <li style={{ listStyleType: 'circle' }}>
                            <h6>Type: {capitalize(k)}</h6>
                            <audio src={v} className="w-100" controls={true} style={{ height: 30 }}>
                              <source type="audio/ogg" />
                              Your browser does not support the audio element.
                            </audio>
                          </li>
                        )}
                      </Fragment>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Fragment>
      )}
      <h6>Pokémon GO:</h6>
      {!props.isLoadedForms ? (
        <div className="ph-item w-100" style={{ padding: 0, margin: 0, height: 65 }}>
          <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: '#fafafa' }} />
        </div>
      ) : (
        <Fragment>
          {!isNotEmpty(sound.current?.sound.cry) ? (
            <div className="text-danger">&emsp;Sound in Pokémon GO unavailable.</div>
          ) : (
            <ul style={{ margin: 0 }}>
              {sound.current?.sound.cry.map((value, index) => (
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
        </Fragment>
      )}
    </div>
  );
};

export default PokemonAssetComponent;
