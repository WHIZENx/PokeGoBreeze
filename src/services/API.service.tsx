import axios from 'axios';

const POKE_API_URL = 'https://pokeapi.co/api/v2/';
const POGO_API_URL = 'https://pogoapi.net/api/v1/';

const POGO_PROD_ASSET_URL = 'https://storage.googleapis.com/prod-public-images/';
const POGO_PRODHOLOHOLO_ASSET_URL = 'https://prodholoholo-public-images.nianticlabs.com/';

const POGO_ASSET_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/';
const POGO_SOUND_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Sounds/';
const POKE_SPRITES_API_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

const POKE_ICON_SPRITES_TYPE_API_URL = 'https://raw.githubusercontent.com/apavlinovic/pokemon-go-imagery/master/Sprite/';
const POKE_SPRITES_FULL_API_URL = 'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/';

const POKE_GIF_SPRITES_API_URL = 'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Pokemon/';
const POKE_TRAINER_SPRITES_API_URL = 'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Trainers/';
const POKE_SOUND_CRY_API_URL = 'https://raw.githubusercontent.com/Touched/pokedex-data/master/data/';
const POKE_TYPES_API_URL = 'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/Others/type-icons/png-original/';

const POKE_PV_API_URL = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/';
const POKE_ASSETS_URL = `https://raw.githubusercontent.com/WHIZENx/pokemon-assets/master/`;

class APIService {
  date: Date;
  axios: any;

  constructor() {
    this.date = new Date();
    this.axios = axios;
  }

  getAxios() {
    return this.axios;
  }

  getFetchUrl(url: string, options: any = null) {
    return this.axios.get(url, options);
  }

  getPokeInfo(value: number, options: any = null) {
    return this.axios.get(this.getPokeAPI('pokemon', value), options);
  }

  getPokeSpices(value: number, options: any = null) {
    return this.axios.get(this.getPokeAPI('pokemon-species', value), options);
  }

  getPokeForm(value: number, options: any = null) {
    return this.axios.get(this.getPokeAPI('pokemon-form', value), options);
  }

  getPokeJSON(path: string, options: any = null) {
    return this.axios.get(`${POGO_API_URL}${path}`, options);
  }

  getPokeAPI(path: string, value: number) {
    return `${POKE_API_URL}${path}/${value}`;
  }

  getPokemonModel(item: string) {
    return `${POGO_ASSET_API_URL}Pokemon/${item}.png`;
  }

  getPokemonSqModel(item: string) {
    return `${POGO_ASSET_API_URL}Pokemon - 256x256/${item}.png`;
  }

  getTrainerModel(id: any) {
    id = id.toString().padStart(3, '0');
    return `${POKE_TRAINER_SPRITES_API_URL}${id}.png`;
  }

  getPokemonGoIcon(icon: string) {
    return `${POGO_ASSET_API_URL}App Icons/${icon}.png`;
  }

  getBadgeSprite(name: string) {
    return `${POGO_ASSET_API_URL}Badges/${name}.png`;
  }

  getIconSprite(icon: string) {
    return `${POGO_ASSET_API_URL}Menu Icons/${icon}.png`;
  }

  getIconMegaPrimalSprite(icon: string) {
    return `${POGO_ASSET_API_URL}Megas and Primals/${icon}.png`;
  }

  getItemSprite(item: string) {
    return `${POGO_ASSET_API_URL}Items/${item}.png`;
  }

  getRaidSprite(name: string) {
    return `${POGO_ASSET_API_URL}Raids/${name}.png`;
  }

  getGenderSprite(sex: string) {
    return `${POGO_ASSET_API_URL}Pokedex/${sex.toLowerCase()}_l.png`;
  }

  getShinyIcon() {
    return `${POGO_ASSET_API_URL}Pokedex/ic_shiny.png`;
  }

  getTypeSprite(type: string) {
    if (type.toLowerCase() === 'unknown') {
      return this.getPokeSprite(0);
    }
    return `${POGO_ASSET_API_URL}Types/POKEMON_TYPE_${type.toUpperCase()}.png`;
  }

  getTypeHqSprite(type: string) {
    if (type === 'Fighting') {
      type = 'Fight';
    }
    return `${POKE_ICON_SPRITES_TYPE_API_URL}Badge_Type_${type}_01.png`;
  }

  getWeatherSprite(weather: string) {
    weather = weather.toLowerCase().replaceAll('_', '').replaceAll('rainy', 'rain').replace('partlycloudy', 'partlyCloudy');
    const timeOfSun = this.date.getHours() > 6 && this.date.getHours() < 18 ? 'Day' : 'Night';
    return `${POGO_ASSET_API_URL}Weather/weatherIcon_large_${weather}${timeOfSun}.png`;
  }

