import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {Row, Col} from 'react-bootstrap'

import APIService from '../../services/API.service'

import Attacker from './Attacker';
import Defender from './Defender';

import './TypeEffect.css';

const TypeEffect = () => {

    const [typeEffective, setTypeEffective] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!typeEffective) {
            APIService.getPokeJSON('type_effectiveness.json')
            .then(res => {
                setTypeEffective(res.data);
            })
            .catch(err => {
                enqueueSnackbar(err, { variant: 'error' })
            })
        }
    }, [typeEffective, enqueueSnackbar]);
        
    return (
        <div className="container element-top">
            {typeEffective &&
            <Row>
                <Col><Attacker types={typeEffective}/></Col>
                <Col><Defender types={typeEffective}/></Col>
            </Row>
            }
        </div>
    )
}

export default TypeEffect;
