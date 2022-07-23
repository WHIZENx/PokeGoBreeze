import { useState } from "react";
import styled from "styled-components";
import APIService from "../../../services/API.service";

const Circle = styled.div`
    width: ${props => props.size+5}px;
    height: ${props => props.size+5}px;
    background: #e5e5e5;
    border-radius: 50%;
    border: 5px solid lightgray;
    position: relative;
`;

const Fill =  styled.div`
    position: absolute;
    border-radius: 50%;
    width: ${props => props.size-5}px;
    height: ${props => props.size-5}px;
    clip: rect(${props => props.size-(props.energy*props.size/props.moveEnergy)}px, ${props => props.size-5}px, ${props => props.size-5}px, 0px);
    opacity: ${props => props.opacity};
    transition: 0.1s;
`;

const Icon = styled.div`
    width: ${props => props.size/2}px;
    height: ${props => props.size/2}px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -webkit-mask: url(${props => props.url}) center/contain;
    mask: url(${props => props.url}) center/contain;
    background: #ffffff75;
`;

const CircleBar = ({type, size, moveEnergy, energy, maxEnergy}) => {

    if (energy > maxEnergy) energy = maxEnergy;
    const fillCount = Math.min(Math.ceil(maxEnergy/moveEnergy), 3);

    const [test, setTest] = useState(energy);

    // console.log(moveEnergy, energy, maxEnergy, fillCount)

    return (
        <div>
        <Circle size={size}>
            <Fill className={type.toLowerCase()} size={size} moveEnergy={moveEnergy} energy={test > moveEnergy ? moveEnergy : test} opacity={1-(fillCount-1)*0.2}/>
            {test > moveEnergy && <Fill className={type.toLowerCase()} size={size} moveEnergy={moveEnergy} energy={test-moveEnergy} opacity={1-(fillCount-2)*0.2}/>}
            {test > moveEnergy*2 && <Fill className={type.toLowerCase()} size={size} moveEnergy={moveEnergy} energy={test-moveEnergy*2} opacity={1-(fillCount-3)*0.2}/>}
            <Icon size={size} url={APIService.getTypeIcon(type)}/>
        </Circle>
        <button onClick={() => {if (test > maxEnergy) setTest(0); else setTest(test+5);}}>Inc</button>
        </div>
    )
}

export default CircleBar;