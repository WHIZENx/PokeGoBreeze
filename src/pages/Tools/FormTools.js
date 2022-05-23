import { useCallback, useEffect, useState } from "react";
import Stats from "../../components/Info/Stats/Stats";

const FormTools = (props) => {

    const [dataPoke, setDataPoke] = useState(null);

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
        const filterForm = stats.find(item => item.id === id &&
            filterFormName(props.currForm.form.form_name, item.form));
        if (filterId.length === 1 && props.formList.length === 1 && !filterForm) return filterId[0];
        else if (filterId.length === props.formList.length && !filterForm) return stats.find(item => item.id === id && item.form === "Normal");
        else return filterForm;
    }, [props.currForm, filterFormName, props.formList.length]);

    useEffect(() => {
        if (props.currForm && props.dataPoke) {
            let formATK = filterFormList(props.stats.attack.ranking, props.id);
            let formDEF = filterFormList(props.stats.defense.ranking, props.id);
            let formSTA = filterFormList(props.stats.stamina.ranking, props.id);
            setStatATK(formATK);
            setStatDEF(formDEF);
            setStatSTA(formSTA);
            setDataPoke(props.dataPoke.find(item => item.id === props.id))

            if (formATK && formDEF && formSTA) {
                props.onSetStats("atk", formATK.attack)
                props.onSetStats("def", formDEF.defense)
                props.onSetStats("sta", formSTA.stamina)
                if (props.setForm) props.setForm(props.currForm)
            }
        }
    }, [props, filterFormList]);

    return (
        <Stats statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                pokemonStats={props.stats}
                stats={dataPoke}/>
    )

}

export default FormTools;