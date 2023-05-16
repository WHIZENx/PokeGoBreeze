import { useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector, RootStateOrAny, useDispatch } from 'react-redux';
import { TRANSITION_TIME } from '../../util/Constants';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.scss';
import { hideSpinner } from '../../store/actions/spinner.action';

const TypeEffect = () => {
  const dispatch = useDispatch();
  const typeEffective = useSelector((state: RootStateOrAny) => state.store.data.typeEff);
  const spinner = useSelector((state: RootStateOrAny) => state.spinner);
  const theme = useTheme();

  useEffect(() => {
    document.title = 'Type Effectiveness';
    if (spinner.loading) {
      dispatch(hideSpinner());
    }
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
