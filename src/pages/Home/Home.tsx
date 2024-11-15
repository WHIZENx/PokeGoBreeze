import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

import './Home.scss';
import CardPokemonInfo from '../../components/Card/CardPokemonInfo';
import TypeInfo from '../../components/Sprites/Type/Type';
import { getKeyEnum, splitAndCapitalize } from '../../util/utils';
import APIService from '../../services/API.service';
import { queryAssetForm } from '../../util/compute';
import {
  DEFAULT_TYPES,
  genList,
  regionList,
  TRANSITION_TIME,
  TYPE_LEGENDARY,
  TYPE_MYTHIC,
  TYPE_ULTRA_BEAST,
  versionList,
} from '../../util/constants';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  MenuProps,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Switch,
  useTheme,
} from '@mui/material';
import { StoreState, StatsState } from '../../store/models/state.model';
import { IPokemonHomeModel, PokemonHomeModel } from '../../core/models/pokemon-home.model';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { PokemonType, TypeTheme } from '../../enums/type.enum';
import { ThemeModify } from '../../util/models/overrides/themes.model';
import { combineClasses, isEmpty, isEqual, isInclude, isIncludeList, isNotEmpty } from '../../util/extension';
import { IncludeMode } from '../../util/enums/string.enum';
import LoadGroup from '../../components/Sprites/Loading/LoadingGroup';

const versionProps: Partial<MenuProps> = {
  PaperProps: {
    style: {
      maxHeight: 220,
    },
  },
};

interface IFilter {
  isMatch: boolean;
  releasedGO: boolean;
  allShiny: boolean;
  gen: number[];
  version: number[];
  isMega: boolean;
  isGmax: boolean;
  isPrimal: boolean;
  isLegendary: boolean;
  isMythic: boolean;
  isUltraBeast: boolean;
}

class Filter implements IFilter {
  isMatch = false;
  releasedGO = false;
  allShiny = false;
  gen: number[] = [];
  version: number[] = [];
  isMega = false;
  isGmax = false;
  isPrimal = false;
  isLegendary = false;
  isMythic = false;
  isUltraBeast = false;

  static setFilterGenAndVersion(gen: number[], version: number[]) {
    const obj = new Filter();
    obj.gen = gen;
    obj.version = version;
    return obj;
  }
}

interface IBtnSelect {
  isSelectGen: boolean;
  isSelectVersion: boolean;
}

class BtnSelect implements IBtnSelect {
  isSelectGen = false;
  isSelectVersion = false;

  constructor({ ...props }: IBtnSelect) {
    Object.assign(this, props);
  }
}

