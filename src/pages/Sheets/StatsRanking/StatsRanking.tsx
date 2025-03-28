import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import {
  splitAndCapitalize,
  capitalize,
  convertPokemonImageName,
  getPokemonDetails,
  generateParamForm,
  getValidPokemonImgPath,
  getDmgMultiplyBonus,
} from '../../../util/utils';
import DataTable, { ConditionalStyles, TableStyles } from 'react-data-table-component';
import { useSelector } from 'react-redux';
import Stats from '../../../components/Info/Stats/Stats';
import TableMove from '../../../components/Table/Move/MoveTable';

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import './StatsRanking.scss';
import { FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSearchParams } from 'react-router-dom';
import { StatsState, StoreState } from '../../../store/models/state.model';
import { IPokemonData, PokemonProgress } from '../../../core/models/pokemon.model';
import { IPokemonStatsRanking, PokemonStatsRanking, StatsAtk, StatsDef, StatsProd, StatsSta } from '../../../core/models/stats.model';
import PokemonTable from '../../../components/Table/Pokemon/PokemonTable';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { ColumnType } from './enums/column-type.enum';
import { FORM_NORMAL, Params } from '../../../util/constants';
import { PokemonType, TypeAction } from '../../../enums/type.enum';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';
import {
  convertColumnDataType,
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isEmpty,
  isEqual,
  isInclude,
  isNotEmpty,
  isNullOrUndefined,
  isNumber,
  toNumber,
} from '../../../util/extension';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';

