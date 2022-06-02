import options from '../data/pokemon_go_options.json';

class Option {

    // constructor () {}

    getUpdateTime() {
        return new Date(options.timestamp);
    }

    getData(func) {
        return options.data[func]
    }

}

export default (new Option());