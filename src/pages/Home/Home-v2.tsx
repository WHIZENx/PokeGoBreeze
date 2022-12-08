import React, { useState, useRef, useEffect, Fragment } from 'react';
import { RootStateOrAny, useSelector } from 'react-redux';
import pokemonData from '../../data/pokemon.json';

import './Home.css';
import CardPokemonInfo from '../../components/Card/CardPokemonInfo';
import TypeInfo from '../../components/Sprites/Type/Type';
import { calculateStatsByTag } from '../../util/Calculate';
import { mappingReleasedGO } from '../../util/Utils';
import APIService from '../../services/API.service';
import { queryAssetForm } from '../../util/Compute';
const Home = () => {
  const icon = useSelector((state: RootStateOrAny) => state.store.icon);
  const data = useSelector((state: RootStateOrAny) => state.store.data);
  const stats = useSelector((state: RootStateOrAny) => state.stats);
  const types = Object.keys(data.typeEff);
  const dataList = useRef(
    mappingReleasedGO(pokemonData, data.details)
      .map((item) => {
        const stats = calculateStatsByTag(item.baseStats, item.slug);
        const assetForm = queryAssetForm(data.assets, item.num, item.name);
        return {
          id: item.num,
          name: item.name,
          forme: item.forme,
          types: item.types,
          color: item.color.toLowerCase(),
          sprite: item.sprite.toLowerCase(),
          baseSpecies: item.baseSpecies,
          baseStats: item.baseStats,
          goStats: {
            atk: stats.atk,
            def: stats.def,
            sta: stats.sta,
          },
          releasedGO: item.releasedGO,
          image: {
            default:
              assetForm && assetForm.default ? APIService.getPokemonModel(assetForm.default) : APIService.getPokeFullSprite(item.num),
            shiny: assetForm && assetForm.shiny ? APIService.getPokemonModel(assetForm.shiny) : null,
          },
        };
      })
      .sort((a: { id: number }, b: { id: number }) => a.id - b.id)
  );
  const dataListFilter: any = useRef(null);
  const [selectTypes, setSelectTypes]: any = useState([]);
  const [listOfPokemon, setListOfPokemon]: any = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addTypeArr = (value: string) => {
    if (selectTypes.includes(value)) {
      return setSelectTypes([...selectTypes].filter((item) => item !== value));
    } else {
      setSelectTypes([...selectTypes].slice(0, 1));
    }
    return setSelectTypes((oldArr: any) => [...oldArr, value]);
  };

  useEffect(() => {
    document.title = 'Home';
  }, []);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      const result = dataList.current.filter((item: any) => {
        const boolFilterType =
          item.types.map((item: any) => selectTypes.includes(item.toUpperCase())).filter((bool: boolean) => bool === true).length ===
          selectTypes.length;
        const boolFilterPoke =
          searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm);
        return boolFilterType && boolFilterPoke;
      });
      dataListFilter.current = result;
      setListOfPokemon(result);
    }, 100);
    return () => clearTimeout(timeOutId);
  }, [searchTerm, selectTypes]);

  return (
    <Fragment>
      <div className="head-filter border-types text-center w-100">
        <div className="head-types">Filter By Types (Maximum 2)</div>
        <div className="row w-100" style={{ margin: 0 }}>
          {types.map((item, index) => (
            <div key={index} className="col img-group" style={{ margin: 0, padding: 0 }}>
              <button
                value={item}
                onClick={() => addTypeArr(item)}
                className={'btn-select-type w-100 border-types' + (selectTypes.includes(item) ? ' select-type' : '')}
                style={{ padding: 10 }}
              >
                <TypeInfo block={true} arr={[item]} />
              </button>
            </div>
          ))}
        </div>
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col border-input" style={{ padding: 0 }}>
            <div className="head-types">Search Name or ID</div>
            <input
              type="text"
              className="w-100 form-control input-search"
              placeholder="Enter Name or ID"
              value={searchTerm}
              onInput={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="text-center">
        <ul className="d-grid pokemon-content">
          {listOfPokemon.map((row: any, index: React.Key) => (
            <CardPokemonInfo
              key={index}
              name={row.name}
              forme={row.forme}
              image={row.image}
              id={row.id}
              types={row.types}
              pokemonStat={row.goStats}
              stats={stats}
              icon={icon}
              releasedGO={row.releasedGO}
            />
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Home;