const Home = () => {
  useChangeTitle('Home');
  const theme = useTheme<ThemeModify>();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const stats = useSelector((state: StatsState) => state.stats);

  const [types, setTypes] = useState(DEFAULT_TYPES);
  const [dataList, setDataList] = useState<IPokemonHomeModel[]>([]);
  const [selectTypes, setSelectTypes] = useState<string[]>([]);
  const [listOfPokemon, setListOfPokemon] = useState<IPokemonHomeModel[]>([]);
  const [result, setResult] = useState<IPokemonHomeModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollID = useRef(0);
  const subItem = useRef(100);

  const [filters, setFilters] = useState(
    Filter.setFilterGenAndVersion(
      Object.values(genList).map((_, index) => index),
      versionList.map((_, index) => index)
    )
  );

  const { isMatch, releasedGO, allShiny, gen, version, isMega, isGmax, isPrimal, isLegendary, isMythic, isUltraBeast } = filters;

  const [btnSelected, setBtnSelected] = useState(
    new BtnSelect({
      isSelectGen: true,
      isSelectVersion: true,
    })
  );

  const addTypeArr = (value: string) => {
    let types = selectTypes;
    if (isIncludeList(types, value)) {
      return setSelectTypes([...types].filter((item) => !isEqual(item, value)));
    } else {
      types = types.slice(0, 1);
    }
    return setSelectTypes([...types, value]);
  };

  useEffect(() => {
    setTypes(Object.keys(data.typeEff));
  }, [data.typeEff]);

  useEffect(() => {
    if (isNotEmpty(data.assets) && isNotEmpty(data.pokemon)) {
      setDataList(
        data.pokemon
          .map((item) => {
            const assetForm = queryAssetForm(data.assets, item.num, item.forme);
            return new PokemonHomeModel(item, assetForm);
          })
          .sort((a, b) => a.id - b.id)
      );
    }
  }, [data.assets, data.pokemon]);

  useEffect(() => {
    setIsLoading(true);
    if (isNotEmpty(dataList)) {
      const timeOutId = setTimeout(
        () => {
          const result = dataList.filter((item) => {
            const boolFilterType =
              !isNotEmpty(selectTypes) ||
              (item.types.every((item) => isIncludeList(selectTypes, item, IncludeMode.IncludeIgnoreCaseSensitive)) &&
                item.types.length === selectTypes.length);
            const boolFilterPoke =
              isEmpty(searchTerm) ||
              (isMatch
                ? isEqual(splitAndCapitalize(item.name, '-', ' '), searchTerm) || isEqual(item.id, searchTerm)
                : isInclude(splitAndCapitalize(item.name, '-', ' '), searchTerm, IncludeMode.IncludeIgnoreCaseSensitive) ||
                  isInclude(item.id, searchTerm));
            const boolReleasedGO = releasedGO ? item.releasedGO : true;
            const boolMega = isMega ? item.pokemonType === PokemonType.Mega : true;
            const boolGmax = isGmax ? item.pokemonType === PokemonType.GMax : true;
            const boolPrimal = isPrimal ? item.pokemonType === PokemonType.Primal : true;
            const boolLegend = isLegendary ? item.class === TYPE_LEGENDARY : true;
            const boolMythic = isMythic ? item.class === TYPE_MYTHIC : true;
            const boolUltra = isUltraBeast ? item.class === TYPE_ULTRA_BEAST : true;

            const findGen = item.gen === 0 || isIncludeList(gen, item.gen - 1);
            const findVersion = item.version === -1 || isIncludeList(version, item.version);
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
          setListOfPokemon(result.slice(0, subItem.current));
          setIsLoading(false);
        },
        listOfPokemon > result ? listOfPokemon.length : result.length
      );
      return () => clearTimeout(timeOutId);
    }
  }, [dataList, searchTerm, selectTypes, isMatch, releasedGO, isMega, isGmax, isPrimal, isLegendary, isMythic, isUltraBeast, gen, version]);

  useEffect(() => {
    const onScroll = (e: { target: { documentElement: { scrollTop: number; offsetHeight: number } } }) => {
      const scrollTop = e.target.documentElement.scrollTop;
      const fullHeight = e.target.documentElement.offsetHeight;
      if (scrollTop * 1.5 >= fullHeight * (scrollID.current + 1)) {
        scrollID.current += 1;
        setListOfPokemon((oldArr) => [
          ...oldArr,
          ...result.slice(scrollID.current * subItem.current, (scrollID.current + 1) * subItem.current),
        ]);
      }
    };
    window.addEventListener('scroll', onScroll as any);
    return () => window.removeEventListener('scroll', onScroll as any);
  }, [listOfPokemon]);

  const handleChangeGen = (event: SelectChangeEvent<number[]>) => {
    const isSelect = isIncludeList(event.target.value as number[], -1);
    if (isSelect) {
      setBtnSelected({
        ...btnSelected,
        isSelectGen: !btnSelected.isSelectGen,
      });
    }
    const gen = !isSelect
      ? (event.target.value as number[]).sort((a, b) => a - b)
      : btnSelected.isSelectGen
      ? []
      : Object.values(genList).map((_, index) => index);

    setFilters({
      ...filters,
      gen,
    });
  };

  const handleChangeVersion = (event: SelectChangeEvent<number[]>) => {
    const isSelect = isIncludeList(event.target.value as number[], -1);
    if (isSelect) {
      setBtnSelected({
        ...btnSelected,
        isSelectVersion: !btnSelected.isSelectVersion,
      });
    }
    const version = !isSelect
      ? (event.target.value as number[]).sort((a, b) => a - b)
      : btnSelected.isSelectVersion
      ? []
      : versionList.map((_, index) => index);

    setFilters({
      ...filters,
      version,
    });
  };

  return (
    <div className="position-relative">
      {!isNotEmpty(dataList) && (
        <div className="ph-item w-100 h-100 position-absolute" style={{ zIndex: 2, background: 'transparent' }}>
          <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: '#ffffff60' }} />
        </div>
      )}
      <div className="head-filter border-types text-center w-100">
        <div className="head-types">Filter By Types (Maximum 2)</div>
        <div className="row w-100" style={{ margin: 0 }}>
          {types.map((item, index) => (
            <div key={index} className="col img-group" style={{ margin: 0, padding: 0 }}>
              <button
                value={item}
                onClick={() => addTypeArr(item)}
                className={combineClasses(
                  `btn-select-type w-100 border-types btn-${theme.palette.mode}`,
                  isIncludeList(selectTypes, item) ? `select-type${theme.palette.mode === TypeTheme.DARK ? '-dark' : ''}` : ''
                )}
                style={{ padding: 10, transition: TRANSITION_TIME }}
              >
                <TypeInfo isBlock={true} arr={[item]} />
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
                  <span className={combineClasses('input-group-text', theme.palette.mode === TypeTheme.DARK ? 'input-group-dark' : '')}>
                    Search name or ID
                  </span>
                  <input
                    type="text"
                    style={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}
                    className={combineClasses('form-control', `input-search${theme.palette.mode === TypeTheme.DARK ? '-dark' : ''}`)}
                    placeholder="Enter Name or ID"
                    defaultValue={searchTerm}
                    onKeyUp={(e) => setSearchTerm(e.currentTarget.value)}
                  />
                </div>
                <div className="d-flex flex-wrap" style={{ paddingLeft: 8, paddingRight: 8 }}>
                  <FormControlLabel
                    control={<Checkbox checked={isMatch} onChange={(_, check) => setFilters({ ...filters, isMatch: check })} />}
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
                          src={APIService.getPokemonGoIcon(icon)}
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
                      renderValue={(selected) => `Gen ${selected.map((item) => (item + 1).toString()).join(', Gen ')}`}
                    >
                      <MenuItem disableRipple={true} disableTouchRipple={true} value={-1}>
                        <ListItemText
                          primary={
                            <button className={combineClasses('btn', btnSelected.isSelectGen ? 'btn-danger' : 'btn-success')}>{`${
                              btnSelected.isSelectGen ? 'Deselect All' : 'Select All'
                            }`}</button>
                          }
                        />
                      </MenuItem>
                      {Object.values(genList).map((_, index) => (
                        <MenuItem key={index} value={index}>
                          <Checkbox checked={isIncludeList(gen, index)} />
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
                      renderValue={(selected) => selected.map((item) => versionList[item]).join(', ')}
                      MenuProps={versionProps}
                    >
                      <MenuItem disableRipple={true} disableTouchRipple={true} value={-1}>
                        <ListItemText
                          primary={
                            <button className={combineClasses('btn', btnSelected.isSelectVersion ? 'btn-danger' : 'btn-success')}>{`${
                              btnSelected.isSelectVersion ? 'Deselect All' : 'Select All'
                            }`}</button>
                          }
                        />
                      </MenuItem>
                      {versionList.map((value, index) => (
                        <MenuItem key={index} value={index}>
                          <Checkbox checked={isIncludeList(version, index)} />
                          <ListItemText primary={value} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="input-group border-input">
                  <span className={combineClasses('input-group-text', theme.palette.mode === TypeTheme.DARK ? 'input-group-dark' : '')}>
                    Filter only by
                  </span>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isMega}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            isMega: check,
                            isGmax: check ? false : filters.isGmax,
                            isPrimal: check ? false : filters.isPrimal,
                          })
                        }
                      />
                    }
                    label={getKeyEnum(PokemonType, PokemonType.Mega)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isGmax}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            isGmax: check,
                            isMega: check ? false : filters.isMega,
                            isPrimal: check ? false : filters.isPrimal,
                          })
                        }
                      />
                    }
                    label={getKeyEnum(PokemonType, PokemonType.GMax)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPrimal}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            isPrimal: check,
                            isMega: check ? false : filters.isMega,
                            isGmax: check ? false : filters.isGmax,
                          })
                        }
                      />
                    }
                    label={getKeyEnum(PokemonType, PokemonType.Primal)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isLegendary}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            isLegendary: check,
                            isMythic: check ? false : filters.isMythic,
                            isUltraBeast: check ? false : filters.isUltraBeast,
                          })
                        }
                      />
                    }
                    label="Legendary"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isMythic}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            isMythic: check,
                            isLegendary: check ? false : filters.isLegendary,
                            isUltraBeast: check ? false : filters.isUltraBeast,
                          })
                        }
                      />
                    }
                    label="Mythic"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isUltraBeast}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            isUltraBeast: check,
                            isLegendary: check ? false : filters.isLegendary,
                            isMythic: check ? false : filters.isMythic,
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
      <LoadGroup className={'position-fixed'} isShow={isLoading} isVertical={false} isHideAttr={false} />
      <div className="text-center bg-white">
        <div className="loading-group-spin-table" style={{ display: !isLoading ? 'none' : 'block' }} />
        <ul className="d-grid pokemon-content">
          {listOfPokemon.map((row, index) => (
            <CardPokemonInfo
              key={index}
              name={row.name}
              forme={row.forme}
              isDefaultImg={allShiny}
              image={row.image}
              id={row.id}
              types={row.types}
              pokemonStat={row.goStats}
              atkMaxStats={stats?.attack.maxStats}
              defMaxStats={stats?.defense.maxStats}
              staMaxStats={stats?.stamina.maxStats}
              icon={icon}
              releasedGO={row.releasedGO}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
