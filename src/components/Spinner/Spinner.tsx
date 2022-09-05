import React, { Fragment } from 'react';
import { RootStateOrAny, useSelector } from 'react-redux';
import loading from '../../assets/loading.png';
import './Spinner.css';

const Spinner = () => {

    const spinner = useSelector((state: RootStateOrAny) => state.spinner);

    return (
        <Fragment>
            {spinner &&
            <div className='spinner-container'>
                <div className='loading-group-spin'></div>
                <div className="loading-spin-container">
                    <div className="loading-spin text-center">
                        <img className="loading" width={64} height={64} alt='img-pokemon' src={loading}/>
                        <span className='caption text-white text-shadow' style={{fontSize: 18}}><b>Loading<span id='p1'>.</span><span id='p2'>.</span><span id='p3'>.</span></b></span>
                    </div>
                </div>
            </div>
            }
        </Fragment>
    )
}

export default Spinner;