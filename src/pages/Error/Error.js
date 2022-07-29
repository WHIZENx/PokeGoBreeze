import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './Error.css';

const Error = () => {

    const thisLocation = useLocation();

    useEffect(() => {
        document.title = "Page Not Found";
    }, []);

    return (
        <div className='d-block position-relative'>
            <div className="error-img"><div className='img'></div></div>
            <div className="error-desc">
                <div className='desc'>
                    <h1 className='desc-head'><b>404</b></h1>
                    <h1>Page Not Found</h1>
                    <span>It looks like nothing was found at <p style={{color: 'yellow'}}>{thisLocation.pathname}</p></span>
                    <span>Maybe try one of the links in the menu or press Back to Home to go to the home page.</span>
                    <div style={{marginTop: 15}}><Link className='btn btn-danger' to="/">Back to Home</Link></div>
                </div>
            </div>
        </div>
    )
}

export default Error;