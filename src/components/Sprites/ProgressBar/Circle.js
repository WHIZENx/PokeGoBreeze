import { useState } from "react";
import styled from "styled-components";
import APIService from "../../../services/API.service";

const Circle = styled.div`
    width: ${props => props.size+5}px;
    height: ${props => props.size+5}px;
    background: #0000003b;
    border-radius: 50%;
    border: 5px solid lightgray;
    position: relative;
`;

const Fill =  styled.div`
    position: absolute;
    border-radius: 50%;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    clip: rect(${props => props.size-(props.energy*props.size/props.moveEnergy)}px, ${props => props.size}px, ${props => props.size}px, 0px);
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
    mask: url(${props => props.url}) center/contain;
    background: #ffffff75;
`;

const IconFill =  styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${props => props.size/2}px;
    height: ${props => props.size/2}px;
    transform: translate(-50%, -50%);
    clip: rect(${props => ((props.size/2)+(((props.size)-(props.size/2))/2))-(props.energy*((props.size/2)+(((props.size)-(props.size/2))))/props.moveEnergy)}px, ${props => props.size/2}px, ${props => props.size/2}px, 0px);
    mask: url(${props => props.url}) center/contain;
    background: white;
    transition: 0.1s;
`;

const CircleBar = ({type, size, moveEnergy, energy, maxEnergy}) => {

    if (energy > maxEnergy) energy = maxEnergy;
    const fillCount = Math.min(Math.ceil(maxEnergy/moveEnergy), 3);

    const [test, setTest] = useState(energy);

    // console.log(moveEnergy, energy, maxEnergy, fillCount)

    return (
        <div>
        <Circle size={size}>
            {[...Array(fillCount).keys()].map(index => (
                <Fill key={index} className={type.toLowerCase()} size={size-5} moveEnergy={moveEnergy} energy={test-moveEnergy*index} opacity={1-(fillCount-(index+1))*0.2}/>
            ))}
            <Icon size={size-5} url={APIService.getTypeIcon(type)}/>
            <IconFill size={size-5} energy={test} moveEnergy={moveEnergy} url={APIService.getTypeIcon(type)}/>
        </Circle>
        <button onClick={() => {if (test <= maxEnergy) setTest(test+5);}}>Inc</button>
        </div>
    )
}

export default CircleBar;