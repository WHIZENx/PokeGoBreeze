import { convertPVPRankings, convertPVPTrain } from '../../core/pvp';
import { replaceTempMovePvpName } from '../../util/utils';
import { Store } from '../models/store.model';
import { StoreActions } from '../actions';
import { StoreActionsUnion } from '../actions/store.action';
import { IWeatherBoost } from '../../core/models/weatherBoost.model';
import { isEqual } from '../../util/extension';

const initialize = new Store();

const StoreReducer = (state = initialize, action: StoreActionsUnion) => {
  switch (action.type) {
    case StoreActions.StoreActionTypes.getStore:
      return state;
    case StoreActions.StoreActionTypes.setCPM:
      return {
        ...state,
        data: {
          ...state.data,
          cpm: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setLogoPokeGO:
      return {
        ...state,
        icon: action.payload,
      };
    case StoreActions.StoreActionTypes.setOptions:
      return {
        ...state,
        data: {
          ...state.data,
          options: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setTypeEff:
      return {
        ...state,
        data: {
          ...state.data,
          typeEff: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setWeatherBoost:
      return {
        ...state,
        data: {
          ...state.data,
          weatherBoost: action.payload as unknown as IWeatherBoost,
        },
      };
    case StoreActions.StoreActionTypes.setPokemon:
      return {
        ...state,
        data: {
          ...state.data,
          pokemons: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setSticker:
      return {
        ...state,
        data: {
          ...state.data,
          stickers: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setCombat:
      return {
        ...state,
        data: {
          ...state.data,
          combats: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setEvolutionChain:
      return {
        ...state,
        data: {
          ...state.data,
          evolutionChains: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setInformation:
      return {
        ...state,
        data: {
          ...state.data,
          information: {
            data: action.payload,
            isLoaded: true,
          },
        },
      };
    case StoreActions.StoreActionTypes.setAssets:
      return {
        ...state,
        data: {
          ...state.data,
          assets: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setLeagues:
      return {
        ...state,
        data: {
          ...state.data,
          leagues: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setTrainers:
      return {
        ...state,
        data: {
          ...state.data,
          trainers: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setPVP:
      return {
        ...state,
        data: {
          ...state.data,
          pvp: {
            rankings: convertPVPRankings(action.payload.rankings, state.data.leagues.data),
            trains: convertPVPTrain(action.payload.trains, state.data.leagues.data),
          },
        },
      };
    case StoreActions.StoreActionTypes.setPVPMoves: {
      const result = state.data.combats.map((move) => {
        const movePVP = action.payload.find((data) =>
          isEqual(
            data.moveId,
            isEqual(move.name, 'HIDDEN_POWER') ? 'HIDDEN_POWER_BUG' : replaceTempMovePvpName(move.name)
          )
        );
        move.archetype = movePVP?.archetype;
        move.abbreviation = movePVP?.abbreviation;
        return move;
      });
      return {
        ...state,
        data: {
          ...state.data,
          combats: result,
        },
      };
    }
    case StoreActions.StoreActionTypes.resetStore:
      return {
        ...initialize,
        timestamp: new Date().getTime(),
      };
    default:
      return state;
  }
};

export default StoreReducer;
