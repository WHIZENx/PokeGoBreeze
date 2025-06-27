import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/api.service';
import { capitalize, generateParamForm, getItemSpritePath, splitAndCapitalize } from '../../../utils/utils';
import './Types.scss';
import CardType from '../../../components/Card/CardType';
import { computeBgType } from '../../../utils/compute';
import { Tabs, Tab } from 'react-bootstrap';
import { calculateStatsByTag } from '../../../utils/calculate';
import { FormControlLabel, Switch } from '@mui/material';
import { ColumnType, PokemonType, TypeMove } from '../../../enums/type.enum';
import { StoreState } from '../../../store/models/state.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ICombat } from '../../../core/models/combat.model';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import {
  combineClasses,
  getValueOrDefault,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toNumber,
} from '../../../utils/extension';
import { ItemName } from '../../News/enums/item-type.enum';
import { LinkToTop } from '../../../utils/hooks/LinkToTop';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import { IStyleSheetData } from '../../models/page.model';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../../components/Table/CustomDataTable/CustomDataTable';
import { IncludeMode } from '../../../utils/enums/string.enum';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import { getTypes } from '../../../utils/helpers/options-context.helpers';
import { getDataCombats, getDataPokemons } from '../../../utils/helpers/data-context.helpers';

const nameSort = (rowA: IPokemonData | ICombat, rowB: IPokemonData | ICombat) => {
  const a = getValueOrDefault(String, rowA.name.toLowerCase());
  const b = getValueOrDefault(String, rowB.name.toLowerCase());
  return a === b ? 0 : a > b ? 1 : -1;
};

