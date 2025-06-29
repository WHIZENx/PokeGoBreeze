// Some React component
import { useEffect } from 'react';
import { updateCurrentOptions } from '../helpers/options-context.helpers';
import { defaultOptions } from '../../contexts/options.context';
import useDataStore from '../../composables/useDataStore';

const optionsObserver = () => {
  const dataStore = useDataStore();

  useEffect(() => {
    updateCurrentOptions(dataStore.options || defaultOptions);
  }, [dataStore.options]);

  return null;
};

export default optionsObserver;
