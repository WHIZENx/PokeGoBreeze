import { useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { SYNC_MSG, TRANSITION_TIME } from '../../util/Constants';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.scss';
import { hideSpinner, showSpinnerWithMsg } from '../../store/actions/spinner.action';
import { SpinnerState, StoreState } from '../../store/models/state.model';

const TypeEffect = () => {
  const dispatch = useDispatch();
  const typeEffective = useSelector((state: StoreState) => state.store.data?.typeEff ?? {});
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const theme = useTheme();

  useEffect(() => {
    if (Object.keys(typeEffective).length > 0 && spinner.loading) {
      dispatch(hideSpinner());
    }
  }, [typeEffective]);

  useEffect(() => {
    if (Object.keys(typeEffective).length === 0) {
      dispatch(showSpinnerWithMsg(SYNC_MSG));
    }
    document.title = 'Type Effectiveness';
  }, []);

  return (
    <div className="container element-top" style={{ paddingBottom: 15 }}>
      <Row style={{ color: theme.palette.text.primary, transition: TRANSITION_TIME }}>
        <Col>
          <Attacker types={typeEffective} />
        </Col>
        <Col>
          <Defender types={typeEffective} />
        </Col>
      </Row>
    </div>
  );
};

export default TypeEffect;