  getWeatherIconSprite(weather: any) {
    weather = weather.toLowerCase().replaceAll('_', '').replaceAll('rainy', 'rain');

    if (weather === 'overcast') {
      weather = 'cloudy';
    }
    if (weather === 'partlycloudy') {
      return `${POGO_ASSET_API_URL}Weather/weatherIcon_small_${weather}_${
        this.date.getHours() > 6 && this.date.getHours() < 18 ? 'day' : 'night'
      }.png`;
    }
    return `${POGO_ASSET_API_URL}Weather/weatherIcon_small_${weather}.png`;
  }

  getPokeSprite(id: number) {
    return `${POKE_SPRITES_API_URL}${id}.png`;
  }

  getPokeFullSprite(id: any, form?: string) {
    id = id.toString().padStart(3, '0');
    return `${POKE_SPRITES_FULL_API_URL}${id}${form ? `-${form}` : ''}.png`;
  }

  getPokeIconSprite(name: string, noFix = false) {
    if (!noFix) {
      if (name.includes('necrozma-dawn')) {
        name += '-wings';
      } else if (name.includes('necrozma-dusk')) {
        name += '-mane';
      }
      name = name
        .replace('-incarnate', '')
        .replace('-normal', '')
        .replace('-plant', '')
        .replace('-altered', '')
        .replace('-land', '')
        .replace('-red-striped', '')
        .replace('-standard', '')
        .replace('-ordinary', '')
        .replace('-aria', '')
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
        .replace('-single-strike', '');
    }
    return `${POKE_ASSETS_URL}/icon/${name}.png`;
  }

  getPokeGifSprite(name: string) {
    name = name.replace('mega-x', 'megax').replace('mega-y', 'megay');
    if (!name.includes('mega') && name.includes('-m')) {
      name = name.replace('-m', '');
    }
    if (name.includes('gengar')) {
      name += '_2';
    }
    if (!name.includes('-mega') && !name.includes('-primal')) {
      name = name.replace('-', '');
    }
    return `${POKE_GIF_SPRITES_API_URL}${name}.gif`;
  }

  getPokeOtherLeague(league: string) {
    return `${POGO_ASSET_API_URL}Combat/${league}.png`;
  }

  getPokeLeague(league: string) {
    return `${POGO_ASSET_API_URL}Combat/pogo_${league}.png`;
  }

  getPokeShadow() {
    return `${POGO_ASSET_API_URL}Rocket/ic_shadow.png`;
  }

  getPokePurified() {
    return `${POGO_ASSET_API_URL}Rocket/ic_purified.png`;
  }

  getPokeLucky() {
    return `${POGO_ASSET_API_URL}Friends/ui_bg_lucky_pokemon.png`;
  }

  getPokeBuddy() {
    return `${POGO_ASSET_API_URL}Buddy/pokemonBuddyCrownSml.png`;
  }

  getItemEvo(item: string) {
    return `${POGO_ASSET_API_URL}Items/Bag_${item}_Sprite.png`;
  }

  getItemTroy(item: string) {
    return item === '' ? `${POGO_ASSET_API_URL}Items/TroyKey.png` : `${POGO_ASSET_API_URL}Items/TroyKey_${item}.png`;
  }

  getSoundCryPokemon(name: string) {
    name = name.toLowerCase().replaceAll('_', '').replaceAll('-', '');
    return `${POKE_SOUND_CRY_API_URL}/${name}/cry.aif`;
  }

  getSoundPokemonGO(path: string) {
    return `${POGO_SOUND_API_URL}Pokemon Cries/${path}.wav`;
  }

  getSoundMove(sound: string) {
    return `${POGO_SOUND_API_URL}Pokemon Moves/${sound}.wav`;
  }

  getAssetPokeGo(image: string | string[]) {
    return image.includes('gofestCatch2022') ? `${POGO_PRODHOLOHOLO_ASSET_URL}LeagueIcons/${image}` : `${POGO_PROD_ASSET_URL}${image}`;
  }

  getSticker(sticker: string) {
    return `${POGO_ASSET_API_URL}Stickers/sticker_${sticker}.png`;
  }

  getStickerPokeGo(sticker: string) {
    return `${POGO_PRODHOLOHOLO_ASSET_URL}Stickers/${sticker}`;
  }

  getRankingFile(serie: string, cp: number, type: string) {
    return `${POKE_PV_API_URL}rankings/${serie}/${type.toLowerCase()}/rankings-${cp}.json`;
  }

  getTeamFile(type: string, serie: string, cp: number) {
    return `${POKE_PV_API_URL}training/${type}/${serie}/${cp}.json`;
  }

  getTypeIcon(type: string) {
    return `${POKE_TYPES_API_URL}${type.toLowerCase()}.png`;
  }

  getPokemonAsset(type: string, gen: number | string, name: string, file: string) {
    return `${POKE_ASSETS_URL}${type}/${gen}/${name}.${file}`;
  }
}

export default new APIService();
