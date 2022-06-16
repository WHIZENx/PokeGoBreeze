import { useEffect, useState } from "react";
import Raid from "../../../components/Raid/Raid";
import Find from "../Find";

const RaidBattle = () => {

    const [id, setId] = useState(1);
    const [name, setName] = useState('Bulbasaur');
    const [form, setForm] = useState(null);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [tier, setTier] = useState(1);

    const clearData = () => {
        return (name, statSTA, tier)
    }

    const onSetForm = (form) => {
        setForm(form);
    }

    useEffect(() => {
        document.title = "Raid Battle - Tools";
    }, []);

    return (
        <div className="row">
            <div className="col-lg" style={{padding: 0}}>
                <Find title="Raid Boss" clearStats={clearData} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setName={setName} setForm={onSetForm} setId={setId}/>
                {/* <StatsTable setStatLvATK={setStatLvATK} setStatLevel={setStatLevel} setStatType={setStatType}
                statATK={statATK} statDEF={statDEF} statSTA={statSTA} /> */}
            </div>
            <div className="col-lg" style={{padding: 0}}>
                <div className="element-top container">
                    <Raid
                        setTierBoss={setTier}
                        currForm={form}
                        id={id}
                        statATK={statATK}
                        statDEF={statDEF}/>
                </div>

            </div>
        </div>
    )
}

export default RaidBattle;