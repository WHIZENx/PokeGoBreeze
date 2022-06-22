import { useCallback, useEffect, useState } from "react";
import Stats from "../../components/Info/Stats/Stats";

const FormTools = ({id, currForm, formList, dataPoke, stats, setForm, onSetStats}) => {

    const [currDataPoke, setCurrDataPoke] = useState(null);

    const [statATK, setStatATK] = useState(null);
    const [statDEF, setStatDEF] = useState(null);
    const [statSTA, setStatSTA] = useState(null);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const filterFormName = useCallback((form, formStats) => {
        form = form === "" ? "Normal" : form.includes("mega") ? form.toLowerCase() : capitalize(form);
        formStats = formStats.includes("Mega") ? formStats.toLowerCase() : formStats.replaceAll("_", "-");
        formStats = formStats === "Hero" ? "Normal" : formStats;
        return form.toLowerCase().includes(formStats.toLowerCase());
    }, []);

    const filterFormList = useCallback((stats, id) => {
        const filterId = stats.filter(item => item.id === id);
        const filterForm = stats.find(item => item.id === id && item.form !== "a" &&
            filterFormName(currForm.form.form_name, item.form));
        if (filterId.length === 1 && formList.length === 1 && !filterForm) return filterId[0];
        else if (filterId.length === formList.length && !filterForm) return stats.find(item => item.id === id && item.form === "Normal");
        else return filterForm;
    }, [currForm, filterFormName, formList.length]);

    useEffect(() => {
        if (currForm && dataPoke) {
            let formATK = filterFormList(stats.attack.ranking, id);
            let formDEF = filterFormList(stats.defense.ranking, id);
            let formSTA = filterFormList(stats.stamina.ranking, id);
            setStatATK(formATK);
            setStatDEF(formDEF);
            setStatSTA(formSTA);
            setCurrDataPoke(dataPoke.find(item => item.id === id))

            if (formATK && formDEF && formSTA) {
                onSetStats("atk", formATK.attack)
                onSetStats("def", formDEF.defense)
                onSetStats("sta", formSTA.stamina)
                if (setForm) setForm(currForm)
            }
        }
    }, [filterFormList, currForm, dataPoke, id, onSetStats, setForm, stats.attack.ranking, stats.defense.ranking, stats.stamina.ranking])

    return (
        <Stats statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                pokemonStats={stats}
                stats={currDataPoke}/>
    )
}

export default FormTools;