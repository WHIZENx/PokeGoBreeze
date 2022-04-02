import React from 'react';
import {Row, Col} from 'react-bootstrap'

import Attacker from './Attacker';
import Defender from './Defender';

const Type = () => {

    return (
        <div className="container element-top">
            <Row>
                <Col><Attacker/></Col>
                <Col><Defender/></Col>
            </Row>
        </div>
    )
}

export default Type;
