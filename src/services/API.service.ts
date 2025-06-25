import axios, { AxiosRequestConfig, AxiosStatic, CancelTokenSource } from 'axios';
import { APIUrl } from './constants';
import { Species } from '../core/models/API/species.model';
import { getValueOrDefault, isEqual, isInclude } from '../utils/extension';
import { EqualMode, IncludeMode } from '../utils/enums/string.enum';
import { ItemEvolutionRequireType, ItemLureRequireType } from '../core/enums/option.enum';
import { capitalize, getDataWithKey, getKeyWithData, splitAndCapitalize } from '../utils/utils';
import { PokemonTypeBadge } from '../core/models/type.model';
import { ScoreType } from '../utils/enums/constants.enum';
import {
  defaultSpriteName,
  formGalar,
  formGalarian,
  formGmax,
  formHisui,
  formHisuian,
  formMega,
  formNormal,
  formPrimal,
  formStandard,
  pathAssetPokeGo,
} from '../utils/helpers/context.helpers';

class APIService {
  date: Date;
  axios: AxiosStatic;
  cancelToken: CancelTokenSource;

  constructor() {
    this.date = new Date();
    this.axios = axios;
    this.cancelToken = axios.CancelToken.source();
    // this.axios.defaults.timeout = 10000;
  }

  getCancelToken() {
    return this.cancelToken;
  }

  reNewCancelToken() {
    return this.axios.CancelToken.source();
  }

  cancel(cancelToken?: CancelTokenSource) {
    if (cancelToken) {
      return cancelToken.cancel();
    }
    return this.cancelToken.cancel();
  }

  isCancel(throwErr: any) {
    return this.axios.isCancel(throwErr);
  }

  getAxios() {
    return this.axios;
  }

  getFetchUrl<T>(url: string | null | undefined, options?: AxiosRequestConfig<any> | undefined) {
    return this.axios.get<T>(getValueOrDefault(String, url), options);
  }

  getPokeSpices(value: number, options?: AxiosRequestConfig<any> | undefined) {
    return this.getFetchUrl<Species>(this.getPokeAPI('pokemon-species', value), options);
  }

  getPokeJSON(path: string, options?: AxiosRequestConfig<any> | undefined) {
    return this.getFetchUrl(`${APIUrl.POGO_API_URL}${path}`, options);
  }

  getPokeAPI(path: string, value: number) {
    return `${APIUrl.POKE_API_URL}${path}/${value}`;
  }

  setPokemonModel(item: string) {
    if (isInclude(item, 'necrozma-dawn')) {
      item += '-wings';
    } else if (isInclude(item, 'necrozma-dusk')) {
      item += '-mane';
    }
    if (isEqual(item[0], '/')) {
      item = `${pathAssetPokeGo()}${item}`;
    }
    return item;
  }

  getPokemonModel(item: string | null | undefined, id?: number) {
    if (!item) {
      return this.getPokeSprite(id);
    }
    item = this.setPokemonModel(item);
    return `${APIUrl.POGO_ASSET_API_URL}Pokemon/${item}.png`;
  }

  getPokemonSqModel(item: string | null | undefined, id?: number) {
    if (!item) {
      return this.getPokeSprite(id);
    }
    if (!isEqual(item[0], '/')) {
      item = `/${item}`;
    }
    item = this.setPokemonModel(item);
    return `${APIUrl.POGO_ASSET_API_URL}Pokemon - 256x256/${item}.png`;
  }

  getTrainerModel(id: number | string) {
    id = id.toString().padStart(3, '0');
    return `${APIUrl.POKE_TRAINER_SPRITES_API_URL}${id}.png`;
  }

  getPokemonGoIcon(icon: string | undefined) {
    return `${APIUrl.POGO_ASSET_API_URL}App Icons/${getValueOrDefault(String, icon, 'Standard')}.png`;
  }

