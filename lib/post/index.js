const fetch = require('node-fetch');
const FormData = require('form-data');
const { returnFormAppenders, readFile } = require('../helpers');

/**
 * @param {object} vars the variables object that has files that will be have it's files read and parsed
 * @returns {object} returns a modified variables object, with files that store files' buffer value instead of absolute path
 */
const findAndParseFilesInVars = async (vars) => {
    /** Incase submitted variables have a parent "fields" object */
    const variables = vars.fields ? vars.fields : vars;

    let result = {};

    try {
        for (const key in variables) {
            if (Object.hasOwnProperty.call(variables, key)) {
                /** If index is an array and it's first element is an object that has isFile set to true and path value */
                if (
                    variables[key].constructor.name === 'Array' &&
                    variables[key][0].isFile &&
                    variables[key][0].path
                ) {
                    const filesArray = variables[key];

                    const files = [];
                    for (let i = 0; i < filesArray.length; i++) {
                        const fileObject = filesArray[i];
                        const file = await readFile(fileObject.path);
                        /** Since 'path' value is no longer neccassry, replace it with 'values' key that stores the buffer's value */
                        files.push({ isFile: true, values: file });
                    }

                    result = { ...result, [key]: files };
                } /** Else if index is a normal object that has isFile set to true and path value */ else if (
                    variables[key].isFile &&
                    variables[key].path
                ) {
                    const filePath = variables[key].path;
                    const file = await readFile(filePath);

                    /** Since 'path' value is no longer neccassry, replace it with 'values' key that stores the buffer's value */
                    const fileObject = { isFile: true, values: file };
                    result = { ...result, [key]: fileObject };
                } /** Else keep it the same */ else {
                    result = { ...result, [key]: variables[key] };
                }
            }
        }

        /** Incase submitted variables have a parent "fields" object */
        if (vars.fields) return { fields: result };
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * @param {string} sdl the schema definition to be queried from the server
 * @param {object} options
 * @param {object} options.variables the variables to be added to the query.
 * @param {string} options.url the server's URL
 * @param {object} options.headers OPTIONAL. HTTP headers to be included in the request
 * @returns {object} queries data
 */
const graphqlPost = async (sdl, { variables, headers = {}, url } = {}) => {
    try {
        if (!variables) throw 'variables option field cannot be empty';
        if (!url) throw 'url option field must be provided';

        const vars = await findAndParseFilesInVars(variables);

        const { operations, map, fileValues } = returnFormAppenders(vars, sdl);
        const requestBody = new FormData();

        requestBody.append('operations', operations);
        requestBody.append('map', map);

        fileValues.forEach((file) => {
            requestBody.append(file[0], file[1]);
        });

        return new Promise(async (resolve, reject) => {
            const res = await fetch(url, {
                headers,
                method: 'POST',
                body: requestBody,
            });
            const data = await res.json();
            if (data.errors) reject(data.errors);
            if (data.data) resolve(data.data);
            resolve(data);
        });
    } catch (error) {
        // console.error(error);
        throw new Error(error);
    }
};

module.exports = { graphqlPost };
