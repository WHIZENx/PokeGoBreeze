import React from 'react';
import APIService from '../../../services/api.service';
import { getValidPokemonImgPath, splitAndCapitalize } from '../../../utils/utils';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from 'react-router-dom';
import { ISearchBarMainComponent } from '../../models/page.model';
import { combineClasses } from '../../../utils/extension';

const SearchBarMain = (props: ISearchBarMainComponent) => {
  return (
    <>
      {props.data?.prev && (
        <div
          title="Previous Pokémon"
          className={combineClasses(
            'prev-block !tw-p-0 tw-h-full tw-float-left',
            props.data?.next ? 'next-border' : '',
            `${props.data.next ? 'tw-flex-none !tw-w-1/2' : 'col'}`
          )}
        >
          <Link
            to={`/pokemon/${props.data.prev.id}`}
            className="tw-flex tw-justify-start tw-items-center tw-h-full"
            title={`#${props.data.prev.id} ${splitAndCapitalize(props.data.prev.name, '-', ' ')}`}
          >
            <div className="tw-cursor-pointer">
              <b>
                <NavigateBeforeIcon fontSize="large" />
              </b>
            </div>
            <div className="tw-h-full tw-cursor-pointer tw-w-15">
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
            <div className="tw-w-full tw-cursor-pointer tw-text-left tw-overflow-hidden">
              <div className="tw-text-left">
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
          className={combineClasses(
            'next-block !tw-p-0 tw-h-full tw-float-right',
            props.data?.prev ? 'prev-border' : '',
            `${props.data.prev ? 'tw-flex-none !tw-w-1/2' : 'col'}`
          )}
        >
          <Link
            to={`/pokemon/${props.data.next.id}`}
            className="tw-flex tw-justify-end tw-items-center tw-h-full"
            title={`#${props.data.next.id} ${splitAndCapitalize(props.data.next.name, '-', ' ')}`}
          >
            <div className="tw-w-full tw-cursor-pointer tw-text-right tw-overflow-hidden">
              <div className="tw-text-right">
                <b>#{props.data.next.id}</b>
              </div>
              <div className="text-navigate">{splitAndCapitalize(props.data.next.name, '-', ' ')}</div>
            </div>
            <div className="tw-h-full tw-cursor-pointer tw-w-15">
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
            <div className="tw-cursor-pointer">
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
