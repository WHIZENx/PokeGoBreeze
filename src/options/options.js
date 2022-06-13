import options from '../data/pokemon_go_options.json';

export function getUpdateTime() {
    return new Date(options.timestamp);
}

export function getOption() {
    let result = options.data;
    Array.apply(this, Array.prototype.slice.call(arguments, 0)).forEach(arg => {
        result = result[arg]
    });
    return result;
}