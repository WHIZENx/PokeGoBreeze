import React from 'react';
import { Data } from '../core/models/data.model';

// Create default data
export const defaultData = new Data();

// Create the context with the default data
export const DataContext = React.createContext(defaultData);

// Create a custom hook to use the data context
export const useData = () => React.useContext(DataContext);
