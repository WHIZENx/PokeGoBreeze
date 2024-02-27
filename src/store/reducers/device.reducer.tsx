import { SET_DEVICE } from '../actions/device.action';

export interface DeviceModel {
  isMobile: boolean;
  browserName: string | null;
  osName: string | null;
}

const initialize: DeviceModel = {
  isMobile: false,
  browserName: null,
  osName: null,
};

const DeviceReducer = (state: DeviceModel = initialize, action: { type: string; payload: DeviceModel }) => {
  switch (action.type) {
    case SET_DEVICE: {
      return action.payload;
    }
    default:
      return state;
  }
};

export default DeviceReducer;
