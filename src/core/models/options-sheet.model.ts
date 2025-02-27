import { OptionFiltersCounter } from '../../components/Table/Counter/models/counter.model';
import { OptionDPSModel } from '../../store/models/options.model';

export interface OptionsSheetModel {
  dpsSheet: OptionDPSModel;
  counter: OptionFiltersCounter;
}
