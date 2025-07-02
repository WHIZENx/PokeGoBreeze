import React, { Fragment, useEffect, useState } from 'react';

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

import './PokemonModel.scss';
import APIService from '../../../services/api.service';
import { capitalize, getValidPokemonImgPath, safeObjectEntries, splitAndCapitalize } from '../../../utils/utils';
import { SearchingState } from '../../../store/models/state.model';
import { IAsset } from '../../../core/models/asset.model';
import { IPokemonModelComponent, PokemonModelComponent } from './models/pokemon-model.model';
import { IPokemonGenderRatio, PokemonGender } from '../../../core/models/pokemon.model';
import { IAssetPokemonModelComponent } from '../../models/component.model';
import { combineClasses, isNotEmpty, UniqValueInArray } from '../../../utils/extension';
import { GenderType } from '../../../core/enums/asset.enum';
import { useDataStore } from '../../../composables/useDataStore';
import { useIcon } from '../../../composables/useIcon';
import { useSelector } from 'react-redux';

const PokemonAssetComponent = (props: IAssetPokemonModelComponent) => {
  const { iconData } = useIcon();
  const { assetsData } = useDataStore();
  const pokemonData = useSelector((state: SearchingState) => state.searching.mainSearching?.pokemon);

  const [pokeAssets, setPokeAssets] = useState<IPokemonModelComponent[]>([]);
  const [gender, setGender] = useState<PokemonGender>();
  const [asset, setAsset] = useState<IAsset>();

  const getImageList = (id: number | undefined, genderRatio: IPokemonGenderRatio) => {
    const pokemonAsset = assetsData.find((item) => item.id === id);
    setAsset(pokemonAsset);
    setGender({
      malePercent: genderRatio.M,
      femalePercent: genderRatio.F,
      genderlessPercent: Number(genderRatio.M === 0 && genderRatio.F === 0),
    });
    const result = UniqValueInArray(pokemonAsset?.image.map((item) => item.form)).map(
      (value) => new PokemonModelComponent(value, pokemonAsset?.image)
    );
    return result;
  };

  useEffect(() => {
    if (isNotEmpty(assetsData) && pokemonData?.fullName && pokemonData.genderRatio) {
      setPokeAssets(getImageList(pokemonData.id, pokemonData.genderRatio));
    }
  }, [assetsData, pokemonData]);

  return (
    <div className="mt-2 position-relative">
      <h4 className="title-evo">
        <b>{`Assets of ${splitAndCapitalize(pokemonData?.pokemonId, '-', ' ')} in Pokémon GO`}</b>
        <img
          className="ms-1"
          width={36}
          height={36}
          alt="Pokémon GO Icon"
          src={APIService.getPokemonGoIcon(iconData)}
        />
      </h4>
      {!props.isLoadedForms ? (
        <div className="ph-item w-100 m-0 p-0" style={{ height: 176 }}>
          <div
            className="ph-picture ph-col-3 w-100 h-100 m-0 p-0"
            style={{ background: 'var(--background-default)' }}
          />
        </div>
      ) : (
        <div>
          {pokeAssets.map((assets, index) => (
            <div key={index} className="d-inline-block group-model text-center">
              {assets.image.map((value, index) => (
                <div
                  key={index}
                  className={combineClasses(
                    'd-inline-block',
                    value.gender === GenderType.GenderLess ? 'w-100' : 'w-auto'
                  )}
                >
                  <div className="sub-group-model">
                    {gender && !gender.genderlessPercent && (
                      <div className="gender">
                        {value.gender === GenderType.GenderLess ? (
                          <Fragment>
                            {gender.malePercent !== 0 && <MaleIcon sx={{ color: 'blue' }} />}
                            {gender.femalePercent !== 0 && <FemaleIcon sx={{ color: 'red' }} />}
                          </Fragment>
                        ) : (
                          <Fragment>
                            {value.gender === GenderType.Male ? (
                              <MaleIcon sx={{ color: 'blue' }} />
                            ) : (
                              <FemaleIcon sx={{ color: 'red' }} />
                            )}
                          </Fragment>
                        )}
                      </div>
                    )}
                    <div className={combineClasses('model text-center', value.shiny ? 'w-pct-50' : 'w-pct-100')}>
                      <div className="d-flex w-100 justify-content-center">
                        <div style={{ width: 80 }}>
                          <img
                            className="pokemon-sprite-model"
                            alt="Pokémon Model"
                            src={APIService.getPokemonModel(value.default, value.pokemonId)}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getValidPokemonImgPath(
                                e.currentTarget.src,
                                value.pokemonId,
                                value.default
                              );
                            }}
                          />
                        </div>
                      </div>
                      <span className="caption">Default</span>
                    </div>
                    {value.shiny && (
                      <div className="model text-center">
                        <div className="d-flex w-100 justify-content-center">
                          <div style={{ width: 80 }}>
                            <img
                              className="pokemon-sprite-model"
                              alt="Pokémon Model"
                              src={APIService.getPokemonModel(value.shiny, value.pokemonId)}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getValidPokemonImgPath(
                                  e.currentTarget.src,
                                  value.pokemonId,
                                  value.shiny
                                );
                              }}
                            />
                          </div>
                        </div>
                        <span className="caption">Shiny</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="desc text-black">{splitAndCapitalize(assets.form, '_', ' ')}</div>
            </div>
          ))}
          {!isNotEmpty(pokeAssets) && <div className="text-danger mb-3">&emsp;Assets in Pokémon GO unavailable</div>}
        </div>
      )}
      <h4 className="title-evo">
        <b>{`Sound of ${splitAndCapitalize(pokemonData?.pokemonId, '_', ' ')}`}</b>
      </h4>
      <h6>Pokémon Origin:</h6>
      {!props.isLoadedForms ? (
        <div className="ph-item w-100 m-0 p-0 h-9">
          <div
            className="ph-picture ph-col-3 w-100 h-100 m-0 p-0"
            style={{ background: 'var(--background-default)' }}
          />
        </div>
      ) : (
        <Fragment>
          {!isNotEmpty(props.originSoundCry) ? (
            <div className="text-danger">&emsp;Sound in Pokémon unavailable.</div>
          ) : (
            <ul className="m-0">
              {props.originSoundCry.map((value, index) => (
                <li key={index} className="list-style-disc">
                  <h6>Form: {splitAndCapitalize(value.form, '_', ' ')}</h6>
                  <ul className="m-0">
                    {value.cries &&
                      safeObjectEntries(value.cries).map(([k, v], i) => (
                        <Fragment key={i}>
                          {v && (
                            <li className="list-style-circle">
                              <h6>Type: {capitalize(k)}</h6>
                              <audio src={v} className="w-100 h-5" controls>
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
        <div className="ph-item w-100 m-0 p-0 h-9">
          <div
            className="ph-picture ph-col-3 w-100 h-100 m-0 p-0"
            style={{ background: 'var(--background-default)' }}
          />
        </div>
      ) : (
        <Fragment>
          {!isNotEmpty(asset?.sound.cry) ? (
            <div className="text-danger">&emsp;Sound in Pokémon GO unavailable.</div>
          ) : (
            <ul className="m-0">
              {asset?.sound.cry.map((value, index) => (
                <li key={index} className="list-style-disc">
                  <h6>Form: {splitAndCapitalize(value.form, '_', ' ')}</h6>
                  <audio src={APIService.getSoundPokemonGO(value.path)} className="w-100 h-5" controls>
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
