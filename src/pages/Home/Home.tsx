import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';
import loadingImg from '../../assets/loading.png';

import './Home.scss';
import CardPokemonInfo from '../../components/Card/CardPokemonInfo';
import TypeInfo from '../../components/Sprites/Type/Type';
import { calculateStatsByTag } from '../../util/Calculate';
import { splitAndCapitalize } from '../../util/Utils';
import APIService from '../../services/API.service';
import { queryAssetForm } from '../../util/Compute';
import {
  DEFAULT_TYPES,
  FORM_GMAX,
  FORM_MEGA,
  FORM_PRIMAL,
  genList,
  regionList,
  TRANSITION_TIME,
  TYPE_LEGENDARY,
  TYPE_MYTHIC,
  TYPE_ULTRA_BEAST,
  versionList,
} from '../../util/Constants';
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
  useTheme,
} from '@mui/material';
import { StoreState, StatsState } from '../../store/models/state.model';
import { PokemonHomeModel } from '../../core/models/pokemon-home.model';

const VersionProps = {
  PaperProps: {
    style: {
      maxHeight: 220,
    },
  },
};

const Home = () => {
  const theme = useTheme();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const stats = useSelector((state: StatsState) => state.stats);

  const [types, setTypes] = useState(DEFAULT_TYPES);
  const [dataList, setDataList]: [PokemonHomeModel[], React.Dispatch<React.SetStateAction<PokemonHomeModel[]>>] = useState(
    [] as PokemonHomeModel[]
  );
  const [selectTypes, setSelectTypes] = useState([] as string[]);
  const [listOfPokemon, setListOfPokemon]: [PokemonHomeModel[], React.Dispatch<React.SetStateAction<PokemonHomeModel[]>>] = useState(
    [] as PokemonHomeModel[]
  );
  const [result, setResult]: [PokemonHomeModel[], React.Dispatch<React.SetStateAction<PokemonHomeModel[]>>] = useState(
    [] as PokemonHomeModel[]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollID = useRef(0);

  const [filters, setFilters] = useState({
    match: false,
    releasedGO: false,
    allShiny: false,
    gen: Object.values(genList).map((_, index) => index),
    version: versionList.map((_, index) => index),
    mega: false,
    gmax: false,
    primal: false,
    legendary: false,
    mythic: false,
    ultrabeast: false,
  });

  const { match, releasedGO, allShiny, gen, version, mega, gmax, primal, legendary, mythic, ultrabeast } = filters;

  const [btnSelected, setBtnSelected] = useState({
    gen: true,
    version: true,
  });

  const subItem = 100;

  const addTypeArr = (value: string) => {
    let types = selectTypes;
    if (types.includes(value)) {
      return setSelectTypes([...types].filter((item) => item !== value));
    } else {
      types = types.slice(0, 1);
    }
    return setSelectTypes([...types, value]);
  };

  useEffect(() => {
    if (data?.typeEff) {
      setTypes(Object.keys(data?.typeEff));
    }
  }, [data?.typeEff]);

  useEffect(() => {
    setDataList(
      data?.released
        ?.map((item) => {
          const stats = calculateStatsByTag(item, item?.baseStats, item?.slug);
          const assetForm = queryAssetForm(data?.assets ?? [], item?.num, item?.name);
          return new PokemonHomeModel(item, assetForm, versionList, stats);
        })
        .sort((a, b) => (a.id ?? 0) - (b?.id ?? 0)) ?? []
    );
  }, [data?.released]);

  useEffect(() => {
    document.title = 'Home';
  }, []);

  useEffect(() => {
    if (dataList) {
      setLoading(true);
      const timeOutId = setTimeout(
        () => {
          const result = dataList?.filter((item) => {
            const boolFilterType =
              selectTypes.length === 0 ||
              (item.types?.every((item) => selectTypes.includes(item?.toUpperCase())) && item.types.length === selectTypes.length);
            const boolFilterPoke =
              searchTerm === '' ||
              (match
                ? splitAndCapitalize(item.name, '-', ' ').toLowerCase() === searchTerm.toLowerCase() || item.id?.toString() === searchTerm
                : splitAndCapitalize(item.name, '-', ' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.id?.toString().includes(searchTerm));
            const boolReleasedGO = releasedGO ? item.releasedGO : true;
            const boolMega = mega ? item.forme?.toUpperCase().includes(FORM_MEGA) : true;
            const boolGmax = gmax ? item.forme?.toUpperCase().includes(FORM_GMAX) : true;
            const boolPrimal = primal ? item.forme?.toUpperCase().includes(FORM_PRIMAL) : true;
            const boolLegend = legendary ? item.class === TYPE_LEGENDARY : true;
            const boolMythic = mythic ? item.class === TYPE_MYTHIC : true;
            const boolUltra = ultrabeast ? item.class === TYPE_ULTRA_BEAST : true;

            const findGen = item.gen === 0 ? true : gen.includes((item.gen ?? 0) - 1);
            const findVersion = item.version === -1 ? true : version.includes(item?.version);
            return (
              boolFilterType &&
              boolFilterPoke &&
              boolReleasedGO &&
              findGen &&
              findVersion &&
              boolMega &&
              boolGmax &&
              boolPrimal &&
              boolLegend &&
              boolMythic &&
              boolUltra
            );
          });
          scrollID.current = 0;
          setResult(result);
          setListOfPokemon(result?.slice(0, subItem));
          setLoading(false);
        },
        listOfPokemon > result ? listOfPokemon.length : result.length
      );
      return () => clearTimeout(timeOutId);
    }
  }, [dataList, searchTerm, selectTypes, match, releasedGO, mega, gmax, primal, legendary, mythic, ultrabeast, gen, version]);

  useEffect(() => {
    const onScroll = (e: { target: { documentElement: { scrollTop: number; offsetHeight: number } } }) => {
      const scrollTop = e.target.documentElement.scrollTop;
      const fullHeight = e.target.documentElement.offsetHeight;
      if (scrollTop * 1.5 >= fullHeight * (scrollID.current + 1)) {
        scrollID.current += 1;
        setListOfPokemon((oldArr) => [...oldArr, ...result.slice(scrollID.current * subItem, (scrollID.current + 1) * subItem)]);
      }
    };
    window.addEventListener('scroll', onScroll as any);
    return () => window.removeEventListener('scroll', onScroll as any);
  }, [listOfPokemon]);

  const handleChangeGen = (event: SelectChangeEvent<number[]>) => {
    setFilters({
      ...filters,
      gen: (event.target.value as number[]).sort((a, b) => a - b),
    });
  };

  const handleChangeVersion = (event: SelectChangeEvent<number[]>) => {
    setFilters({
      ...filters,
      version: (event.target.value as number[]).sort((a, b) => a - b),
    });
  };

  const setFilterGen = () => {
    if (btnSelected.gen) {
      setFilters({
        ...filters,
        gen: [],
      });
      setBtnSelected({
        ...btnSelected,
        gen: false,
      });
    } else {
      setFilters({
        ...filters,
        gen: versionList.map((_, index: number) => index),
      });
      setBtnSelected({
        ...btnSelected,
        gen: true,
      });
    }
  };

  const setFilterVersion = () => {
    if (btnSelected.version) {
      setFilters({
        ...filters,
        version: [],
      });
      setBtnSelected({
        ...btnSelected,
        version: false,
      });
    } else {
      setFilters({
        ...filters,
        version: versionList.map((_, index: number) => index),
      });
      setBtnSelected({
        ...btnSelected,
        version: true,
      });
    }
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
                className={
                  'btn-select-type w-100 border-types btn-' +
                  theme.palette.mode +
                  (selectTypes.includes(item) ? ' select-type' + (theme.palette.mode === 'dark' ? '-dark' : '') : '')
                }
                style={{ padding: 10, transition: TRANSITION_TIME }}
              >
                <TypeInfo block={true} arr={[item]} />
              </button>
            </div>
          ))}
        </div>
        <div className="w-100" style={{ color: theme.palette.text.primary }}>
          <div className="border-input">
            <div className="head-types">Options</div>
            <div className="row" style={{ margin: 0 }}>
              <div className="col-xl-4" style={{ padding: 0 }}>
                <div className="d-flex">
                  <span className={'input-group-text ' + (theme.palette.mode === 'dark' ? 'input-group-dark' : '')}>Search name or ID</span>
                  <input
                    type="text"
                    style={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}
                    className={'form-control input-search' + (theme.palette.mode === 'dark' ? '-dark' : '')}
                    placeholder="Enter Name or ID"
                    defaultValue={searchTerm}
                    onKeyUp={(e) => setSearchTerm(e.currentTarget.value)}
                  />
                </div>
                <div className="d-flex flex-wrap" style={{ paddingLeft: 8, paddingRight: 8 }}>
                  <FormControlLabel
                    control={<Checkbox checked={match} onChange={(_, check) => setFilters({ ...filters, match: check })} />}
                    label="Match Pokémon"
                  />
                  <FormControlLabel
                    control={<Switch checked={releasedGO} onChange={(_, check) => setFilters({ ...filters, releasedGO: check })} />}
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
                    control={<Switch checked={allShiny} onChange={(_, check) => setFilters({ ...filters, allShiny: check })} />}
                    label={
                      <span className="d-flex align-items-center">
                        Show All Shiny Pokémon (Only Possible)
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
                    <InputLabel>Generation(s)</InputLabel>
                    <Select
                      multiple={true}
                      value={gen}
                      onChange={handleChangeGen}
                      input={<OutlinedInput label="Generation(s)" />}
                      renderValue={(selected) => 'Gen ' + selected.map((item) => (item + 1).toString()).join(', Gen ')}
                    >
                      <MenuItem disableRipple={true} disableTouchRipple={true}>
                        <ListItemText
                          primary={
                            <button onClick={setFilterGen} className={`btn ${btnSelected.gen ? 'btn-danger' : 'btn-success'}`}>{`${
                              btnSelected.gen ? 'Deselect All' : 'Select All'
                            }`}</button>
                          }
                        />
                      </MenuItem>
                      {Object.values(genList).map((_, index) => (
                        <MenuItem key={index} value={index}>
                          <Checkbox checked={gen.includes(index)} />
                          <ListItemText primary={`Generation ${index + 1} (${regionList[index + 1]})`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: '50%' }} size="small">
                    <InputLabel>Version(s)</InputLabel>
                    <Select
                      multiple={true}
                      value={version}
                      onChange={handleChangeVersion}
                      input={<OutlinedInput label="Version(s)" />}
                      renderValue={(selected) => selected.map((item: number) => versionList[item]).join(', ')}
                      MenuProps={VersionProps}
                    >
                      <MenuItem disableRipple={true} disableTouchRipple={true}>
                        <ListItemText
                          primary={
                            <button onClick={setFilterVersion} className={`btn ${btnSelected.version ? 'btn-danger' : 'btn-success'}`}>{`${
                              btnSelected.version ? 'Deselect All' : 'Select All'
                            }`}</button>
                          }
                        />
                      </MenuItem>
                      {versionList.map((value: string, index: number) => (
                        <MenuItem key={index} value={index}>
                          <Checkbox checked={version.includes(index)} />
                          <ListItemText primary={value} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="input-group border-input">
                  <span className={'input-group-text ' + (theme.palette.mode === 'dark' ? 'input-group-dark' : '')}>Filter only by</span>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={mega}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            mega: check,
                            gmax: check ? false : filters.gmax,
                            primal: check ? false : filters.primal,
                          })
                        }
                      />
                    }
                    label="Mega"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={gmax}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            gmax: check,
                            mega: check ? false : filters.mega,
                            primal: check ? false : filters.primal,
                          })
                        }
                      />
                    }
                    label="Gmax"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={primal}
                        onChange={(_, check) =>
                          setFilters({ ...filters, primal: check, mega: check ? false : filters.mega, gmax: check ? false : filters.gmax })
                        }
                      />
                    }
                    label="Primal"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={legendary}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            legendary: check,
                            mythic: check ? false : filters.mythic,
                            ultrabeast: check ? false : filters.ultrabeast,
                          })
                        }
                      />
                    }
                    label="Legendary"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={mythic}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            mythic: check,
                            legendary: check ? false : filters.legendary,
                            ultrabeast: check ? false : filters.ultrabeast,
                          })
                        }
                      />
                    }
                    label="Mythic"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={ultrabeast}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            ultrabeast: check,
                            legendary: check ? false : filters.legendary,
                            mythic: check ? false : filters.mythic,
                          })
                        }
                      />
                    }
                    label="Ultra Beast"
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
      <div className="text-center bg-white">
        <div className="loading-group-spin-table" style={{ display: !loading ? 'none' : 'block' }} />
        <ul className="d-grid pokemon-content">
          {listOfPokemon.map((row, index) => (
            <CardPokemonInfo
              key={index}
              name={row.name}
              forme={row.forme ?? ''}
              defaultImg={allShiny}
              image={row.image}
              id={row.id}
              types={row.types}
              pokemonStat={row.goStats}
              stats={stats}
              icon={icon ?? ''}
              releasedGO={row.releasedGO}
            />
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Home;
