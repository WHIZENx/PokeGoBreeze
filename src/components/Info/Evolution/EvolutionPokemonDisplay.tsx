import { Badge } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { PokemonType } from '../../../enums/type.enum';
import APIService from '../../../services/api.service';
import useAssets from '../../../composables/useAssets';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import PokemonTableIcon, { resolveExactPokemonIconIndex } from '../../Sprites/PokemonTableIcon/PokemonTableIcon';
import { sortAnimationSources } from '../../../utils/pokemon-animation-assets';

interface EvolutionPokemonDisplayProps {
  id: number;
  name: string;
  form: string;
  sprite: string;
  pokemonType?: PokemonType;
  stage?: number;
  formLabel?: string;
  formVaries?: boolean;
}

const EvolutionPokemonDisplay = ({
  id,
  name,
  form,
  sprite,
  pokemonType = PokemonType.Normal,
  stage,
  formLabel,
  formVaries = false,
}: EvolutionPokemonDisplayProps) => {
  const { findAnimationForm, findExactAssetForm } = useAssets();
  const animation = findAnimationForm(id, form, pokemonType);
  const staticAsset = findExactAssetForm(id, form);
  const imageSources = useMemo(() => {
    if (formVaries) {
      return [APIService.getPokeSprite()];
    }
    const sources = sortAnimationSources(animation?.sources ?? []).map((source) => source.url);
    if (staticAsset) {
      sources.push(APIService.getPokemonSqModel(staticAsset));
    }
    return [...new Set(sources)];
  }, [animation, formVaries, staticAsset]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const exactMiniIcon = resolveExactPokemonIconIndex({ num: id, name, sprite, form, pokemonType });

  useEffect(() => setSourceIndex(0), [imageSources]);

  const activeSource = imageSources[sourceIndex];
  const imageContent = activeSource ? (
    <img
      key={`${id}-${form}-${sprite}-${activeSource}`}
      className="pokemon-sprite"
      data-testid="evolution-pokemon-image"
      data-evolution-sprite={sprite}
      alt={name}
      src={activeSource}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setSourceIndex((current) => current + 1)}
    />
  ) : exactMiniIcon !== undefined ? (
    <PokemonTableIcon
      num={id}
      name={name}
      sprite={sprite}
      form={form}
      pokemonType={pokemonType}
      size={96}
      className="evolution-pokemon-mini-icon"
    />
  ) : (
    <img
      key={`${id}-${form}-${sprite}-unknown`}
      className="pokemon-sprite"
      data-testid="evolution-pokemon-image"
      data-evolution-sprite={sprite}
      alt={name}
      src={APIService.getPokeSprite()}
    />
  );
  const image = (
    <PokemonIconType pokemonType={pokemonType} size={30}>
      {imageContent}
    </PokemonIconType>
  );
  const stageImage = stage ? (
    <Badge color="primary" overlap="circular" badgeContent={stage} className="tw-w-24">
      {image}
    </Badge>
  ) : (
    <span className="img-evo-container">{image}</span>
  );

  return (
    <>
      {formLabel ? (
        <Badge
          color={pokemonType === PokemonType.Purified ? 'info' : 'secondary'}
          overlap="circular"
          badgeContent={formLabel}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          className="evolution-form-badge"
          title={formLabel}
        >
          {stageImage}
        </Badge>
      ) : (
        stageImage
      )}
      <span className="tw-block">
        <b className="tw-text-default">#{id}</b>
      </span>
      <span className="tw-block tw-whitespace-nowrap" data-testid="evolution-pokemon-name">
        <b className="link-title">{name}</b>
      </span>
    </>
  );
};

export default EvolutionPokemonDisplay;
