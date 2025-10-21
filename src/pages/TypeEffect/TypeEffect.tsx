import React from 'react';
import { Row, Col } from 'react-bootstrap';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.scss';
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

  return (
    <div className="tw-container tw-mt-2 tw-pb-3">
      <Row>
        <Col>
          <Attacker />
        </Col>
        <Col>
          <Defender />
        </Col>
      </Row>
    </div>
  );
};

export default TypeEffect;
