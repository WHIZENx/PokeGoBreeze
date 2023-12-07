import { isMobile, browserName, osName } from 'react-device-detect';

export const SET_DEVICE = 'SET_DEVICE';

export const setDevice = () => ({
  type: SET_DEVICE,
  payload: {
    isMobile,
    browserName,
    osName,
  },
});
