import { PokemonClass, PokemonType } from '../../enums/type.enum';
import APIService from '../../services/API.service';
import { FORM_NORMAL, versionList } from '../../util/constants';
import { getValueOrDefault, toNumber } from '../../util/extension';
import { convertPokemonImageName, splitAndCapitalize } from '../../util/utils';
import { IImage, ImageModel } from './asset.model';
import { IPokemonData } from './pokemon.model';
import { IStatsPokemon, IStatsPokemonGO, StatsPokemon, StatsPokemonGO } from './stats.model';

export interface IPokemonHomeModel {
  id: number;
  name: string;
  form: string | undefined;
  types: string[];
  color: string;
  sprite: string;
  baseSpecies: string | undefined;
  baseStats: IStatsPokemon;
  gen: number;
  region: string | undefined;
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
  form: string | undefined;
  types: string[];
  color: string;
  sprite: string;
  baseSpecies: string | undefined;
  baseStats = new StatsPokemon();
  gen: number;
  region: string | undefined;
  version: number;
  goStats = new StatsPokemonGO();
  pokemonClass = PokemonClass.None;
  releasedGO: boolean;
  image: IImage;
  pokemonType = PokemonType.Normal;

  constructor(item: IPokemonData, assetForm: IImage | undefined) {
    this.id = toNumber(item.num);
    this.name = item.name;
    this.form = assetForm?.default
      ? getValueOrDefault(String, item.form, FORM_NORMAL)
      : getValueOrDefault(String, item.form?.toLowerCase().replaceAll('_', '-'));
    this.types = item.types;
    this.color = item.color.toLowerCase();
    this.sprite = item.sprite.toLowerCase();
    this.baseSpecies = item.baseSpecies;
    this.baseStats = item.baseStats;
    this.gen = item.gen;
    this.region = item.region;
    this.version = versionList.indexOf(splitAndCapitalize(item.version, '-', ' ').replace(/GO$/i, 'GO'));
    this.goStats = item.statsGO ?? new StatsPokemonGO();
    this.pokemonClass = item.pokemonClass;
    this.releasedGO = item.releasedGO;
    this.image = new ImageModel({
      default: assetForm?.default
        ? APIService.getPokemonModel(assetForm.default)
        : APIService.getPokeFullSprite(item.num, convertPokemonImageName(splitAndCapitalize(item.form, '_', '-'))),
      shiny: assetForm?.shiny ? APIService.getPokemonModel(assetForm.shiny) : undefined,
      pokemonType: item.pokemonType,
    });
    this.pokemonType = item.pokemonType;
  }
}
