import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import { splitAndCapitalize, capitalize, convertToPokemonForm, convertPokemonImageName, getPokemonDetails } from '../../../util/Utils';
import DataTable from 'react-data-table-component';
import { useSelector } from 'react-redux';
import { calculateStatsByTag } from '../../../util/Calculate';
import Stats from '../../../components/Info/Stats/Stats';
import TableMove from '../../../components/Table/Move/MoveTable';

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import './StatsRanking.scss';
import { FormControlLabel, Checkbox } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { StatsState, StoreState } from '../../../store/models/state.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';
import { PokemonStatsRanking } from '../../../core/models/stats.model';
import PokemonTable from '../../../components/Table/Pokemon/PokemonTable';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { APIUrl } from '../../../services/constants';
import { ColumnType } from './enums/column-type.enum';
import { FORM_NORMAL } from '../../../util/Constants';

const columnPokemon: any = [
  {
    name: '',
    selector: (row: PokemonStatsRanking) => (
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
    selector: (row: PokemonStatsRanking) => row.rank,
    width: '80px',
  },
  {
    name: 'ID',
    selector: (row: PokemonStatsRanking) => row.num,
    width: '80px',
  },
  {
    name: 'Released',
    selector: (row: PokemonStatsRanking) => (row.releasedGO ? <DoneIcon color="success" /> : <CloseIcon color="error" />),
    width: '80px',
  },
  {
    name: 'Pokémon Name',
    selector: (row: PokemonStatsRanking) => (
      <>
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.sprite, true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name?.replaceAll('_', '-'), '-', ' ')}
      </>
    ),
    minWidth: '200px',
  },
  {
    name: 'Type(s)',
    selector: (row: PokemonStatsRanking) =>
      row.types?.map((value, index) => (
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
    selector: (row: PokemonStatsRanking) => row.atk.attack,
    sortable: true,
    width: '100px',
  },
  {
    name: 'DEF',
    selector: (row: PokemonStatsRanking) => row.def.defense,
    sortable: true,
    width: '100px',
  },
  {
    name: 'STA',
    selector: (row: PokemonStatsRanking) => row.sta.stamina,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Stat Prod',
    selector: (row: PokemonStatsRanking) => row.statProd.prod,
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
  useChangeTitle('Stats Ranking');
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const conditionalRowStyles = [
    {
      when: (row: PokemonStatsRanking) => row.slug === select?.slug,
      style: { backgroundColor: '#e3f2fd', fontWeight: 'bold' },
    },
  ];

  const stats = useSelector((state: StatsState) => state.stats);
  const pokemonData = useSelector((state: StoreState) => state.store?.data?.pokemon ?? []);
  const [search, setSearch] = useState('');

  const mappingData = (pokemon: PokemonDataModel[]) => {
    return pokemon.map((data) => {
      const statsTag = calculateStatsByTag(data, data?.baseStats, data?.slug);
      const details = getPokemonDetails(pokemon, data.num, data.fullName ?? '', true);
      return {
        ...data,
        releasedGO: details?.releasedGO,
        atk: {
          attack: statsTag.atk,
          rank: stats?.attack?.ranking?.find((stat) => stat.attack === statsTag.atk)?.rank,
        },
        def: {
          defense: statsTag.def,
          rank: stats?.defense?.ranking?.find((stat) => stat.defense === statsTag.def)?.rank,
        },
        sta: {
          stamina: statsTag.sta,
          rank: stats?.stamina?.ranking?.find((stat) => stat.stamina === statsTag.sta)?.rank,
        },
        statProd: {
          prod: statsTag.atk * statsTag.def * (statsTag?.sta ?? 0),
          rank: stats?.statProd?.ranking?.find((stat) => stat.prod === statsTag.atk * statsTag.def * (statsTag?.sta ?? 0))?.rank,
        },
      };
    }) as PokemonStatsRanking[];
  };

  const sortRanking = (pokemon: PokemonStatsRanking[], id: number): PokemonStatsRanking[] => {
    let sortBy: string[] = [];
    if (id === ColumnType.Atk) {
      sortBy = ['atk', 'attack'];
    } else if (id === ColumnType.Def) {
      sortBy = ['def', 'defense'];
    } else if (id === ColumnType.Sta) {
      sortBy = ['sta', 'stamina'];
    } else if (id === ColumnType.Prod) {
      sortBy = ['statProd', 'prod'];
    }
    return pokemon
      .sort((a: any, b: any) => b[sortBy[0]][sortBy[1]] - a[sortBy[0]][sortBy[1]])
      .map((data: any) => {
        return {
          ...data,
          rank: data[sortBy[0]]?.rank,
        };
      });
  };

  const getSortId = () => {
    let idSort = ColumnType.Prod;
    const statsBy = location.state?.stats;
    if (statsBy) {
      if (statsBy === 'atk') {
        idSort = ColumnType.Atk;
      } else if (statsBy === 'def') {
        idSort = ColumnType.Def;
      } else if (statsBy === 'sta') {
        idSort = ColumnType.Sta;
      }
    }
    return idSort;
  };

  const [page, setPage] = useState(1);
  const [sortId, setSortId] = useState(getSortId());
  const [pokemonList, setPokemonList]: [PokemonStatsRanking[], React.Dispatch<React.SetStateAction<PokemonStatsRanking[]>>] = useState(
    [] as PokemonStatsRanking[]
  );
  const [pokemonFilter, setPokemonFilter]: [PokemonStatsRanking[], React.Dispatch<React.SetStateAction<PokemonStatsRanking[]>>] = useState(
    [] as PokemonStatsRanking[]
  );

  const [select, setSelect]: [PokemonStatsRanking | undefined, React.Dispatch<React.SetStateAction<PokemonStatsRanking | undefined>>] =
    useState();

  const [filters, setFilters] = useState({ match: false });
  const { match } = filters;

  const [progress, setProgress] = useState({ isLoadedForms: false });
  const { isLoadedForms } = progress;

  useEffect(() => {
    if (pokemonData.length > 0 && pokemonList.length === 0) {
      const pokemon = sortRanking(mappingData(pokemonData.filter((pokemon) => pokemon.num > 0)), sortId);
      setPokemonList(pokemon);
      setPokemonFilter(pokemon);
      setProgress((p) => ({ ...p, isLoadedForms: true }));
    }
  }, [pokemonList, pokemonData]);

  useEffect(() => {
    if (!select && pokemonList.length > 0) {
      setSelect(pokemonList.at(0));
    }
  }, [select, pokemonList]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && pokemonFilter.length > 0) {
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

  const setFilterParams = (select: PokemonStatsRanking) => {
    searchParams.set('id', select.num.toString());
    searchParams.set('form', select.forme?.replace(FORM_NORMAL, '').replaceAll('_', '-').toLowerCase());
    setSearchParams(searchParams);
  };

  useEffect(() => {
    if (pokemonList.length > 0) {
      const timeOutId = setTimeout(() => {
        setPokemonFilter(
          pokemonList.filter(
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
  }, [search, match, pokemonList]);

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
              region={select?.region}
              version={select?.version}
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
        form={select?.forme}
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
      </div>
      <DataTable
        columns={columnPokemon}
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
            setPokemonFilter(sortRanking(pokemonList, parseInt(rows.id?.toString() ?? '0')));
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
