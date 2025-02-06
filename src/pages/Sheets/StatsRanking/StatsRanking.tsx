import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import {
  splitAndCapitalize,
  capitalize,
  convertPokemonImageName,
  getPokemonDetails,
  generateParamForm,
  getValidPokemonImgPath,
} from '../../../util/utils';
import DataTable, { ConditionalStyles, TableStyles } from 'react-data-table-component';
import { useSelector } from 'react-redux';
import { calculateStatsByTag } from '../../../util/calculate';
import Stats from '../../../components/Info/Stats/Stats';
import TableMove from '../../../components/Table/Move/MoveTable';

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import './StatsRanking.scss';
import { FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link, useSearchParams } from 'react-router-dom';
import { StatsState, StoreState } from '../../../store/models/state.model';
import { IPokemonData, PokemonProgress } from '../../../core/models/pokemon.model';
import { IPokemonStatsRanking, PokemonStatsRanking } from '../../../core/models/stats.model';
import PokemonTable from '../../../components/Table/Pokemon/PokemonTable';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { ColumnType } from './enums/column-type.enum';
import { FORM_NORMAL, Params } from '../../../util/constants';
import { Form } from '../../../core/models/API/form.model';
import { TypeAction } from '../../../enums/type.enum';
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
  toNumber,
} from '../../../util/extension';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';

