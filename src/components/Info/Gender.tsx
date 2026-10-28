import React from 'react';
import APIService from '../../services/api.service';
import { IGenderComponent } from '../models/component.model';
import { TypeSex } from '../../enums/type.enum';
import { getKeyWithData } from '../../utils/utils';
import PokemonIconType from '../Sprites/PokemonIconType/PokemonIconType';
import { Skeleton } from '@mui/material';
import { useImageSourceSequence } from '../../utils/hooks/useImageSourceSequence';
import { IPokemonSprite } from '../../core/models/API/form.model';

export const GenderSkeleton = () => (
  <div className="tw-mt-3 tw-mr-3 tw-flex-none" data-testid="gender-ratio-skeleton">
    <div className="tw-flex tw-items-center tw-gap-x-3">
      <Skeleton data-skeleton-surface="page" variant="rounded" animation="wave" width={40} height={40} />
      <Skeleton data-skeleton-surface="page" variant="text" animation="wave" className="!tw-w-32" />
    </div>
    <div className="tw-mt-2 tw-flex tw-ml-4 tw-gap-x-3">
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="img-form-gender-group !tw-mr-0 tw-flex tw-flex-col tw-items-center">
          <Skeleton data-skeleton-surface="page" variant="rounded" animation="wave" width={96} height={96} />
          <Skeleton data-skeleton-surface="page" variant="text" animation="wave" className="!tw-w-14" />
        </div>
      ))}
    </div>
  </div>
);

export const getGenderSpriteCandidates = (
  sprite: IPokemonSprite | undefined,
  fallbackSprite: IPokemonSprite | undefined,
  sex: TypeSex
) => ({
  default:
    sex === TypeSex.Male
      ? [
          sprite?.frontDefault,
          sprite?.frontFemale,
          sprite?.frontHome,
          sprite?.frontArtwork,
          fallbackSprite?.frontDefault,
          fallbackSprite?.frontFemale,
        ]
      : [
          sprite?.frontFemale,
          sprite?.frontDefault,
          sprite?.frontHome,
          sprite?.frontArtwork,
          fallbackSprite?.frontFemale,
          fallbackSprite?.frontDefault,
        ],
  shiny:
    sex === TypeSex.Male
      ? [sprite?.frontShiny, sprite?.frontShinyFemale, fallbackSprite?.frontShiny, fallbackSprite?.frontShinyFemale]
      : [sprite?.frontShinyFemale, sprite?.frontShiny, fallbackSprite?.frontShinyFemale, fallbackSprite?.frontShiny],
});

const Gender = (props: IGenderComponent) => {
  const spriteCandidates = getGenderSpriteCandidates(props.sprite, props.fallbackSprite, props.sex);
  const defaultSpriteCandidates = [...spriteCandidates.default, APIService.getPokeSprite()];
  const shinySpriteCandidates = [...spriteCandidates.shiny, APIService.getPokeSprite()];
  const { source: defaultSprite, advanceSource: advanceDefaultSprite } =
    useImageSourceSequence(defaultSpriteCandidates);
  const { source: shinySprite, advanceSource: advanceShinySprite } = useImageSourceSequence(shinySpriteCandidates);

  return (
    <div className="tw-mt-3 tw-mr-3 tw-flex-none">
      <div className="tw-flex tw-items-center tw-gap-x-3">
        <img
          className="img-gender"
          width={40}
          height={40}
          alt="Image Pokémon Sex"
          src={APIService.getGenderSprite(getKeyWithData(TypeSex, props.sex))}
        />
        <h6 className="ratio-gender !tw-m-0 tw-whitespace-nowrap">
          {`${getKeyWithData(TypeSex, props.sex)} ${
            props.ratio ? `ratio: ${props.sex === TypeSex.Male ? props.ratio.M * 100 : props.ratio.F * 100}%` : ''
          }`}
        </h6>
      </div>
      <div className="tw-mt-2 tw-flex tw-ml-4 tw-gap-x-3">
        <div className="img-form-gender-group">
          <div className="img-gender-group tw-relative">
            <img
              data-testid="pokemon-form-default-sprite"
              className="tw-h-24 tw-w-24 tw-object-contain"
              width={96}
              height={96}
              alt="Pokémon Image"
              onError={advanceDefaultSprite}
              src={defaultSprite}
            />
            <PokemonIconType pokemonType={props.pokemonType} size={32} className="!tw-right-0 !tw-bottom-0 tw-z-[1]" />
          </div>
          <span className="caption">Default</span>
        </div>
        <div className="img-form-gender-group">
          <div className="img-gender-group tw-relative">
            <img
              data-testid="pokemon-form-shiny-sprite"
              className="tw-h-24 tw-w-24 tw-object-contain"
              width={96}
              height={96}
              alt="Pokémon Image"
              onError={advanceShinySprite}
              src={shinySprite}
            />
            <PokemonIconType pokemonType={props.pokemonType} size={32} className="!tw-right-0 !tw-bottom-0 tw-z-[1]" />
          </div>
          <span className="caption">Shiny</span>
        </div>
      </div>
    </div>
  );
};

export default Gender;
