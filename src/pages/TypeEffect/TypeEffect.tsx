import React, { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector, RootStateOrAny } from 'react-redux';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.css';

const TypeEffect = () => {
  const typeEffective = useSelector((state: RootStateOrAny) => state.store.data.typeEff);

  useEffect(() => {
    document.title = 'Type Effectiveness';
  }, []);

  return (
    <div className="container element-top" style={{ paddingBottom: 15 }}>
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
