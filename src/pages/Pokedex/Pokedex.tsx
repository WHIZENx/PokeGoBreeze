import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import './Pokedex.scss';
import CardPokemonInfo from '../../components/Card/CardPokemonInfo';
import { getKeyWithData } from '../../utils/utils';
import APIService from '../../services/api.service';
import { genList, regionList, versionList } from '../../utils/constants';
import { Checkbox, FormControlLabel, ListItemText, Skeleton, Switch } from '@mui/material';
import { IPokemonHomeModel, PokemonHomeModel } from '../../core/models/pokemon-home.model';
import { PokedexApiResponse } from '../../core/models/API/pokedex.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { PokemonClass, PokemonType } from '../../enums/type.enum';
import { combineClasses, isEqual, isIncludeList, isNotEmpty, toNumber } from '../../utils/extension';
import LoadGroup from '../../components/Sprites/Loading/LoadingGroup';
import { ScrollModifyEvent } from '../../utils/models/overrides/dom.model';
import { IStyleSheetData } from '../models/page.model';
import { SpinnerActions } from '../../store/actions';
import useIcon from '../../composables/useIcon';
import InputMuiSearch from '../../components/Commons/Inputs/InputMuiSearch';
import InputReleased from '../../components/Commons/Inputs/InputReleased';
import SelectMui from '../../components/Commons/Selects/SelectMui';
import ButtonMui from '../../components/Commons/Buttons/ButtonMui';
import ToggleType from '../../components/Commons/Buttons/ToggleType';
import FormControlMui from '../../components/Commons/Forms/FormControlMui';
import BackdropMui from '../../components/Commons/Backdrops/BackdropMui';
import useSkipStalePageRequest from '../../utils/hooks/useSkipStalePageRequest';

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
  const [selectTypes, setSelectTypes] = useState<string[]>([]);
  const [listOfPokemon, setListOfPokemon] = useState<IPokemonHomeModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const subItem = useRef(100);
  const latestRequestRef = useRef(0);

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
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setListOfPokemon([]);
  }, [
    debouncedSearch,
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

  const skipStalePageRequest = useSkipStalePageRequest(
    page,
    JSON.stringify([
      debouncedSearch,
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
    ])
  );

  useEffect(() => {
    if (skipStalePageRequest) {
      return;
    }
    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    const pokemonType = isMega
      ? PokemonType.Mega
      : isGMax
        ? PokemonType.GMax
        : isPrimal
          ? PokemonType.Primal
          : undefined;
    const pokemonClass = isLegendary
      ? PokemonClass.Legendary
      : isMythic
        ? PokemonClass.Mythic
        : isUltraBeast
          ? PokemonClass.UltraBeast
          : undefined;
    setIsLoading(true);
    APIService.getFetchUrl<PokedexApiResponse>(
      APIService.getPokedex({
        q: debouncedSearch,
        match: isMatch,
        released: releasedGO,
        types: selectTypes.join(','),
        generations: gen.map((value) => value + 1).join(','),
        versions: version.map((value) => versionList[value]).join(','),
        pokemonType,
        pokemonClass,
        page,
        limit: subItem.current,
      }),
      { signal: controller.signal }
    )
      .then(({ data }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        const rows = data.data.map((item) => new PokemonHomeModel(item, item.assetForm));
        setPages(data.meta.pages);
        setListOfPokemon((current) => (page === 1 ? rows : [...current, ...rows]));
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          dispatch(SpinnerActions.ShowSpinnerMsg.create({ message: `Error loading Pokédex: ${error}`, isError: true }));
        }
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, [
    page,
    debouncedSearch,
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
    dispatch,
    skipStalePageRequest,
  ]);

  useEffect(() => {
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

        if (scrollTop + fullHeight >= scrollHeight - 300 && !isLoading && page < pages) {
          setPage((current) => current + 1);
        }
      } catch (error) {
        dispatch(SpinnerActions.ShowSpinnerMsg.create({ message: `Error in scroll handler: ${error}`, isError: true }));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('touchmove', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('touchmove', onScroll);
    };
  }, [dispatch, isLoading, page, pages]);

  const handleChangeGen = (value: number[]) => {
    const isSelect = isIncludeList(value, -1);
    if (isSelect) {
      setBtnSelected({
        ...btnSelected,
        isSelectGen: !btnSelected.isSelectGen,
      });
    }
    const gen = !isSelect
      ? value.sort((a, b) => a - b)
      : btnSelected.isSelectGen
        ? []
        : Object.values(genList).map((_, index) => index);

    setFilters({
      ...filters,
      gen,
    });
  };

  const handleChangeVersion = (value: number[]) => {
    const isSelect = isIncludeList(value, -1);
    if (isSelect) {
      setBtnSelected({
        ...btnSelected,
        isSelectVersion: !btnSelected.isSelectVersion,
      });
    }
    const version = !isSelect
      ? value.sort((a, b) => a - b)
      : btnSelected.isSelectVersion
        ? []
        : versionList.map((_, index) => index);

    setFilters({
      ...filters,
      version,
    });
  };

  return (
    <div className="tw-relative">
      <div className="tw-relative tw-text-center tw-w-full">
        {!isNotEmpty(listOfPokemon) && isLoading && (
          <div className="slide-container !tw-p-0 !tw-w-full !tw-h-full !tw-absolute tw-z-2 !tw-bg-spinner-default">
            <Skeleton variant="rectangular" animation="wave" className="!tw-w-full !tw-h-full !tw-m-0 !tw-p-0" />
          </div>
        )}
        <div className="head-types">Filter By Types (Maximum 2)</div>
        <ToggleType fullWidth value={selectTypes} onSelectType={(type) => addTypeArr(type)} />
        <div className="tw-w-full">
          <div className="border-input">
            <div className="head-types">Options</div>
            <div className="row !tw-m-0">
              <div className="xl:tw-w-1/3 xl:tw-flex-initial !tw-p-0">
                <InputMuiSearch
                  isNoWrap
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                  placeholder="Enter Name or ID"
                  labelPrepend="Search name or ID"
                />
                <FormControlMui
                  control={
                    <Checkbox checked={isMatch} onChange={(_, check) => setFilters({ ...filters, isMatch: check })} />
                  }
                  label="Match Pokémon"
                >
                  <InputReleased
                    releasedGO={releasedGO}
                    setReleaseGO={(check) => setFilters({ ...filters, releasedGO: check })}
                    isAvailable={releasedGO}
                  />
                  <FormControlMui
                    isNotGroup
                    control={
                      <Switch checked={isShiny} onChange={(_, check) => setFilters({ ...filters, isShiny: check })} />
                    }
                    className="tw-h-full"
                    label={
                      <span className="tw-flex tw-items-center">
                        Show All Shiny Pokémon (Only Possible)
                        <img
                          className={combineClasses('tw-ml-1', isShiny ? 'filter-shiny' : 'filter-gray')}
                          width={28}
                          height={28}
                          alt="Pokémon GO Icon"
                          src={APIService.getShinyIcon()}
                        />
                      </span>
                    }
                  />
                </FormControlMui>
              </div>
              <div className="xl:tw-w-2/3 xl:tw-flex-initial border-input tw-p-2 tw-gap-2">
                <div className="tw-flex">
                  <SelectMui<number[]>
                    multiple
                    formClassName="tw-w-1/2"
                    formSx={{ m: 1 }}
                    inputLabel="Generation(s)"
                    value={gen}
                    onChangeSelect={handleChangeGen}
                    renderValue={(selected) => `Gen ${selected.map((item) => (item + 1).toString()).join(', Gen ')}`}
                    insertItems={[
                      {
                        value: -1,
                        label: (
                          <ListItemText
                            primary={
                              <ButtonMui
                                fullWidth
                                color={btnSelected.isSelectGen ? 'error' : 'success'}
                                label={`${btnSelected.isSelectGen ? 'Deselect All' : 'Select All'}`}
                              />
                            }
                          />
                        ),
                        disabled: false,
                      },
                    ]}
                    menuItems={Object.values(genList).map((_, index) => ({
                      value: index,
                      label: (
                        <>
                          <Checkbox checked={isIncludeList(gen, index)} />
                          <ListItemText primary={`Generation ${index + 1} (${regionList[index + 1]})`} />
                        </>
                      ),
                    }))}
                  />
                  <SelectMui<number[]>
                    multiple
                    formClassName="tw-w-1/2"
                    formSx={{ m: 1 }}
                    inputLabel="Version(s)"
                    value={version}
                    onChangeSelect={handleChangeVersion}
                    renderValue={(selected) => selected.map((item) => versionList[item]).join(', ')}
                    insertItems={[
                      {
                        value: -1,
                        label: (
                          <ListItemText
                            primary={
                              <ButtonMui
                                fullWidth
                                color={btnSelected.isSelectVersion ? 'error' : 'success'}
                                label={`${btnSelected.isSelectVersion ? 'Deselect All' : 'Select All'}`}
                              />
                            }
                          />
                        ),
                      },
                    ]}
                    menuItems={Object.values(versionList).map((value, index) => ({
                      value: index,
                      label: (
                        <>
                          <Checkbox checked={isIncludeList(version, index)} />
                          <ListItemText primary={value} />
                        </>
                      ),
                    }))}
                  />
                </div>
                <div className="input-group border-input">
                  <span className="input-group-text !tw-max-h-[42px]">Filter only by</span>
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
      <BackdropMui open={isLoading}>
        <LoadGroup isShow={isLoading} isVertical={false} isHideAttr={false} />
      </BackdropMui>
      <div className="tw-text-center tw-bg-custom-default">
        <ul className="tw-grid pokemon-content">
          {listOfPokemon.map((row) => (
            <CardPokemonInfo
              key={`${row.id}-${row.form ?? ''}`}
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
