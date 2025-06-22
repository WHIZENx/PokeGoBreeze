import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.scss';
import { StoreState } from '../../store/models/state.model';
import { useTitle } from '../../utils/hooks/useTitle';

const TypeEffect = () => {
  useTitle({
    title: 'PokéGO Breeze - Type Effectiveness',
    description:
      'Complete Pokémon GO type effectiveness chart. Learn which types are strong or weak against other types to maximize your battle strategy.',
    keywords: [
      'type effectiveness',
      'Pokémon GO types',
      'type chart',
      'type matchups',
      'super effective',
      'battle strategy',
    ],
  });
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