const columnPokemon: TableColumnModify<IPokemonData>[] = [
  {
    id: ColumnType.Id,
    name: 'ID',
    selector: (row) => row.num,
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Name,
    name: 'Pokémon Name',
    selector: (row) => (
      <LinkToTop
        to={`/pokemon/${row.num}${generateParamForm(row.form)}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
        <img
          height={48}
          alt="Pokémon Image"
          className="me-2"
          src={APIService.getPokeIconSprite(row.sprite, false)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name, '-', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    id: ColumnType.Type,
    name: 'Type(s)',
    selector: (row) =>
      row.types.map((value, index) => (
        <IconType
          key={index}
          width={25}
          height={25}
          className="me-2"
          alt="Pokémon GO Type Logo"
          title={capitalize(value)}
          type={value}
        />
      )),
    width: '150px',
  },
  {
    id: ColumnType.Atk,
    name: 'ATK',
    selector: (row) => calculateStatsByTag(row, row.baseStats, row.slug).atk,
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Def,
    name: 'DEF',
    selector: (row) => calculateStatsByTag(row, row.baseStats, row.slug).def,
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Sta,
    name: 'STA',
    selector: (row) => calculateStatsByTag(row, row.baseStats, row.slug).sta,
    sortable: true,
    width: '100px',
  },
];

const columnMove: TableColumnModify<ICombat>[] = [
  {
    id: ColumnType.Type,
    name: 'ID',
    selector: (row) => row.id,
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Name,
    name: 'Move Name',
    selector: (row) => (
      <LinkToTop
        className="d-flex align-items-center"
        to={`/move/${row.id}`}
        title={`${splitAndCapitalize(row.name, '_', ' ')}`}
      >
        {splitAndCapitalize(row.name, '_', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    id: ColumnType.PowerPVE,
    name: 'Power PVE',
    selector: (row) => row.pvePower,
    sortable: true,
    width: '120px',
  },
  {
    id: ColumnType.PowerPVP,
    name: 'Power PVP',
    selector: (row) => row.pvpPower,
    sortable: true,
    width: '120px',
  },
  {
    id: ColumnType.EnergyPVE,
    name: 'Energy PVE',
    selector: (row) => `${row.pveEnergy > 0 ? '+' : ''}${row.pveEnergy}`,
    sortable: true,
    width: '120px',
  },
  {
    id: ColumnType.EnergyPVP,
    name: 'Energy PVP',
    selector: (row) => `${row.pvpEnergy > 0 ? '+' : ''}${row.pvpEnergy}`,
    sortable: true,
    width: '120px',
  },
];

interface IPokemonTypeMove {
  pokemonList: IPokemonData[];
  fastMove: ICombat[];
  chargedMove: ICombat[];
}

class PokemonTypeMove implements IPokemonTypeMove {
  pokemonList: IPokemonData[] = [];
  fastMove: ICombat[] = [];
  chargedMove: ICombat[] = [];

  static create(value: IPokemonTypeMove) {
    const obj = new PokemonTypeMove();
    Object.assign(obj, value);
    return obj;
  }
}

interface IPokemonTypeData {
  pokemon: number;
  fastMoves: number | undefined;
  chargedMoves: number | undefined;
}

class PokemonTypeData implements IPokemonTypeData {
  pokemon = 0;
  fastMoves: number | undefined;
  chargedMoves: number | undefined;

  static create(value: IPokemonTypeData) {
    const obj = new PokemonTypeData();
    Object.assign(obj, value);
    return obj;
  }
}

const SearchTypes = (props: IStyleSheetData) => {
  const icon = useSelector((state: StoreState) => state.store.icon);
  const pokemons = getDataPokemons();
  const combats = getDataCombats();

  const [releasedGO, setReleaseGO] = useState(true);

  const [currentType, setCurrentType] = useState('');
  const [result, setResult] = useState(new PokemonTypeMove());
  const [allData, setAllData] = useState<IPokemonTypeData>();

  const [showType, setShowType] = useState(false);

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'PokéGO Breeze - Type',
    description: 'Explore Pokémon type information, effectiveness, and related Pokémon and moves in Pokémon GO.',
    keywords: ['Pokémon GO', 'type effectiveness', 'type chart', 'Pokemon types', 'PokéGO Breeze'],
  });

  useTitle(titleProps);

  useEffect(() => {
    if (currentType) {
      setTitleProps({
        title: `Type - ${capitalize(currentType)}`,
        description: `Detailed information about ${capitalize(
          currentType
        )} type Pokémon, moves, strengths, and weaknesses in Pokémon GO.`,
        keywords: [
          'Pokémon GO',
          `${currentType} type`,
          `${currentType} Pokémon`,
          `${currentType} moves`,
          'PokéGO Breeze',
        ],
        image: APIService.getTypeSprite(currentType),
      });
    }
  }, [currentType]);

  useEffect(() => {
    if (isNotEmpty(combats) && isNotEmpty(pokemons)) {
      setAllData(
        PokemonTypeData.create({
          pokemon: pokemons.filter((pokemon) => (releasedGO ? pokemon.releasedGO : true)).length - 1,
          fastMoves: combats.filter((type) => type.typeMove === TypeMove.Fast).length,
          chargedMoves: combats.filter((type) => type.typeMove === TypeMove.Charge).length,
        })
      );
    }
  }, [releasedGO, combats, pokemons]);

  useEffect(() => {
    if (isNotEmpty(getTypes()) && !currentType) {
      setCurrentType(getTypes()[0]);
    }
  }, [currentType]);

  useEffect(() => {
    if (isNotEmpty(pokemons) && isNotEmpty(combats)) {
      setResult(
        PokemonTypeMove.create({
          pokemonList: pokemons
            .filter((pokemon) => (releasedGO ? pokemon.releasedGO : true))
            .filter((pokemon) => isIncludeList(pokemon.types, currentType)),
          fastMove: combats.filter((type) => type.typeMove === TypeMove.Fast && isEqual(type.type, currentType)),
          chargedMove: combats.filter((type) => type.typeMove === TypeMove.Charge && isEqual(type.type, currentType)),
        })
      );
    }
  }, [currentType, releasedGO, pokemons, combats]);

  const changeType = (value: string) => {
    setShowType(false);
    setCurrentType(value);
  };

  return (
    <div className="container mt-2">
      <div className="d-flex justify-content-end">
        <div>
          <h6 className="text-center">
            <b>Select Type</b>
          </h6>
          <div
            className="card-input mb-3"
            tabIndex={0}
            onClick={() => setShowType(true)}
            onBlur={() => setShowType(false)}
          >
            <div className="card-select">
              <CardType value={capitalize(currentType)} />
            </div>
            {showType && (
              <div className="result-type">
                <ul>
                  {getTypes()
                    .filter((value) => !isEqual(value, currentType))
                    .map((value, index) => (
                      <li className="container card-pokemon" key={index} onMouseDown={() => changeType(value)}>
                        <CardType value={capitalize(value)} />
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <FormControlLabel
        control={<Switch checked={releasedGO} onChange={(_, check) => setReleaseGO(check)} />}
        label={
          <span className="d-flex align-items-center">
            Released in GO
            <img
              className={combineClasses('mx-1', releasedGO ? '' : 'filter-gray')}
              width={28}
              height={28}
              alt="Pokémon GO Icon"
              src={APIService.getPokemonGoIcon(icon)}
            />
            <b>{`Filter from ${allData?.pokemon} Pokémon`}</b>
          </span>
        }
      />
      <div className="row">
        <div className="col-xl-4 mt-2">
          <div
            className={combineClasses(
              'd-flex flex-column align-items-center type-info-container',
              `${currentType.toLowerCase()}-border`
            )}
            style={{ background: computeBgType(currentType, PokemonType.Normal, props.styleSheet) }}
          >
            <div className="filter-shadow" style={{ width: 128 }}>
              <img
                className="sprite-type-large p-3 rounded-circle bg-black"
                alt="Pokémon GO Type Logo"
                src={APIService.getTypeHqSprite(currentType)}
              />
            </div>
            <span
              className={combineClasses(
                currentType.toLowerCase(),
                'type-select-bg d-flex align-items-center filter-shadow mt-2 w-max-content'
              )}
            >
              <div className="w-3 d-contents">
                <img
                  className="pokemon-sprite-small sprite-type-select filter-shadow"
                  alt="Pokémon GO Type Logo"
                  src={APIService.getTypeHqSprite(currentType)}
                />
              </div>
              <span className="filter-shadow">{capitalize(currentType)}</span>
            </span>
            <span className="mt-2 text-white text-shadow-black">
              <img alt="Icon Item" height={36} src={getItemSpritePath(ItemName.PokeBall)} />
              <b>{` Pokémon: ${result.pokemonList.length} (${
                isNotEmpty(result.pokemonList) &&
                toNumber(allData?.pokemon) > 0 &&
                Math.round((result.pokemonList.length * 100) / toNumber(allData?.pokemon, 1))
              }%)`}</b>
              <ul className="list-style-disc">
                <li>
                  <b>{`Legacy Type: ${result.pokemonList.filter((pokemon) => pokemon.types.length === 1).length} (${
                    isNotEmpty(result.pokemonList) &&
                    toNumber(allData?.pokemon) > 0 &&
                    Math.round(
                      (result.pokemonList.filter((pokemon) => pokemon.types.length === 1).length * 100) /
                        toNumber(allData?.pokemon, 1)
                    )
                  }%)`}</b>
                </li>
                <li>
                  <b>{`Include Type: ${result.pokemonList.filter((pokemon) => pokemon.types.length > 1).length} (${
                    isNotEmpty(result.pokemonList) &&
                    toNumber(allData?.pokemon) > 0 &&
                    Math.round(
                      (result.pokemonList.filter((pokemon) => pokemon.types.length > 1).length * 100) /
                        toNumber(allData?.pokemon, 1)
                    )
                  }%)`}</b>
                </li>
              </ul>
            </span>
            <span className="mt-2 text-white text-shadow-black">
              <img alt="Icon Item" height={36} src={APIService.getItemSprite('Item_1201')} />
              <b>{` Fast Moves: ${result.fastMove.length}/${toNumber(allData?.fastMoves)} (${Math.round(
                (result.fastMove.length * 100) / toNumber(allData?.fastMoves, 1)
              )}%)`}</b>
            </span>
            <span className="mt-2 text-white text-shadow-black">
              <img alt="Icon Item" height={36} src={APIService.getItemSprite('Item_1202')} />
              <b>{` Charged Moves: ${result.chargedMove.length}/${toNumber(allData?.chargedMoves)} (${Math.round(
                (result.chargedMove.length * 100) / toNumber(allData?.chargedMoves, 1)
              )}%)`}</b>
            </span>
          </div>
        </div>
        <div className="col-xl-8 mt-2">
          <Tabs defaultActiveKey="pokemonLegacyList" className="lg-2">
            <Tab eventKey="pokemonLegacyList" title="Pokémon Legacy Type List">
              <CustomDataTable
                customColumns={columnPokemon}
                data={result.pokemonList.filter((pokemon) => pokemon.types.length === 1)}
                pagination
                defaultSortFieldId={ColumnType.Name}
                highlightOnHover
                striped
                progressPending={!isNotEmpty(result.pokemonList)}
                progressComponent={<CircularProgressTable />}
                isShowSearch
                isAutoSearch
                inputPlaceholder="Search Pokémon Name or ID"
                searchFunction={(pokemon, searchTerm) =>
                  isInclude(
                    splitAndCapitalize(pokemon.name, '-', ' '),
                    searchTerm,
                    IncludeMode.IncludeIgnoreCaseSensitive
                  ) || isInclude(pokemon.num, searchTerm)
                }
              />
            </Tab>
            <Tab eventKey="pokemonIncludeList" title="Pokémon Include Types List">
              <CustomDataTable
                customColumns={columnPokemon}
                data={result.pokemonList.filter((pokemon) => pokemon.types.length > 1)}
                pagination
                defaultSortFieldId={ColumnType.Name}
                highlightOnHover
                striped
                progressPending={!isNotEmpty(result.pokemonList)}
                progressComponent={<CircularProgressTable />}
                isShowSearch
                isAutoSearch
                inputPlaceholder="Search Pokémon Name or ID"
                searchFunction={(pokemon, searchTerm) =>
                  isInclude(
                    splitAndCapitalize(pokemon.name, '-', ' '),
                    searchTerm,
                    IncludeMode.IncludeIgnoreCaseSensitive
                  ) || isInclude(pokemon.num, searchTerm)
                }
              />
            </Tab>
            <Tab eventKey="fastMovesList" title="Fast Move List">
              <CustomDataTable
                customColumns={columnMove}
                data={result.fastMove}
                pagination
                defaultSortFieldId={ColumnType.Name}
                highlightOnHover
                striped
                progressPending={!isNotEmpty(result.pokemonList)}
                progressComponent={<CircularProgressTable />}
                isShowSearch
                isAutoSearch
                inputPlaceholder="Search Move Name or ID"
                searchFunction={(move, searchTerm) =>
                  isInclude(
                    splitAndCapitalize(move.name, '_', ' '),
                    searchTerm,
                    IncludeMode.IncludeIgnoreCaseSensitive
                  ) || isInclude(move.id, searchTerm)
                }
              />
            </Tab>
            <Tab eventKey="chargesMovesList" title="Charged Move List">
              <CustomDataTable
                customColumns={columnMove}
                data={result.chargedMove}
                pagination
                defaultSortFieldId={ColumnType.Name}
                highlightOnHover
                striped
                progressPending={!isNotEmpty(result.pokemonList)}
                progressComponent={<CircularProgressTable />}
                isShowSearch
                isAutoSearch
                inputPlaceholder="Search Move Name or ID"
                searchFunction={(move, searchTerm) =>
                  isInclude(
                    splitAndCapitalize(move.name, '_', ' '),
                    searchTerm,
                    IncludeMode.IncludeIgnoreCaseSensitive
                  ) || isInclude(move.id, searchTerm)
                }
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SearchTypes;
