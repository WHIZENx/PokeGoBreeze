import React, { Fragment, useEffect, useState } from 'react';

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

import './PokemonModel.scss';
import APIService from '../../../services/api.service';
import { capitalize, getValidPokemonImgPath, splitAndCapitalize } from '../../../utils/utils';
import { IAsset } from '../../../core/models/asset.model';
import { IPokemonModelComponent, PokemonModelComponent } from './models/pokemon-model.model';
import { IPokemonGenderRatio, PokemonGender } from '../../../core/models/pokemon.model';
import { IAssetPokemonModelComponent } from '../../models/component.model';
import { combineClasses, isNotEmpty, safeObjectEntries, UniqValueInArray } from '../../../utils/extension';
import { GenderType } from '../../../core/enums/asset.enum';
import { useIcon } from '../../../composables/useIcon';
import { useAssets } from '../../../composables/useAssets';
import { useSearch } from '../../../composables/useSearch';

const PokemonAssetComponent = (props: IAssetPokemonModelComponent) => {
  const { iconData } = useIcon();
  const { findAssetsById } = useAssets();
  const { searchingMainDetails } = useSearch();

  const [pokeAssets, setPokeAssets] = useState<IPokemonModelComponent[]>([]);
  const [gender, setGender] = useState<PokemonGender>();
  const [asset, setAsset] = useState<IAsset>();

  const getImageList = (id: number | undefined, genderRatio: IPokemonGenderRatio) => {
    const pokemonAsset = findAssetsById(id);
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
    if (searchingMainDetails?.fullName && searchingMainDetails.genderRatio) {
      setPokeAssets(getImageList(searchingMainDetails.id, searchingMainDetails.genderRatio));
    }
  }, [searchingMainDetails]);

  return (
    <div className="tw-mt-2 tw-relative">
      <h4 className="title-evo">
        <b>{`Assets of ${splitAndCapitalize(searchingMainDetails?.pokemonId, '-', ' ')} in Pokémon GO`}</b>
        <img
          className="tw-ml-1"
          width={36}
          height={36}
          alt="Pokémon GO Icon"
          src={APIService.getPokemonGoIcon(iconData)}
        />
      </h4>
      {!props.isLoadedForms ? (
        <div className="ph-item tw-w-full !tw-m-0 !tw-p-0" style={{ height: 176 }}>
          <div
            className="ph-picture ph-col-3 tw-w-full tw-h-full !tw-m-0 !tw-p-0"
            style={{ background: 'var(--custom-default)' }}
          />
        </div>
      ) : (
        <div>
          {pokeAssets.map((assets, index) => (
            <div key={index} className="tw-inline-block group-model tw-text-center">
              {assets.image.map((value, index) => (
                <div
                  key={index}
                  className={combineClasses(
                    'tw-inline-block',
                    value.gender === GenderType.GenderLess ? 'tw-w-full' : 'tw-w-auto'
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
                    <div className={combineClasses('model text-center', value.shiny ? 'tw-w-1/2' : 'tw-w-full')}>
                      <div className="tw-flex tw-w-full tw-justify-center">
                        <div className="tw-w-20">
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
                      <div className="model tw-text-center">
                        <div className="tw-flex tw-w-full tw-justify-center">
                          <div className="tw-w-20">
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
              <div className="desc tw-text-black">{splitAndCapitalize(assets.form, '_', ' ')}</div>
            </div>
          ))}
          {!isNotEmpty(pokeAssets) && (
            <div className="tw-text-red-600 tw-mb-3">&emsp;Assets in Pokémon GO unavailable</div>
          )}
        </div>
      )}
      <h4 className="title-evo">
        <b>{`Sound of ${splitAndCapitalize(searchingMainDetails?.pokemonId, '_', ' ')}`}</b>
      </h4>
      <h6>Pokémon Origin:</h6>
      {!props.isLoadedForms ? (
        <div className="ph-item tw-w-full !tw-m-0 !tw-p-0 tw-h-9">
          <div
            className="ph-picture ph-col-3 tw-w-full tw-h-full !tw-m-0 !tw-p-0"
            style={{ background: 'var(--custom-default)' }}
          />
        </div>
      ) : (
        <Fragment>
          {!isNotEmpty(props.originSoundCry) ? (
            <div className="tw-text-red-600">&emsp;Sound in Pokémon unavailable.</div>
          ) : (
            <ul className="!tw-m-0">
              {props.originSoundCry.map((value, index) => (
                <li key={index} className="tw-list-disc">
                  <h6>Form: {splitAndCapitalize(value.form, '_', ' ')}</h6>
                  <ul className="!tw-m-0">
                    {value.cries &&
                      safeObjectEntries(value.cries).map(([k, v], i) => (
                        <Fragment key={i}>
                          {v && (
                            <li className="tw-list-circle">
                              <h6>Type: {capitalize(k)}</h6>
                              <audio src={v} className="tw-w-full tw-h-8" controls>
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
        <div className="ph-item tw-w-full !tw-m-0 !tw-p-0 tw-h-9">
          <div
            className="ph-picture ph-col-3 tw-w-full tw-h-full !tw-m-0 !tw-p-0"
            style={{ background: 'var(--custom-default)' }}
          />
        </div>
      ) : (
        <Fragment>
          {!isNotEmpty(asset?.sound.cry) ? (
            <div className="tw-text-red-600">&emsp;Sound in Pokémon GO unavailable.</div>
          ) : (
            <ul className="!tw-m-0">
              {asset?.sound.cry.map((value, index) => (
                <li key={index} className="tw-list-disc">
                  <h6>Form: {splitAndCapitalize(value.form, '_', ' ')}</h6>
                  <audio src={APIService.getSoundPokemonGO(value.path)} className="tw-w-full tw-h-8" controls>
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
