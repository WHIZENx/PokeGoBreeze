import Find from "../Tools/Find";

import './Stats.css';
import Hexagon from "../../components/Sprites/Hexagon/Hexagon";
import { useState } from "react";
import { calculateTankiness } from "../../util/Calculate";

const Stats = () => {

    const initStats = {
        lead: 85,
        atk: 70,
        cons: 65,
        closer: 50,
        charger: 40,
        switch: 75
    }

    const [id, setId] = useState(1);
    const [name, setName] = useState('Bulbasaur');
    const [form, setForm] = useState(null);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const clearData = () => {
        console.log(id, name, form, statATK, statDEF, statSTA)
    }

    const onSetForm = (form) => {
        setForm(form);
    }

    return (
        <div className="container">
            <div className="d-flex flex-wrap w-100">
                <Find hide={true} title="PVP Pokémon Stats" clearStats={clearData} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setForm={onSetForm} setName={setName} setId={setId}/>
                <Hexagon size={200} stats={initStats}/>
                {statATK && statDEF && statSTA &&
                <span>Tanki: {calculateTankiness(statDEF, statSTA)}</span>
                }
            </div>
        </div>
    )
}

export default Stats;