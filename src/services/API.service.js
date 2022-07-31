import axios from 'axios';

const POKE_API_URL = 'https://pokeapi.co/api/v2/';
const POGO_API_URL = 'https://pogoapi.net/api/v1/';

const POGO_PROD_ASSET_URL = 'https://storage.googleapis.com/prod-public-images/';
const POGO_PRODHOLOHOLO_ASSET_URL = 'https://prodholoholo-public-images.nianticlabs.com/';

const POGO_ASSET_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/';
const POGO_SOUND_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Sounds/';
const POKE_SPRITES_API_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

const POKE_ICON_SPRITES_API_URL = 'https://raw.githubusercontent.com/waydelyle/pokemon-assets/master/assets/img/pokemon/';
const POKE_ICON_SPRITES_TYPE_API_URL = 'https://raw.githubusercontent.com/apavlinovic/pokemon-go-imagery/master/Sprite/'
const POKE_SPRITES_FULL_API_URL = 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/';

const POKE_GIF_SPRITES_API_URL = 'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Pokemon/';
const POKE_TRAINER_SPRITES_API_URL = 'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Trainers/';
const POKE_SOUND_CRY_API_URL = 'https://raw.githubusercontent.com/Touched/pokedex-data/master/data/';
const POKE_TYPES_API_URL = 'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/Others/type-icons/png-original/';

const POKE_PV_API_URL = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/';

class APIService {

    constructor() {
        this.date = new Date();
    }

    getFetchUrl(url) {
        return axios.get(url);
    }

    getPokemonModel(item) {
        return `${POGO_ASSET_API_URL}Pokemon/${item}.png`;
    }

    getPokemonSqModel(item) {
        return `${POGO_ASSET_API_URL}Pokemon - 256x256/${item}.png`;
    }

    getTrainerModel(id) {
        id = id.toString().padStart(3, '0');
        return `${POKE_TRAINER_SPRITES_API_URL}${id}.png`;
    }

    getPokemonGoIcon(icon) {
        return `${POGO_ASSET_API_URL}App Icons/${icon}.png`;
    }

    getPokeInfo(value) {
        return axios.get(`${POKE_API_URL}pokemon/${value}`);
    }

    getPokeSpicies(value) {
        return axios.get(`${POKE_API_URL}pokemon-species/${value}`);
    }

    getPokeForm(value) {
        return axios.get(`${POKE_API_URL}pokemon-form/${value}`);
    }

    getPokeJSON(path) {
        return axios.get(`${POGO_API_URL}${path}`);
    }

    getIconSprite(icon) {
        return `${POGO_ASSET_API_URL}Menu Icons/${icon}.png`;
    }

    getItemSprite(item) {
        return `${POGO_ASSET_API_URL}Items/${item}.png`;
    }

    getRaidSprite(name) {
        return `${POGO_ASSET_API_URL}Raids/${name}.png`;
    }

    getGenderSprite(sex) {
        return `${POGO_ASSET_API_URL}Pokedex/${sex.toLowerCase()}_l.png`;
    }

    getTypeSprite(type) {
        if (type.toLowerCase() === "unknown") return this.getPokeSprite(0);
        return `${POGO_ASSET_API_URL}Types/POKEMON_TYPE_${type.toUpperCase()}.png`;
    }

    getTypeHqSprite(type) {
        if (type === "Fighting") type = "Fight";
        return `${POKE_ICON_SPRITES_TYPE_API_URL}Badge_Type_${type}_01.png`;
    }

    getWeatherSprite(weather) {
        weather = weather.replaceAll(' ', '').replaceAll('Rainy', 'Rain');
        weather = weather.charAt(0).toLowerCase() + weather.slice(1);

        const timeOfSun = this.date.getHours() > 6 && this.date.getHours() < 18 ? 'Day' : 'Night';

        return `${POGO_ASSET_API_URL}Weather/weatherIcon_large_${weather}${timeOfSun}.png`;
    }

    getWeatherIconSprite(weather) {
        weather = weather.replaceAll(' ', '').replaceAll('Rainy', 'Rain');

        if (weather === "Overcast") weather = "Cloudy"
        if (weather === "PartlyCloudy") return `${POGO_ASSET_API_URL}Weather/weatherIcon_small_${weather.toLowerCase()}_${this.date.getHours() > 6 && this.date.getHours() < 18 ? 'day' : 'night'}.png`;
        return `${POGO_ASSET_API_URL}Weather/weatherIcon_small_${weather.toLowerCase()}.png`;
    }

    getPokeSprite(id) {
        return `${POKE_SPRITES_API_URL}${id}.png`;
    }

    getPokeFullSprite(id) {
        id = id.toString().padStart(3, '0');
        return `${POKE_SPRITES_FULL_API_URL}${id}.png`;
    }

    getPokeIconSprite(name, fix) {
        if (!fix) {
            if (name.includes("necrozma-dawn")) name += "-wings"
            else if (name.includes("necrozma-dusk")) name += "-mane"
            name = name.replace("-incarnate", "")
        }
        return `${POKE_ICON_SPRITES_API_URL}${name}.png`;
    }

    getPokeGifSprite(name) {
        name = name.replace("mega-x","megax").replace("mega-y","megay");
        if (!name.includes("mega") && name.includes("-m")) name = name.replace("-m", "");
        if (name.includes("gengar")) name += "_2";
        if (!name.includes("-mega")) name = name.replace("-", "");
        return `${POKE_GIF_SPRITES_API_URL}${name}.gif`
    }

    getPokeOtherLeague(league) {
        return `${POGO_ASSET_API_URL}Combat/${league}.png`;
    }

    getPokeLeague(league) {
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

    getItemEvo(item) {
        return `${POGO_ASSET_API_URL}Items/Bag_${item}_Sprite.png`;
    }

    getItemTroy(item) {
        return item === "" ? `${POGO_ASSET_API_URL}Items/TroyKey.png` : `${POGO_ASSET_API_URL}Items/TroyKey_${item}.png`;
    }

    getSoundCryPokemon(name) {
        name = name.toLowerCase().replaceAll("_","").replaceAll("-","");
        return `${POKE_SOUND_CRY_API_URL}/${name}/cry.aif`;
    }

    getSoundPokemonGO(path) {
        return `${POGO_SOUND_API_URL}Pokemon Cries/Addressable Assets/${path}.wav`;
    }

    getSoundMove(sound) {
        return `${POGO_SOUND_API_URL}Pokemon Moves/${sound}.wav`;
    }

    getAssetPokeGo(image) {
        return image.includes("gofestCatch2022") ? `${POGO_PRODHOLOHOLO_ASSET_URL}LeagueIcons/${image}` : `${POGO_PROD_ASSET_URL}${image}`;
    }

    getSticker(sticker) {
        return `${POGO_ASSET_API_URL}Stickers/sticker_${sticker}.png`;
    }

    getStickerPokeGo(sticker) {
        return `${POGO_PRODHOLOHOLO_ASSET_URL}Stickers/${sticker}`;
    }

    getRankingFile(serie, cp, type) {
        return `${POKE_PV_API_URL}rankings/${serie}/${type.toLowerCase()}/rankings-${cp}.json`;
    }

    getTeamFile(type, serie, cp) {
        return `${POKE_PV_API_URL}training/${type}/${serie}/${cp}.json`;
    }

    getTypeIcon(type) {
        return `${POKE_TYPES_API_URL}${type.toLowerCase()}.png`
    }
}

export default (new APIService());