import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RouterActionTypes } from '../store/actions/router.actions';

const RouterSync = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: RouterActionTypes.LOCATION_CHANGE,
      payload: {
        location,
        action: navType,
      },
    });
  }, [location, navType, dispatch]);

  return null;
};

export default RouterSync;
