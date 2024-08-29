import APIService from '../../services/API.service';
import { FORM_NORMAL } from '../../util/constants';
import { convertPokemonImageName, splitAndCapitalize } from '../../util/utils';
import { IImage } from './asset.model';
import { IPokemonData } from './pokemon.model';
import { IStatsPokemon, IStatsPokemonGO, StatsPokemon, StatsPokemonGO } from './stats.model';

export interface IPokemonHomeModel {
  id: number;
  name: string;
  forme: string | null;
  types: string[];
  color: string;
  sprite: string;
  baseSpecies: string | null;
  baseStats: IStatsPokemon;
  gen: number;
  region: string | null;
  version: number;
  goStats: IStatsPokemonGO;
  class: string | null;
  releasedGO: boolean;
  image: IImage;
}

export class PokemonHomeModel implements IPokemonHomeModel {
  id: number;
  name: string;
  forme: string | null;
  types: string[];
  color: string;
  sprite: string;
  baseSpecies: string | null;
  baseStats: IStatsPokemon = new StatsPokemon();
  gen: number;
  region: string | null;
  version: number;
  goStats: IStatsPokemonGO = new StatsPokemonGO();
  class: string | null;
  releasedGO: boolean;
  image: IImage;

  constructor(item: IPokemonData, assetForm: IImage | null, versionList: string[]) {
    this.id = item.num ?? 0;
    this.name = item.name;
    this.forme = assetForm?.default
      ? item.forme !== FORM_NORMAL
        ? item.forme
        : null
      : item.forme?.toLowerCase().replaceAll('_', '-') ?? '';
    this.types = item.types;
    this.color = item.color.toLowerCase();
    this.sprite = item.sprite.toLowerCase();
    this.baseSpecies = item.baseSpecies;
    this.baseStats = item.baseStats;
    this.gen = item.gen;
    this.region = item.region;
    this.version = versionList.indexOf(splitAndCapitalize(item.version, '-', ' '));
    this.goStats = StatsPokemonGO.create({
      atk: item.baseStats.atk,
      def: item.baseStats.def,
      sta: item.baseStats.sta ?? 0,
      prod: item.baseStats.atk * item.baseStats.def * (item.baseStats.sta ?? 0),
    });
    this.class = item.pokemonClass;
    this.releasedGO = item.releasedGO;
    this.image = {
      default: assetForm?.default
        ? APIService.getPokemonModel(assetForm.default)
        : APIService.getPokeFullSprite(item.num, convertPokemonImageName(splitAndCapitalize(item.forme, '_', '-'))),
      shiny: assetForm?.shiny ? APIService.getPokemonModel(assetForm.shiny) : null,
    };
  }
}
