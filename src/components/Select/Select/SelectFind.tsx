import React, { useRef, useState } from 'react';
import pokemonData from '../../../data/pokemon.json';
import { calculateStatsByTag } from '../../../util/Calculate';
import { convertNameRanking, splitAndCapitalize } from '../../../util/Utils';
import CardPokemonLarge from '../../Card/CardPokemonLarge';

const SelectFind = (props: {
  data: any[];
  clearData: () => void;
  setStatATK: (arg0: number | null) => void;
  setStatDEF: (arg0: number | null) => void;
  setStatSTA: (arg0: number | null) => void;
  setForm: (arg0: any) => void;
  setName: (arg0: string) => void;
  setId: (arg0: null) => void;
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;

  const [currentPokemon, setCurrentPokemon]: any = useState(null);
  const [showPokemon, setShowPokemon] = useState(false);

  const [search, setSearch] = useState('');

  const result = useRef(
    Object.values(pokemonData).filter((pokemon) =>
      props.data ? props.data.map((item: { speciesId: any }) => item.speciesId).includes(convertNameRanking(pokemon.slug)) : true
    )
  );

  const listenScrollEvent = (ele: { currentTarget: { scrollTop: any; offsetHeight: any } }) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 0.3 >= fullHeight * (startIndex + 1)) setStartIndex(startIndex + 1);
  };

  const changePokemon = (pokemon: any) => {
    setCurrentPokemon(pokemon);
    setShowPokemon(false);
    const stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);
    if (props.clearData) props.clearData();
    if (props.setStatATK) props.setStatATK(stats.atk);
    if (props.setStatDEF) props.setStatDEF(stats.def);
    if (props.setStatSTA) props.setStatSTA(stats.sta);
    if (props.setForm) props.setForm(pokemon);
    if (props.setName) props.setName(splitAndCapitalize(pokemon.name, '-', ' '));
    if (props.setId) props.setId(pokemon.num);
  };

  const removePokemon = () => {
    setCurrentPokemon(null);
    setShowPokemon(false);
    if (props.clearData) props.clearData();
    if (props.setStatATK) props.setStatATK(null);
    if (props.setStatDEF) props.setStatDEF(null);
    if (props.setStatSTA) props.setStatSTA(null);
    if (props.setName) props.setName('');
    if (props.setId) props.setId(null);
  };

  return (
    <div style={{ width: 'fit-content' }}>
      <div className="input-group border-input">
        <input
          type="text"
          className="form-control input-search"
          placeholder="Enter Name or ID"
          value={search}
          onInput={(e: any) => setSearch(e.target.value)}
          onFocus={() => setShowPokemon(true)}
          onBlur={() => setShowPokemon(false)}
        />
      </div>
      <div
        className="card-input"
        style={{ marginBottom: 15 }}
        tabIndex={0}
        onClick={() => setShowPokemon(true)}
        onBlur={() => setShowPokemon(false)}
      >
        <div className="card-select">
          <CardPokemonLarge
            id={currentPokemon && currentPokemon.num}
            name={currentPokemon && splitAndCapitalize(currentPokemon.name, '-', ' ')}
            value={currentPokemon}
          />
          {currentPokemon && (
            <button type="button" className="btn-close btn-close-white remove-close" onMouseDown={removePokemon} aria-label="Close" />
          )}
        </div>
        {showPokemon && (
          <div className="result-type" onScroll={listenScrollEvent.bind(this)}>
            <div>
              {result.current
                .filter(
                  (pokemon) =>
                    splitAndCapitalize(pokemon.name, '-', ' ').toLowerCase().includes(search.toLowerCase()) ||
                    pokemon.num.toString().includes(search)
                )
                .slice(0, firstInit + eachCounter * startIndex)
                .map((pokemon, index) => (
                  <div className="container card-pokemon" key={index} onMouseDown={() => changePokemon(pokemon)}>
                    <CardPokemonLarge id={pokemon.num} name={splitAndCapitalize(pokemon.name, '-', ' ')} value={pokemon} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectFind;