const columnPokemon: TableColumnModify<IPokemonStatsRanking>[] = [
  {
    name: '',
    selector: (row) => (
      <Link to={`/pokemon/${row.num}${generateParamForm(row.forme)}`} title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}>
        <VisibilityIcon className="view-pokemon" fontSize="small" sx={{ color: 'black' }} />
      </Link>
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
      <>
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
      </>
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

const StatsRanking = () => {
  const icon = useSelector((state: StoreState) => state.store.icon);
  useChangeTitle('Stats Ranking');
  const [searchParams, setSearchParams] = useSearchParams();
  const conditionalRowStyles: ConditionalStyles<IPokemonStatsRanking>[] = [
    {
      when: (row) => isEqual(row.slug, select?.slug),
      style: { backgroundColor: '#e3f2fd', fontWeight: 'bold' },
    },
  ];

  const stats = useSelector((state: StatsState) => state.stats);
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemon);
  const [search, setSearch] = useState('');

  const mappingData = (pokemon: IPokemonData[]) =>
    pokemon.map((data) => {
      const statsTag = calculateStatsByTag(data, data?.baseStats, data?.slug);
      const details = getPokemonDetails(pokemon, data.num, data.fullName, true);
      return PokemonStatsRanking.create({
        ...data,
        releasedGO: getValueOrDefault(Boolean, details?.releasedGO),
        atk: {
          attack: statsTag.atk,
          rank: toNumber(stats?.attack?.ranking?.find((stat) => stat.attack === statsTag.atk)?.rank),
        },
        def: {
          defense: statsTag.def,
          rank: toNumber(stats?.defense?.ranking?.find((stat) => stat.defense === statsTag.def)?.rank),
        },
        sta: {
          stamina: statsTag.sta,
          rank: toNumber(stats?.stamina?.ranking?.find((stat) => stat.stamina === statsTag.sta)?.rank),
        },
        prod: {
          product: statsTag.atk * statsTag.def * statsTag.sta,
          rank: toNumber(stats?.statProd?.ranking?.find((stat) => stat.product === statsTag.atk * statsTag.def * statsTag.sta)?.rank),
        },
      });
    });

  const setSortBy = (id: ColumnType) => {
    let sortBy: string[] = [];
    const stats = new PokemonStatsRanking();
    if (id === ColumnType.Atk) {
      sortBy = [getPropertyName(stats, (o) => o.atk), getPropertyName(stats.atk, (o) => o.attack)];
    } else if (id === ColumnType.Def) {
      sortBy = [getPropertyName(stats, (o) => o.def), getPropertyName(stats.def, (o) => o.defense)];
    } else if (id === ColumnType.Sta) {
      sortBy = [getPropertyName(stats, (o) => o.sta), getPropertyName(stats.sta, (o) => o.stamina)];
    } else if (id === ColumnType.Prod) {
      sortBy = [getPropertyName(stats, (o) => o.prod), getPropertyName(stats.prod, (o) => o.product)];
    }
    return sortBy;
  };

  const setSortedPokemonRanking = (primary: IPokemonStatsRanking, secondary: IPokemonStatsRanking, sortBy: string[]) => {
    const a = primary as unknown as DynamicObj<DynamicObj<number>>;
    const b = secondary as unknown as DynamicObj<DynamicObj<number>>;
    return b[sortBy[0]][sortBy[1]] - a[sortBy[0]][sortBy[1]];
  };

  const sortRanking = (pokemon: IPokemonStatsRanking[], id: ColumnType) => {
    const sortBy = setSortBy(id);
    return pokemon
      .sort((a, b) => setSortedPokemonRanking(a, b, sortBy))
      .map((data) => {
        const result = data as unknown as DynamicObj<IPokemonStatsRanking>;
        return PokemonStatsRanking.create({
          ...data,
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

  const [page, setPage] = useState(1);
  const [sortId, setSortId] = useState(getSortId());
  const [pokemonList, setPokemonList] = useState<IPokemonStatsRanking[]>([]);
  const [pokemonFilter, setPokemonFilter] = useState<IPokemonStatsRanking[]>([]);

  const [select, setSelect] = useState<IPokemonStatsRanking>();

  const [filters, setFilters] = useState(new Filter());
  const { isMatch, releasedGO } = filters;

  const [progress, setProgress] = useState(new PokemonProgress());

  useEffect(() => {
    if (isNotEmpty(pokemonData) && !isNotEmpty(pokemonList)) {
      const pokemon = sortRanking(mappingData(pokemonData.filter((pokemon) => pokemon.num > 0)), sortId);
      setPokemonList(pokemon);
      setPokemonFilter(pokemon);
      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: true }));
    }
  }, [pokemonList, pokemonData]);

  useEffect(() => {
    if (!select && isNotEmpty(pokemonList)) {
      setSelect(pokemonList[0]);
    }
  }, [select, pokemonList]);

  useEffect(() => {
    const id = toNumber(searchParams.get(Params.Id));
    if (!isNaN(id) && isNotEmpty(pokemonFilter)) {
      const form = searchParams.get(Params.Form)?.replaceAll('_', '-');
      const index = pokemonFilter.findIndex(
        (row) => row.num === id && isEqual(row.forme, form || FORM_NORMAL, EqualMode.IgnoreCaseSensitive)
      );
      if (index > -1) {
        const result = pokemonFilter[index];
        setPage(Math.ceil((index + 1) / 25));
        setSelect(result);
        setSortId(getSortId());
      }
    }
  }, [searchParams, pokemonFilter]);

  const setFilterParams = (select: IPokemonStatsRanking) => {
    searchParams.set(Params.Id, select.num.toString());
    const form = select.forme?.replace(FORM_NORMAL, '').toLowerCase().replaceAll('_', '-');
    searchParams.set(Params.Form, getValueOrDefault(String, form));
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

  const convertToPokemonForm = (pokemon: IPokemonStatsRanking) =>
    Form.create({
      formName: pokemon.forme,
      id: pokemon.num,
      isDefault: true,
      name: pokemon.name,
      types: pokemon.types,
      version: pokemon.version,
    });

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
              <TableMove
                data={select}
                id={select.num}
                form={convertToPokemonForm(select)}
                statATK={toNumber(select.atk.attack)}
                statDEF={toNumber(select.def.defense)}
                statSTA={toNumber(select.sta.stamina)}
                maxHeight={400}
              />
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
          if (!isEqual(select?.name, row.name)) {
            setFilterParams(row);
          }
        }}
        onSort={(rows) => {
          if (sortId !== rows.id) {
            setPokemonFilter(sortRanking(pokemonFilter, toNumber(rows.id)));
            setSortId(toNumber(rows.id));
          }
        }}
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
        paginationDefaultPage={page}
        paginationPerPage={25}
        paginationRowsPerPageOptions={[25, 50, 100]}
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
