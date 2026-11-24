import { useLayoutEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react';

import type { IPokemonTableComponent } from '../Commons/models/component.model';
import PokemonTable, { type PokemonTableLayout } from '../Commons/Tables/Pokemon/PokemonTable';
import APIService from '../../services/api.service';
import { combineClasses } from '../../utils/extension';
import { useImageSourceSequence } from '../../utils/hooks/useImageSourceSequence';
import { markImageAsPreloaded } from '../../utils/hooks/usePreloadedImage';
import ClassificationBadge from './ClassificationBadge';
import PokemonProfileImageSkeleton from './PokemonProfileImageSkeleton';

interface PokemonDetailHeroProps {
  notice?: ReactNode;
  imageCandidates: readonly string[];
  imageAlt?: string;
  isImageLoading: boolean;
  imageTestId: string;
  imageSkeletonTestId?: string;
  profileModifier?: string;
  classificationLabels?: readonly string[];
  table: Omit<IPokemonTableComponent, 'className'>;
  tableLayoutRef?: MutableRefObject<PokemonTableLayout | undefined>;
}

const PokemonDetailProfileImage = ({
  imageCandidates,
  imageAlt = 'Image Pokemon',
  isImageLoading,
  imageTestId,
  imageSkeletonTestId,
  profileModifier,
}: Omit<PokemonDetailHeroProps, 'notice' | 'classificationLabels' | 'table' | 'tableLayoutRef'>) => {
  const { source, advanceSource } = useImageSourceSequence([...imageCandidates, APIService.getPokeSprite()]);
  const [loadedSource, setLoadedSource] = useState<string>();
  const showImageSkeleton = isImageLoading || Boolean(source && loadedSource !== source);
  const markLoaded = (image: HTMLImageElement) => {
    markImageAsPreloaded(image.currentSrc || image.src);
    setLoadedSource(source);
  };

  return (
    <div
      className={combineClasses(
        'tw-relative tw-isolate tw-inline-flex tw-items-center tw-justify-center tw-overflow-visible img-desc pokemon-profile-aura',
        profileModifier ? `pokemon-profile-aura--${profileModifier}` : ''
      )}
      aria-busy={showImageSkeleton}
      data-testid={imageTestId}
      data-profile-modifier={profileModifier}
    >
      {showImageSkeleton && <PokemonProfileImageSkeleton testId={imageSkeletonTestId} />}
      {!isImageLoading && source && (
        <img
          key={source}
          ref={(image) => {
            if (image?.complete && image.naturalWidth > 0) {
              markLoaded(image);
            }
          }}
          className={combineClasses(
            'pokemon-main-sprite !tw-align-baseline',
            showImageSkeleton ? '!tw-absolute tw-invisible' : ''
          )}
          alt={imageAlt}
          src={source}
          onLoad={(event) => markLoaded(event.currentTarget)}
          onError={advanceSource}
        />
      )}
    </div>
  );
};

const PokemonDetailHero = ({
  notice,
  classificationLabels,
  table,
  tableLayoutRef,
  ...image
}: PokemonDetailHeroProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const localTableLayoutRef = useRef<PokemonTableLayout>();
  const retainedTableLayoutRef = tableLayoutRef ?? localTableLayoutRef;
  const loadingLayout = table.isLoadedForms ? undefined : retainedTableLayoutRef.current;

  useLayoutEffect(() => {
    const element = tableContainerRef.current?.querySelector('table');
    const label = element?.rows[0]?.cells[0];
    if (!table.isLoadedForms || !element || !label) {
      return;
    }
    const measure = () => {
      const width = element.getBoundingClientRect().width;
      const labelWidth = label.getBoundingClientRect().width;
      if (width > 0 && labelWidth > 0) {
        retainedTableLayoutRef.current = { width, labelWidth };
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(label);
    return () => observer.disconnect();
  }, [retainedTableLayoutRef, table.isLoadedForms]);

  return (
    <section className="pokemon-detail-section pokemon-detail-hero-section tw-w-full tw-text-center tw-inline-block tw-align-middle tw-my-3">
      {notice}
      <div className="tw-contents sm:tw-inline-flex sm:tw-max-w-full sm:tw-items-start sm:tw-align-top">
        <div className="tw-inline-flex tw-w-pokemon-profile tw-shrink-0 tw-flex-col tw-align-top">
          <PokemonDetailProfileImage {...image} />
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
        <div ref={tableContainerRef} className="tw-inline-block tw-max-w-full tw-align-top sm:tw-min-w-0">
          <PokemonTable
            {...table}
            className={combineClasses('pokemon-detail-table', loadingLayout ? 'tw-table-fixed' : '')}
            loadingLayout={loadingLayout}
          />
        </div>
      </div>
    </section>
  );
};

export default PokemonDetailHero;
