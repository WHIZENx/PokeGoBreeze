import APIService from '../../services/API.service';
import './TypeBar.css'

const TypeBar = (props) => {

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = (string, split) => {
        return string.split(split).map(text => capitalize(text)).join(" ");
    };

    return (
        <div className={"d-flex align-items-center border-type "+props.type.toLowerCase()}>
            <img style={{padding: 5, backgroundColor: 'black'}} width={35} height={35} alt="img-type-pokemon" src={APIService.getTypeHqSprite(capitalize(props.type.toLowerCase()))}></img>
            <h3>{splitAndCapitalize(props.type.toLowerCase(), "_")}</h3>
        </div>
    )
}

export default TypeBar;