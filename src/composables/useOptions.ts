import { useSelector, useDispatch } from 'react-redux';
import { OptionsSheetState } from '../store/models/state.model';
import { OptionDPSModel } from '../store/models/options.model';
import { OptionFiltersCounter } from '../components/Table/Counter/models/counter.model';
import { SetDpsSheetOptions, SetCounterOptions } from '../store/actions/options.action';

/**
 * Custom hook to access and update the options state from Redux store
 * This replaces direct usage of useSelector((state: OptionsSheetState) => state.options)
 *
 * @returns The options state object with all properties and update methods
 */
export const useOptionStore = () => {
  const dispatch = useDispatch();
  const optionsData = useSelector((state: OptionsSheetState) => state.options);

  /**
   * Update DPS sheet options in the store
   * @param dpsOptions The new DPS sheet options
   */
  const setDpsSheetOptions = (dpsOptions: OptionDPSModel) => {
    dispatch(SetDpsSheetOptions.create(dpsOptions));
  };

  /**
   * Update counter options in the store
   * @param counterOptions The new counter options
   */
  const setCounterOptions = (counterOptions: OptionFiltersCounter) => {
    dispatch(SetCounterOptions.create(counterOptions));
  };

  const optionsDpsSheet = optionsData?.dpsSheet;
  const optionsCounter = optionsData?.counter || new OptionFiltersCounter();

  return {
    optionsData,
    optionsDpsSheet,
    optionsCounter,
    setDpsSheetOptions,
    setCounterOptions,
  };
};

export default useOptionStore;
