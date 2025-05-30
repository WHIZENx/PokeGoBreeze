import React from 'react';
import APIService from '../../../services/API.service';
import { getValidPokemonImgPath, splitAndCapitalize } from '../../../util/utils';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from 'react-router-dom';
import { ISearchBarMainComponent } from '../../models/page.model';
import { combineClasses } from '../../../util/extension';

const SearchBarMain = (props: ISearchBarMainComponent) => {
  return (
    <>
      {props.data?.prev && (
        <div
          title="Previous Pokémon"
          className={combineClasses('prev-block p-0 h-100 float-start', `col${props.data.next ? '-6' : ''}`)}
        >
          <Link
            to={`/pokemon/${props.data.prev.id}`}
            className="d-flex justify-content-start align-items-center h-100"
            title={`#${props.data.prev.id} ${splitAndCapitalize(props.data.prev.name, '-', ' ')}`}
          >
            <div className="cursor-pointer">
              <b>
                <NavigateBeforeIcon fontSize="large" />
              </b>
            </div>
            <div className="h-100 cursor-pointer" style={{ width: 60 }}>
              <img
                style={{ padding: '5px 5px 5px 0' }}
                className="pokemon-navigate-sprite"
                alt="Image Pokemon"
                src={APIService.getPokeFullSprite(props.data.prev.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, props.data?.prev?.id);
                }}
              />
            </div>
            <div className="w-100 cursor-pointer text-start overflow-hidden">
              <div className="text-start">
                <b>#{props.data.prev.id}</b>
              </div>
              <div className="text-navigate">{splitAndCapitalize(props.data.prev.name, '-', ' ')}</div>
            </div>
          </Link>
        </div>
      )}
      {props.data?.next && (
        <div
          title="Next Pokémon"
          className={combineClasses('next-block p-0 h-100 float-end', `col${props.data.prev ? '-6' : ''}`)}
        >
          <Link
            to={`/pokemon/${props.data.next.id}`}
            className="d-flex justify-content-end align-items-center h-100"
            title={`#${props.data.next.id} ${splitAndCapitalize(props.data.next.name, '-', ' ')}`}
          >
            <div className="w-100 cursor-pointer text-end overflow-hidden">
              <div className="text-end">
                <b>#{props.data.next.id}</b>
              </div>
              <div className="text-navigate">{splitAndCapitalize(props.data.next.name, '-', ' ')}</div>
            </div>
            <div className="h-100 cursor-pointer" style={{ width: 60 }}>
              <img
                style={{ padding: '5px 0 5px 5px' }}
                className="pokemon-navigate-sprite"
                alt="Image Pokemon"
                src={APIService.getPokeFullSprite(props.data.next.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, props.data?.next?.id);
                }}
              />
            </div>
            <div className="cursor-pointer">
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
