const { graphqlPost } = require('../lib/post/index.js');
const { uploadSingleSDL } = require('./sdl');
const { resolve } = require('path');
const startServer = require('./server');

const url = 'http://localhost:4000/graphql';

let apolloServer;

beforeAll(async () => {
    apolloServer = await startServer();
});

describe('Graphql multipart/form-data uploading', () => {
    it('Successfuly sends and saves a file in the server', async () => {
        const inputVariables = {
            file: { isFile: true, path: resolve(__dirname, 'a6806349.JPG') },
        };

        const data = await graphqlPost(uploadSingleSDL, {
            variables: inputVariables,
            url,
        });
        expect(data.singleUpload);
        expect(data.singleUpload.success).toEqual(true);
    });
});
