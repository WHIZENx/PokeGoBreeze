import './IVBar.css';

const IVbar = (props) => {

    const width_iv_1 = `${props.iv < 5 ? 6*props.iv : 30}%`;
    const width_iv_2 = `${props.iv >= 5 ? props.iv < 10 ? 6*(props.iv-5) : 30 : 0}%`;
    const width_iv_3 = `${props.iv >= 10 ? props.iv <= 15 ? 6*(props.iv-10) : 30 : 0}%`;

    return (
        <div className='position-relative iv-container element-top'>
            <div className='iv-bg-group'>
                <div className='iv iv-bg-bar'></div>
                <div className='iv iv-bg-bar'></div>
                <div className='iv iv-bg-bar'></div>
            </div>
            <div className='iv-group'>
                <div className={'iv iv-bar'+(props.iv <= 5 ? " border-right-iv": "")} style={{width: width_iv_1}}></div>
                <div className={'iv iv-bar'+(props.iv > 5 && props.iv <= 10 ? " border-right-iv": "")} style={{width: width_iv_2}}></div>
                <div className='iv iv-bar' style={{width: width_iv_3}}></div>
            </div>
        </div>

    )
}

export default IVbar;