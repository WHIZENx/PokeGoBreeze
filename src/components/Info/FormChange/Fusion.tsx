import React, { useId } from 'react';
import Xarrow from 'react-xarrows';
import type { PokemonFusionOption } from '../../../core/models/API/pokemon-bundle.model';
import { Params } from '../../../utils/constants';
import { convertModelSpritName } from '../../../utils/utils';
import { formatPokemonDisplayName } from '../../../utils/pokemon-display-name';
import { LinkToTop } from '../../Link/LinkToTop';
import EvolutionPokemonDisplay from '../Evolution/EvolutionPokemonDisplay';

interface FusionProps {
  options: PokemonFusionOption[];
  componentId: number;
  componentName: string;
}

const Fusion = ({ options, componentId, componentName }: FusionProps) => {
  const arrowId = useId().replaceAll(':', '');
  const renderPokemon = (id: number, name: string, form = 'NORMAL') => {
    const label = formatPokemonDisplayName(name);
    const to = `/pokemon/${id}${form === 'NORMAL' ? '' : `?${Params.Form}=${form.toLowerCase().replaceAll('_', '-')}`}`;
    const normalizedName = name.replaceAll('-', '_').toUpperCase();
    const sprite = convertModelSpritName(
      form !== 'NORMAL' && !normalizedName.endsWith(`_${form.toUpperCase()}`) ? `${name}_${form}` : name
    );
    return (
      <LinkToTop to={to}>
        <span className="tw-flex tw-flex-col tw-items-center tw-gap-1">
          <EvolutionPokemonDisplay id={id} name={label} sprite={sprite} />
        </span>
      </LinkToTop>
    );
  };

  return (
    <section>
      <h4 className="title-evo">
        <b>Fusion</b>
      </h4>
      <div className="tw-overflow-x-auto">
        {options.map((option, index) => (
          <div
            key={`${option.baseId}-${option.targetName}`}
            className="!tw-flex tw-w-max tw-min-w-full tw-flex-nowrap tw-items-center tw-justify-center tw-gap-12"
          >
            <div
              id={`${arrowId}-fusion-${index}-origin`}
              className="tw-flex tw-items-center tw-justify-center tw-gap-3"
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
              path="straight"
              startAnchor="right"
              endAnchor="left"
              start={`${arrowId}-fusion-${index}-origin`}
              end={`${arrowId}-fusion-${index}-target`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Fusion;
