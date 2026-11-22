import type { ReactNode } from 'react';

import type { IPokemonTableComponent } from '../Commons/models/component.model';
import PokemonTable from '../Commons/Tables/Pokemon/PokemonTable';
import { combineClasses } from '../../utils/extension';
import ClassificationBadge from './ClassificationBadge';
import PokemonProfileImageSkeleton from './PokemonProfileImageSkeleton';

interface PokemonDetailHeroProps {
  notice?: ReactNode;
  imageSrc: string;
  imageAlt?: string;
  isImageLoading: boolean;
  imageTestId: string;
  imageSkeletonTestId?: string;
  profileModifier?: string;
  classificationLabels?: readonly string[];
  table: Omit<IPokemonTableComponent, 'className'>;
}

const PokemonDetailHero = ({
  notice,
  imageSrc,
  imageAlt = 'Image Pokemon',
  isImageLoading,
  imageTestId,
  imageSkeletonTestId,
  profileModifier,
  classificationLabels,
  table,
}: PokemonDetailHeroProps) => (
  <section className="pokemon-detail-section pokemon-detail-hero-section tw-w-full tw-text-center tw-inline-block tw-align-middle tw-my-3">
    {notice}
    <div className="tw-contents min-[576px]:tw-inline-flex min-[576px]:tw-max-w-full min-[576px]:tw-items-start min-[576px]:tw-align-top">
      <div className="tw-inline-flex tw-w-pokemon-profile tw-shrink-0 tw-flex-col tw-align-top">
        <div
          className={combineClasses(
            'tw-relative tw-isolate tw-inline-flex tw-items-center tw-justify-center tw-overflow-visible img-desc pokemon-profile-aura',
            profileModifier ? `pokemon-profile-aura--${profileModifier}` : ''
          )}
          aria-busy={isImageLoading}
          data-testid={imageTestId}
          data-profile-modifier={profileModifier}
        >
          {isImageLoading ? (
            <PokemonProfileImageSkeleton testId={imageSkeletonTestId} />
          ) : (
            <img className="pokemon-main-sprite !tw-align-baseline" alt={imageAlt} src={imageSrc} />
          )}
        </div>
        {classificationLabels && (
          <div
            className="tw-mt-2 tw-mb-3 sm:tw-mb-0 tw-flex tw-h-6 tw-items-center tw-justify-center tw-gap-2"
            aria-label="Pokémon classification"
            aria-hidden={classificationLabels.length === 0}
            data-testid="pokemon-classification-badges"
          >
            {classificationLabels.map((label) => (
              <ClassificationBadge key={label} label={label} />
            ))}
          </div>
        )}
      </div>
      <div className="tw-inline-block tw-max-w-full tw-align-top min-[576px]:tw-min-w-0">
        <PokemonTable {...table} className="pokemon-detail-table" />
      </div>
    </div>
  </section>
);

export default PokemonDetailHero;
