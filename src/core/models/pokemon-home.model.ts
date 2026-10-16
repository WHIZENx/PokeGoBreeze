import { PokemonClass, PokemonType } from '../../enums/type.enum';
import APIService from '../../services/api.service';
import { versionList } from '../../utils/constants';
import { getValueOrDefault, toNumber } from '../../utils/extension';
import { formNormal } from '../../utils/helpers/options-context.helpers';
import { buildPokedexCardImageCandidates } from '../../utils/pokedex-card-image';
import { convertPokemonImageName, splitAndCapitalize } from '../../utils/utils';
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

  constructor(item: IPokemonData & { spriteUrl?: string | null }, assetForm: IImage | undefined) {
    this.id = toNumber(item.num);
    this.name = item.name;
    this.form = assetForm?.default
      ? getValueOrDefault(String, item.form, formNormal())
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
    const pokemonGoAsset = assetForm?.default ? APIService.getPokemonModel(assetForm.default) : undefined;
    const profileImage = APIService.getPokeFullSprite(
      item.num,
      convertPokemonImageName(splitAndCapitalize(item.form, '_', '-'))
    );
    const cardImages = buildPokedexCardImageCandidates(
      pokemonGoAsset,
      profileImage,
      item.spriteUrl,
      APIService.getPokeFullAsset(item.num)
    );
    this.image = new ImageModel({
      default: cardImages[0] ?? APIService.getPokeSprite(item.num),
      fallbacks: cardImages.slice(1),
      shiny: assetForm?.shiny ? APIService.getPokemonModel(assetForm.shiny) : undefined,
      pokemonType: item.pokemonType,
    });
    this.pokemonType = item.pokemonType;
  }
}