const columnPokemon: TableColumnModify<IPokemonStatsRanking>[] = [
  {
    name: '',
    selector: (row) => (
      <LinkToTop
        to={`/pokemon/${row.num}${generateParamForm(row.forme, row.pokemonType)}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
        <VisibilityIcon className="view-pokemon" fontSize="small" sx={{ color: 'black' }} />
      </LinkToTop>
    ),
    width: '55px',
  },
  {
    name: 'Ranking',
    selector: (row) => toNumber(row.rank),
    width: '80px',
  },
  {
    name: 'ID',
    selector: (row) => row.num,
    width: '80px',
  },
  {
    name: 'Released',
    selector: (row) => (row.releasedGO ? <DoneIcon color="success" /> : <CloseIcon color="error" />),
    width: '80px',
  },
  {
    name: 'Pokémon Name',
    selector: (row) => (
      <PokemonIconType pokemonType={row.pokemonType} size={24}>
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.sprite, false)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name.replaceAll('_', '-'), '-', ' ')}
      </PokemonIconType>
    ),
    minWidth: '200px',
  },
  {
    name: 'Type(s)',
    selector: (row) =>
      getValueOrDefault(Array, row.types).map((value, index) => (
        <img
          key={index}
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          title={capitalize(value)}
          src={APIService.getTypeSprite(value)}
        />
      )),
    width: '150px',
  },
  {
    name: 'ATK',
    selector: (row) => toNumber(row.atk.attack),
    sortable: true,
    width: '100px',
  },
  {
    name: 'DEF',
    selector: (row) => toNumber(row.def.defense),
    sortable: true,
    width: '100px',
  },
  {
    name: 'STA',
    selector: (row) => toNumber(row.sta.stamina),
    sortable: true,
    width: '100px',
  },
  {
    name: 'Stat Prod',
    selector: (row) => toNumber(row.prod.product),
    sortable: true,
    width: '150px',
  },
];

const customStyles: TableStyles = {
  rows: {
    style: {
      cursor: 'pointer',
    },
  },
};

interface IFilter {
  isMatch: boolean;
  releasedGO: boolean;
}

class Filter implements IFilter {
  isMatch = false;
  releasedGO = false;

  static create(value: IFilter) {
    const obj = new Filter();
    Object.assign(obj, value);
    return obj;
  }
}

const defaultPerPages = 25;

const StatsRanking = () => {
  const icon = useSelector((state: StoreState) => state.store.icon);
  useChangeTitle('Stats Ranking');
  const [searchParams, setSearchParams] = useSearchParams();
  const [select, setSelect] = useState<IPokemonStatsRanking>();
  const conditionalRowStyles: ConditionalStyles<IPokemonStatsRanking>[] = [
    {
      when: (row) => !isNullOrUndefined(select) && row.id === select.id,
      style: { backgroundColor: '#e3f2fd', fontWeight: 'bold' },
    },
  ];

  const stats = useSelector((state: StatsState) => state.stats);
  const pokemons = useSelector((state: StoreState) => state.store.data.pokemons);
  const options = useSelector((state: StoreState) => state.store.data.options);
  const [pokemon, setPokemon] = useState<IPokemonData>();
  const [search, setSearch] = useState('');

  const addShadowPurificationForms = (result: IPokemonStatsRanking[], value: IPokemonData, details: IPokemonData) => {
    const atkShadow = Math.round(value.baseStats.atk * getDmgMultiplyBonus(PokemonType.Shadow, options, TypeAction.Atk));
    const defShadow = Math.round(value.baseStats.def * getDmgMultiplyBonus(PokemonType.Shadow, options, TypeAction.Def));
    const prodShadow = atkShadow * defShadow * toNumber(details.baseStats.sta);
    result.push(
      PokemonStatsRanking.create({
        ...value,
        releasedGO: details.releasedGO,
        pokemonType: PokemonType.Shadow,
        fullName: details.fullName,
        atk: StatsAtk.create({
          attack: atkShadow,
          rank: toNumber(stats?.attack?.ranking?.find((stat) => stat.attack === atkShadow)?.rank),
        }),
        def: StatsDef.create({
          defense: defShadow,
          rank: toNumber(stats?.defense?.ranking?.find((stat) => stat.defense === defShadow)?.rank),
        }),
        sta: StatsSta.create({
          stamina: details.baseStats.sta,
          rank: toNumber(stats?.stamina?.ranking?.find((stat) => stat.stamina === details.baseStats.sta)?.rank),
        }),
        prod: StatsProd.create({
          product: prodShadow,
          rank: toNumber(stats?.statProd?.ranking?.find((stat) => stat.product === prodShadow)?.rank),
        }),
      })
    );
    const atkPurification = Math.round(value.baseStats.atk * getDmgMultiplyBonus(PokemonType.Purified, options, TypeAction.Atk));
    const defPurification = Math.round(value.baseStats.def * getDmgMultiplyBonus(PokemonType.Purified, options, TypeAction.Def));
    const prodPurification = atkPurification * defPurification * toNumber(details.baseStats.sta);
    result.push(
      PokemonStatsRanking.create({
        ...value,
        releasedGO: true,
        pokemonType: PokemonType.Purified,
        atk: StatsAtk.create({
          attack: atkPurification,
          rank: toNumber(stats?.attack?.ranking?.find((stat) => stat.attack === atkPurification)?.rank),
        }),
        def: StatsDef.create({
          defense: defPurification,
          rank: toNumber(stats?.defense?.ranking?.find((stat) => stat.defense === defPurification)?.rank),
        }),
        sta: StatsSta.create({
          stamina: details.baseStats.sta,
          rank: toNumber(stats?.stamina?.ranking?.find((stat) => stat.stamina === details.baseStats.sta)?.rank),
        }),
        prod: StatsProd.create({
          product: prodPurification,
          rank: toNumber(stats?.statProd?.ranking?.find((stat) => stat.product === prodPurification)?.rank),
        }),
      })
    );
  };

  const mappingData = (pokemon: IPokemonData[]) => {
    const result: IPokemonStatsRanking[] = [];
    pokemon.forEach((data) => {
      const details = getPokemonDetails(pokemon, data.num, data.fullName, data.pokemonType, true);
      const product = details.baseStats.atk * details.baseStats.def * toNumber(details.baseStats.sta);
      result.push(
        PokemonStatsRanking.create({
          ...data,
          releasedGO: details.releasedGO,
          pokemonType: details.pokemonType,
          fullName: details.fullName,
          atk: StatsAtk.create({
            attack: details.baseStats.atk,
            rank: toNumber(stats?.attack?.ranking?.find((stat) => stat.attack === details.baseStats.atk)?.rank),
          }),
          def: StatsDef.create({
            defense: details.baseStats.def,
            rank: toNumber(stats?.defense?.ranking?.find((stat) => stat.defense === details.baseStats.def)?.rank),
          }),
          sta: StatsSta.create({
            stamina: details.baseStats.sta,
            rank: toNumber(stats?.stamina?.ranking?.find((stat) => stat.stamina === details.baseStats.sta)?.rank),
          }),
          prod: StatsProd.create({
            product,
            rank: toNumber(stats?.statProd?.ranking?.find((stat) => stat.product === product)?.rank),
          }),
        })
      );

      if (data.hasShadowForm) {
        addShadowPurificationForms(result, data, details);
      }
    });
    return result;
  };

  const setSortBy = (id: ColumnType) => {
    const stats = new PokemonStatsRanking();
    switch (id) {
      case ColumnType.Atk:
        return [getPropertyName(stats, (o) => o.atk), getPropertyName(stats.atk, (o) => o.attack)];
      case ColumnType.Def:
        return [getPropertyName(stats, (o) => o.def), getPropertyName(stats.def, (o) => o.defense)];
      case ColumnType.Sta:
        return [getPropertyName(stats, (o) => o.sta), getPropertyName(stats.sta, (o) => o.stamina)];
      case ColumnType.Prod:
      default:
        return [getPropertyName(stats, (o) => o.prod), getPropertyName(stats.prod, (o) => o.product)];
    }
  };

  const setSortedPokemonRanking = (primary: IPokemonStatsRanking, secondary: IPokemonStatsRanking, sortBy: string[]) => {
    const a = primary as unknown as DynamicObj<DynamicObj<number>>;
    const b = secondary as unknown as DynamicObj<DynamicObj<number>>;
    return b[sortBy[0]][sortBy[1]] - a[sortBy[0]][sortBy[1]];
  };

  const sortRanking = (pokemon: IPokemonStatsRanking[], id: ColumnType) => {
    const sortBy = setSortBy(id);
    const statsType = getStatsType(id);
    searchParams.set(Params.StatsType, statsType.toString());
    setSearchParams(searchParams);
    return pokemon
      .sort((a, b) => setSortedPokemonRanking(a, b, sortBy))
      .map((data, id) => {
        const result = data as unknown as DynamicObj<IPokemonStatsRanking>;
        return PokemonStatsRanking.create({
          ...data,
          id,
          rank: result[sortBy[0]]?.rank,
        });
      });
  };

  const getSortId = () => {
    let idSort = ColumnType.Prod;
    const statsBy = toNumber(searchParams.get(Params.StatsType));
    if (statsBy === TypeAction.Atk) {
      idSort = ColumnType.Atk;
    } else if (statsBy === TypeAction.Def) {
      idSort = ColumnType.Def;
    } else if (statsBy === TypeAction.Sta) {
      idSort = ColumnType.Sta;
    }
    return idSort;
  };

  const getStatsType = (id: ColumnType) => {
    switch (id) {
      case ColumnType.Atk:
        return TypeAction.Atk;
      case ColumnType.Def:
        return TypeAction.Def;
      case ColumnType.Sta:
        return TypeAction.Sta;
      case ColumnType.Prod:
      default:
        return TypeAction.Prod;
    }
  };

  const [page, setPage] = useState(1);
  const [sortId, setSortId] = useState(getSortId());
  const [pokemonList, setPokemonList] = useState<IPokemonStatsRanking[]>([]);
  const [pokemonFilter, setPokemonFilter] = useState<IPokemonStatsRanking[]>([]);

  const [filters, setFilters] = useState(new Filter());
  const { isMatch, releasedGO } = filters;

  const [progress, setProgress] = useState(new PokemonProgress());

  useEffect(() => {
    if (isNotEmpty(pokemons) && !isNotEmpty(pokemonList)) {
      const pokemon = pokemons.filter((pokemon) => pokemon.num > 0);
      const mapping = mappingData(pokemon);
      const pokemonList = sortRanking(mapping, sortId);
      setPokemonList(pokemonList);
      setPokemonFilter(pokemonList);
      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: true }));
    }
  }, [pokemonList, pokemons]);

  useEffect(() => {
    if (!select && isNotEmpty(pokemonList)) {
      const result = pokemonFilter[0];

      const pokemon = pokemons.filter((pokemon) => pokemon.num > 0);
      const details = getPokemonDetails(pokemon, result.num, result.fullName, result.pokemonType, true);
      setPokemon(details);

      setSelect(result);
    }
  }, [select, pokemonList]);

  useEffect(() => {
    const paramId = searchParams.get(Params.Id);
    if (isNumber(paramId) && isNotEmpty(pokemonFilter)) {
      const id = toNumber(paramId);
      const form = getValueOrDefault(String, searchParams.get(Params.Form), FORM_NORMAL).replaceAll('-', '_');
      const index = pokemonFilter.findIndex((row) => row.num === id && isEqual(row.forme, form, EqualMode.IgnoreCaseSensitive));
      if (index > -1) {
        const result = pokemonFilter[index];

        const pokemon = pokemons.filter((pokemon) => pokemon.num > 0);
        const details = getPokemonDetails(pokemon, id, result.fullName, result.pokemonType, true);
        setPokemon(details);

        setPage(Math.ceil((index + 1) / defaultPerPages));
        setSelect(result);
        setSortId(getSortId());
        searchParams.delete(Params.Id);
        searchParams.delete(Params.Form);
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, pokemonFilter]);

  const setFilterParams = (select: IPokemonStatsRanking) => {
    setSelect(select);
    searchParams.set(Params.Id, select.num.toString());
    const form = select.forme?.replace(FORM_NORMAL, '').toLowerCase().replaceAll('_', '-');
    if (form) {
      searchParams.set(Params.Form, form);
    } else {
      searchParams.delete(Params.Form);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    if (isNotEmpty(pokemonList)) {
      const timeOutId = setTimeout(() => {
        setPokemonFilter(
          pokemonList
            .filter((pokemon) => (releasedGO ? pokemon.releasedGO : true))
            .filter(
              (pokemon) =>
                isEmpty(search) ||
                (isMatch
                  ? isEqual(pokemon.num, search) ||
                    isEqual(splitAndCapitalize(pokemon.name, '-', ' '), search, EqualMode.IgnoreCaseSensitive)
                  : isInclude(pokemon.num, search) ||
                    isInclude(splitAndCapitalize(pokemon.name, '-', ' '), search, IncludeMode.IncludeIgnoreCaseSensitive))
            )
        );
      }, 100);
      return () => clearTimeout(timeOutId);
    }
  }, [search, isMatch, releasedGO, pokemonList]);

  return (
    <div className="element-bottom position-relative poke-container container">
      <div className="w-100 d-inline-block align-middle" style={{ marginTop: 15, marginBottom: 15 }}>
        <div className="d-flex justify-content-center w-100">
          <div className="d-inline-block img-desc">
            <img
              className="pokemon-main-sprite"
              style={{ verticalAlign: 'baseline' }}
              alt="img-full-pokemon"
              src={APIService.getPokeFullSprite(
                select?.num,
                convertPokemonImageName(select && isEqual(select.baseForme, select.forme) ? '' : select?.forme)
              )}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, select?.num);
              }}
            />
          </div>
        </div>
        <div className="row w-100 element-top" style={{ margin: 0 }}>
          <div className="col-xl-5" style={{ padding: 0 }}>
            <PokemonTable
              id={select?.num}
              gen={select?.gen}
              formName={select?.name}
              region={select?.region}
              version={select?.version}
              weight={toNumber(select?.weightKg)}
              height={toNumber(select?.heightM)}
              className="table-stats-ranking"
              isLoadedForms={progress.isLoadedForms}
            />
          </div>
          {select && (
            <div className="col-xl-7" style={{ padding: 0 }}>
              <TableMove pokemonData={pokemon} maxHeight={400} />
            </div>
          )}
        </div>
      </div>
      <Stats
        statATK={select?.atk}
        statDEF={select?.def}
        statSTA={select?.sta}
        statProd={select?.prod}
        pokemonStats={stats}
        id={select?.num}
        form={select?.forme}
        isDisabled={true}
      />
      <div className="d-flex flex-wrap" style={{ gap: 15 }}>
        <div className="w-25 input-group border-input" style={{ minWidth: 300 }}>
          <span className="input-group-text">Find Pokémon</span>
          <input
            type="text"
            className="form-control input-search"
            placeholder="Enter Name or ID"
            value={search}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
        <FormControlLabel
          control={<Checkbox checked={isMatch} onChange={(_, check) => setFilters(Filter.create({ ...filters, isMatch: check }))} />}
          label="Match Pokémon"
        />
        <FormControlLabel
          control={<Checkbox checked={releasedGO} onChange={(_, check) => setFilters(Filter.create({ ...filters, releasedGO: check }))} />}
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
      <DataTable
        columns={convertColumnDataType(columnPokemon)}
        data={pokemonFilter}
        pagination={true}
        defaultSortFieldId={getSortId()}
        defaultSortAsc={false}
        highlightOnHover={true}
        onRowClicked={(row) => {
          if (select?.id !== row.id) {
            setFilterParams(row);
            const pokemon = pokemons.find((pokemon) => pokemon.num === row.num && isEqual(row.forme, pokemon.forme));
            if (pokemon) {
              pokemon.pokemonType = row.pokemonType || PokemonType.Normal;
              setPokemon(pokemon);
            }
          }
        }}
        onSort={(rows) => {
          const rowsId = toNumber(rows.id);
          if (sortId !== rowsId) {
            setPokemonFilter(sortRanking(pokemonFilter, rowsId));
            setSortId(rowsId);
          }
        }}
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
        paginationDefaultPage={page}
        paginationPerPage={defaultPerPages}
        paginationRowsPerPageOptions={Array.from({ length: 3 }, (_, i) => defaultPerPages * Math.max(0, i - 1) + defaultPerPages * (i + 1))}
        progressPending={!isNotEmpty(pokemonList)}
        progressComponent={
          <div style={{ margin: 10 }}>
            <CircularProgress />
          </div>
        }
      />
    </div>
  );
};

export default StatsRanking;
