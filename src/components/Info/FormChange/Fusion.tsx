import React, { useId } from 'react';
import Xarrow from 'react-xarrows';
import { useAssets } from '../../../composables/useAssets';
import type { PokemonFusionOption } from '../../../core/models/API/pokemon-bundle.model';
import type { IAsset } from '../../../core/models/asset.model';
import APIService from '../../../services/api.service';
import { Params } from '../../../utils/constants';
import { formatPokemonDisplayName } from '../../../utils/pokemon-display-name';
import { LinkToTop } from '../../Link/LinkToTop';

interface FusionProps {
  options: PokemonFusionOption[];
  componentId: number;
  componentName: string;
  asset?: IAsset;
}

const Fusion = ({ options, componentId, componentName, asset }: FusionProps) => {
  const { findAssetsById } = useAssets();
  const arrowId = useId().replaceAll(':', '');
  const renderPokemon = (id: number, name: string, form = 'NORMAL') => {
    const images = [...(asset?.id === id ? asset.image : []), ...(findAssetsById(id)?.image ?? [])];
    const image = images.find(
      (entry) => entry.form?.toUpperCase() === form.toUpperCase() && !entry.default.endsWith('.s.icon')
    );
    const squareSrc = image ? APIService.getPokemonSqModel(image.default, id) : undefined;
    const label = formatPokemonDisplayName(name);
    const to = `/pokemon/${id}${form === 'NORMAL' ? '' : `?${Params.Form}=${form.toLowerCase().replaceAll('_', '-')}`}`;
    return (
      <LinkToTop to={to}>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <img
            key={`${id}-${form}-${image?.default ?? ''}`}
            width={96}
            height={96}
            style={{ objectFit: 'contain' }}
            alt={label}
            src={image ? APIService.getPokemonModel(image.default, id) : APIService.getPokeSprite()}
            onError={(event) => {
              if (squareSrc && event.currentTarget.dataset.squareFallback !== 'true') {
                event.currentTarget.dataset.squareFallback = 'true';
                event.currentTarget.src = squareSrc;
                return;
              }
              event.currentTarget.onerror = null;
              event.currentTarget.src = APIService.getPokeSprite();
            }}
          />
          <span>{label}</span>
        </span>
      </LinkToTop>
    );
  };

  return (
    <section>
      <h4 className="title-evo">
        <b>Fusion</b>
      </h4>
      {options.map((option, index) => (
        <div
          key={`${option.baseId}-${option.targetName}`}
          className="caption"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 48 }}
        >
          <div
            id={`${arrowId}-fusion-${index}-origin`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
          >
            {renderPokemon(option.baseId, option.baseName)}
            <span>+</span>
            {renderPokemon(componentId, componentName)}
          </div>
          <div id={`${arrowId}-fusion-${index}-target`}>
            {renderPokemon(option.baseId, option.targetName, option.targetForm)}
          </div>
          <Xarrow
            strokeWidth={2}
            path="grid"
            start={`${arrowId}-fusion-${index}-origin`}
            end={`${arrowId}-fusion-${index}-target`}
          />
        </div>
      ))}
    </section>
  );
};

export default Fusion;
