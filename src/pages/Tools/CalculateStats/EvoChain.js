import { Fragment, useCallback, useEffect, useState } from "react";
import { splitAndCapitalize } from "../../../util/Utils";
import APIService from "../../../services/API.service";

const EvoChain = (props) => {

    const [arrEvoList, setArrEvoList] = useState([]);

    const getEvoChain = useCallback((data) => {
        if (data.length === 0) return false;
        setArrEvoList(oldArr => [...oldArr, data.map(item => {
            return {name: item.species.name, id: item.species.url.split("/")[6], baby: item.is_baby}
        })])
        return data.map(item => getEvoChain(item.evolves_to))
    }, []);

    useEffect(() => {
        const fetchMyAPI = async () => {
            setArrEvoList([]);
            const dataEvo = await APIService.getFetchUrl(props.url)
            getEvoChain([dataEvo.data.chain])
        }
        if (props.url) fetchMyAPI();
    }, [getEvoChain, props.url]);

    return (
        <Fragment>
            <tr className="text-center"><td className="table-sub-header" colSpan="2">Evolution Chains</td></tr>
                {arrEvoList.map((value, index) => (
                    <Fragment key={index}>
                    {value.map((value, index) => (
                        <Fragment key={index}>
                            {parseInt(value.id) !== props.id &&
                                <Fragment>
                                    <tr className="text-center">
                                        <td className="img-table-evo" colSpan="2"><img width="96" height="96" alt="img-pokemon" src={APIService.getPokeSprite(value.id)}></img></td>
                                    </tr>
                                    <tr>
                                        <td>Name</td>
                                        <td>{splitAndCapitalize(value.name, "-", " ")}</td>
                                    </tr>
                                    <tr>
                                        <td>CP</td>
                                        <td>5555</td>
                                    </tr>
                                </Fragment>
                            }
                        </Fragment>
                    ))
                    }
                    </Fragment>
                ))
            }
        </Fragment>
    )
}

export default EvoChain;