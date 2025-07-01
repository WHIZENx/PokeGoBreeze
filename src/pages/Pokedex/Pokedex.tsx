import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import './Pokedex.scss';
import CardPokemonInfo from '../../components/Card/CardPokemonInfo';
import TypeInfo from '../../components/Sprites/Type/Type';
import { getKeyWithData, splitAndCapitalize } from '../../utils/utils';
import APIService from '../../services/api.service';
import { genList, regionList, versionList } from '../../utils/constants';
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
} from '@mui/material';
import { IPokemonHomeModel, PokemonHomeModel } from '../../core/models/pokemon-home.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { PokemonClass, PokemonType } from '../../enums/type.enum';
import {
  combineClasses,
  isEmpty,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toNumber,
} from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import LoadGroup from '../../components/Sprites/Loading/LoadingGroup';
import { ScrollModifyEvent } from '../../utils/models/overrides/dom.model';
import { debounce } from 'lodash';
import { IStyleSheetData } from '../models/page.model';
import { SpinnerActions } from '../../store/actions';
import { getTypes, transitionTime } from '../../utils/helpers/options-context.helpers';
import useDataStore from '../../composables/useDataStore';
import useIcon from '../../composables/useIcon';
import useAssets from '../../composables/useAssets';

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
  isShiny: boolean;
  gen: number[];
  version: number[];
  isMega: boolean;
  isGMax: boolean;
  isPrimal: boolean;
  isLegendary: boolean;
  isMythic: boolean;
  isUltraBeast: boolean;
}

