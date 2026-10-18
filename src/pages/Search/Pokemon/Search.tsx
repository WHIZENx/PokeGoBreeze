import React, { useState, useEffect, Fragment, useRef } from 'react';

import '../../Tools/CalculateStats/CalculateStats.scss';

import APIService from '../../../services/api.service';
import Pokemon from '../../Pokemon/Pokemon';

import { Action } from 'history';
import { PokemonType } from '../../../enums/type.enum';
import { toNumber } from '../../../utils/extension';
import { SearchOption } from './models/pokemon-search.model';
import useRouter from '../../../composables/useRouter';
import usePokemon from '../../../composables/usePokemon';
import useSearch from '../../../composables/useSearch';
import { formatPokemonSpeciesDisplayName } from '../../../utils/pokemon-display-name';
import SelectCardPokemon from '../../../components/Commons/Selects/SelectCardPokemon';
import { useTitle } from '../../../utils/hooks/useTitle';
import PokemonTableIcon from '../../../components/Sprites/PokemonTableIcon/PokemonTableIcon';
import {
  isPokedexApiResponse,
  type PokedexApiPokemon,
  type PokedexApiResponse,
} from '../../../core/models/API/pokedex.model';
import { pokemonSearchOptionId } from './pokemon-search-navigation';
import { getPokemonKeyboardIndex, getScrollTopToReveal } from '../../../utils/pokemon-keyboard-navigation';