  getBadgeSprite(name: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Badges/${name}.png`;
  }

  getIconSprite(icon: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Menu Icons/${icon}.png`;
  }

  getIconMegaPrimalSprite(icon: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Megas and Primals/${icon}.png`;
  }

  getItemSprite(item: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Items/${item}.png`;
  }

  getRaidSprite(name: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Raids/${name}.png`;
  }

  getGenderSprite(sex: string | undefined) {
    return `${APIUrl.POGO_ASSET_API_URL}Pokedex/${sex?.toLowerCase()}_l.png`;
  }

  getShinyIcon() {
    return `${APIUrl.POGO_ASSET_API_URL}Pokedex/ic_shiny.png`;
  }

  getTypeSprite(type: string | undefined) {
    if (!type || isEqual(type, 'unknown', EqualMode.IgnoreCaseSensitive)) {
      return this.getPokeSprite();
    }
    return `${APIUrl.POGO_ASSET_API_URL}Types/POKEMON_TYPE_${type.toUpperCase()}.png`;
  }

  getTypeHqSprite(type: string | undefined) {
    if (!type) {
      return this.getPokeSprite();
    }
    type = capitalize(type);
    let encryptUrl = '';
    switch (getDataWithKey<PokemonTypeBadge>(PokemonTypeBadge, type, EqualMode.IgnoreCaseSensitive)) {
      case PokemonTypeBadge.Bug:
        encryptUrl = '7/7d';
        break;
      case PokemonTypeBadge.Dark:
        encryptUrl = '0/0e';
        break;
      case PokemonTypeBadge.Dragon:
        encryptUrl = 'c/c7';
        break;
      case PokemonTypeBadge.Electric:
        encryptUrl = '2/2f';
        break;
      case PokemonTypeBadge.Fairy:
        encryptUrl = '4/43';
        break;
      case PokemonTypeBadge.Fighting:
      case PokemonTypeBadge.Fire:
        encryptUrl = '3/30';
        break;
      case PokemonTypeBadge.Flying:
        encryptUrl = '7/7f';
        break;
      case PokemonTypeBadge.Ghost:
        encryptUrl = 'a/ab';
        break;
      case PokemonTypeBadge.Grass:
        encryptUrl = 'c/c5';
        break;
      case PokemonTypeBadge.Ground:
        encryptUrl = '8/8f';
        break;
      case PokemonTypeBadge.Ice:
        encryptUrl = '7/77';
        break;
      case PokemonTypeBadge.Normal:
        encryptUrl = 'f/fb';
        break;
      case PokemonTypeBadge.Poison:
        encryptUrl = '0/05';
        break;
      case PokemonTypeBadge.Psychic:
        encryptUrl = '2/21';
        break;
      case PokemonTypeBadge.Rock:
        encryptUrl = '0/0b';
        break;
      case PokemonTypeBadge.Steel:
        encryptUrl = 'c/c9';
        break;
      case PokemonTypeBadge.Water:
        encryptUrl = '9/9d';
        break;
    }
    return `${APIUrl.POKE_ICON_SPRITES_TYPE_API_URL}${encryptUrl}/${type}.png`;
  }

  getWeatherSprite(weather: string) {
    weather = weather
      .toLowerCase()
      .replaceAll(' ', '')
      .replaceAll('_', '')
      .replaceAll('rainy', 'rain')
      .replace('partlycloudy', 'partlyCloudy');
    const timeOfSun = this.date.getHours() > 6 && this.date.getHours() < 18 ? 'Day' : 'Night';
    return `${APIUrl.POGO_ASSET_API_URL}Weather/weatherIcon_large_${weather}${timeOfSun}.png`;
  }

  getWeatherIconSprite(weather: string | undefined) {
    if (!weather) {
      return this.getPokeSprite();
    }
    weather = weather.toLowerCase().replaceAll('_', '').replaceAll('rainy', 'rain');

    if (isEqual(weather, 'overcast', EqualMode.IgnoreCaseSensitive)) {
      weather = 'cloudy';
    }
    if (isEqual(weather, 'partlycloudy', EqualMode.IgnoreCaseSensitive)) {
      return `${APIUrl.POGO_ASSET_API_URL}Weather/weatherIcon_small_${weather}_${
        this.date.getHours() > 6 && this.date.getHours() < 18 ? 'day' : 'night'
      }.png`;
    }
    return `${APIUrl.POGO_ASSET_API_URL}Weather/weatherIcon_small_${weather}.png`;
  }

  getPokeSprite(id = 0) {
    return `${APIUrl.POKE_SPRITES_API_URL}${id}.png`;
  }

  getPokeFullAsset(id = 0) {
    return `${APIUrl.POKE_ASSETS}${id}.png`;
  }

  getPokeFullSprite(id?: number | string, form?: string) {
    if (id) {
      if (form) {
        form = splitAndCapitalize(
          form.toUpperCase().replace(formGalarian(), formGalar()).replace(formHisuian(), formHisui()),
          '-',
          '-'
        );
      }
      return `${APIUrl.POKE_SPRITES_FULL_API_URL}${id.toString().padStart(3, '0')}${
        form && id !== 201 ? `-${form}` : ''
      }.png`;
    }
    return this.getPokeFullAsset();
  }

  getPokeIconSprite(name?: string | null, isFix = true) {
    if (name && isFix) {
      if (isInclude(name, 'necrozma-dawn')) {
        name += '-wings';
      } else if (isInclude(name, 'necrozma-dusk')) {
        name += '-mane';
      } else if (isInclude(name, 'alcremie') && !isInclude(name, formGmax(), IncludeMode.IncludeIgnoreCaseSensitive)) {
        if (isInclude(name, '-vanilla-cream')) {
          name = 'alcremie';
        } else {
          name = defaultSpriteName();
        }
      } else if (isInclude(name, '-antique')) {
        name = defaultSpriteName();
      }
      name = getValueOrDefault(String, name)
        .replace('-incarnate', '')
        .replace(`-${formNormal().toLowerCase()}`, '')
        .replace('-plant', '')
        .replace('-overcast', '')
        .replace('-west', '')
        .replace('-altered', '')
        .replace('-land', '')
        .replace('-red-striped', '')
        .replace(`-${formStandard().toLowerCase()}`, '')
        .replace('-ordinary', '')
        .replace('-aria', '')
        .replace('-spring', '')
        .replace('-red', '')
        .replace('meowstic-male', 'meowstic')
        .replace('meowstic-female', 'meowstic-f')
        .replace('aegislash-shield', 'aegislash')
        .replace('unown-a', 'unown')
        .replace('-average', '')
        .replace('-50', '')
        .replace('-baile', '')
        .replace('-midday', '')
        .replace('-solo', '')
        .replace('-disguised', '')
        .replace('-amped', '')
        .replace('eiscue-ice', 'eiscue')
        .replace('indeedee-male', 'indeedee')
        .replace('indeedee-female', 'indeedee-f')
        .replace('-full-belly', '')
        .replace('-single-strike', '')
        .replace('-natural', '')
        .replaceAll('-phony', '')
        .replace('-matcha-cream', '')
        .replace('-neutral', '');
    }
    if (!name) {
      name = defaultSpriteName();
    }
    return `${APIUrl.POKE_ASSETS_URL}/icon/${name}.png`;
  }

  getPokeGifSprite(name: string) {
    name = name
      .replace(`${formMega()}-X`.toLowerCase(), `${formMega()}X`.toLowerCase())
      .replace(`${formMega()}-Y`.toLowerCase(), `${formMega()}Y`.toLowerCase());
    if (!isInclude(name, formMega(), IncludeMode.IncludeIgnoreCaseSensitive) && isInclude(name, '-m')) {
      name = name.replace('-m', '');
    }
    if (isInclude(name, 'gengar')) {
      name += '_2';
    }
    if (!isInclude(name, `-${formMega()}`.toLowerCase()) && !isInclude(name, `-${formPrimal()}`.toLowerCase())) {
      name = name.replaceAll('-', '');
    }
    return `${APIUrl.POKE_GIF_SPRITES_API_URL}${name}.gif`;
  }

  getPokeOtherLeague(league: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Combat/${league}.png`;
  }

