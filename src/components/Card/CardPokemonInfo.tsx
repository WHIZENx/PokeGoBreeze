import React from 'react';
import { computeBgType } from '../../util/Compute';
import { splitAndCapitalize } from '../../util/Utils';
import ProgressBar from '../Sprites/ProgressBar/ProgressBar';
import TypeInfo from '../Sprites/Type/Type';
import './CardPokemonInfo.css';

import BlockIcon from '@mui/icons-material/Block';

const CardPokemonInfo = (props: {
  image: string;
  id: number;
  name: string;
  types: string[];
  pokemonStat: any;
  stats: any;
  releasedGO: boolean;
}) => {
  return (
    <li
      className="position-relative pokemoninfo-container border-types h-100"
      style={{ backgroundImage: computeBgType(props.types, false, false, 0.3) }}
    >
      {!props.releasedGO && <BlockIcon className="block-pokemon" color="error" />}
      {/* <img className="shiny-pokemon" height={32} src={APIService.getShinyIcon()} /> */}
      <div className="d-flex justify-content-center" style={{ padding: 8 }}>
        <span style={{ width: 96 }}>
          <img className="pokemon-sprite-large" alt="pokemon-img" src={props.image} />
        </span>
      </div>
      <TypeInfo arr={props.types} hideText={true} height={24} />
      <b>
        <span style={{ fontSize: 14 }} className="text-info text-center caption text-black">{`#${props.id} ${splitAndCapitalize(
          props.name,
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
    </li>
  );
};

export default CardPokemonInfo;
