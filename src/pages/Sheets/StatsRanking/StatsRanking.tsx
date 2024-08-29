import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import {
  splitAndCapitalize,
  capitalize,
  convertPokemonImageName,
  getPokemonDetails,
  isNotEmpty,
  convertColumnDataType,
} from '../../../util/utils';
import DataTable from 'react-data-table-component';
import { useSelector } from 'react-redux';
import { calculateStatsByTag } from '../../../util/calculate';
import Stats from '../../../components/Info/Stats/Stats';
import TableMove from '../../../components/Table/Move/MoveTable';

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import './StatsRanking.scss';
import { FormControlLabel, Checkbox } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { StatsState, StoreState } from '../../../store/models/state.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { IPokemonStatsRanking, PokemonStatsRanking } from '../../../core/models/stats.model';
import PokemonTable from '../../../components/Table/Pokemon/PokemonTable';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { APIUrl } from '../../../services/constants';
import { ColumnType } from './enums/column-type.enum';
import { FORM_MEGA, FORM_NORMAL } from '../../../util/constants';
import { Form } from '../../../core/models/API/form.model';
import { TypeAction } from '../../../enums/type.enum';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';

const columnPokemon: TableColumnModify<IPokemonStatsRanking>[] = [
  {
    name: '',
    selector: (row) => (
      <Link
        to={`/pokemon/${row.num}${row.forme ? `?form=${row.forme.toLowerCase().replaceAll('_', '-')}` : ''}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
        <VisibilityIcon className="view-pokemon" fontSize="small" sx={{ color: 'black' }} />
      </Link>
    ),
    width: '55px',
  },
  {
    name: 'Ranking',
    selector: (row) => row.rank ?? 0,
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
          src={APIService.getPokeIconSprite(row.sprite, true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies ?? '');
          }}
        />
        {splitAndCapitalize(row.name?.replaceAll('_', '-'), '-', ' ')}
      </>
    ),
    minWidth: '200px',
  },
  {
    name: 'Type(s)',
    selector: (row) =>
      row.types.map((value, index) => (
        <img
          key={index}
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          title={capitalize(value)}
          src={APIService.getTypeSprite(capitalize(value))}
        />
      )),
    width: '150px',
  },
  {
    name: 'ATK',
    selector: (row) => row.atk.attack,
    sortable: true,
    width: '100px',
  },
  {
    name: 'DEF',
    selector: (row) => row.def.defense,
    sortable: true,
    width: '100px',
  },
  {
    name: 'STA',
    selector: (row) => row.sta.stamina,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Stat Prod',
    selector: (row) => row.statProd.prod,
    sortable: true,
    width: '150px',
  },
];

const customStyles = {
  rows: {
    style: {
      cursor: 'pointer',
    },
  },
};

const StatsRanking = () => {
  const icon = useSelector((state: StoreState) => state.store.icon);
  useChangeTitle('Stats Ranking');
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const conditionalRowStyles = [
    {
      when: (row: IPokemonStatsRanking) => row.slug === select?.slug,
      style: { backgroundColor: '#e3f2fd', fontWeight: 'bold' },
    },
  ];

  const stats = useSelector((state: StatsState) => state.stats);
  const pokemonData = useSelector((state: StoreState) => state.store?.data?.pokemon ?? []);
  const [search, setSearch] = useState('');

  const mappingData = (pokemon: IPokemonData[]) => {
    return pokemon.map((data) => {
      const statsTag = calculateStatsByTag(data, data?.baseStats, data?.slug);
      const details = getPokemonDetails(pokemon, data.num, data.fullName ?? '', true);
      return new PokemonStatsRanking({
        ...data,
        releasedGO: details?.releasedGO ?? false,
        atk: {
          attack: statsTag.atk,
          rank: stats?.attack?.ranking?.find((stat) => stat.attack === statsTag.atk)?.rank ?? 0,
        },
        def: {
          defense: statsTag.def,
          rank: stats?.defense?.ranking?.find((stat) => stat.defense === statsTag.def)?.rank ?? 0,
        },
        sta: {
          stamina: statsTag.sta ?? 0,
          rank: stats?.stamina?.ranking?.find((stat) => stat.stamina === statsTag.sta)?.rank ?? 0,
        },
        statProd: {
          prod: statsTag.atk * statsTag.def * (statsTag?.sta ?? 0),
          rank: stats?.statProd?.ranking?.find((stat) => stat.prod === statsTag.atk * statsTag.def * (statsTag?.sta ?? 0))?.rank ?? 0,
        },
      });
    });
  };

  const setSortedPokemonRanking = (primary: IPokemonStatsRanking, secondary: IPokemonStatsRanking, sortBy: string[]) => {
    const a = primary as unknown as { [x: string]: { [y: string]: number } };
    const b = secondary as unknown as { [x: string]: { [y: string]: number } };
    return b[sortBy[0]][sortBy[1]] - a[sortBy[0]][sortBy[1]];
  };

  const sortRanking = (pokemon: IPokemonStatsRanking[], id: number) => {
    let sortBy: string[] = [];
    if (id === ColumnType.Atk) {
      sortBy = [TypeAction.ATK, 'attack'];
    } else if (id === ColumnType.Def) {
      sortBy = [TypeAction.DEF, 'defense'];
    } else if (id === ColumnType.Sta) {
      sortBy = [TypeAction.STA, 'stamina'];
    } else if (id === ColumnType.Prod) {
      sortBy = ['statProd', 'prod'];
    }
    return pokemon
      .sort((a, b) => setSortedPokemonRanking(a, b, sortBy))
      .map((data) => {
        const result = data as unknown as { [x: string]: IPokemonStatsRanking };
        return new PokemonStatsRanking({
          ...data,
          rank: result[sortBy[0]]?.rank,
        });
      });
  };

  const getSortId = () => {
    let idSort = ColumnType.Prod;
    const statsBy = location.state?.stats;
    if (statsBy) {
      if (statsBy === TypeAction.ATK) {
        idSort = ColumnType.Atk;
      } else if (statsBy === TypeAction.DEF) {
        idSort = ColumnType.Def;
      } else if (statsBy === TypeAction.STA) {
        idSort = ColumnType.Sta;
      }
    }
    return idSort;
  };

  const [page, setPage] = useState(1);
  const [sortId, setSortId] = useState(getSortId());
  const [pokemonList, setPokemonList] = useState<IPokemonStatsRanking[]>([]);
  const [pokemonFilter, setPokemonFilter] = useState<IPokemonStatsRanking[]>([]);

  const [select, setSelect] = useState<IPokemonStatsRanking>();

  const [filters, setFilters] = useState({ match: false, releasedGO: false });
  const { match, releasedGO } = filters;

  const [progress, setProgress] = useState({ isLoadedForms: false });
  const { isLoadedForms } = progress;

  useEffect(() => {
    if (isNotEmpty(pokemonData) && !isNotEmpty(pokemonList)) {
      const pokemon = sortRanking(mappingData(pokemonData.filter((pokemon) => pokemon.num > 0)), sortId);
      setPokemonList(pokemon);
      setPokemonFilter(pokemon);
      setProgress((p) => ({ ...p, isLoadedForms: true }));
    }
  }, [pokemonList, pokemonData]);

  useEffect(() => {
    if (!select && isNotEmpty(pokemonList)) {
      setSelect(pokemonList.at(0));
    }
  }, [select, pokemonList]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && isNotEmpty(pokemonFilter)) {
      const form = searchParams.get('form');
      const index = pokemonFilter.findIndex(
        (row) => row.num === parseInt(id) && row.forme === (form?.replaceAll('-', '_').toUpperCase() || FORM_NORMAL)
      );
      if (index > -1) {
        const result = pokemonFilter[index];
        setPage(Math.ceil((index + 1) / 25));
        setSelect(result);
      }
    }
  }, [searchParams, pokemonFilter]);

  const setFilterParams = (select: IPokemonStatsRanking) => {
    searchParams.set('id', select.num.toString());
    searchParams.set('form', select.forme?.replace(FORM_NORMAL, '').replaceAll('_', '-').toLowerCase() ?? '');
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
                search === '' ||
                (match
                  ? pokemon.num.toString() === search || splitAndCapitalize(pokemon.name, '-', ' ').toLowerCase() === search.toLowerCase()
                  : pokemon.num.toString().includes(search) ||
                    splitAndCapitalize(pokemon.name, '-', ' ').toLowerCase().includes(search.toLowerCase()))
            )
        );
      }, 100);
      return () => clearTimeout(timeOutId);
    }
  }, [search, match, releasedGO, pokemonList]);

  const convertToPokemonForm = (pokemon: IPokemonData | IPokemonStatsRanking) => {
    return Form.create({
      formName: pokemon.forme ?? '',
      id: pokemon.num,
      isDefault: true,
      isMega: pokemon.slug?.toUpperCase().includes(FORM_MEGA),
      name: pokemon.name,
      sprites: undefined,
      types: pokemon.types ?? [],
      versionGroup: { name: pokemon.version ?? '' },
      isShadow: false,
      isPurified: false,
    });
  };

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
                select?.num ?? 0,
                convertPokemonImageName(select && select.baseForme === select.forme ? '' : select?.forme)
              )}
              onError={(e) => {
                e.currentTarget.onerror = null;
                if (e.currentTarget.src.includes(APIUrl.POKE_SPRITES_FULL_API_URL)) {
                  e.currentTarget.src = APIService.getPokeFullAsset(select?.num ?? 0);
                } else {
                  e.currentTarget.src = APIService.getPokeFullSprite(0);
                }
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
              region={select?.region ?? ''}
              version={select?.version ?? ''}
              weight={select?.weightkg ?? 0}
              height={select?.heightm ?? 0}
              className={'table-stats-ranking'}
              isLoadedForms={isLoadedForms}
            />
          </div>
          {select && (
            <div className="col-xl-7" style={{ padding: 0 }}>
              <TableMove
                data={select}
                id={select?.num}
                form={convertToPokemonForm(select)}
                statATK={select?.atk.attack}
                statDEF={select?.def.defense}
                statSTA={select?.sta.stamina}
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
        statProd={select?.statProd}
        pokemonStats={stats}
        id={select?.num}
        form={select?.forme ?? ''}
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
          control={<Checkbox checked={match} onChange={(_, check) => setFilters({ ...filters, match: check })} />}
          label="Match Pokémon"
        />
        <FormControlLabel
          control={<Checkbox checked={releasedGO} onChange={(_, check) => setFilters({ ...filters, releasedGO: check })} />}
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
        columns={convertColumnDataType<TableColumnModify<IPokemonStatsRanking>[], IPokemonStatsRanking>(columnPokemon)}
        data={pokemonFilter}
        pagination={true}
        defaultSortFieldId={getSortId()}
        defaultSortAsc={false}
        highlightOnHover={true}
        onRowClicked={(row) => {
          if (select?.name !== row.name) {
            setFilterParams(row);
          }
        }}
        onSort={(rows) => {
          if (sortId !== rows.id) {
            setPokemonFilter(sortRanking(pokemonFilter, parseInt(rows.id?.toString() ?? '0')));
            setSortId(parseInt(rows.id?.toString() ?? ''));
          }
        }}
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
        paginationDefaultPage={page}
        paginationPerPage={25}
        paginationRowsPerPageOptions={[25, 50, 100]}
      />
    </div>
  );
};

export default StatsRanking;
