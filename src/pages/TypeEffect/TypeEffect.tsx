import { useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector, RootStateOrAny } from 'react-redux';
import { TRANSITION_TIME } from '../../util/Constants';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.scss';

const TypeEffect = () => {
  const typeEffective = useSelector((state: RootStateOrAny) => state.store.data.typeEff);
  const theme = useTheme();

  useEffect(() => {
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
