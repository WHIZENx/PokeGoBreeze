import axios from 'axios';

const POKE_API_URL = 'https://pokeapi.co/api/v2/';
const POGO_API_URL = 'https://pogoapi.net/api/v1/';

const POGO_ASSET_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/';
const POKE_SPRITES_API_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

const POKE_ICON_SPRITES_API_URL = 'https://raw.githubusercontent.com/itsjavi/pokemon-assets/main/assets/img/pokemon/';
const POKE_SPRITES_FULL_API_URL = 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/';

class APIService {

    constructor() {
        this.date = new Date();
    }

    getFetchUrl(url) {
        return axios.get(url);
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

    getGenderSprite(sex) {
        return `${POGO_ASSET_API_URL}Pokedex/${sex.toLowerCase()}_l.png`;
    }

    getTypeSprite(type) {
        if (type.toLowerCase() === "unknown") return this.getPokeSprite(0);
        return `${POGO_ASSET_API_URL}Types/POKEMON_TYPE_${type.toUpperCase()}.png`;
    }

    getWeatherSprite(weather) {
        weather = weather.replaceAll(' ', '').replaceAll('Rainy', 'Rain');
        weather = weather.charAt(0).toLowerCase() + weather.slice(1);

        const timeOfSun = this.date.getHours() > 6 && this.date.getHours() < 18 ? 'Day' : 'Night';

        return `${POGO_ASSET_API_URL}Weather/weatherIcon_large_${weather}${timeOfSun}.png`;
    }

    getPokeSprite(id) {
        return `${POKE_SPRITES_API_URL}${id}.png`;
    }

    getPokeFullSprite(id) {
        let paddingID = id.toString().padStart(3, '0');
        return `${POKE_SPRITES_FULL_API_URL}${paddingID}.png`;
    }

    getPokeIconSprite(name) {
        if (name.includes("necrozma-dawn")) name += "-wings"
        else if (name.includes("necrozma-dusk")) name += "-mane"
        return `${POKE_ICON_SPRITES_API_URL}${name}.png`;
    }
}

export default (new APIService());