import APIService from '../../services/API.service';
import { convertFormNameImg, splitAndCapitalize } from '../../util/Utils';
import { Image } from './asset.model';
import { PokemonDataModel } from './pokemon.model';

export interface PokemonHomeModel {
  id: number;
  name: string;
  forme: string | null;
  types: string[];
  color: string;
  sprite: string;
  baseSpecies: string | null;
  baseStats: {
    hp?: number;
    atk: number;
    def: number;
    sta?: number;
    spa?: number;
    spd?: number;
    spe?: number;
  };
  gen: number;
  region: string | null;
  version: number;
  goStats: {
    atk: number;
    def: number;
    sta: number;
  };
  class: string | null;
  releasedGO: boolean;
  image: {
    default: string | null;
    shiny: string | null;
  };
}

export class PokemonHomeModel {
  id!: number;
  name!: string;
  forme!: string | null;
  types!: string[];
  color!: string;
  sprite!: string;
  baseSpecies!: string | null;
  baseStats!: {
    hp?: number;
    atk: number;
    def: number;
    sta?: number;
    spa?: number;
    spd?: number;
    spe?: number;
  };
  gen!: number;
  region!: string | null;
  version!: number;
  goStats!: {
    atk: number;
    def: number;
    sta: number;
  };
  class!: string | null;
  releasedGO!: boolean;
  image!: {
    default: string | null;
    shiny: string | null;
  };

  constructor(
    item: PokemonDataModel,
    assetForm: Image | null | undefined,
    versionList: string[],
    stats: {
      hp?: number | undefined;
      atk: number;
      def: number;
      sta?: number | undefined;
      spa?: number | undefined;
      spd?: number | undefined;
      spe?: number | undefined;
    }
  ) {
    this.id = item?.num;
    this.name = item?.name;
    this.forme = assetForm?.default ? item?.forme : convertFormNameImg(item?.num ?? 0, item?.forme?.toLowerCase() ?? '');
    this.types = item?.types;
    this.color = item?.color.toLowerCase();
    this.sprite = item?.sprite.toLowerCase();
    this.baseSpecies = item?.baseSpecies;
    this.baseStats = item?.baseStats;
    this.gen = item?.gen;
    this.region = item?.region;
    this.version = versionList.indexOf(splitAndCapitalize(item?.version, '-', ' '));
    this.goStats = {
      atk: stats.atk,
      def: stats.def,
      sta: stats?.sta ?? 0,
    };
    this.class = item?.pokemonClass;
    this.releasedGO = item?.releasedGO;
    this.image = {
      default: assetForm?.default
        ? APIService.getPokemonModel(assetForm.default)
        : APIService.getPokeFullSprite(
            item?.num,
            splitAndCapitalize(convertFormNameImg(item?.num ?? 0, item?.forme?.toLowerCase() ?? ''), '-', '-')
          ),
      shiny: assetForm?.shiny ? APIService.getPokemonModel(assetForm.shiny) : null,
    };
  }
}
