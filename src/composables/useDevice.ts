import { useSelector, useDispatch } from 'react-redux';
import { isMobile as isMobileDetect } from 'react-device-detect';
import { DeviceState } from '../store/models/state.model';
import { SetDevice } from '../store/actions/device.action';

/**
 * Custom hook to access and update the device state from Redux store
 * This replaces direct usage of useSelector((state: DeviceState) => state.device)
 *
 * @returns The device state and update methods
 */
export const useDevice = () => {
  const dispatch = useDispatch();
  const deviceData = useSelector((state: DeviceState) => state.device);

  /**
   * Update device state in the store
   */
  const setDevice = () => {
    dispatch(SetDevice.create());
  };

  const isMobileStore = deviceData.isMobile;
  const isMobile = isMobileDetect;

  return {
    deviceData,
    setDevice,
    isMobileStore,
    isMobile,
  };
};

export default useDevice;
