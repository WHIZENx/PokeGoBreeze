const configuredDataApiUrl = process.env.REACT_APP_DATA_API_URL?.trim();
const defaultDataApiUrl =
  typeof window === 'undefined' || window.location.hostname !== 'localhost'
    ? 'https://pokego-breeze-api.vercel.app'
    : '';

export class APIUrl {
  public static POKEGO_BREEZE_API_URL = (configuredDataApiUrl || defaultDataApiUrl).replace(/\/$/, '');
  public static POKE_ASSETS = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  public static POKE_OFFICIAL_ARTWORK_ASSETS = `${APIUrl.POKE_ASSETS}other/official-artwork/`;

  public static POGO_PROD_ASSET_URL = 'https://storage.googleapis.com/prod-public-images/';
  public static POGO_PRODHOLOHOLO_ASSET_URL = 'https://prodholoholo-public-images.nianticlabs.com/';

  public static POGO_ASSET_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/';
  public static POGO_SOUND_API_URL = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Sounds/';
  public static POKE_SPRITES_API_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  public static POKE_SPRITES_FULL_API_URL =
    'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/';

  public static POKE_GIF_SPRITES_API_URL = 'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Pokemon/';
  public static POKE_TRAINER_SPRITES_API_URL =
    'https://raw.githubusercontent.com/argorar/Pokemon-Assets/master/Trainers/';
  public static POKE_SOUND_CRY_API_URL = 'https://raw.githubusercontent.com/Touched/pokedex-data/master/data/';
  public static POKE_ASSETS_URL = `https://raw.githubusercontent.com/WHIZENx/pokemon-assets/master/`;
}
