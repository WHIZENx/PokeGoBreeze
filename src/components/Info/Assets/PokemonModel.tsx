import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import VolumeOffOutlinedIcon from '@mui/icons-material/VolumeOffOutlined';

import './PokemonModel.scss';
import APIService from '../../../services/api.service';
import { capitalize, getValidPokemonImgPath, splitAndCapitalize } from '../../../utils/utils';
import { PokemonModelComponent } from './models/pokemon-model.model';
import { PokemonGender } from '../../../core/models/pokemon.model';
import { IAssetPokemonModelComponent } from '../../models/component.model';
import { combineClasses, isNotEmpty, safeObjectEntries, UniqValueInArray } from '../../../utils/extension';
import { GenderType } from '../../../core/enums/asset.enum';
import { useSearch } from '../../../composables/useSearch';
import { Chip, Skeleton } from '@mui/material';
import { useAssets } from '../../../composables/useAssets';
import { getAvailableOriginSoundCries, getPokemonGoCryFormLabel } from './pokemon-sound.utils';
import { useImageSourceSequence } from '../../../utils/hooks/useImageSourceSequence';
import { preloadFirstAvailableImage } from '../../../utils/hooks/usePreloadedImage';

interface PokemonAssetImageProps {
  candidates: string[];
  resolvedSource: string | undefined;
}

const DEFAULT_POKEMON_ASSET_SKELETON_COUNT = 4;

interface AssetLoadingSnapshot {
  assetGroupCount: number;
  hasUnavailableAssets: boolean;
  originCryCount: number;
  pokemonGoCryCount: number;
  hasUnavailableCries: boolean;
}

const DEFAULT_ASSET_LOADING_SNAPSHOT: AssetLoadingSnapshot = {
  assetGroupCount: DEFAULT_POKEMON_ASSET_SKELETON_COUNT,
  hasUnavailableAssets: false,
  originCryCount: 1,
  pokemonGoCryCount: 1,
  hasUnavailableCries: false,
};

const CompactUnavailable = ({ icon, label, testId }: { icon: React.ReactNode; label: string; testId: string }) => (
  <div
    className="tw-inline-flex tw-min-h-10 tw-w-fit tw-max-w-full tw-items-center tw-gap-2 tw-rounded-lg tw-border tw-border-solid tw-border-[var(--divider)] tw-bg-transparent tw-px-3 tw-py-2 tw-text-[var(--text-secondary)]"
    data-testid={testId}
  >
    {icon}
    <span className="tw-text-body2">{label}</span>
  </div>
);

const getPokemonAssetImageCandidates = (asset: string, id: number | undefined) => {
  const primarySource = APIService.getPokemonModel(asset, id);
  return [
    primarySource,
    getValidPokemonImgPath(primarySource, id, asset),
    APIService.getPokeSprite(id),
    APIService.getPokeSprite(),
  ];
};

const getPokemonAssetImageKey = (
  form: string,
  gender: GenderType | undefined,
  id: number | undefined,
  variant: 'default' | 'shiny',
  asset: string
) => `${id ?? 'unknown'}:${form}:${gender ?? GenderType.GenderLess}:${variant}:${asset}`;

const PokemonAssetImage = ({ candidates, resolvedSource }: PokemonAssetImageProps) => {
  const { source, advanceSource } = useImageSourceSequence([resolvedSource, ...candidates]);

  return <img className="pokemon-sprite-model" alt="Pokémon Model" src={source} onError={advanceSource} />;
};

const CrySourceSkeleton = ({ label, count }: { label: string; count: number }) => (
  <section className="tw-min-w-0" data-testid="pokemon-cry-source-skeleton" data-skeleton-count={count}>
    <h5 className="!tw-m-0 !tw-mb-3">
      <Chip component="span" label={label} size="small" variant="outlined" />
    </h5>
    <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-4">
      {Array.from({ length: count }, (_, index) => (
        <div className="tw-min-w-0" key={index}>
          <Skeleton data-skeleton-surface="page" variant="text" animation="wave" className="!tw-mb-2 !tw-w-28" />
          <Skeleton data-skeleton-surface="page" variant="rounded" animation="wave" className="!tw-h-8 !tw-w-full" />
        </div>
      ))}
    </div>
  </section>
);

