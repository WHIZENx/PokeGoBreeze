import React from 'react';
import APIService from '../../../services/API.service';
import { getValidPokemonImgPath, splitAndCapitalize } from '../../../utils/utils';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ISearchBarComponent } from '../../models/page.model';
import { Action } from 'history';
import { combineClasses } from '../../../utils/extension';
import { RouterState } from '../../../store/models/state.model';
import { useSelector } from 'react-redux';

const SearchBar = (props: ISearchBarComponent) => {
  const router = useSelector((state: RouterState) => state.router);
  return (
    <>
      {props.data?.prev && (
        <div
          title="Previous Pokémon"
          className={combineClasses(
            'prev-block p-0 h-100 float-start',
            props.data?.next ? 'next-border' : '',
            `col${props.data.next ? '-6' : ''}`
          )}
        >
          <div
            className="d-flex justify-content-start align-items-center h-100"
            onClick={() => {
              if (router.action === Action.Pop) {
                router.action = null;
              }
              props.onDecId?.();
            }}
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
          </div>
        </div>
      )}
      {props.data?.next && (
        <div
          title="Next Pokémon"
          className={combineClasses(
            'next-block p-0 h-100 float-end',
            props.data?.prev ? 'prev-border' : '',
            `col${props.data.prev ? '-6' : ''}`
          )}
        >
          <div
            className="d-flex justify-content-end align-items-center h-100"
            onClick={() => {
              if (router.action === Action.Pop) {
                router.action = null;
              }
              props.onIncId?.();
            }}
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
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
