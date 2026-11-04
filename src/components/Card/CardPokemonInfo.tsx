import React, { useState, useRef } from 'react';
import { computeBgType } from '../../utils/compute';
import { generateParamForm, setNextPokemonImageFallback, splitAndCapitalize } from '../../utils/utils';
import TypeInfo from '../Sprites/Type/Type';
import './CardPokemonInfo.scss';

import APIService from '../../services/api.service';
import { ICardPokemonInfoComponent } from '../models/component.model';
import { combineClasses } from '../../utils/extension';
import { PokemonType } from '../../enums/type.enum';
import { LinkToTop } from '../Link/LinkToTop';
import { useDevice } from '../../composables/useDevice';

interface ProgressiveShinyImageProps {
  alt: string;
  fallbacks?: string[];
  src: string;
  visible: boolean;
}

const ProgressiveShinyImage = ({ alt, fallbacks = [], src, visible }: ProgressiveShinyImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      aria-hidden={!visible}
      alt={alt}
      className={combineClasses(
        'pokemon-sprite-large tw-pointer-events-none tw-absolute tw-inset-0',
        loaded && visible ? 'tw-opacity-100' : 'tw-opacity-0'
      )}
      src={src}
      onLoad={() => setLoaded(true)}
      onError={(event) => {
        setLoaded(false);
        if (!setNextPokemonImageFallback(event.currentTarget, [src, ...fallbacks])) {
          event.currentTarget.onerror = null;
        }
      }}
    />
  );
};

const CardPokemonInfo = (props: ICardPokemonInfoComponent) => {
  const [isShiny, setIsShiny] = useState(false);
  const [hasRequestedShiny, setHasRequestedShiny] = useState(false);
  const { isMobile } = useDevice();

  const shinyRef: React.LegacyRef<HTMLImageElement> = useRef(null);
  const displayGoStat = (value: number) => (value > 0 ? value : '—');
  const showShiny = isShiny || props.isDefaultImg;
  const shouldLoadShiny = Boolean(props.image.shiny && (hasRequestedShiny || showShiny));

  const onTouchEnd = () => {
    if (!isMobile || props.isDefaultImg) {
      return;
    }

    if (isShiny) {
      shinyRef.current?.classList.remove('active');
    } else {
      shinyRef.current?.classList.add('active');
      setHasRequestedShiny(true);
    }
    setIsShiny(!isShiny);
  };

  const onHoverShiny = () => {
    if (isMobile || props.isDefaultImg) {
      return;
    }

    shinyRef.current?.classList.add('active');
    setHasRequestedShiny(true);
    setIsShiny(true);
  };

  const onLeaveShiny = () => {
    if (isMobile || props.isDefaultImg) {
      return;
    }

    shinyRef.current?.classList.remove('active');
    setIsShiny(false);
  };

  return (
    <li
      className="tw-relative border-types tw-h-full"
      style={{ backgroundImage: computeBgType(props.types, PokemonType.Normal, props.styleList, 0.3) }}
    >
      {!props.releasedGO && (
        <div className="no-released-pokemon">
          <img
            width={24}
            height={24}
            title="Coming Soon"
            alt="Pokémon GO Icon"
            src={APIService.getPokemonGoIcon(props.icon)}
          />
        </div>
      )}
      {props.image.shiny && (
        <img
          onTouchEnd={onTouchEnd}
          onMouseOver={onHoverShiny}
          onMouseLeave={onLeaveShiny}
          ref={shinyRef}
          className={combineClasses('shiny-pokemon', props.isDefaultImg ? 'active' : '')}
          height={32}
          src={APIService.getShinyIcon()}
          title="Shiny Pokemon"
          alt="Icon Shiny"
        />
      )}
      <LinkToTop
        className="tw-block tw-h-full pokemon-link"
        to={`/pokemon/${props.id}${generateParamForm(props.form, props.pokemonType)}`}
      >
        <div className="tw-h-full tw-flex tw-flex-col tw-justify-between tw-gap-2">
          <div>
            <div className="tw-flex tw-justify-center tw-p-2">
              <span className="tw-relative tw-block tw-w-24">
                <img
                  className="pokemon-sprite-large"
                  alt={`#${props.id} ${splitAndCapitalize(props.name.replaceAll('_', '-'), '-', ' ')}`}
                  title={`#${props.id} ${splitAndCapitalize(props.name.replaceAll('_', '-'), '-', ' ')}`}
                  src={props.image.default}
                  onError={(e) => {
                    if (
                      !setNextPokemonImageFallback(e.currentTarget, [
                        props.image.default,
                        ...(props.image.fallbacks ?? []),
                        APIService.getPokeSprite(),
                      ])
                    ) {
                      e.currentTarget.onerror = null;
                    }
                  }}
                />
                {shouldLoadShiny && props.image.shiny && (
                  <ProgressiveShinyImage
                    key={props.image.shiny}
                    alt={`Shiny #${props.id} ${splitAndCapitalize(props.name.replaceAll('_', '-'), '-', ' ')}`}
                    fallbacks={props.image.shinyFallbacks}
                    src={props.image.shiny}
                    visible={showShiny}
                  />
                )}
              </span>
            </div>
            <TypeInfo arr={props.types} isHideText height={24} />
            <b>
              <span className="tw-text-sm tw-text-center tw-text-default">{`#${props.id} ${splitAndCapitalize(
                props.name.replaceAll('_', '-'),
                '-',
                ' '
              )}`}</span>
            </b>
          </div>
          <div>
            <div className="tw-flex tw-items-center tw-justify-center tw-w-full">
              <b>
                <span className="caption !tw-text-error">{`ATK ${displayGoStat(props.pokemonStat.atk)}`}</span>
              </b>
            </div>
            <div className="tw-flex tw-items-center tw-justify-center tw-w-full">
              <b>
                <span className="caption !tw-text-success">{`DEF ${displayGoStat(props.pokemonStat.def)}`}</span>
              </b>
            </div>
            <div className="tw-flex tw-items-center tw-justify-center tw-w-full">
              <b>
                <span className="caption !tw-text-cyan-600">{`STA ${displayGoStat(props.pokemonStat.sta)}`}</span>
              </b>
            </div>
          </div>
        </div>
      </LinkToTop>
    </li>
  );
};

export default React.memo(CardPokemonInfo);
