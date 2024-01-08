import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import { splitAndCapitalize, convertName, capitalize, convertFormName } from '../../../util/Utils';
import DataTable from 'react-data-table-component';
import { useSelector } from 'react-redux';
import { calculateStatsByTag } from '../../../util/Calculate';
import { genRoman } from '../../../util/Constants';
import Stats from '../../../components/Info/Stats/Stats';
import TableMove from '../../../components/Table/Move/MoveTable';

import './StatsRanking.scss';
import { FormControlLabel, Checkbox } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import { StatsState, StoreState } from '../../../store/models/state.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';

const columnPokemon: any = [
  {
    name: '',
    selector: (row: { num: number; forme: string; name: string }) => (
      <Link
        to={`/pokemon/${row.num}${row.forme ? `?form=${convertFormName(row.num, row.forme.toLowerCase())}` : ''}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
        <VisibilityIcon className="view-pokemon" fontSize="small" sx={{ color: 'black' }} />
      </Link>
    ),
    width: '55px',
  },
  {
    name: 'Ranking',
    selector: (row: { rank: number }) => row.rank,
    width: '80px',
  },
  {
    name: 'ID',
    selector: (row: { num: number }) => row.num,
    width: '80px',
  },
  {
    name: 'Pokémon Name',
    selector: (row: { num: number; forme: string; name: string; sprite: string; baseSpecies: string }) => (
      <>
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.sprite, true)}
          onError={(e: any) => {
            e.onerror = null;
            e.target.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name?.replaceAll('_', '-'), '-', ' ')}
      </>
    ),
    minWidth: '200px',
  },
  {
    name: 'Type(s)',
    selector: (row: { types: string[] }) =>
      row.types.map((value: string, index: React.Key) => (
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
    selector: (row: { atk: { attack: number } }) => row.atk.attack,
    sortable: true,
    width: '100px',
  },
  {
    name: 'DEF',
    selector: (row: { def: { defense: number } }) => row.def.defense,
    sortable: true,
    width: '100px',
  },
  {
    name: 'STA',
    selector: (row: { sta: { stamina: number } }) => row.sta.stamina,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Stat Prod',
    selector: (row: { statProd: { prod: number } }) => row.statProd.prod,
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
  const conditionalRowStyles = [
    {
      when: (row: { name: string; slug: string }) => row.slug === select?.slug,
      style: { backgroundColor: '#e3f2fd', fontWeight: 'bold' },
    },
  ];

  const stats = useSelector((state: StatsState) => state.stats);
  const pokemonData = useSelector((state: StoreState) => state.store?.data?.pokemonData ?? []);
  const [search, setSearch] = useState('');

  const mappingData = (pokemon: PokemonDataModel[]) => {
    return pokemon.map((data) => {
      const statsTag = calculateStatsByTag(data, data?.baseStats, data?.slug);
      return {
        ...data,
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
    });
  };

  const sortRanking = (pokemon: any[], id: string | number | undefined) => {
    let sortBy: string[] = [];
    if (id === 6) {
      sortBy = ['atk', 'attack'];
    } else if (id === 7) {
      sortBy = ['def', 'defense'];
    } else if (id === 8) {
      sortBy = ['sta', 'stamina'];
    } else {
      sortBy = ['statProd', 'prod'];
    }
    return pokemon
      .sort((a: any, b: any) => b[sortBy[0]][sortBy[1]] - a[sortBy[0]][sortBy[1]])
      .map((data) => {
        return {
          ...data,
          rank: data[sortBy[0]].rank,
        };
      });
  };

  const [sortId, setSortId] = useState(9);
  const [pokemonList, setPokemonList]: [PokemonDataModel[], any] = useState([]);
  const [pokemonFilter, setPokemonFilter]: [PokemonDataModel[], any] = useState([]);

  const [select, setSelect]: any = useState(null);

  const [filters, setFilters] = useState({ match: false });
  const { match } = filters;

  useEffect(() => {
    document.title = `Stats Ranking`;
  }, []);

  useEffect(() => {
    if (pokemonData.length > 0 && pokemonList.length === 0) {
      const pokemon = sortRanking(mappingData(pokemonData.filter((pokemon) => pokemon.num > 0)), sortId);
      setPokemonList(pokemon);
      setPokemonFilter(pokemon);
    }
  }, [pokemonList, pokemonData]);

  useEffect(() => {
    if (!select && pokemonList.length > 0) {
      setSelect(pokemonList.at(0));
    }
  }, [select, pokemonList]);

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
              src={APIService.getPokeFullSprite(select?.num, splitAndCapitalize(select?.forme, '-', '-'))}
            />
          </div>
        </div>
        <div className="row w-100 element-top" style={{ margin: 0 }}>
          <div className="col-xl-5" style={{ padding: 0 }}>
            <table className="table-info table-desc table-stats-ranking">
              <thead />
              <tbody>
                <tr>
                  <td>
                    <h5 className="d-flex">ID</h5>
                  </td>
                  <td colSpan={2}>
                    <h5 className="d-flex">
                      <b>{select && `#${select?.num}`}</b>
                    </h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="d-flex">Name</h5>
                  </td>
                  <td colSpan={2}>
                    <h5 className="d-flex">
                      <b>
                        {splitAndCapitalize(convertName(select?.name.replaceAll(' ', '-')).replace('MEWTWO_A', 'MEWTOW_ARMOR'), '_', ' ')}
                      </b>
                    </h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="d-flex">Generation</h5>
                  </td>
                  <td colSpan={2}>
                    <h5 className="d-flex align-items-center" style={{ gap: 5 }}>
                      {!select || select?.gen === 0 ? (
                        <b>Unknown</b>
                      ) : (
                        <>
                          <b>{genRoman(select.gen)}</b> <span className="text-gen">{`Gen ${select.gen}`}</span>
                        </>
                      )}
                    </h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="d-flex">Region</h5>
                  </td>
                  <td colSpan={2}>
                    <h5 className="d-flex">{splitAndCapitalize(select?.region, '-', ' ')}</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="d-flex">Version</h5>
                  </td>
                  <td colSpan={2}>
                    <h5 className="d-flex">{select?.version && splitAndCapitalize(select?.version.replace(' Go', ' GO'), '-', ' ')}</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="d-flex">Body</h5>
                  </td>
                  <td colSpan={2} style={{ padding: 0 }}>
                    <div className="d-flex align-items-center first-extra-col h-100" style={{ float: 'left', width: '50%' }}>
                      <div>
                        <div className="d-inline-block" style={{ marginRight: 5 }}>
                          <h6>Weight:</h6>
                        </div>
                        <div className="d-inline-block">
                          <h6>{select?.weightkg} kg</h6>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center h-100" style={{ float: 'left', width: '50%' }}>
                      <div>
                        <div className="d-inline-block" style={{ marginRight: 5 }}>
                          <h6>Height:</h6>
                        </div>
                        <div className="d-inline-block">
                          <h6>{select?.heightm} m</h6>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-xl-7" style={{ padding: 0 }}>
            <TableMove
              data={select}
              id={select?.num}
              form={select?.slug}
              statATK={select?.atk.attack}
              statDEF={select?.def.defense}
              statSTA={select?.sta.stamina}
              maxHeight={400}
            />
          </div>
        </div>
      </div>
      <Stats statATK={select?.atk} statDEF={select?.def} statSTA={select?.sta} statProd={select?.statProd} pokemonStats={stats} />
      <div className="d-flex" style={{ gap: 15 }}>
        <div className="w-25 input-group border-input" style={{ minWidth: 300 }}>
          <span className="input-group-text">Find Pokémon</span>
          <input
            type="text"
            className="form-control input-search"
            placeholder="Enter Name or ID"
            value={search}
            onInput={(e: any) => setSearch(e.target.value)}
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
        defaultSortFieldId={9}
        defaultSortAsc={false}
        highlightOnHover={true}
        onRowClicked={(row) => {
          if (select?.name !== row.name) {
            setSelect(row);
          }
        }}
        onSort={(rows) => {
          if (sortId !== rows.id) {
            setPokemonFilter(sortRanking(pokemonList, rows.id));
            setSortId(parseInt(rows.id?.toString() ?? ''));
          }
        }}
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
      />
    </div>
  );
};

export default StatsRanking;