const Search = () => {
  useTitle({
    title: 'PokéGO Breeze - Pokémon Search',
    description:
      'Search and filter Pokémon in Pokémon GO by type, stats, moves, and more. Find the best Pokémon for your battle teams.',
    keywords: ['Pokémon search', 'find Pokémon', 'Pokémon filter', 'Pokémon GO search', 'Pokémon database'],
  });
  const { routerAction } = useRouter();
  const { getPokemonNavigation } = usePokemon();
  const { searchingMainData } = useSearch();

  const [searchOption, setSearchOption] = useState<SearchOption>({
    id: routerAction === Action.Pop && searchingMainData ? toNumber(searchingMainData.pokemon?.id, 1) : 1,
    form: routerAction === Action.Pop && searchingMainData ? searchingMainData.form?.form?.formName : '',
    pokemonType: PokemonType.Normal,
  });
  const [selectId, setSelectId] = useState(
    routerAction === Action.Pop && searchingMainData ? toNumber(searchingMainData.pokemon?.id, 1) : 1
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchPages, setSearchPages] = useState(1);
  const [searchResults, setSearchResults] = useState<PokedexApiPokemon[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const latestSearchRequest = useRef(0);

  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectId(searchOption.id);
  }, [searchOption.id]);

  useEffect(() => {
    const requestId = ++latestSearchRequest.current;
    const controller = new AbortController();
    const delay = searchPage === 1 ? 250 : 0;
    if (searchPage === 1) {
      setSearchResults([]);
    }
    setIsSearchLoading(true);
    const timeout = window.setTimeout(() => {
      APIService.getFetchUrl<PokedexApiResponse>(
        APIService.getPokedex({
          q: searchQuery.trim(),
          defaultOnly: true,
          page: searchPage,
          limit: 100,
        }),
        { signal: controller.signal }
      )
        .then(({ data }) => {
          if (requestId !== latestSearchRequest.current) {
            return;
          }
          if (!isPokedexApiResponse(data)) {
            throw new Error('The Pokémon search service returned an invalid response.');
          }
          setSearchPages(data.meta.pages);
          setSearchResults((current) => {
            if (searchPage === 1) {
              return data.data;
            }
            const existingIds = new Set(current.map((pokemon) => pokemon.num));
            return [...current, ...data.data.filter((pokemon) => !existingIds.has(pokemon.num))];
          });
        })
        .catch((error) => {
          if (requestId === latestSearchRequest.current && !APIService.isCancel(error)) {
            // Keep the last successful result set visible when a refresh fails.
          }
        })
        .finally(() => {
          if (requestId === latestSearchRequest.current) {
            setIsSearchLoading(false);
          }
        });
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [searchPage, searchQuery]);

  const getInfoPoke = (id: number) => {
    setSearchOption({ id });
    setSelectId(id);
  };

  const modifyId = (modify: number) => {
    const navigation = getPokemonNavigation(selectId);
    const targetPokemon = modify < 0 ? navigation.prev : navigation.next;
    if (targetPokemon) {
      setSelectId(targetPokemon.id);
      setSearchOption({ id: targetPokemon.id });
    }
  };

  const onChangeSelect = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const activePokemon = searchResults.find((pokemon) => pokemon.num === selectId);
      if (activePokemon) {
        event.preventDefault();
        setSelectId(activePokemon.num);
        setSearchOption({ id: activePokemon.num });
      }
      return;
    }

    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    const currentIndex = searchResults.findIndex((pokemon) => pokemon.num === selectId);
    const targetIndex = getPokemonKeyboardIndex(searchResults.length, currentIndex, event.key === 'ArrowDown' ? 1 : -1);
    const targetPokemon = searchResults[targetIndex];
    if (targetPokemon) {
      setSelectId(targetPokemon.num);
      scrollToSelectedItem(targetPokemon.num);
    }
  };

  const scrollToSelectedItem = (id: number) => {
    if (!resultsContainerRef.current) {
      return;
    }

    setTimeout(() => {
      const container = resultsContainerRef.current;
      if (!container) {
        return;
      }

      const selectedElement = container.querySelector(`#${pokemonSearchOptionId(id)}`) as HTMLElement;
      if (!selectedElement) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const elementRect = selectedElement.getBoundingClientRect();
      const nextScrollTop = getScrollTopToReveal(
        container.scrollTop,
        containerRect.top,
        containerRect.bottom,
        elementRect.top,
        elementRect.bottom
      );
      if (nextScrollTop !== container.scrollTop) {
        container.scrollTo({ top: nextScrollTop, behavior: 'auto' });
      }
    });
  };

  return (
    <Fragment>
      <div className="tw-container tw-mt-2">
        <h1 id="main" className="tw-text-center">
          Pokémon Info Search
        </h1>
        <SelectCardPokemon
          inputRef={inputRef}
          resultsContainerRef={resultsContainerRef}
          pokemonList={searchResults}
          isRemoteSearch
          isLoading={isSearchLoading}
          hasMore={searchPage < searchPages}
          onLoadMore={() => {
            if (!isSearchLoading && searchPage < searchPages) {
              setSearchPage((page) => page + 1);
            }
          }}
          onSetSearch={(value) => {
            setSearchQuery(value);
            setSearchPage(1);
          }}
          onChangeSelect={onChangeSelect}
          onSetPokemon={(pokemon) => getInfoPoke(pokemon.num)}
          preserveSearchOnSelect
          isFit
          label="Search"
          onFilter={(pokemon) => ({
            name: pokemon.speciesName ?? pokemon.baseSpecies ?? pokemon.name,
            id: pokemon.num,
          })}
          onIsSelectedPokemon={(pokemon) => pokemon.num === selectId}
          getOptionId={(pokemon) => pokemonSearchOptionId(pokemon.num)}
          maxHeight={570}
          cardElement={(pokemon) => (
            <>
              <b>#{pokemon.num}</b>
              <PokemonTableIcon {...pokemon} className="img-search" size={36} />
              {formatPokemonSpeciesDisplayName(pokemon.name, pokemon.speciesName ?? pokemon.baseSpecies)}
            </>
          )}
        />
        <Pokemon
          searchOption={searchOption}
          setSearchOption={setSearchOption}
          onIncId={() => modifyId(1)}
          onDecId={() => modifyId(-1)}
          isSearch
        />
      </div>
    </Fragment>
  );
};

export default Search;
