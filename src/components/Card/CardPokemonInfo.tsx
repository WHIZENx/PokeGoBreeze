import React, { useState, useRef } from 'react';
import { computeBgType } from '../../util/Compute';
import { convertFormName, splitAndCapitalize } from '../../util/Utils';
import ProgressBar from '../Sprites/ProgressBar/ProgressBar';
import TypeInfo from '../Sprites/Type/Type';
import './CardPokemonInfo.scss';

import APIService from '../../services/API.service';
import { Link } from 'react-router-dom';
import { StatsModel, StatsPokemon } from '../../core/models/stats.model';
import { Image } from '../../core/models/asset.model';

const CardPokemonInfo = (props: {
  image: Image;
  id: number;
  name: string;
  forme: string;
  defaultImg: boolean;
  types: string[];
  pokemonStat: StatsPokemon;
  stats: StatsModel;
  icon: string;
  releasedGO: boolean;
}) => {
  const [isShiny, setIsShiny] = useState(false);

  const imageRef: any = useRef(null);
  const shinyRef: any = useRef(null);

  const onTouchEnd = () => {
    if (props.defaultImg) {
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
    if (props.defaultImg) {
      return;
    }

    shinyRef.current?.classList.add('active');
    setIsShiny(true);
  };

  const onLeaveShiny = () => {
    if (props.defaultImg) {
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
          <img
            width={24}
            height={24}
            title={'Coming Soon'}
            alt="pokemon-go-icon"
            src={APIService.getPokemonGoIcon(props.icon ?? 'Standard')}
          />
        </div>
      )}
      {props.image.shiny && (
        <img
          onTouchEnd={onTouchEnd}
          onMouseOver={onHoverShiny}
          onMouseLeave={onLeaveShiny}
          ref={shinyRef}
          className={'shiny-pokemon' + (props.defaultImg ? ' active' : '')}
          height={32}
          src={APIService.getShinyIcon()}
        />
      )}
      <Link
        className="d-block h-100 pokemon-link"
        to={`/pokemon/${props.id}${props.forme ? `?form=${convertFormName(props.id, props.forme.toLowerCase())}` : ''}`}
      >
        <div className="d-flex justify-content-center" style={{ padding: 8 }}>
          <span style={{ width: 96 }}>
            <img
              ref={imageRef}
              className="pokemon-sprite-large"
              alt="pokemon-img"
              src={props.image.shiny && (isShiny || props.defaultImg) ? props.image.shiny : props.image.default ?? ''}
            />
          </span>
        </div>
        <TypeInfo arr={props.types} hideText={true} height={24} />
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
              maxValue={props.stats.attack.max_stats}
              bgColor={'#ececec'}
              color={'var(--bs-danger)'}
            />
          </div>
          <div className="d-flex align-items-center w-100">
            <span className="caption text-black">DEF</span>
            <ProgressBar
              style={{ marginLeft: 3, marginTop: 5 }}
              height={10}
              value={props.pokemonStat.def}
              maxValue={props.stats.defense.max_stats}
              bgColor={'#ececec'}
              color={'var(--bs-success)'}
            />
          </div>
          <div className="d-flex align-items-center w-100">
            <span className="caption text-black">STA</span>
            <ProgressBar
              style={{ marginLeft: 3, marginTop: 5 }}
              height={10}
              value={props.pokemonStat.sta}
              maxValue={props.stats.stamina.max_stats}
              bgColor={'#ececec'}
              color={'var(--bs-info)'}
            />
          </div>
        </div>
      </Link>
    </li>
  );
};

export default CardPokemonInfo;
