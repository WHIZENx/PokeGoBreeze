import React from 'react';
import { OptionsPokemon } from '../../../core/models/pokemon.model';
import APIService from '../../../services/API.service';
import { Link } from 'react-router-dom';
import { splitAndCapitalize } from '../../../util/Utils';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const SearchBarMain = (props: { data: OptionsPokemon | undefined; setForm: React.Dispatch<React.SetStateAction<string | undefined>> }) => {
  return (
    <>
      {props.data?.prev && (
        <div title="Previous Pokémon" className={`prev-block col${props.data?.next ? '-6' : ''}`} style={{ float: 'left', padding: 0 }}>
          <Link
            onClick={() => {
              props.setForm(undefined);
            }}
            className="d-flex justify-content-start align-items-center"
            to={'/pokemon/' + props.data?.prev?.id}
            title={`#${props.data?.prev?.id} ${splitAndCapitalize(props.data?.prev?.name, '-', ' ')}`}
          >
            <div style={{ cursor: 'pointer' }}>
              <b>
                <NavigateBeforeIcon fontSize="large" />
              </b>
            </div>
            <div style={{ width: 60, cursor: 'pointer' }}>
              <img
                style={{ padding: '5px 5px 5px 0' }}
                className="pokemon-navigate-sprite"
                alt="img-full-pokemon"
                src={APIService.getPokeFullSprite(props.data?.prev?.id)}
              />
            </div>
            <div className="w-100" style={{ cursor: 'pointer' }}>
              <div style={{ textAlign: 'start' }}>
                <b>#{props.data?.prev?.id}</b>
              </div>
              <div className="text-navigate">{splitAndCapitalize(props.data?.prev?.name, '-', ' ')}</div>
            </div>
          </Link>
        </div>
      )}
      {props.data?.next && (
        <div title="Next Pokémon" className={`next-block col${props.data?.prev ? '-6' : ''}`} style={{ float: 'right', padding: 0 }}>
          <Link
            onClick={() => {
              props.setForm(undefined);
            }}
            className="d-flex justify-content-end align-items-center"
            to={'/pokemon/' + props.data?.next?.id}
            title={`#${props.data?.next?.id} ${splitAndCapitalize(props.data?.next?.name, '-', ' ')}`}
          >
            <div className="w-100" style={{ cursor: 'pointer', textAlign: 'end' }}>
              <div style={{ textAlign: 'end' }}>
                <b>#{props.data?.next?.id}</b>
              </div>
              <div className="text-navigate">{splitAndCapitalize(props.data?.next?.name, '-', ' ')}</div>
            </div>
            <div style={{ width: 60, cursor: 'pointer' }}>
              <img
                style={{ padding: '5px 0 5px 5px' }}
                className="pokemon-navigate-sprite"
                alt="img-full-pokemon"
                src={APIService.getPokeFullSprite(props.data?.next?.id)}
              />
            </div>
            <div style={{ cursor: 'pointer' }}>
              <b>
                <NavigateNextIcon fontSize="large" />
              </b>
            </div>
          </Link>
        </div>
      )}
    </>
  );
};

export default SearchBarMain;
