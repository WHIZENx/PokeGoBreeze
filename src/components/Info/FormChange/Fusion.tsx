import React, { useId } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Xarrow, { Xwrapper } from 'react-xarrows';
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
  const isMobileLayout = useMediaQuery('(max-width:639px)');
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
        <span className="tw-flex tw-min-w-0 tw-flex-col tw-items-center tw-gap-1 tw-text-center">
          <EvolutionPokemonDisplay id={id} name={label} sprite={sprite} />
        </span>
      </LinkToTop>
    );
  };

  return (
    <section data-testid="fusion-section">
      <h4 className="title-evo">
        <b>Fusion</b>
      </h4>
      <Xwrapper>
        <div className="tw-flex tw-w-full tw-min-w-0 tw-flex-col tw-gap-10">
          {options.map((option, index) => (
            <div
              key={`${option.baseId}-${option.targetName}`}
              className="tw-flex tw-w-full tw-min-w-0 tw-flex-col tw-items-center tw-justify-center tw-gap-8 sm:tw-flex-row sm:tw-gap-12"
            >
              <div
                id={`${arrowId}-fusion-${index}-origin`}
                data-testid="fusion-origin"
                className="tw-flex tw-w-full tw-min-w-0 tw-items-center tw-justify-center tw-gap-2 sm:tw-w-auto sm:tw-gap-3"
              >
                <span className="tw-min-w-0 tw-flex-1 sm:tw-flex-none">
                  {renderPokemon(option.baseId, option.baseName)}
                </span>
                <span className="tw-shrink-0" aria-label="plus">
                  +
                </span>
                <span className="tw-min-w-0 tw-flex-1 sm:tw-flex-none">
                  {renderPokemon(componentId, componentName)}
                </span>
              </div>
              <div
                id={`${arrowId}-fusion-${index}-target`}
                className="tw-min-w-0 tw-text-center"
                data-testid="fusion-target"
              >
                {renderPokemon(option.baseId, option.targetName, option.targetForm)}
              </div>
              <Xarrow
                strokeWidth={2}
                path={isMobileLayout ? 'grid' : 'straight'}
                startAnchor={isMobileLayout ? 'bottom' : 'right'}
                endAnchor={isMobileLayout ? 'top' : 'left'}
                start={`${arrowId}-fusion-${index}-origin`}
                end={`${arrowId}-fusion-${index}-target`}
              />
            </div>
          ))}
        </div>
      </Xwrapper>
    </section>
  );
};

export default Fusion;
