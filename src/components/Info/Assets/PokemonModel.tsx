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
import { useSearch } from '../../../composables/useSearch';
import { Chip, Skeleton } from '@mui/material';
import { useAssets } from '../../../composables/useAssets';
import { getAvailableOriginSoundCries, getPokemonGoCryFormLabel } from './pokemon-sound.utils';
import { useImageSourceSequence } from '../../../utils/hooks/useImageSourceSequence';

interface PokemonAssetImageProps {
  asset: string;
  id: number | undefined;
}

const PokemonAssetImage = ({ asset, id }: PokemonAssetImageProps) => {
  const primarySource = APIService.getPokemonModel(asset, id);
  const { source, advanceSource } = useImageSourceSequence([
    primarySource,
    getValidPokemonImgPath(primarySource, id, asset),
    APIService.getPokeSprite(id),
    APIService.getPokeSprite(),
  ]);

  return <img className="pokemon-sprite-model" alt="Pokémon Model" src={source} onError={advanceSource} />;
};

const PokemonAssetComponent = (props: IAssetPokemonModelComponent) => {
  const { findAssetsById } = useAssets();
  const { searchingMainDetails } = useSearch();

  const [pokeAssets, setPokeAssets] = useState<IPokemonModelComponent[]>([]);
  const [gender, setGender] = useState<PokemonGender>();
  const [asset, setAsset] = useState<IAsset>();
  const availableOriginSoundCries = getAvailableOriginSoundCries(props.originSoundCry);

  const getImageList = (id: number | undefined, genderRatio: IPokemonGenderRatio) => {
    const pokemonAsset = props.asset?.id === id ? props.asset : findAssetsById(id);
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
  }, [props.asset, searchingMainDetails]);

  const renderGender = (asset: string, id: number | undefined, tag: string) => (
    <div className="tw-flex tw-flex-col tw-w-full tw-justify-center tw-items-center">
      <div className="!tw-w-20">
        <PokemonAssetImage asset={asset} id={id} />
      </div>
      <span className="caption">{tag}</span>
    </div>
  );

  return (
    <div className="tw-mt-2 tw-relative">
      <h4 className="title-evo">
        <b>Pokémon GO assets</b>
      </h4>
      <div className="tw-flex tw-min-h-[206px] tw-flex-wrap" data-testid="pokemon-assets-content">
        {!props.isLoadedForms ? (
          <div className="group-model tw-h-[206px] tw-w-[234px] tw-max-w-full">
            <Skeleton
              data-testid="pokemon-assets-skeleton"
              data-skeleton-surface="page"
              variant="rounded"
              animation="wave"
              className="!tw-h-full !tw-w-full"
            />
          </div>
        ) : (
          <Fragment>
            {pokeAssets.map((assets, index) => (
              <div key={index} className="group-model tw-flex tw-w-fit tw-flex-col tw-items-center">
                <div className="tw-flex tw-flex-wrap tw-w-full tw-items-center">
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
                                {gender.malePercent !== 0 && <MaleIcon className="tw-text-accent-blue" />}
                                {gender.femalePercent !== 0 && <FemaleIcon className="tw-text-accent-red" />}
                              </Fragment>
                            ) : (
                              <Fragment>
                                {value.gender === GenderType.Male ? (
                                  <MaleIcon className="tw-text-accent-blue" />
                                ) : (
                                  <FemaleIcon className="tw-text-accent-red" />
                                )}
                              </Fragment>
                            )}
                          </div>
                        )}
                        <div className={combineClasses('model text-center', value.shiny ? 'tw-w-1/2' : 'tw-w-full')}>
                          {renderGender(value.default, value.pokemonId, 'Default')}
                        </div>
                        {value.shiny && (
                          <div className="model tw-text-center">
                            {renderGender(value.shiny, value.pokemonId, 'Shiny')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="desc tw-text-black">{splitAndCapitalize(assets.form, '_', ' ')}</div>
              </div>
            ))}
            {!isNotEmpty(pokeAssets) && (
              <div className="tw-text-error tw-mb-3">&emsp;Assets in Pokémon GO unavailable</div>
            )}
          </Fragment>
        )}
      </div>
      <h4 className="title-evo">
        <b>Pokémon cry</b>
      </h4>
      <div className="tw-grid tw-grid-cols-1 tw-gap-6 lg:tw-grid-cols-2" data-testid="pokemon-cry-sources">
        <section className="tw-min-w-0">
          <h5 className="!tw-m-0 tw-mb-3 tw-pb-3">
            <Chip component="span" label="Pokémon Origin" size="small" variant="outlined" />
          </h5>
          {!props.isLoadedForms ? (
            <Skeleton variant="rounded" animation="wave" data-skeleton-surface="page" className="!tw-h-9 !tw-w-full" />
          ) : !isNotEmpty(availableOriginSoundCries) ? (
            <div className="tw-text-error">Sound in Pokémon unavailable.</div>
          ) : (
            <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-4">
              {availableOriginSoundCries.map((value) => (
                <div key={value.form} className="tw-min-w-0">
                  <div className="tw-mb-2 tw-flex tw-flex-wrap tw-items-baseline tw-gap-2">
                    <b>Form</b>
                    <span>{splitAndCapitalize(value.form, '_', ' ')}</span>
                  </div>
                  <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-3">
                    {value.cries &&
                      safeObjectEntries(value.cries).map(
                        ([type, source]) =>
                          source && (
                            <div key={`${value.form}-${type}`} className="tw-min-w-0">
                              <span className="caption tw-mb-1 tw-block">{capitalize(type)}</span>
                              <audio src={source} className="tw-h-8 tw-w-full" controls preload="none">
                                <source type="audio/ogg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="tw-min-w-0">
          <h5 className="!tw-m-0 tw-mb-3 tw-pb-3">
            <Chip component="span" label="Pokémon GO" size="small" variant="outlined" />
          </h5>
          {!props.isLoadedForms ? (
            <Skeleton variant="rounded" animation="wave" data-skeleton-surface="page" className="!tw-h-9 !tw-w-full" />
          ) : !isNotEmpty(asset?.sound.cry) ? (
            <div className="tw-text-error">Sound in Pokémon GO unavailable.</div>
          ) : (
            <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-4">
              {asset?.sound.cry.map((value) => (
                <div key={`${value.form}-${value.path}`} className="tw-min-w-0">
                  <div className="tw-mb-2 tw-flex tw-flex-wrap tw-items-baseline tw-gap-2">
                    <b>Form</b>
                    <span>{getPokemonGoCryFormLabel(value.form, value.path)}</span>
                  </div>
                  <audio
                    src={APIService.getSoundPokemonGO(value.path)}
                    className="tw-h-8 tw-w-full"
                    controls
                    preload="none"
                  >
                    <source type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PokemonAssetComponent;
