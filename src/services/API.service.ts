import axios, { AxiosRequestConfig, AxiosStatic, CancelTokenSource } from 'axios';
import { APIUrl } from './constants';
import { FORM_GMAX, FORM_MEGA, FORM_NORMAL, FORM_PRIMAL, FORM_STANDARD } from '../util/constants';
import { Species } from '../core/models/API/species.model';
import { isEqual, isInclude } from '../util/extension';
import { EqualMode, IncludeMode } from '../util/enums/string.enum';
import { ItemEvolutionRequireType, ItemLureRequireType } from '../core/enums/option.enum';

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

  getFetchUrl<T>(url: string, options?: AxiosRequestConfig<any> | undefined) {
    return this.axios.get<T>(url, options);
  }

  getPokeSpices(value: string, options?: AxiosRequestConfig<any> | undefined) {
    return this.getFetchUrl<Species>(this.getPokeAPI('pokemon-species', value), options);
  }

  getPokeJSON(path: string, options?: AxiosRequestConfig<any> | undefined) {
    return this.getFetchUrl(`${APIUrl.POGO_API_URL}${path}`, options);
  }

  getPokeAPI(path: string, value: string) {
    return `${APIUrl.POKE_API_URL}${path}/${value}`;
  }

  getPokemonModel(item: string | null | undefined) {
    if (!item) {
      return this.getPokeSprite(0);
    }
    if (isInclude(item, 'necrozma-dawn')) {
      item += '-wings';
    } else if (isInclude(item, 'necrozma-dusk')) {
      item += '-mane';
    }
    return `${APIUrl.POGO_ASSET_API_URL}Pokemon/${item}.png`;
  }

  getPokemonSqModel(item: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Pokemon - 256x256/${item}.png`;
  }

  getTrainerModel(id: number | string) {
    id = id.toString().padStart(3, '0');
    return `${APIUrl.POKE_TRAINER_SPRITES_API_URL}${id}.png`;
  }

  getPokemonGoIcon(icon: string | undefined) {
    return `${APIUrl.POGO_ASSET_API_URL}App Icons/${icon ?? 'Standard'}.png`;
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

  getGenderSprite(sex: string) {
    return `${APIUrl.POGO_ASSET_API_URL}Pokedex/${sex.toLowerCase()}_l.png`;
  }

  getShinyIcon() {
    return `${APIUrl.POGO_ASSET_API_URL}Pokedex/ic_shiny.png`;
  }

  getTypeSprite(type: string) {
    if (isEqual(type, 'unknown', EqualMode.IgnoreCaseSensitive)) {
      return this.getPokeSprite(0);
    }
    return `${APIUrl.POGO_ASSET_API_URL}Types/POKEMON_TYPE_${type.toUpperCase()}.png`;
  }

  getTypeHqSprite(type: string) {
    if (!type) {
      return this.getPokeSprite(0);
    }
    if (type === 'Fighting') {
      type = 'Fight';
    }
    return `${APIUrl.POKE_ICON_SPRITES_TYPE_API_URL}Badge_Type_${type}_01.png`;
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
    weather = weather?.toLowerCase().replaceAll('_', '').replaceAll('rainy', 'rain');

    if (weather === 'overcast') {
      weather = 'cloudy';
    }
    if (weather === 'partlycloudy') {
      return `${APIUrl.POGO_ASSET_API_URL}Weather/weatherIcon_small_${weather}_${
        this.date.getHours() > 6 && this.date.getHours() < 18 ? 'day' : 'night'
      }.png`;
    }
    return `${APIUrl.POGO_ASSET_API_URL}Weather/weatherIcon_small_${weather}.png`;
  }

  getPokeSprite(id: number) {
    return `${APIUrl.POKE_SPRITES_API_URL}${id}.png`;
  }

  getPokeFullAsset(id: number | string) {
    return `${APIUrl.POKE_ASSETS}${id}.png`;
  }

  getPokeFullSprite(id: number | string | undefined, form?: string) {
    if (id) {
      return `${APIUrl.POKE_SPRITES_FULL_API_URL}${id.toString().padStart(3, '0')}${form ? `-${form}` : ''}.png`;
    }
    return this.getPokeFullAsset(0);
  }

  getPokeIconSprite(name: string, noFix = false) {
    if (!noFix) {
      if (isInclude(name, 'necrozma-dawn')) {
        name += '-wings';
      } else if (isInclude(name, 'necrozma-dusk')) {
        name += '-mane';
      } else if (isInclude(name, 'alcremie') && !isInclude(name, FORM_GMAX, IncludeMode.IncludeIgnoreCaseSensitive)) {
        if (isInclude(name, '-vanilla-cream')) {
          name = 'alcremie';
        } else {
          name = 'unknown-pokemon';
        }
      } else if (isInclude(name, '-antique')) {
        name = 'unknown-pokemon';
      }
      name = name
        .replace('-incarnate', '')
        .replace(`-${FORM_NORMAL.toLowerCase()}`, '')
        .replace('-plant', '')
        .replace('-overcast', '')
        .replace('-west', '')
        .replace('-altered', '')
        .replace('-land', '')
        .replace('-red-striped', '')
        .replace(`-${FORM_STANDARD.toLowerCase()}`, '')
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
    return `${APIUrl.POKE_ASSETS_URL}/icon/${name}.png`;
  }

  getPokeGifSprite(name: string) {
    name = name
      .replace(`${FORM_MEGA}-X`.toLowerCase(), `${FORM_MEGA}X`.toLowerCase())
      .replace(`${FORM_MEGA}-Y`.toLowerCase(), `${FORM_MEGA}Y`.toLowerCase());
    if (!isInclude(name, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) && isInclude(name, '-m')) {
      name = name.replace('-m', '');
    }
    if (isInclude(name, 'gengar')) {
      name += '_2';
    }
    if (!isInclude(name, `-${FORM_MEGA}`.toLowerCase()) && !isInclude(name, `-${FORM_PRIMAL}`.toLowerCase())) {
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
      return this.getPokeSprite(0);
    }
    return `${APIUrl.POGO_ASSET_API_URL}Items/Bag_${item}_Sprite.png`;
  }

  getItemTroy(item?: ItemLureRequireType) {
    return !item ? `${APIUrl.POGO_ASSET_API_URL}Items/TroyKey.png` : `${APIUrl.POGO_ASSET_API_URL}Items/TroyKey_${item}.png`;
  }

  getSoundCryPokemon(name: string) {
    name = name.toLowerCase().replaceAll('_', '').replaceAll('-', '');
    return `${APIUrl.POKE_SOUND_CRY_API_URL}/${name}/cry.aif`;
  }

  getSoundPokemonGO(path: string) {
    return `${APIUrl.POGO_SOUND_API_URL}Pokemon Cries/${path}.wav`;
  }

  getSoundMove(sound: string) {
    return `${APIUrl.POGO_SOUND_API_URL}Pokemon Moves/${sound}.wav`;
  }

  getAssetPokeGo(image: string) {
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

  getRankingFile(serie: string, cp: number, type: string) {
    return `${APIUrl.POKE_PV_API_URL}rankings/${serie}/${type.toLowerCase()}/rankings-${cp}.json`;
  }

  getTeamFile(type: string, serie: string, cp: number) {
    return `${APIUrl.POKE_PV_API_URL}training/${type}/${serie}/${cp}.json`;
  }

  getTypeIcon(type: string) {
    return `${APIUrl.POKE_TYPES_API_URL}${type.toLowerCase()}.png`;
  }

  getPokemonAsset(type: string, gen: number | string, name: string | undefined, file: string) {
    return `${APIUrl.POKE_ASSETS_URL}${type}/${gen}/${name}.${file}`;
  }
}

export default new APIService();
