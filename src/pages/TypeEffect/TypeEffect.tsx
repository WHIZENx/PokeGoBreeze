import { useTheme } from '@mui/material';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { TRANSITION_TIME } from '../../util/Constants';

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.scss';
import { StoreState } from '../../store/models/state.model';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { ThemeModify } from '../../util/models/overrides/themes.model';

const TypeEffect = () => {
  useChangeTitle('Type Effectiveness');
  const typeEffective = useSelector((state: StoreState) => state.store.data?.typeEff);
  const theme = useTheme<ThemeModify>();

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
