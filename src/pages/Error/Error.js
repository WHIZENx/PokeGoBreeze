import { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import error from '../../assets/error.jpg';

import './Error.css';

const Error = () => {

    const thisLocation = useLocation();

    useEffect(() => {
        document.title = "Page Not Found";
    }, []);

    return (
        <Fragment>
            <div className="error-img"><img alt="error-img" src={error}></img></div>
            <div className="error-desc">
                <div className='desc'>
                    <h1 className='desc-head'><b>404</b></h1>
                    <h1>Page Not Found</h1>
                    <span>It looks like nothing was found at <p style={{color: 'yellow'}}>{thisLocation.pathname}</p></span>
                    <span>Maybe try one of the links in the menu or press Go home to go to the home page.</span>
                    <div style={{marginTop: 15}}><Link className='btn btn-danger' to="/">Go home</Link></div>
                </div>
            </div>
        </Fragment>
    )
}

export default Error;