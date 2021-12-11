const fs = require('fs');

const readdir = async (path) => {
    try {
        return await new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) reject(err);
                resolve(files);
            });
        });
    } catch (error) {
        throw new Error(error);
    }
};

const readFile = async (path) => {
    try {
        return await new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * @summary processes possible uploadable files, returns values to be used when appending keys to FormData. values
 * match the graphql upload specification.
 * @param {object} variables the variables that will be present in the query
 * @param {string} sdl the graphql SDL that will be used for the query
 * @returns {object}
 * @returns {object.operations} JSON object to be used for 'operations' key
 * @returns {object.map} JSON object to be used for 'map' key
 * @returns {object.fileValues} JSON array that stores two elements: index and file, that will also be appended
 */
const returnFormAppenders = (queryVariables, sdl) => {
    /** 'variables' will be evaluated */
    let variables = queryVariables;

    /** 'mapPath' is the path that maps values to 'variables' object */
    let mapPath = 'variables';

    /** If query variables contains a parent 'field' object, we modify both values so that
     * 'variables' can be processed on correctly and 'mapPath' maps to the correct path */
    if (queryVariables.fields) {
        variables = queryVariables.fields;
        mapPath = 'variables.fields';
    }

    /** After performing an evaluation on 'variables' argument through looping, add evaluation results to this variable */
    let vars = {};

    /** After performing specific evalutations on 'variables' argument, increment this counter*/
    let i = 0;

    /** The values to be returned */
    let operations = {};
    let map = {};
    let fileValues = [];

    for (const key in variables) {
        if (Object.hasOwnProperty.call(variables, key)) {
            if (variables[key].isFile) {
                if (variables[key].values.constructor.name === 'Array') {
                } else {
                    /** vars = {fileKeyName: null, ...rest of vars} */
                    vars = { ...vars, [key]: [null] };

                    /** map = {counter: variables.fileKeyName, ... rest of map} */
                    map = { ...map, [i]: [`${mapPath}.${key}`] };

                    /** fileValues = [counter, file] */
                    fileValues = [...fileValues, [i, variables[key].values]];
                    /** Increment counter */
                    i++;
                }
            } else if (
                variables[key].constructor.name === 'Array' &&
                variables[key][0].isFile
            ) {
                variables[key].forEach((file, index) => {
                    /** map = {counter: variables.fileKeyName, ... rest of map} */
                    map = {
                        ...map,
                        [i]: [`${mapPath}.${key}.${index}`],
                    };

                    const varsKey = vars[key] ? [...vars[key]] : [];

                    /** vars = {fileKeyName: null, ...rest of vars} */
                    vars = { ...vars, [key]: [...varsKey, null] };

                    /** fileValues = [counter, file] */
                    fileValues = [...fileValues, [i, file.values]];
                    /** Increment counter */
                    i++;
                });
            } else {
                /** Add the same key:value as it is to 'vars' */
                vars = { ...vars, [key]: variables[key] };
            }
        }
    }

    if (queryVariables.fields)
        operations = { query: sdl, variables: { fields: vars } };
    else operations = { query: sdl, variables: vars };

    return {
        operations: JSON.stringify(operations),
        map: JSON.stringify(map),
        fileValues,
    };
};

module.exports = { returnFormAppenders, readFile, readdir };
