import { useSelector, useDispatch } from 'react-redux';
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

  return {
    deviceData,
    setDevice,
  };
};

export default useDevice;
