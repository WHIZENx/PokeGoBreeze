import { Badge } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { PokemonType } from '../../../enums/type.enum';
import APIService from '../../../services/api.service';
import useAssets from '../../../composables/useAssets';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
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
    sources.push(APIService.getPokeSprite());
    return [...new Set(sources)];
  }, [animation, formVaries, staticAsset]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => setSourceIndex(0), [imageSources]);

  const image = (
    <PokemonIconType pokemonType={pokemonType} size={30}>
      <img
        key={`${id}-${form}-${sprite}`}
        className="pokemon-sprite"
        data-testid="evolution-pokemon-image"
        data-evolution-sprite={sprite}
        alt={name}
        src={imageSources[sourceIndex]}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setSourceIndex((current) => (current < imageSources.length - 1 ? current + 1 : current))}
      />
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
