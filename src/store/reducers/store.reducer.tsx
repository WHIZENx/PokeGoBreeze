import { optionPokemonName } from '../../core/options';
import { convertPVPRankings, convertPVPTrain } from '../../core/pvp';
import { mappingReleasedGO } from '../../util/Utils';
import {
  LOAD_ASSETS,
  LOAD_CANDY,
  LOAD_COMBAT,
  LOAD_CPM,
  LOAD_DETAILS,
  LOAD_EVOLUTION,
  LOAD_LEAGUES,
  LOAD_LOGO_POKEGO,
  LOAD_OPTIONS,
  LOAD_POKEMON,
  LOAD_POKEMON_COMBAT,
  LOAD_POKEMON_DATA,
  LOAD_POKEMON_NAME,
  LOAD_PVP,
  LOAD_RELEASED_GO,
  LOAD_STICKER,
  LOAD_STORE,
  LOAD_TIMESTAMP,
  LOAD_TYPE_EFF,
  LOAD_WEATHER_BOOST,
  RESET_STORE,
} from '../actions/store.action';
import { StoreModel } from '../models/store.model';

const initialize: StoreModel = {
  icon: null,
  data: null,
  searching: null,
  timestamp: null,
};

const StoreReducer = (state: StoreModel = initialize, action: any) => {
  switch (action.type) {
    case LOAD_STORE:
      return action.payload;
    case LOAD_CPM:
      return {
        ...state,
        cpm: action.payload,
      };
    case LOAD_TIMESTAMP:
      return {
        ...state,
        timestamp: action.payload,
      };
    case LOAD_LOGO_POKEGO:
      return {
        ...state,
        icon: action.payload,
      };
    case LOAD_CANDY:
      return {
        ...state,
        data: {
          ...state.data,
          candy: action.payload,
        },
      };
    case LOAD_OPTIONS:
      return {
        ...state,
        data: {
          ...state.data,
          options: action.payload,
        },
      };
    case LOAD_TYPE_EFF:
      return {
        ...state,
        data: {
          ...state.data,
          typeEff: action.payload,
        },
      };
    case LOAD_WEATHER_BOOST:
      return {
        ...state,
        data: {
          ...state.data,
          weatherBoost: action.payload,
        },
      };
    case LOAD_POKEMON:
      return {
        ...state,
        data: {
          ...state.data,
          pokemon: action.payload,
        },
      };
    case LOAD_POKEMON_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          pokemonData: action.payload,
        },
      };
    case LOAD_EVOLUTION:
      return {
        ...state,
        data: {
          ...state.data,
          evolution: action.payload,
        },
      };
    case LOAD_STICKER:
      return {
        ...state,
        data: {
          ...state.data,
          stickers: action.payload,
        },
      };
    case LOAD_COMBAT:
      return {
        ...state,
        data: {
          ...state.data,
          combat: action.payload,
        },
      };
    case LOAD_POKEMON_COMBAT:
      return {
        ...state,
        data: {
          ...state.data,
          pokemonCombat: action.payload,
        },
      };
    case LOAD_POKEMON_NAME:
      return {
        ...state,
        data: {
          ...state.data,
          pokemonName: optionPokemonName(state.data?.details ?? []),
        },
      };
    case LOAD_ASSETS:
      return {
        ...state,
        data: {
          ...state.data,
          assets: action.payload,
        },
      };
    case LOAD_LEAGUES:
      return {
        ...state,
        data: {
          ...state.data,
          leagues: action.payload,
        },
      };
    case LOAD_RELEASED_GO: {
      return {
        ...state,
        data: {
          ...state.data,
          released: mappingReleasedGO(state.data?.pokemonData ?? [], state.data?.details ?? []),
        },
      };
    }
    case LOAD_DETAILS:
      return {
        ...state,
        data: {
          ...state.data,
          details: action.payload,
        },
      };
    case LOAD_PVP:
      return {
        ...state,
        data: {
          ...state.data,
          pvp: {
            rankings: convertPVPRankings(action.payload.rankings, state.data?.leagues?.data ?? []),
            trains: convertPVPTrain(action.payload.trains, state.data?.leagues?.data ?? []),
          },
        },
      };
    case RESET_STORE:
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export default StoreReducer;
