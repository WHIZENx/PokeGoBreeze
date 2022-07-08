import './IVBar.css';

const IVbar = (props) => {

    const width_iv_1 = `${props.iv < 5 ? 6.52*props.iv : 32.6}%`;
    const width_iv_2 = `${props.iv >= 5 ? props.iv < 10 ? 6.52*(props.iv-5) : 32.6 : 0}%`;
    const width_iv_3 = `${props.iv >= 10 ? props.iv <= 15 ? 6.52*(props.iv-10) : 32.6 : 0}%`;

    return (
        <div className='iv-container element-top' style={props.style}>
            <div className='d-flex justify-content-between' style={{width: '99%'}}>
                <b>{props.title}</b>
                <b>{props.iv}</b>
            </div>
            <div className='position-relative'>
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
        </div>
    )
}

export default IVbar;