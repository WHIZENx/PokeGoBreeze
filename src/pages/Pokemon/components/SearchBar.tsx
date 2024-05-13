import React from 'react';
import { OptionsPokemon } from '../../../core/models/pokemon.model';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../util/Utils';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ReduxRouterState } from '@lagunovsky/redux-react-router';

const SearchBar = (props: { data: OptionsPokemon | undefined; router: ReduxRouterState; onDecId?: () => void; onIncId?: () => void }) => {
  return (
    <>
      {props.data?.prev && (
        <div title="Previous Pokémon" className={`prev-block col${props.data?.next ? '-6' : ''}`} style={{ float: 'left', padding: 0 }}>
          <div
            className="d-flex justify-content-start align-items-center"
            onClick={() => {
              if (props.router?.action === 'POP') {
                props.router.action = null as any;
              }
              props.onDecId?.();
            }}
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
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = APIService.getPokeFullAsset(props.data?.prev?.id ?? 0);
                  APIService.getFetchUrl(e.currentTarget?.currentSrc)
                    .then(() => {
                      e.currentTarget.src = APIService.getPokeFullSprite(props.data?.prev?.id ?? 0);
                    })
                    .catch(() => false);
                }}
              />
            </div>
            <div className="w-100" style={{ cursor: 'pointer' }}>
              <div style={{ textAlign: 'start' }}>
                <b>#{props.data?.prev?.id}</b>
              </div>
              <div className="text-navigate">{splitAndCapitalize(props.data?.prev?.name, '-', ' ')}</div>
            </div>
          </div>
        </div>
      )}
      {props.data?.next && (
        <div title="Next Pokémon" className={`next-block col${props.data?.prev ? '-6' : ''}`} style={{ float: 'right', padding: 0 }}>
          <div
            className="d-flex justify-content-end align-items-center"
            onClick={() => {
              if (props.router?.action === 'POP') {
                props.router.action = null as any;
              }
              props.onIncId?.();
            }}
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
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = APIService.getPokeFullAsset(props.data?.next?.id ?? 0);
                  APIService.getFetchUrl(e.currentTarget?.currentSrc)
                    .then(() => {
                      e.currentTarget.src = APIService.getPokeFullSprite(props.data?.next?.id ?? 0);
                    })
                    .catch(() => false);
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
