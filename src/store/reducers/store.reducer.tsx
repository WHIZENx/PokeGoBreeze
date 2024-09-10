import { convertPVPRankings, convertPVPTrain } from '../../core/pvp';
import { replaceTempMovePvpName } from '../../util/utils';
import { Store, StoreModel } from '../models/store.model';
import { StoreActions } from '../../store/actions';
import { StoreActionsUnion } from '../actions/store.action';
import { getValueOrDefault } from '../../util/models/util.model';

const initialize: StoreModel = new Store();

const StoreReducer = (state: StoreModel = initialize, action: StoreActionsUnion) => {
  switch (action.type) {
    case StoreActions.StoreActionTypes.getStore:
      return state;
    case StoreActions.StoreActionTypes.setCPM:
      return {
        ...state,
        cpm: action.payload,
      };
    case StoreActions.StoreActionTypes.setTimestamp:
      return {
        ...state,
        timestamp: action.payload,
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
          weatherBoost: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setPokemon:
      return {
        ...state,
        data: {
          ...state.data,
          pokemon: action.payload,
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
          combat: action.payload,
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
    case StoreActions.StoreActionTypes.setPVP:
      return {
        ...state,
        data: {
          ...state.data,
          pvp: {
            rankings: convertPVPRankings(action.payload.rankings, getValueOrDefault(Array, state.data?.leagues?.data)),
            trains: convertPVPTrain(action.payload.trains, getValueOrDefault(Array, state.data?.leagues?.data)),
          },
        },
      };
    case StoreActions.StoreActionTypes.setPVPMoves: {
      const result = state.data?.combat?.map((move) => {
        const movePVP = action.payload.find(
          (data) => data.moveId === (move.name === 'HIDDEN_POWER' ? 'HIDDEN_POWER_BUG' : replaceTempMovePvpName(move.name))
        );
        move.archetype = movePVP?.archetype;
        move.abbreviation = movePVP?.abbreviation;
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
    case StoreActions.StoreActionTypes.resetStore:
      return {
        ...state,
        timestamp: new Date().getTime(),
      };
    default:
      return state;
  }
};

export default StoreReducer;