class Filter implements IFilter {
  isMatch = false;
  releasedGO = false;
  isShiny = false;
  gen: number[] = [];
  version: number[] = [];
  isMega = false;
  isGMax = false;
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

const Pokedex = (props: IStyleSheetData) => {
  useTitle({
    title: 'PokéGO Breeze - Pokédex',
    description:
      'Complete Pokémon GO Pokédex with detailed information on all available Pokémon, including stats, moves, evolution chains, and forms.',
    keywords: ['Pokédex', 'Pokémon database', 'Pokémon GO Pokédex', 'Pokémon stats', 'Pokémon evolution'],
  });

  const dispatch = useDispatch();
  const { iconData } = useIcon();
  const { pokemonsData, getFilteredPokemons } = useDataStore();
  const { queryAssetForm } = useAssets();

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

  const { isMatch, releasedGO, isShiny, gen, version, isMega, isGMax, isPrimal, isLegendary, isMythic, isUltraBeast } =
    filters;

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
    if (isNotEmpty(pokemonsData)) {
      const filteredPokemons = getFilteredPokemons();
      setDataList(
        filteredPokemons
          .map((item) => {
            const assetForm = queryAssetForm(item.num, item.form);
            return new PokemonHomeModel(item, assetForm);
          })
          .sort((a, b) => a.id - b.id)
      );
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (isNotEmpty(dataList)) {
      try {
        const debounced = debounce(() => {
          try {
            const result = dataList.filter((item) => {
              const boolFilterType =
                !isNotEmpty(selectTypes) ||
                (item.types.every((item) => isIncludeList(selectTypes, item, IncludeMode.IncludeIgnoreCaseSensitive)) &&
                  item.types.length === selectTypes.length);
              const boolFilterPoke =
                isEmpty(searchTerm) ||
                (isMatch
                  ? isEqual(splitAndCapitalize(item.name, '-', ' '), searchTerm) || isEqual(item.id, searchTerm)
                  : isInclude(
                      splitAndCapitalize(item.name, '-', ' '),
                      searchTerm,
                      IncludeMode.IncludeIgnoreCaseSensitive
                    ) || isInclude(item.id, searchTerm));
              const boolReleasedGO = releasedGO ? item.releasedGO : true;
              const boolMega = isMega ? item.pokemonType === PokemonType.Mega : true;
              const boolGMax = isGMax ? item.pokemonType === PokemonType.GMax : true;
              const boolPrimal = isPrimal ? item.pokemonType === PokemonType.Primal : true;
              const boolLegend = isLegendary ? item.pokemonClass === PokemonClass.Legendary : true;
              const boolMythic = isMythic ? item.pokemonClass === PokemonClass.Mythic : true;
              const boolUltra = isUltraBeast ? item.pokemonClass === PokemonClass.UltraBeast : true;

              const findGen = item.gen === 0 || isIncludeList(gen, item.gen - 1);
              const findVersion = item.version === -1 || isIncludeList(version, item.version);
              return (
                boolFilterType &&
                boolFilterPoke &&
                boolReleasedGO &&
                findGen &&
                findVersion &&
                boolMega &&
                boolGMax &&
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
          } catch (error) {
            dispatch(
              SpinnerActions.ShowSpinnerMsg.create({ message: `Error during filtering: ${error}`, isError: true })
            );
            setIsLoading(false);
          }
        }, Math.max(300, listOfPokemon.length > result.length ? listOfPokemon.length : result.length));
        debounced();
        return () => {
          debounced.cancel();
        };
      } catch (error) {
        dispatch(SpinnerActions.ShowSpinnerMsg.create({ message: `Error during filtering: ${error}`, isError: true }));
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [
    dataList,
    searchTerm,
    selectTypes,
    isMatch,
    releasedGO,
    isMega,
    isGMax,
    isPrimal,
    isLegendary,
    isMythic,
    isUltraBeast,
    gen,
    version,
  ]);

  useEffect(() => {
    if (isNotEmpty(listOfPokemon)) {
      const onScroll = (e: ScrollModifyEvent) => {
        try {
          const scrollingElement = (e.target?.documentElement ||
            e.target?.scrollingElement ||
            document.scrollingElement) as HTMLElement;

          if (!scrollingElement) {
            dispatch(SpinnerActions.ShowSpinnerMsg.create({ message: 'No scrolling found', isError: true }));
            return;
          }

          const scrollTop = toNumber(scrollingElement.scrollTop);
          const fullHeight = toNumber(scrollingElement.offsetHeight);
          const scrollHeight = toNumber(scrollingElement.scrollHeight);

          if (scrollTop + fullHeight >= scrollHeight - 300) {
            scrollID.current += 1;
            setListOfPokemon((oldArr) => [
              ...oldArr,
              ...result.slice(scrollID.current * subItem.current, (scrollID.current + 1) * subItem.current),
            ]);
          }
        } catch (error) {
          dispatch(
            SpinnerActions.ShowSpinnerMsg.create({ message: `Error in scroll handler: ${error}`, isError: true })
          );
        }
      };

      window.addEventListener('scroll', onScroll);
      document.addEventListener('touchmove', onScroll);

      return () => {
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('touchmove', onScroll);
      };
    }
  }, [listOfPokemon, result]);

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
        <div className="ph-item w-100 h-100 position-absolute z-2 bg-transparent">
          <div className="ph-picture ph-col-3 w-100 h-100 theme-spinner m-0 p-0" />
        </div>
      )}
      <div className="text-center w-100">
        <div className="head-types">Filter By Types (Maximum 2)</div>
        <div className="row w-100 m-0 types-select-btn">
          {getTypes().map((item, index) => (
            <div key={index} className="col img-group m-0 p-0">
              <button
                value={item}
                onClick={() => addTypeArr(item)}
                className={combineClasses(
                  'btn-select-type w-100 p-2',
                  isIncludeList(selectTypes, item) ? 'select-type' : ''
                )}
                style={{ transition: transitionTime() }}
              >
                <TypeInfo isBlock arr={[item]} />
              </button>
            </div>
          ))}
        </div>
        <div className="w-100">
          <div className="border-input">
            <div className="head-types">Options</div>
            <div className="row m-0">
              <div className="col-xl-4 p-0">
                <div className="d-flex">
                  <span className="input-group-text">Search name or ID</span>
                  <input
                    type="text"
                    className="form-control input-search"
                    placeholder="Enter Name or ID"
                    defaultValue={searchTerm}
                    onKeyUp={(e) => setSearchTerm(e.currentTarget.value)}
                  />
                </div>
                <div className="d-flex flex-wrap px-2">
                  <FormControlLabel
                    control={
                      <Checkbox checked={isMatch} onChange={(_, check) => setFilters({ ...filters, isMatch: check })} />
                    }
                    label="Match Pokémon"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={releasedGO}
                        onChange={(_, check) => setFilters({ ...filters, releasedGO: check })}
                      />
                    }
                    label={
                      <span className="d-flex align-items-center">
                        Released in GO
                        <img
                          className={combineClasses('ms-1', releasedGO ? '' : 'filter-gray')}
                          width={28}
                          height={28}
                          alt="Pokémon GO Icon"
                          src={APIService.getPokemonGoIcon(iconData)}
                        />
                      </span>
                    }
                  />
                </div>
                <div className="d-flex px-2">
                  <FormControlLabel
                    control={
                      <Switch checked={isShiny} onChange={(_, check) => setFilters({ ...filters, isShiny: check })} />
                    }
                    label={
                      <span className="d-flex align-items-center">
                        Show All Shiny Pokémon (Only Possible)
                        <img
                          className={combineClasses('ms-1', isShiny ? 'filter-shiny' : 'filter-gray')}
                          width={28}
                          height={28}
                          alt="Pokémon GO Icon"
                          src={APIService.getShinyIcon()}
                        />
                      </span>
                    }
                  />
                </div>
              </div>
              <div className="col-xl-8 border-input p-2 gap-2">
                <div className="d-flex">
                  <FormControl className="w-50" sx={{ m: 1 }} size="small">
                    <InputLabel>Generation(s)</InputLabel>
                    <Select
                      multiple
                      value={gen}
                      onChange={handleChangeGen}
                      input={<OutlinedInput label="Generation(s)" />}
                      renderValue={(selected) => `Gen ${selected.map((item) => (item + 1).toString()).join(', Gen ')}`}
                    >
                      <MenuItem disableRipple disableTouchRipple value={-1}>
                        <ListItemText
                          primary={
                            <button
                              className={combineClasses('btn', btnSelected.isSelectGen ? 'btn-danger' : 'btn-success')}
                            >{`${btnSelected.isSelectGen ? 'Deselect All' : 'Select All'}`}</button>
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
                  <FormControl className="w-50" sx={{ m: 1 }} size="small">
                    <InputLabel>Version(s)</InputLabel>
                    <Select
                      multiple
                      value={version}
                      onChange={handleChangeVersion}
                      input={<OutlinedInput label="Version(s)" />}
                      renderValue={(selected) => selected.map((item) => versionList[item]).join(', ')}
                      MenuProps={versionProps}
                    >
                      <MenuItem disableRipple disableTouchRipple value={-1}>
                        <ListItemText
                          primary={
                            <button
                              className={combineClasses(
                                'btn',
                                btnSelected.isSelectVersion ? 'btn-danger' : 'btn-success'
                              )}
                            >{`${btnSelected.isSelectVersion ? 'Deselect All' : 'Select All'}`}</button>
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
                  <span className="input-group-text">Filter only by</span>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isMega}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            isMega: check,
                            isGMax: check ? false : filters.isGMax,
                            isPrimal: check ? false : filters.isPrimal,
                          })
                        }
                      />
                    }
                    label={getKeyWithData(PokemonType, PokemonType.Mega)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isGMax}
                        onChange={(_, check) =>
                          setFilters({
                            ...filters,
                            isGMax: check,
                            isMega: check ? false : filters.isMega,
                            isPrimal: check ? false : filters.isPrimal,
                          })
                        }
                      />
                    }
                    label={getKeyWithData(PokemonType, PokemonType.GMax)}
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
                            isGMax: check ? false : filters.isGMax,
                          })
                        }
                      />
                    }
                    label={getKeyWithData(PokemonType, PokemonType.Primal)}
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
                    label={getKeyWithData(PokemonClass, PokemonClass.Legendary)}
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
                    label={getKeyWithData(PokemonClass, PokemonClass.Mythic)}
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
      <LoadGroup className={'position-fixed text-center'} isShow={isLoading} isVertical={false} isHideAttr={false} />
      <div className="text-center bg-white">
        <div className={combineClasses('loading-group-spin-table', isLoading ? 'd-block' : 'd-none')} />
        <ul className="d-grid pokemon-content">
          {listOfPokemon.map((row, index) => (
            <CardPokemonInfo
              key={index}
              name={row.name}
              form={row.form}
              isDefaultImg={isShiny}
              image={row.image}
              id={row.id}
              types={row.types}
              pokemonStat={row.goStats}
              icon={iconData}
              releasedGO={row.releasedGO}
              styleList={props.styleSheet}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Pokedex;
