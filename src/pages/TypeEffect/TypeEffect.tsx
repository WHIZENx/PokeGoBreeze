import React, { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.css';
import typeEffective from '../../data/type_effectiveness.json';

const TypeEffect = () => {
  useEffect(() => {
    document.title = 'Type Effectiveness';
  }, []);

  return (
    <div className="container element-top">
      {typeEffective && (
        <Row>
          <Col>
            <Attacker types={typeEffective} />
          </Col>
          <Col>
            <Defender types={typeEffective} />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default TypeEffect;
