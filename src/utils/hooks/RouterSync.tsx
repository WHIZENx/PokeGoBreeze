import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RouterActions } from '../../store/actions';

const RouterSync = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      RouterActions.LocationChangeAction.create({
        location,
        action: navType,
      })
    );
  }, [location, navType, dispatch]);

  return null;
};

export default RouterSync;
