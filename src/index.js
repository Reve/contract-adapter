const VARIABLE_NAMIG_STYLES = ['snakecase', 'camelcase'];
const NAMING_STYLES_REGEX = {
    snakecase: '[A-Z,a-z]+(_[A-Z,a-z]+)*',
    camelcase: '[a-z]+((d)|([A-Z0-9][a-z0-9]+))*([A-Z])?',
};

function validateObjectKeyAdheresToCodingStyle(key, codingStyle) {
    return RegExp(NAMING_STYLES_REGEX[codingStyle]).test(key);
}

function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}

function convertCamelCaseToSnakeCase(text, e = []) {
    if (e.includes(text)) {
        return text;
    }

    let _text = text
        .split(/(?=[A-Z])/)
        .map((s) => s.toLowerCase())
        .join('_');

    let _loc = _text.search(/\d+/);
    if (_loc > 0) {
        let _num = _text.substring(_loc);
        _text = _text.substring(0, _loc);
        return `${_text}_${_num}`;
    } else {
        return _text;
    }
}
function convertSnakeCaseToCamelCase(text, e = []) {
    if (e.includes(text)) {
        return text;
    }

    return text
        .split('_')
        .map((s, i) => (i === 0 ? s.toLowerCase() : capitalize(s)))
        .join('');
}

function convertFactory(style) {
    if (style === 'snakecase') {
        return convertCamelCaseToSnakeCase;
    } else if (style == 'camelcase') {
        return convertSnakeCaseToCamelCase;
    } else {
        return null;
    }
}

function convertDataToStyle(data, style, exclude = []) {
    if (!VARIABLE_NAMIG_STYLES.includes(style)) {
        return null;
    }

    const results = {};

    if (data === null) {
        return null;
    }

    Object.keys(data).map((o) => {
        if (!validateObjectKeyAdheresToCodingStyle(o, style)) {
            // we leave it as is
            results[o] = data[o];
        }

        let converter = convertFactory(style);
        let convertedKey = exclude.includes(o) ? o : converter(o, exclude);

        if (typeof data[o] === 'object') {
            if (Array.isArray(data[o])) {
                results[convertedKey] = [];
                data[o].map((d) => {
                    results[convertedKey].push(convertDataToStyle(d, style, exclude));
                });
            } else {
                results[convertedKey] = convertDataToStyle(data[o], style, exclude);
            }
        } else {
            results[convertedKey] = data[o];
        }
    });

    return results;
}

export default class ContractAdapter {
    constructor(key, schema) {
        if (!key || typeof key !== 'string') {
            throw new Error(`Expected a string for key, but found ${key} of type ${typeof key} `);
        }

        if (!schema || (typeof schema !== 'object' && !Array.isArray(schema))) {
            throw new Error(`Expected an object or string for schema, but found ${schema} of type ${typeof schema}`);
        }

        this._key = key;
        this._schema = schema;
        this._server = null;
        this._client = null;

        if (Array.isArray(schema)) {
            this._server = schema[0];
            this._client = schema[1];
        }
    }

    toServer(data, exclude = []) {
        if (typeof data !== 'object') {
            throw new Error(`Expected an object for data, but found ${data} of type ${typeof data}`);
        }

        let result = {};

        if (Array.isArray(this._schema)) {
            result = convertDataToStyle(data, this._server, exclude);
        } else {
            const flippedSchema = Object.entries(this._schema).reduce((ret, entry) => {
                const [key, value] = entry;
                if (typeof value === 'string') {
                    ret[value] = key;
                } else if (typeof value === 'object') {
                    ret[value._key] = new ContractAdapter(key, value._schema);
                }
                return ret;
            }, {});

            Object.keys(flippedSchema).map((s) => {
                if (!data.hasOwnProperty(s)) {
                    return '';
                }

                if (typeof flippedSchema[s] === 'string') {
                    result[flippedSchema[s]] = data[s];
                } else if (typeof flippedSchema[s] === 'object') {
                    if (Array.isArray(data[s])) {
                        if (data[s].length === 0) {
                            result[flippedSchema[s]._key] = [];
                        }

                        if (data[s].length > 0) {
                            result[flippedSchema[s]._key] = data[s].map((d) => flippedSchema[s].toServer(d, exclude));
                        }
                    } else {
                        result[flippedSchema[s]._key] = flippedSchema[s].toServer(data[s], exclude);
                    }
                }
                return '';
            });
        }

        return result;
    }

    fromServer(data, exclude = []) {
        if (typeof data !== 'object') {
            throw new Error(`Expected an object for data, but found ${data} of type ${typeof data}`);
        }

        let result = {};

        if (Array.isArray(this._schema)) {
            result = convertDataToStyle(data, this._client, exclude);
        } else {
            Object.keys(this._schema).map((s) => {
                if (!data.hasOwnProperty(s)) {
                    return '';
                }

                if (typeof this._schema[s] === 'string') {
                    result[this._schema[s]] = data[s];
                } else if (typeof this._schema[s] === 'object') {
                    if (Array.isArray(data[s])) {
                        if (data[s].length === 0) {
                            result[this._schema[s]._key] = [];
                        }

                        if (data[s].length > 0) {
                            result[this._schema[s]._key] = data[s].map((d) => this._schema[s].fromServer(d, exclude));
                        }
                    } else {
                        result[this._schema[s]._key] = this._schema[s].fromServer(data[s], exclude);
                    }
                }

                return '';
            });
        }

        return result;
    }

    serialize(data, exclude = []) {
        return this.toServer(data, exclude);
    }

    unserialize(data, exclude = []) {
        return this.fromServer(data, exclude);
    }
}
