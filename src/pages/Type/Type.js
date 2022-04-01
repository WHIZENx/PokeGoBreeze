import React from 'react';

import Attacker from './Attacker';
import Defender from './Defender';

const Type = () => {

    return (
        <div className="container element-top">
            <div className='row'>
                <div className='col'><Attacker/></div>
                <div className='col'><Defender/></div>
            </div>
        </div>
    )
}

export default Type;
