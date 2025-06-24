// Some React component
import { useEffect } from 'react';
import { updateCurrentOptions } from '../helpers/context.helpers';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { defaultOptions } from '../../contexts/options.context';

const optionsObserver = () => {
  const options = useSelector((state: StoreState) => state.store.data.options);

  useEffect(() => {
    const config = process.env.REACT_APP_CONFIG;
    if (config) {
      options.config = JSON.parse(config);
    }
    updateCurrentOptions(options || defaultOptions);
  }, [options]);

  return null;
};

export default optionsObserver;
