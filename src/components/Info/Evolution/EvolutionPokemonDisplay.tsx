import { Badge } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { PokemonType } from '../../../enums/type.enum';
import APIService from '../../../services/api.service';
import useAssets from '../../../composables/useAssets';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import PokemonTableIcon, {
  pokemonIconSheetSource,
  resolveExactPokemonIconIndex,
} from '../../Sprites/PokemonTableIcon/PokemonTableIcon';
import { sortAnimationSources } from '../../../utils/pokemon-animation-assets';
import { useImageSourceSequence } from '../../../utils/hooks/useImageSourceSequence';

interface EvolutionPokemonDisplayProps {
  id: number;
  name: string;
  form: string;
  sprite: string;
  pokemonType?: PokemonType;
  stage?: number;
  formLabel?: string;
  formVaries?: boolean;
  assetKey?: string;
  onAssetReady?: (assetKey: string) => void;
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
  assetKey,
  onAssetReady,
}: EvolutionPokemonDisplayProps) => {
  const { findAnimationForm, findExactAssetForm } = useAssets();
  const animation = findAnimationForm(id, form, pokemonType);
  const staticAsset = findExactAssetForm(id, form);
  const imageSources = useMemo(() => {
    if (formVaries) {
      return [];
    }
    const sources = sortAnimationSources(animation?.sources ?? []).map((source) => source.url);
    if (staticAsset) {
      sources.push(APIService.getPokemonSqModel(staticAsset));
    }
    const normalizedForm = form.replaceAll('-', '_').toUpperCase();
    const isOrdinaryDefaultForm =
      (normalizedForm === '' || normalizedForm === 'NORMAL') &&
      (pokemonType === PokemonType.None || pokemonType === PokemonType.Normal);
    if (isOrdinaryDefaultForm) {
      sources.push(APIService.getPokeSprite(id));
    }
    return [...new Set(sources)];
  }, [animation, form, formVaries, id, pokemonType, staticAsset]);
  const exactMiniIcon = resolveExactPokemonIconIndex({ num: id, name, sprite, form, pokemonType });
  const { source: activeSource, advanceSource } = useImageSourceSequence(imageSources);
  const reportedAssetKeyRef = useRef('');
  const reportAssetReady = useCallback(() => {
    if (!assetKey || !onAssetReady || reportedAssetKeyRef.current === assetKey) {
      return;
    }
    reportedAssetKeyRef.current = assetKey;
    onAssetReady(assetKey);
  }, [assetKey, onAssetReady]);

  useEffect(() => {
    if (!onAssetReady || activeSource || exactMiniIcon === undefined) {
      return;
    }
    const iconSheetImage = new Image();
    iconSheetImage.addEventListener('load', reportAssetReady);
    iconSheetImage.addEventListener('error', reportAssetReady);
    iconSheetImage.src = pokemonIconSheetSource;
    if (iconSheetImage.complete) {
      reportAssetReady();
    }
    return () => {
      iconSheetImage.removeEventListener('load', reportAssetReady);
      iconSheetImage.removeEventListener('error', reportAssetReady);
    };
  }, [activeSource, exactMiniIcon, reportAssetReady]);

  const imageContent = activeSource ? (
    <img
      key={`${id}-${form}-${sprite}-${activeSource}`}
      className="pokemon-sprite"
      data-testid="evolution-pokemon-image"
      data-evolution-sprite={sprite}
      alt={name}
      src={activeSource}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={reportAssetReady}
      onError={advanceSource}
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
      loading="eager"
      decoding="async"
      onLoad={reportAssetReady}
      onError={reportAssetReady}
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
