import { createContext, useContext } from 'react';
import { Options } from '../core/models/options.model';

// Create default options
export const defaultOptions = new Options();

// Create the context with the default options
export const OptionsContext = createContext(defaultOptions);

// Create a custom hook to use the options context
export const useOptions = () => useContext(OptionsContext);