const PokemonAssetComponent = (props: IAssetPokemonModelComponent) => {
  const { findAssetsById } = useAssets();
  const { searchingMainDetails } = useSearch();

  const availableOriginSoundCries = getAvailableOriginSoundCries(props.originSoundCry);
  const pokemonId = props.asset?.id ?? searchingMainDetails?.id;
  const asset = props.asset?.id === pokemonId ? props.asset : findAssetsById(pokemonId);
  const genderRatio =
    searchingMainDetails && searchingMainDetails.id === pokemonId ? searchingMainDetails.genderRatio : undefined;
  const gender: PokemonGender | undefined = genderRatio
    ? {
        malePercent: genderRatio.M,
        femalePercent: genderRatio.F,
        genderlessPercent: Number(genderRatio.M === 0 && genderRatio.F === 0),
      }
    : undefined;
  const pokeAssets = useMemo(
    () =>
      UniqValueInArray(asset?.image.map((item) => item.form)).map(
        (value) => new PokemonModelComponent(value, asset?.image)
      ),
    [asset]
  );
  const imageRequests = useMemo(
    () =>
      pokeAssets.flatMap((assetGroup) =>
        assetGroup.image.flatMap((image) => {
          const requests = [
            {
              key: getPokemonAssetImageKey(assetGroup.form, image.gender, image.pokemonId, 'default', image.default),
              candidates: getPokemonAssetImageCandidates(image.default, image.pokemonId),
            },
          ];
          if (image.shiny) {
            requests.push({
              key: getPokemonAssetImageKey(assetGroup.form, image.gender, image.pokemonId, 'shiny', image.shiny),
              candidates: getPokemonAssetImageCandidates(image.shiny, image.pokemonId),
            });
          }
          return requests;
        })
      ),
    [pokeAssets]
  );
  const imageRequestKey = JSON.stringify(imageRequests);
  const [preloadedImages, setPreloadedImages] = useState<{
    requestKey: string;
    sources: Record<string, string | undefined>;
  }>({ requestKey: '', sources: {} });

  useEffect(() => {
    if (!props.isLoadedForms || imageRequests.length === 0) {
      return;
    }
    let active = true;
    Promise.all(imageRequests.map(({ candidates }) => preloadFirstAvailableImage(candidates))).then((sources) => {
      if (active) {
        setPreloadedImages({
          requestKey: imageRequestKey,
          sources: Object.fromEntries(imageRequests.map(({ key }, index) => [key, sources[index]])),
        });
      }
    });
    return () => {
      active = false;
    };
  }, [imageRequestKey, imageRequests, props.isLoadedForms]);

  const areAssetImagesLoaded =
    props.isLoadedForms && (imageRequests.length === 0 || preloadedImages.requestKey === imageRequestKey);
  const hasPokemonGoAssets = isNotEmpty(pokeAssets);
  const hasOriginCries = isNotEmpty(availableOriginSoundCries);
  const hasPokemonGoCries = isNotEmpty(asset?.sound.cry);
  const hasAnyCry = hasOriginCries || hasPokemonGoCries;
  const originCryCount = availableOriginSoundCries.reduce(
    (count, value) => count + safeObjectEntries(value.cries).filter(([, source]) => Boolean(source)).length,
    0
  );
  const pokemonGoCryCount = asset?.sound.cry.length ?? 0;
  const lastLoadedAssetSnapshot = useRef<AssetLoadingSnapshot>(DEFAULT_ASSET_LOADING_SNAPSHOT);

  useEffect(() => {
    if (areAssetImagesLoaded) {
      lastLoadedAssetSnapshot.current = {
        assetGroupCount: pokeAssets.length,
        hasUnavailableAssets: !hasPokemonGoAssets,
        originCryCount,
        pokemonGoCryCount,
        hasUnavailableCries: !hasAnyCry,
      };
    }
  }, [areAssetImagesLoaded, hasAnyCry, hasPokemonGoAssets, originCryCount, pokeAssets.length, pokemonGoCryCount]);

  const loadingSnapshot = lastLoadedAssetSnapshot.current;

  const renderGender = (candidates: string[], resolvedSource: string | undefined, tag: string) => (
    <div className="tw-flex tw-flex-col tw-w-full tw-justify-center tw-items-center">
      <div className="!tw-w-20">
        <PokemonAssetImage candidates={candidates} resolvedSource={resolvedSource} />
      </div>
      <span className="caption">{tag}</span>
    </div>
  );

  return (
    <div className="tw-relative tw-mt-2 tw-flex tw-flex-col tw-gap-6">
      <section className="tw-min-w-0">
        <h4 className="title-evo !tw-m-0 !tw-mb-3">
          <b>Pokémon GO assets</b>
        </h4>
        <div
          aria-busy={!areAssetImagesLoaded}
          className={combineClasses(
            'tw-flex tw-flex-wrap',
            !areAssetImagesLoaded || hasPokemonGoAssets ? 'tw-min-h-[206px]' : 'tw-min-h-0'
          )}
          data-testid="pokemon-assets-content"
        >
          {!areAssetImagesLoaded ? (
            <div className="tw-flex tw-w-full tw-flex-wrap" data-testid="pokemon-assets-skeleton">
              {Array.from({ length: loadingSnapshot.assetGroupCount }, (_, index) => (
                <div
                  key={index}
                  className="group-model tw-h-[206px] tw-w-[234px] tw-max-w-full"
                  data-testid="pokemon-asset-skeleton-card"
                >
                  <Skeleton
                    data-skeleton-surface="page"
                    variant="rounded"
                    animation="wave"
                    className="!tw-h-full !tw-w-full"
                  />
                </div>
              ))}
              {loadingSnapshot.hasUnavailableAssets && (
                <Skeleton
                  data-skeleton-surface="page"
                  variant="rounded"
                  animation="wave"
                  className="!tw-h-10 !tw-w-72 !tw-max-w-full"
                  data-testid="pokemon-assets-unavailable-skeleton"
                />
              )}
            </div>
          ) : (
            <Fragment>
              {pokeAssets.map((assets) => (
                <div key={assets.form} className="group-model tw-flex tw-w-fit tw-flex-col tw-items-center">
                  <div className="tw-flex tw-flex-wrap tw-w-full tw-items-center">
                    {assets.image.map((value) => {
                      const defaultKey = getPokemonAssetImageKey(
                        assets.form,
                        value.gender,
                        value.pokemonId,
                        'default',
                        value.default
                      );
                      const shinyKey = value.shiny
                        ? getPokemonAssetImageKey(assets.form, value.gender, value.pokemonId, 'shiny', value.shiny)
                        : undefined;
                      return (
                        <div
                          key={`${assets.form}:${value.gender ?? GenderType.GenderLess}:${value.default}`}
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
                            <div
                              className={combineClasses('model text-center', value.shiny ? 'tw-w-1/2' : 'tw-w-full')}
                            >
                              {renderGender(
                                getPokemonAssetImageCandidates(value.default, value.pokemonId),
                                preloadedImages.sources[defaultKey],
                                'Default'
                              )}
                            </div>
                            {value.shiny && (
                              <div className="model tw-text-center">
                                {renderGender(
                                  getPokemonAssetImageCandidates(value.shiny, value.pokemonId),
                                  shinyKey ? preloadedImages.sources[shinyKey] : undefined,
                                  'Shiny'
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="desc tw-text-black">{splitAndCapitalize(assets.form, '_', ' ')}</div>
                </div>
              ))}
              {!hasPokemonGoAssets && (
                <CompactUnavailable
                  icon={<ImageNotSupportedOutlinedIcon fontSize="small" />}
                  label="Pokémon GO image assets unavailable"
                  testId="pokemon-assets-unavailable"
                />
              )}
            </Fragment>
          )}
        </div>
      </section>
      <section className="tw-min-w-0">
        <h4 className="title-evo !tw-m-0 !tw-mb-4 tw-flex tw-flex-wrap tw-items-center tw-gap-2">
          <b>Pokémon cry</b>
          {props.isLoadedForms && hasAnyCry && (!hasOriginCries || !hasPokemonGoCries) && (
            <span className="tw-inline-flex tw-min-h-7 tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-[var(--divider)] tw-bg-transparent tw-px-2 tw-py-1 tw-text-caption tw-font-normal tw-leading-none tw-text-[var(--text-secondary)]">
              {!hasOriginCries ? 'Origin unavailable' : 'Pokémon GO unavailable'}
            </span>
          )}
        </h4>
        {!props.isLoadedForms ? (
          <div
            className={combineClasses(
              'tw-grid tw-grid-cols-1 tw-gap-6',
              loadingSnapshot.originCryCount > 0 && loadingSnapshot.pokemonGoCryCount > 0
                ? 'lg:tw-grid-cols-2'
                : 'lg:tw-max-w-3xl'
            )}
            data-testid="pokemon-cry-sources"
            aria-busy="true"
          >
            {loadingSnapshot.originCryCount > 0 && (
              <CrySourceSkeleton label="Pokémon Origin" count={loadingSnapshot.originCryCount} />
            )}
            {loadingSnapshot.pokemonGoCryCount > 0 && (
              <CrySourceSkeleton label="Pokémon GO" count={loadingSnapshot.pokemonGoCryCount} />
            )}
            {loadingSnapshot.hasUnavailableCries && (
              <Skeleton
                data-skeleton-surface="page"
                variant="rounded"
                animation="wave"
                className="!tw-h-10 !tw-w-64 !tw-max-w-full"
                data-testid="pokemon-cries-unavailable-skeleton"
              />
            )}
          </div>
        ) : !hasAnyCry ? (
          <CompactUnavailable
            icon={<VolumeOffOutlinedIcon fontSize="small" />}
            label="Cry audio unavailable"
            testId="pokemon-cries-unavailable"
          />
        ) : (
          <div
            className={combineClasses(
              'tw-grid tw-grid-cols-1 tw-gap-6',
              hasOriginCries && hasPokemonGoCries ? 'lg:tw-grid-cols-2' : 'lg:tw-max-w-3xl'
            )}
            data-testid="pokemon-cry-sources"
          >
            {hasOriginCries && (
              <section className="tw-min-w-0">
                <h5 className="!tw-m-0 !tw-mb-3">
                  <Chip component="span" label="Pokémon Origin" size="small" variant="outlined" />
                </h5>
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
                                  <audio src={source} className="tw-h-8 tw-w-full" controls preload="metadata">
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
              </section>
            )}
            {hasPokemonGoCries && (
              <section className="tw-min-w-0">
                <h5 className="!tw-m-0 !tw-mb-3">
                  <Chip component="span" label="Pokémon GO" size="small" variant="outlined" />
                </h5>
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
                        preload="metadata"
                      >
                        <source type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default PokemonAssetComponent;
