import React, { useState, useRef, useEffect, Fragment } from 'react';
import { RootStateOrAny, useSelector } from 'react-redux';
import pokemonData from '../../data/pokemon.json';
import loadingImg from '../../assets/loading.png';

import './Home.css';
import CardPokemonInfo from '../../components/Card/CardPokemonInfo';
import TypeInfo from '../../components/Sprites/Type/Type';
import { calculateStatsByTag } from '../../util/Calculate';
import { mappingReleasedGO, splitAndCapitalize } from '../../util/Utils';
import APIService from '../../services/API.service';
import { queryAssetForm } from '../../util/Compute';
import { genList, regionList, versionList } from '../../util/Constants';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Switch,
} from '@mui/material';

const VersionProps = {
  PaperProps: {
    style: {
      maxHeight: 220,
    },
  },
};

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
  const [selectTypes, setSelectTypes]: any = useState([]);
  const [listOfPokemon, setListOfPokemon]: any = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    match: false,
    releasedGO: false,
    allShiny: false,
    gen: Object.values(genList).map((value, index) => index),
    version: versionList.map((value: any, index: any) => index),
    mega: false,
    gmax: false,
  });

  const { match, releasedGO, allShiny, gen, version, mega, gmax } = filters;

  const addTypeArr = (value: string) => {
    let types = selectTypes;
    if (types.includes(value)) {
      return setSelectTypes([...types].filter((item) => item !== value));
    } else {
      types = types.slice(0, 1);
    }
    return setSelectTypes([...types, value]);
  };

  const checkGeneration = (id: number) => {
    return gen.some((gen) => {
      if (id >= genList[gen + 1][0] && id <= genList[gen + 1][1]) {
        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    document.title = 'Home';
  }, []);

  useEffect(() => {
    if (dataList.current) {
      setLoading(true);
      const timeOutId = setTimeout(
        () => {
          const result = dataList.current.filter((item: any) => {
            const boolFilterType =
              selectTypes.length === 0 ||
              (item.types.every((item: any) => selectTypes.includes(item.toUpperCase())) && item.types.length === selectTypes.length);
            const boolFilterPoke =
              searchTerm === '' ||
              (match
                ? splitAndCapitalize(item.name, '-', ' ').toLowerCase() === searchTerm.toLowerCase() || item.id.toString() === searchTerm
                : splitAndCapitalize(item.name, '-', ' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.id.toString().includes(searchTerm));
            const boolReleasedGO = releasedGO ? item.releasedGO : true;
            const boolMega = mega ? item.forme === 'Mega' : true;
            const boolGmax = gmax ? item.forme === 'Gmax' : true;

            const findGen = checkGeneration(item.id);
            return boolFilterType && boolFilterPoke && boolReleasedGO && boolMega && boolGmax && findGen;
          });
          setListOfPokemon(result);
          setLoading(false);
        },
        document.title === 'Home' ? 100 : 1000
      );
      return () => clearTimeout(timeOutId);
    }
  }, [searchTerm, selectTypes, match, releasedGO, mega, gmax, gen]);

  const handleChangeGen = (event: SelectChangeEvent<any>) => {
    const {
      target: { value },
    } = event;
    setFilters({
      ...filters,
      gen: (value as any).sort((a: number, b: number) => a - b),
    });
  };

  const handleChangeVersion = (event: SelectChangeEvent<any>) => {
    const {
      target: { value },
    } = event;
    setFilters({
      ...filters,
      version: (value as any).sort((a: number, b: number) => a - b),
    });
  };

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
        <div className="w-100">
          <div className="border-input">
            <div className="head-types">Options</div>
            <div className="row" style={{ margin: 0 }}>
              <div className="col-xl-4" style={{ padding: 0 }}>
                <div className="d-flex">
                  <span className="input-group-text">Search name or ID</span>
                  <input
                    type="text"
                    className="form-control input-search"
                    placeholder="Enter Name or ID"
                    value={searchTerm}
                    onInput={(e: any) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="d-flex flex-wrap" style={{ paddingLeft: 8, paddingRight: 8 }}>
                  <FormControlLabel
                    control={<Checkbox checked={match} onChange={(event, check) => setFilters({ ...filters, match: check })} />}
                    label="Match Pokémon"
                  />
                  <FormControlLabel
                    control={<Switch checked={releasedGO} onChange={(event, check) => setFilters({ ...filters, releasedGO: check })} />}
                    label={
                      <span className="d-flex align-items-center">
                        Released in GO
                        <img
                          className={releasedGO ? '' : 'filter-gray'}
                          width={28}
                          height={28}
                          style={{ marginLeft: 5 }}
                          alt="pokemon-go-icon"
                          src={APIService.getPokemonGoIcon(icon ?? 'Standard')}
                        />
                      </span>
                    }
                  />
                </div>
                <div className="d-flex" style={{ paddingLeft: 8, paddingRight: 8 }}>
                  <FormControlLabel
                    control={<Switch checked={allShiny} onChange={(event, check) => setFilters({ ...filters, allShiny: check })} />}
                    label={
                      <span className="d-flex align-items-center">
                        Show All Pokemon Shiny (Possible only)
                        <img
                          className={allShiny ? 'filter-shiny' : 'filter-gray'}
                          width={28}
                          height={28}
                          style={{ marginLeft: 5 }}
                          alt="pokemon-go-icon"
                          src={APIService.getShinyIcon()}
                        />
                      </span>
                    }
                  />
                </div>
              </div>
              <div className="col-xl-8 border-input" style={{ padding: 8, gap: 10 }}>
                <div className="d-flex">
                  <FormControl sx={{ m: 1, width: '50%' }} size="small">
                    <InputLabel>Generation</InputLabel>
                    <Select
                      multiple={true}
                      value={gen}
                      onChange={handleChangeGen}
                      input={<OutlinedInput label="Generation" />}
                      renderValue={(selected: any) => 'Gen ' + selected.map((item: number) => (item + 1).toString()).join(', Gen ')}
                    >
                      {Object.values(genList).map((value: any, index) => (
                        <MenuItem key={index} value={index}>
                          <Checkbox checked={gen.includes(index)} />
                          <ListItemText primary={`Generation ${index + 1} (Region ${regionList[index + 1]})`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: '50%' }} size="small">
                    <InputLabel>Version</InputLabel>
                    <Select
                      multiple={true}
                      value={version}
                      onChange={handleChangeVersion}
                      input={<OutlinedInput label="Version" />}
                      renderValue={(selected: any) => selected.map((item: number) => versionList[item]).join(', ')}
                      MenuProps={VersionProps}
                    >
                      {versionList.map((value: string, index: React.Key) => (
                        <MenuItem key={index} value={index}>
                          <Checkbox checked={version.includes(index)} />
                          <ListItemText primary={value} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="input-group border-input">
                  <span className="input-group-text">Filter only by</span>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={mega}
                        onChange={(event, check) => setFilters({ ...filters, mega: check, gmax: check ? false : filters.gmax })}
                      />
                    }
                    label="Mega"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={gmax}
                        onChange={(event, check) => setFilters({ ...filters, gmax: check, mega: check ? false : filters.mega })}
                      />
                    }
                    label="Gmax"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="position-fixed loading-spin-table text-center" style={{ display: !loading ? 'none' : 'block' }}>
        <img className="loading" width={64} height={64} alt="img-pokemon" src={loadingImg} />
        <span className="caption text-black" style={{ fontSize: 18 }}>
          <b>
            Loading<span id="p1">.</span>
            <span id="p2">.</span>
            <span id="p3">.</span>
          </b>
        </span>
      </div>
      <div className="text-center">
        <div className="loading-group-spin-table" style={{ display: !loading ? 'none' : 'block' }} />
        <ul className="d-grid pokemon-content">
          {listOfPokemon.map((row: any, index: React.Key) => (
            <CardPokemonInfo
              key={index}
              name={row.name}
              forme={row.forme}
              defaultImg={allShiny}
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
