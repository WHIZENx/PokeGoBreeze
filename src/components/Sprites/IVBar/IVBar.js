import './IVBar.css';

const IVbar = (props) => {

    const ivWidthFirst = props.iv < 5 ? 20*props.iv : 100;
    const ivWidthSec = props.iv >= 5 ? props.iv < 10 ? 20*(props.iv-5) : 100 : 0;
    const ivWidthThird = props.iv >= 10 ? props.iv < 15 ? 20*(props.iv-10) : 100 : 0;

    return (
        <div className='iv-container element-top' style={props.style}>
            <div className='d-flex justify-content-between' style={{width: '99%'}}>
                <b>{props.title}</b>
                <b>{props.iv}</b>
            </div>
            <div className='iv-bg-group'>
                <div className='iv iv-first-child position-relative'>
                    <div style={{width: `${ivWidthFirst}%`}} className={'position-absolute iv-bar'+(props.iv <= 5 ? " border-right-iv": "")}></div>
                    <div className='iv-bg-bar w-100'></div>
                </div>
                <div className='iv position-relative'>
                    <div style={{width: `${ivWidthSec}%`}} className={'position-absolute iv-bar'+(props.iv > 5 && props.iv <= 10 ? " border-right-iv": "")}></div>
                    <div className='iv-bg-bar w-100'></div>
                </div>
                <div className='iv iv-last-child position-relative'>
                    <div style={{width: `${ivWidthThird}%`}} className={'position-absolute iv-bar'}></div>
                    <div className='iv-bg-bar w-100'></div>
                </div>
            </div>
        </div>
    )
}

export default IVbar;