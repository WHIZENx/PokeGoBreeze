import { defaultOptions } from '../../contexts/options.context';
import { IOptions } from '../../core/models/options.model';

// This variable will store the latest options from the context
let currentOptions = defaultOptions;

// Function to update the current options (called from a React component)
export const updateCurrentOptions = (newOptions: IOptions) => {
  currentOptions = newOptions;
};

// Function to get the current options (can be called from any file)
export const getOptions = () => currentOptions;
