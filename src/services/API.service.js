import axios from 'axios';

const POKE_API_URL = 'https://pokeapi.co/api/v2/';
const POGO_API_URL = 'https://pogoapi.net/api/v1/';

const POGO_ASSET_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/'
const POKE_SPRITES_API_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'

class APIService {

    constructor() {}

    getPokeInfo(value) {
        return axios.get(`${POKE_API_URL}pokemon/${value}`);
    }

    getPokeJSON(path) {
        return axios.get(`${POGO_API_URL}${path}`);
    }

    getGenderSprite(sex) {
        return `${POGO_ASSET_API_URL}Pokedex/${sex.toLowerCase()}_l.png`;
    }

    getTypeSprite(type) {
        return `${POGO_ASSET_API_URL}Types/POKEMON_TYPE_${type.toUpperCase()}.png`;
    }

    getPokeSprite(id) {
        return `${POKE_SPRITES_API_URL}${id}.png`;
    }
}

export default (new APIService());