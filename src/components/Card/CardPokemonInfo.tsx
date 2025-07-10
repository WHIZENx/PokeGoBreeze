import React, { useState, useRef } from 'react';
import { computeBgType } from '../../utils/compute';
import { generateParamForm, getValidPokemonImgPath, splitAndCapitalize } from '../../utils/utils';
import TypeInfo from '../Sprites/Type/Type';
import './CardPokemonInfo.scss';

import APIService from '../../services/api.service';
import { ICardPokemonInfoComponent } from '../models/component.model';
import { combineClasses } from '../../utils/extension';
import { PokemonType } from '../../enums/type.enum';
import { LinkToTop } from '../LinkToTop';
import { useDevice } from '../../composables/useDevice';

const CardPokemonInfo = (props: ICardPokemonInfoComponent) => {
  const [isShiny, setIsShiny] = useState(false);
  const { isMobile } = useDevice();

  const imageRef: React.LegacyRef<HTMLImageElement> = useRef(null);
  const shinyRef: React.LegacyRef<HTMLImageElement> = useRef(null);

  const onTouchEnd = () => {
    if (!isMobile || props.isDefaultImg) {
      return;
    }

    if (isShiny) {
      shinyRef.current?.classList.remove('active');
    } else {
      shinyRef.current?.classList.add('active');
    }
    setIsShiny(!isShiny);
  };

  const onHoverShiny = () => {
    if (isMobile || props.isDefaultImg) {
      return;
    }

    shinyRef.current?.classList.add('active');
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
      className="position-relative border-types h-100"
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
      <LinkToTop className="d-block h-100 pokemon-link" to={`/pokemon/${props.id}${generateParamForm(props.form)}`}>
        <div className="h-100 d-flex flex-column justify-content-between gap-2">
          <div>
            <div className="d-flex justify-content-center p-2">
              <span style={{ width: 96 }}>
                <img
                  ref={imageRef}
                  className="pokemon-sprite-large"
                  alt={`#${props.id} ${splitAndCapitalize(props.name.replaceAll('_', '-'), '-', ' ')}`}
                  title={`#${props.id} ${splitAndCapitalize(props.name.replaceAll('_', '-'), '-', ' ')}`}
                  src={props.image.shiny && (isShiny || props.isDefaultImg) ? props.image.shiny : props.image.default}
                  onError={(e) => {
                    const form =
                      props.image.shiny && (isShiny || props.isDefaultImg) ? props.image.shiny : props.image.default;
                    const formList = form.split('/');
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getValidPokemonImgPath(
                      e.currentTarget.src,
                      props.id,
                      formList[formList.length - 1].replace('.png', '')
                    );
                  }}
                />
              </span>
            </div>
            <TypeInfo arr={props.types} isHideText height={24} />
            <b>
              <span className="u-fs-3 text-center theme-text-primary">{`#${props.id} ${splitAndCapitalize(
                props.name.replaceAll('_', '-'),
                '-',
                ' '
              )}`}</span>
            </b>
          </div>
          <div>
            <div className="d-flex align-items-center justify-content-center w-100">
              <b>
                <span className="caption text-danger">{`ATK ${props.pokemonStat.atk}`}</span>
              </b>
            </div>
            <div className="d-flex align-items-center justify-content-center w-100">
              <b>
                <span className="caption text-success">{`DEF ${props.pokemonStat.def}`}</span>
              </b>
            </div>
            <div className="d-flex align-items-center justify-content-center w-100">
              <b>
                <span className="caption text-info">{`STA ${props.pokemonStat.sta}`}</span>
              </b>
            </div>
          </div>
        </div>
      </LinkToTop>
    </li>
  );
};

export default CardPokemonInfo;
