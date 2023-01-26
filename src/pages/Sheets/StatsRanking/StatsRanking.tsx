import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import { splitAndCapitalize, convertName, capitalize, convertFormName } from '../../../util/Utils';
import DataTable from 'react-data-table-component';
import pokemonData from '../../../data/pokemon.json';
import { useSelector, RootStateOrAny } from 'react-redux';
import { Link } from 'react-router-dom';
import { calculateStatsByTag } from '../../../util/Calculate';
import { genRoman } from '../../../util/Constants';
import Stats from '../../../components/Info/Stats/Stats';
import loadingImg from '../../../assets/loading.png';

const columnPokemon: any = [
  {
    name: 'Ranking',
    selector: (row: { rank: any }) => row.rank,
    width: '80px',
  },
  {
    name: 'ID',
    selector: (row: { num: any }) => row.num,
    width: '80px',
  },
  {
    name: 'Pokémon Name',
    selector: (row: { num: any; forme: string; name: string; sprite: string; baseSpecies: string }) => (
      <Link
        to={`/pokemon/${row.num}${row.forme ? `?form=${convertFormName(row.num, row.forme.toLowerCase())}` : ''}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
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
        {splitAndCapitalize(row.name, '-', ' ')}
      </Link>
    ),
    minWidth: '200px',
  },
  {
    name: 'Type(s)',
    selector: (row: { types: any[] }) =>
      row.types.map((value: any, index: React.Key) => (
        <img
          key={index}
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          src={APIService.getTypeSprite(capitalize(value))}
        />
      )),
    width: '150px',
  },
  {
    name: 'ATK',
    selector: (row: { atk: { attack: any } }) => row.atk.attack,
    sortable: true,
    width: '100px',
  },
  {
    name: 'DEF',
    selector: (row: { def: { defense: any } }) => row.def.defense,
    sortable: true,
    width: '100px',
  },
  {
    name: 'STA',
    selector: (row: { sta: { stamina: any } }) => row.sta.stamina,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Stat Prod',
    selector: (row: { statProd: any }) => row.statProd,
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
      when: (row: { slug: string }) => row.slug === select?.slug,
      style: { backgroundColor: '#e3f2fd' },
    },
  ];

  const stats = useSelector((state: RootStateOrAny) => state.stats);

  const mappingData = (pokemon: any[]) => {
    return pokemon.map(
      (data: { baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }; slug: string | null }) => {
        return {
          ...data,
          atk: {
            attack: calculateStatsByTag(data.baseStats, data.slug).atk,
            rank: stats.attack.ranking.find(
              (stat: { attack: number }) => stat.attack === calculateStatsByTag(data.baseStats, data.slug).atk
            ).rank,
          },
          def: {
            defense: calculateStatsByTag(data.baseStats, data.slug).def,
            rank: stats.defense.ranking.find(
              (stat: { defense: number }) => stat.defense === calculateStatsByTag(data.baseStats, data.slug).def
            ).rank,
          },
          sta: {
            stamina: calculateStatsByTag(data.baseStats, data.slug).sta,
            rank: stats.stamina.ranking.find(
              (stat: { stamina: number }) => stat.stamina === calculateStatsByTag(data.baseStats, data.slug).sta
            ).rank,
          },
          statProd:
            calculateStatsByTag(data.baseStats, data.slug).atk *
            calculateStatsByTag(data.baseStats, data.slug).def *
            calculateStatsByTag(data.baseStats, data.slug).sta,
        };
      }
    );
  };

  const sortRanking = (pokemon: any[], id: number) => {
    let sortBy: string[] = [];
    if (id === 5) {
      sortBy = ['atk', 'attack'];
    } else if (id === 6) {
      sortBy = ['def', 'defense'];
    } else if (id === 7) {
      sortBy = ['sta', 'stamina'];
    }
    return pokemon
      .sort((a: any, b: any) => (id !== 8 ? b[sortBy[0]][sortBy[1]] - a[sortBy[0]][sortBy[1]] : b.statProd - a.statProd))
      .map((data, index) => {
        return {
          ...data,
          rank: index + 1,
        };
      });
  };

  const [sortId, setSortId] = useState(8);
  const [pokemonList, setPokemonList]: any = useState(
    sortRanking(mappingData(Object.values(pokemonData).filter((pokemon) => pokemon.num > 0)), sortId)
  );

  const [select, setSelect]: any = useState(pokemonList[0]);
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    document.title = `Stats Ranking`;
  }, []);

  useEffect(() => {
    if (showSpinner) {
      setShowSpinner(false);
    }
  }, [select, sortId]);

  return (
    <div className="element-bottom position-relative poke-container container">
      <div className="loading-group-spin-table" style={{ display: !showSpinner ? 'none' : 'block' }} />
      <div className="loading-spin-table text-center" style={{ display: !showSpinner ? 'none' : 'block' }}>
        <img className="loading" width={64} height={64} alt="img-pokemon" src={loadingImg} />
        <span className="caption text-black" style={{ fontSize: 18 }}>
          <b>
            Loading<span id="p1">.</span>
            <span id="p2">.</span>
            <span id="p3">.</span>
          </b>
        </span>
      </div>
      <div className="w-100 text-center d-inline-block align-middle" style={{ marginTop: 15, marginBottom: 15 }}>
        <div className="d-inline-block img-desc">
          <img
            className="pokemon-main-sprite"
            style={{ verticalAlign: 'baseline' }}
            alt="img-full-pokemon"
            src={APIService.getPokeFullSprite(select.num, splitAndCapitalize(select.forme, '-', '-'))}
          />
        </div>
        <div className="d-inline-block">
          <table className="table-info table-desc">
            <thead />
            <tbody>
              <tr>
                <td>
                  <h5 className="d-flex">ID</h5>
                </td>
                <td colSpan={2}>
                  <h5 className="d-flex">
                    <b>#{select.num}</b>
                  </h5>
                </td>
              </tr>
              <tr>
                <td>
                  <h5 className="d-flex">Name</h5>
                </td>
                <td colSpan={2}>
                  <h5 className="d-flex">
                    <b>{splitAndCapitalize(convertName(select.name.replaceAll(' ', '-')).replace('MEWTWO_A', 'MEWTOW_ARMOR'), '_', ' ')}</b>
                  </h5>
                </td>
              </tr>
              <tr>
                <td>
                  <h5 className="d-flex">Generation</h5>
                </td>
                <td colSpan={2}>
                  <h5 className="d-flex align-items-center" style={{ gap: 5 }}>
                    <b>{genRoman(select.gen)}</b> <span className="text-gen">{`Gen ${select.gen}`}</span>
                  </h5>
                </td>
              </tr>
              <tr>
                <td>
                  <h5 className="d-flex">Region</h5>
                </td>
                <td colSpan={2}>
                  <h5 className="d-flex">{splitAndCapitalize(select.region, '-', ' ')}</h5>
                </td>
              </tr>
              <tr>
                <td>
                  <h5 className="d-flex">Version</h5>
                </td>
                <td colSpan={2}>
                  <h5 className="d-flex">{select.version && splitAndCapitalize(select.version.replace(' Go', ' GO'), '-', ' ')}</h5>
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
                        <h6>{select.weightkg} kg</h6>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center h-100" style={{ float: 'left', width: '50%' }}>
                    <div>
                      <div className="d-inline-block" style={{ marginRight: 5 }}>
                        <h6>Height:</h6>
                      </div>
                      <div className="d-inline-block">
                        <h6>{select.heightm} m</h6>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Stats statATK={select.atk} statDEF={select.def} statSTA={select.sta} pokemonStats={stats} />
      <DataTable
        columns={columnPokemon}
        data={pokemonList}
        pagination={true}
        defaultSortFieldId={8}
        defaultSortAsc={false}
        highlightOnHover={true}
        onRowClicked={(row: any) => {
          if (select.name !== row.name) {
            setShowSpinner(true);
            setSelect(row);
          }
        }}
        onSort={(rows: any) => {
          if (sortId !== rows.id) {
            setShowSpinner(true);
            setPokemonList(sortRanking(pokemonList, rows.id));
            setSortId(rows.id);
          }
        }}
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
      />
    </div>
  );
};

export default StatsRanking;
