import APIService from '../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../util/Utils';
import './TypeBar.css'

const TypeBar = (props) => {

    return (
        <div className={"d-flex align-items-center border-type "+props.type.toLowerCase()}>
            <img style={{padding: 5, backgroundColor: 'black'}} width={35} height={35} alt="img-type-pokemon" src={APIService.getTypeHqSprite(capitalize(props.type.toLowerCase()))}></img>
            <h3>{splitAndCapitalize(props.type.toLowerCase(), "_", " ")}</h3>
        </div>
    )
}

export default TypeBar;