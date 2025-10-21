import React, { useState, useEffect, Fragment, useRef } from 'react';

import '../../Tools/CalculateStats/CalculateStats.scss';

import APIService from '../../../services/api.service';
import Pokemon from '../../Pokemon/Pokemon';

import { Action } from 'history';
import { PokemonType } from '../../../enums/type.enum';
import { toNumber } from '../../../utils/extension';
import { SearchOption } from './models/pokemon-search.model';
import { keyDown, keyEnter, keyUp } from '../../../utils/helpers/options-context.helpers';
import useRouter from '../../../composables/useRouter';
import usePokemon from '../../../composables/usePokemon';
import useSearch from '../../../composables/useSearch';
import SelectCardPokemon from '../../../components/Commons/Selects/SelectCardPokemon';
import { useTitle } from '../../../utils/hooks/useTitle';

const Search = () => {
  useTitle({
    title: 'PokéGO Breeze - Pokémon Search',
    description:
      'Search and filter Pokémon in Pokémon GO by type, stats, moves, and more. Find the best Pokémon for your battle teams.',
    keywords: ['Pokémon search', 'find Pokémon', 'Pokémon filter', 'Pokémon GO search', 'Pokémon database'],
  });
  const { routerAction } = useRouter();
  const { getPokemonById, getDefaultPokemons } = usePokemon();
  const { searchingMainData } = useSearch();

  const [searchOption, setSearchOption] = useState<SearchOption>({
    id: routerAction === Action.Pop && searchingMainData ? toNumber(searchingMainData.pokemon?.id, 1) : 1,
    form: routerAction === Action.Pop && searchingMainData ? searchingMainData.form?.form?.formName : '',
    pokemonType: PokemonType.Normal,
  });
  const [selectId, setSelectId] = useState(
    routerAction === Action.Pop && searchingMainData ? toNumber(searchingMainData.pokemon?.id, 1) : 1
  );

  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectId(searchOption.id);
  }, [searchOption.id]);

  const getInfoPoke = (id: number) => {
    setSearchOption({ id });
    setSelectId(id);
  };

  const modifyId = (modify: number) => {
    const currentPokemon = getPokemonById(selectId + modify);
    if (currentPokemon) {
      setSelectId(selectId + modify);
      setSearchOption({ id: toNumber(currentPokemon.id) });
    }
  };

  const onChangeSelect = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const currentPokemon = getPokemonById(selectId);
    if (currentPokemon) {
      const prev = getPokemonById(currentPokemon.id - 1);
      const next = getPokemonById(currentPokemon.id + 1);
      if (event.keyCode === keyEnter()) {
        inputRef.current?.blur();
        setSearchOption({ id: selectId });
      } else if (prev && event.keyCode === keyUp()) {
        event.preventDefault();
        setSelectId(prev.id);
        scrollToSelectedItem(prev.id);
      } else if (next && event.keyCode === keyDown()) {
        event.preventDefault();
        setSelectId(next.id);
        scrollToSelectedItem(next.id);
      }
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

      const selectedElement = container.querySelector(`#pokemon-card-${id}`) as HTMLElement;
      if (!selectedElement) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + containerRect.height;
      const elementTop = selectedElement.offsetTop;
      const elementBottom = elementTop + selectedElement.offsetHeight;

      const isInView = elementTop >= containerTop && elementBottom <= containerBottom;

      if (!isInView) {
        if (elementTop < containerTop) {
          container.scrollTo({
            top: elementTop,
            behavior: 'smooth',
          });
        } else if (elementBottom > containerBottom) {
          container.scrollTo({
            top: elementBottom - containerRect.height,
            behavior: 'smooth',
          });
        }
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
          pokemonList={getDefaultPokemons()}
          onChangeSelect={onChangeSelect}
          onSetPokemon={(pokemon) => getInfoPoke(pokemon.num)}
          isFit
          label="Search"
          onFilter={(pokemon) => ({ name: pokemon.name, id: pokemon.num })}
          onIsSelectedPokemon={(pokemon) => pokemon.num === selectId}
          maxHeight={570}
          cardElement={(pokemon) => (
            <>
              <b>#{pokemon.num}</b>
              <img
                width={36}
                height={36}
                className="img-search"
                alt="Pokémon Image"
                src={APIService.getPokeSprite(pokemon.num)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = APIService.getPokeSprite();
                }}
              />
              {pokemon.name}
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
