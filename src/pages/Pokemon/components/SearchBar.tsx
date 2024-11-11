import React from 'react';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../util/utils';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ISearchBarComponent } from '../../models/page.model';
import { Action } from 'history';
import { AnyAction } from 'redux';
import { combineClasses, toNumber } from '../../../util/extension';

const SearchBar = (props: ISearchBarComponent) => {
  return (
    <>
      {props.data?.prev && (
        <div
          title="Previous Pokémon"
          className={combineClasses('prev-block', `col${props.data.next ? '-6' : ''}`)}
          style={{ float: 'left', padding: 0 }}
        >
          <div
            className="d-flex justify-content-start align-items-center"
            onClick={() => {
              if (props.router.action === Action.Pop) {
                props.router.action = null as AnyAction[''];
              }
              props.onDecId?.();
            }}
            title={`#${props.data.prev.id} ${splitAndCapitalize(props.data.prev.name, '-', ' ')}`}
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
                src={APIService.getPokeFullSprite(props.data.prev.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = APIService.getPokeFullAsset(toNumber(props.data?.prev?.id));
                }}
              />
            </div>
            <div className="w-100" style={{ cursor: 'pointer', textAlign: 'start', overflow: 'hidden' }}>
              <div style={{ textAlign: 'start' }}>
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
          className={combineClasses('next-block', `col${props.data.prev ? '-6' : ''}`)}
          style={{ float: 'right', padding: 0 }}
        >
          <div
            className="d-flex justify-content-end align-items-center"
            onClick={() => {
              if (props.router.action === Action.Pop) {
                props.router.action = null as AnyAction[''];
              }
              props.onIncId?.();
            }}
            title={`#${props.data.next.id} ${splitAndCapitalize(props.data.next.name, '-', ' ')}`}
          >
            <div className="w-100" style={{ cursor: 'pointer', textAlign: 'end', overflow: 'hidden' }}>
              <div style={{ textAlign: 'end' }}>
                <b>#{props.data.next.id}</b>
              </div>
              <div className="text-navigate">{splitAndCapitalize(props.data.next.name, '-', ' ')}</div>
            </div>
            <div style={{ width: 60, cursor: 'pointer' }}>
              <img
                style={{ padding: '5px 0 5px 5px' }}
                className="pokemon-navigate-sprite"
                alt="img-full-pokemon"
                src={APIService.getPokeFullSprite(props.data.next.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = APIService.getPokeFullAsset(toNumber(props.data?.next?.id));
                }}
              />
            </div>
            <div style={{ cursor: 'pointer' }}>
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
