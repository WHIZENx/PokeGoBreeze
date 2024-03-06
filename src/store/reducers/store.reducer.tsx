import { optionPokemonName } from '../../core/options';
import { convertPVPRankings, convertPVPTrain } from '../../core/pvp';
import {
  LOAD_ASSETS,
  LOAD_COMBAT,
  LOAD_CPM,
  LOAD_DETAILS,
  LOAD_EVOLUTION,
  LOAD_LEAGUES,
  LOAD_LOGO_POKEGO,
  LOAD_OPTIONS,
  LOAD_POKEMON,
  LOAD_POKEMON_COMBAT,
  LOAD_POKEMON_NAME,
  LOAD_PVP,
  LOAD_PVP_MOVES,
  LOAD_STICKER,
  LOAD_STORE,
  LOAD_TIMESTAMP,
  LOAD_TYPE_EFF,
  LOAD_WEATHER_BOOST,
  RESET_STORE,
} from '../actions/store.action';
import { StoreModel } from '../models/store.model';

const initialize: StoreModel = {};

const StoreReducer = (state: StoreModel = initialize, action: { type: string; payload: any }) => {
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
          pokemonName: Object.values(optionPokemonName(state.data?.pokemon ?? [])) ?? [],
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
    case LOAD_PVP_MOVES: {
      const result = state.data?.combat?.map((move) => {
        const movePVP = action.payload.find(
          (data: { moveId: string }) =>
            data.moveId ===
            (move.name === 'HIDDEN_POWER'
              ? 'HIDDEN_POWER_BUG'
              : move.name.replace('_BLASTOISE', '').replaceAll('_PLUS', '').replace('TECHNO_BLAST_WATER', 'TECHNO_BLAST_DOUSE'))
        );
        move.archetype = movePVP?.archetype;
        return move;
      });
      return {
        ...state,
        data: {
          ...state.data,
          combat: result,
        },
      };
    }
    case RESET_STORE:
      return {
        ...state,
        timestamp: new Date().getTime(),
      };
    default:
      return state;
  }
};

export default StoreReducer;
