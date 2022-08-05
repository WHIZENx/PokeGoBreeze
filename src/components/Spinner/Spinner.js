import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import loading from '../../assets/loading.png';
import './Spinner.css';

const Spinner = () => {

    const spinner = useSelector((state) => state.spinner);

    return (
        <Fragment>
            {spinner &&
            <div className='position-fixed spinner-container' style={{display: true ? "block" : "none"}}>
                <div className='position-fixed loading-group-spin' ></div>
                <div className="position-fixed loading-spin text-center">
                    <img className="loading" width={64} height={64} alt='img-pokemon' src={loading}/>
                    <span className='caption text-white text-shadow' style={{fontSize: 18}}><b>Loading...</b></span>
                </div>
            </div>
            }
        </Fragment>
    )
}

export default Spinner;