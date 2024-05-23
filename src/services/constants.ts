/* eslint-disable no-unused-vars */
export class APIUrl {
  static POKE_API_URL = 'https://pokeapi.co/api/v2/';
  static POKE_ASSETS = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  static POGO_API_URL = 'https://pogoapi.net/api/v1/';

  static POGO_PROD_ASSET_URL = 'https://storage.googleapis.com/prod-public-images/';
  static POGO_PRODHOLOHOLO_ASSET_URL = 'https://prodholoholo-public-images.nianticlabs.com/';

  static POGO_ASSET_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/';
  static POGO_SOUND_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Sounds/';
  static POKE_SPRITES_API_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  static POKE_ICON_SPRITES_TYPE_API_URL = 'https://raw.githubusercontent.com/apavlinovic/pokemon-go-imagery/master/Sprite/';
  static POKE_SPRITES_FULL_API_URL = 'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/';

  static POKE_GIF_SPRITES_API_URL = 'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Pokemon/';
  static POKE_TRAINER_SPRITES_API_URL = 'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Trainers/';
  static POKE_SOUND_CRY_API_URL = 'https://raw.githubusercontent.com/Touched/pokedex-data/master/data/';
  static POKE_TYPES_API_URL = 'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/Others/type-icons/png-original/';

  static POKE_PV_API_URL = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/';
  static POKE_ASSETS_URL = `https://raw.githubusercontent.com/WHIZENx/pokemon-assets/master/`;

  // Fetch Data
  static FETCH_POKEGO_IMAGES_ICON_SHA =
    'https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/App%20Icons&page=1&per_page=1';
  static FETCH_POKEGO_IMAGES_POKEMON_SHA =
    'https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/Pokemon&page=1&per_page=1';
  static FETCH_POKEGO_IMAGES_SOUND_SHA =
    'https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Sounds/Pokemon%20Cries&page=1&per_page=1';

  static FETCH_PVP_DATA = 'https://api.github.com/repos/pvpoke/pvpoke/commits?path=src/data&page=1&per_page=1';

  static TIMESTAMP = 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/timestamp.txt';
  static GAMEMASTER = 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json';
  static CANDY_DATA = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Candy Color Data/PokemonCandyColorData.json';

  static FETCH_PVP_MOVES = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster/moves.json';
}
