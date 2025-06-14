import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.scss';
import { StoreState } from '../../store/models/state.model';
import { useTitle } from '../../util/hooks/useTitle';

const TypeEffect = () => {
  useTitle('Type Effectiveness');
  const typeEffective = useSelector((state: StoreState) => state.store.data.typeEff);

  return (
    <div className="container mt-2 pb-3">
      <Row>
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