  getPokeLeague(league: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Combat/pogo_${league}.png`;
  }

  getPokeShadow() {
    return `${APIUrl.POGO_ASSET_API_URL}Rocket/ic_shadow.png`;
  }

  getPokePurified() {
    return `${APIUrl.POGO_ASSET_API_URL}Rocket/ic_purified.png`;
  }

  getPokeLucky() {
    return `${APIUrl.POGO_ASSET_API_URL}Friends/ui_bg_lucky_pokemon.png`;
  }

  getPokeBuddy() {
    return `${APIUrl.POGO_ASSET_API_URL}Buddy/pokemonBuddyCrownSml.png`;
  }

  getItemEvo(item: ItemEvolutionRequireType) {
    if (item === ItemEvolutionRequireType.Beans) {
      return this.getPokeSprite();
    }
    return `${APIUrl.POGO_ASSET_API_URL}Items/Bag_${item}_Sprite.png`;
  }

  getItemTroy(item?: ItemLureRequireType) {
    const troy = `TroyKey${item ? `_${item}` : ''}`;
    return `${APIUrl.POGO_ASSET_API_URL}Items/${troy}.png`;
  }

  getSoundCryPokemon(name: string) {
    name = name.toLowerCase().replaceAll('_', '').replaceAll('-', '');
    return `${APIUrl.POKE_SOUND_CRY_API_URL}/${name}/cry.aif`;
  }

  getSoundPokemonGO(path: string) {
    if (isEqual(path[0], '/')) {
      path = `${pathAssetPokeGo()}${path}`;
    }
    return `${APIUrl.POGO_SOUND_API_URL}Pokemon Cries/${path}.wav`;
  }

  getSoundMove(sound: string | undefined) {
    return `${APIUrl.POGO_SOUND_API_URL}Pokemon Moves/${getValueOrDefault(String, sound)}.wav`;
  }

  getAssetPokeGo(image?: string) {
    return isInclude(image, 'gofestCatch2022')
      ? `${APIUrl.POGO_PRODHOLOHOLO_ASSET_URL}LeagueIcons/${image}`
      : `${APIUrl.POGO_PROD_ASSET_URL}${image}`;
  }

  getSticker(sticker: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Stickers/sticker_${sticker}.png`;
  }

  getStickerPokeGo(sticker: string) {
    return `${APIUrl.POGO_PRODHOLOHOLO_ASSET_URL}Stickers/${sticker}`;
  }

  getRankingFile(serie: string | undefined, cp: number, type: string | undefined) {
    return `${APIUrl.POKE_PV_API_URL}rankings/${getValueOrDefault(String, serie)}/${getValueOrDefault(
      String,
      type,
      getKeyWithData(ScoreType, ScoreType.Overall)
    ).toLowerCase()}/rankings-${cp}.json`;
  }

  getTeamFile(type: string, serie: string | undefined, cp: number) {
    return `${APIUrl.POKE_PV_API_URL}training/${type}/${getValueOrDefault(String, serie)}/${cp}.json`;
  }

  getTypeIcon(type: string | null | undefined) {
    return `${APIUrl.POKE_TYPES_API_URL}${getValueOrDefault(String, type).toLowerCase()}.png`;
  }

  getPokemonAsset(type: string, gen: number | string, name: string | undefined, file: string) {
    return `${APIUrl.POKE_ASSETS_URL}${type}/${gen}/${name}.${file}`;
  }
}

export default new APIService();
