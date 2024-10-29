import React, { useState, useRef } from 'react';
import { computeBgType } from '../../util/compute';
import { splitAndCapitalize } from '../../util/utils';
import ProgressBar from '../Sprites/ProgressBar/ProgressBar';
import TypeInfo from '../Sprites/Type/Type';
import './CardPokemonInfo.scss';

import APIService from '../../services/API.service';
import { Link } from 'react-router-dom';
import { ICardPokemonInfoComponent } from '../models/component.model';
import { combineClasses, getValueOrDefault } from '../../util/extension';

const CardPokemonInfo = (props: ICardPokemonInfoComponent) => {
  const [isShiny, setIsShiny] = useState(false);

  const imageRef: React.LegacyRef<HTMLImageElement> = useRef(null);
  const shinyRef: React.LegacyRef<HTMLImageElement> = useRef(null);

  const onTouchEnd = () => {
    if (props.isDefaultImg) {
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
    if (props.isDefaultImg) {
      return;
    }

    shinyRef.current?.classList.add('active');
    setIsShiny(true);
  };

  const onLeaveShiny = () => {
    if (props.isDefaultImg) {
      return;
    }

    shinyRef.current?.classList.remove('active');
    setIsShiny(false);
  };

  return (
    <li
      className="position-relative pokemon-container border-types h-100"
      style={{ backgroundImage: computeBgType(props.types, false, false, 0.3) }}
    >
      {!props.releasedGO && (
        <div className="no-released-pokemon">
          <img width={24} height={24} title="Coming Soon" alt="pokemon-go-icon" src={APIService.getPokemonGoIcon(props.icon)} />
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
        />
      )}
      <Link
        className="d-block h-100 pokemon-link"
        to={`/pokemon/${props.id}${props.forme ? `?form=${props.forme.toLowerCase().replaceAll('_', '-')}` : ''}`}
      >
        <div className="d-flex justify-content-center" style={{ padding: 8 }}>
          <span style={{ width: 96 }}>
            <img
              ref={imageRef}
              className="pokemon-sprite-large"
              alt="pokemon-img"
              src={props.image.shiny && (isShiny || props.isDefaultImg) ? props.image.shiny : props.image.default}
            />
          </span>
        </div>
        <TypeInfo arr={props.types} isHideText={true} height={24} />
        <b>
          <span style={{ fontSize: 14 }} className="text-info text-center caption text-black">{`#${props.id} ${splitAndCapitalize(
            props.name.replaceAll('_', '-'),
            '-',
            ' '
          )}`}</span>
        </b>
        <div className="element-top">
          <div className="d-flex align-items-center w-100">
            <span className="caption text-black">ATK</span>
            <ProgressBar
              style={{ marginLeft: 3 }}
              height={10}
              value={props.pokemonStat.atk}
              maxValue={getValueOrDefault(Number, props.atkMaxStats)}
              bgColor="#ececec"
              color="var(--bs-danger)"
            />
          </div>
          <div className="d-flex align-items-center w-100">
            <span className="caption text-black">DEF</span>
            <ProgressBar
              style={{ marginLeft: 3, marginTop: 5 }}
              height={10}
              value={props.pokemonStat.def}
              maxValue={getValueOrDefault(Number, props.defMaxStats)}
              bgColor="#ececec"
              color="var(--bs-success)"
            />
          </div>
          <div className="d-flex align-items-center w-100">
            <span className="caption text-black">STA</span>
            <ProgressBar
              style={{ marginLeft: 3, marginTop: 5 }}
              height={10}
              value={props.pokemonStat.sta}
              maxValue={getValueOrDefault(Number, props.staMaxStats)}
              bgColor="#ececec"
              color="var(--bs-info)"
            />
          </div>
        </div>
      </Link>
    </li>
  );
};

export default CardPokemonInfo;
