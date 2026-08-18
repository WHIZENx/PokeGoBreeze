export class APIUrl {
  public static POKEGO_BREEZE_API_URL = (process.env.REACT_APP_DATA_API_URL ?? '').replace(/\/$/, '');
  public static POKE_API_URL = 'https://pokeapi.co/api/v2/';
  public static POKE_ASSETS = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  public static POGO_API_URL = 'https://pogoapi.net/api/v1/';

  public static POGO_PROD_ASSET_URL = 'https://storage.googleapis.com/prod-public-images/';
  public static POGO_PRODHOLOHOLO_ASSET_URL = 'https://prodholoholo-public-images.nianticlabs.com/';

  public static POGO_ASSET_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/';
  public static POGO_SOUND_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Sounds/';
  public static POKE_SPRITES_API_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  public static POKE_ICON_SPRITES_TYPE_API_URL = 'https://static.wikia.nocookie.net/pokemongo/images/';
  public static POKE_SPRITES_FULL_API_URL =
    'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/';

  public static POKE_GIF_SPRITES_API_URL = 'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Pokemon/';
  public static POKE_TRAINER_SPRITES_API_URL =
    'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Trainers/';
  public static POKE_SOUND_CRY_API_URL = 'https://raw.githubusercontent.com/Touched/pokedex-data/master/data/';
  public static POKE_TYPES_API_URL =
    'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/Others/type-icons/png-original/';

  public static POKE_ASSETS_URL = `https://raw.githubusercontent.com/WHIZENx/pokemon-assets/master/`;

  public static TEXTFILE = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Texts/Latest%20APK/JSON/';
  public static CANDY_DATA =
    'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Candy%20Color%20Data/PokemonCandyColorData.json';
}
