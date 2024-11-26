import { PokemonClass, PokemonType } from '../../enums/type.enum';
import APIService from '../../services/API.service';
import { FORM_NORMAL, versionList } from '../../util/constants';
import { getValueOrDefault, toNumber } from '../../util/extension';
import { convertPokemonImageName, splitAndCapitalize } from '../../util/utils';
import { IImage } from './asset.model';
import { IPokemonData } from './pokemon.model';
import { IStatsPokemon, IStatsPokemonGO, StatsPokemon, StatsPokemonGO } from './stats.model';

export interface IPokemonHomeModel {
  id: number;
  name: string;
  forme: string | undefined;
  types: string[];
  color: string;
  sprite: string;
  baseSpecies: string | null;
  baseStats: IStatsPokemon;
  gen: number;
  region: string | null;
  version: number;
  goStats: IStatsPokemonGO;
  pokemonClass: PokemonClass;
  releasedGO: boolean;
  image: IImage;
  pokemonType: PokemonType;
}

export class PokemonHomeModel implements IPokemonHomeModel {
  id: number;
  name: string;
  forme: string | undefined;
  types: string[];
  color: string;
  sprite: string;
  baseSpecies: string | null;
  baseStats = new StatsPokemon();
  gen: number;
  region: string | null;
  version: number;
  goStats = new StatsPokemonGO();
  pokemonClass = PokemonClass.None;
  releasedGO: boolean;
  image: IImage;
  pokemonType = PokemonType.Normal;

  constructor(item: IPokemonData, assetForm: IImage | undefined | null) {
    this.id = toNumber(item.num);
    this.name = item.name;
    this.forme = assetForm?.default
      ? getValueOrDefault(String, item.forme, FORM_NORMAL)
      : getValueOrDefault(String, item.forme?.toLowerCase().replaceAll('_', '-'));
    this.types = item.types;
    this.color = item.color.toLowerCase();
    this.sprite = item.sprite.toLowerCase();
    this.baseSpecies = item.baseSpecies;
    this.baseStats = item.baseStats;
    this.gen = item.gen;
    this.region = item.region;
    this.version = versionList.indexOf(splitAndCapitalize(item.version, '-', ' ').replace(/GO$/i, 'GO'));
    const sta = toNumber(item.baseStats.sta);
    this.goStats = StatsPokemonGO.create({
      atk: item.baseStats.atk,
      def: item.baseStats.def,
      sta,
      prod: item.baseStats.atk * item.baseStats.def * sta,
    });
    this.pokemonClass = item.pokemonClass;
    this.releasedGO = item.releasedGO;
    this.image = {
      default: assetForm?.default
        ? APIService.getPokemonModel(assetForm.default)
        : APIService.getPokeFullSprite(item.num, convertPokemonImageName(splitAndCapitalize(item.forme, '_', '-'))),
      shiny: assetForm?.shiny ? APIService.getPokemonModel(assetForm.shiny) : undefined,
      pokemonType: item.pokemonType,
    };
    this.pokemonType = item.pokemonType;
  }
}
