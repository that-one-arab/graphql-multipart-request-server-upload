const { graphqlPost } = require('../lib/post/index.,js');
const {
    uploadImageWithInfoSDL,
    uploadImageSDL,
    uploadImagesSDL,
    uploadImagesWithInfoSDL,
    uploadImagesWfields,
} = require('./sdl');
const { resolve } = require('path');

const url = 'http://localhost:4000/api/graphql';

describe('Graphql multipart/form-data uploading', () => {
    it('Successfuly sends a request with an image and other static fields to a graphql server', async () => {
        const inputVariables = {
            name: 'Michelle',
            age: 23,
            image: { isFile: true, path: resolve(__dirname, 'a6806349.JPG') },
        };

        const data = await graphqlPost(uploadImageWithInfoSDL, {
            variables: inputVariables,
            url,
        });
        expect(data.testUpload);
        expect(data.testUpload.code).toEqual('200');
        expect(data.testUpload.success).toEqual(true);
    });

    it('Successfuly sends a request with only one image to a graphql server', async () => {
        const inputVariables = {
            image: { isFile: true, path: resolve(__dirname, 'a6806349.JPG') },
        };

        const data = await graphqlPost(uploadImageSDL, {
            variables: inputVariables,
            url,
        });
        expect(data.testUpload);
        expect(data.testUpload.code).toEqual('200');
        expect(data.testUpload.success).toEqual(true);
    });

    it('Successfuly sends a request with only multiple images to a graphql server', async () => {
        const inputVariables = {
            images: [
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
            ],
        };

        const data = await graphqlPost(uploadImagesSDL, {
            variables: inputVariables,
            url,
        });
        expect(data.testUpload);
        expect(data.testUpload.code).toEqual('200');
        expect(data.testUpload.success).toEqual(true);
    });

    it('Successfuly sends a request with multiple images and other static fields to a graphql server', async () => {
        const inputVariables = {
            name: 'Michelle',
            age: 23,
            images: [
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
            ],
        };

        const data = await graphqlPost(uploadImagesWithInfoSDL, {
            variables: inputVariables,
            url,
        });
        expect(data.testUpload);
        expect(data.testUpload.code).toEqual('200');
        expect(data.testUpload.success).toEqual(true);
    });

    it('Successfuly sends a request with a parent "fields" object that includes mutliple images and other static fields to a server', async () => {
        const inputVariables = {
            name: 'Michelle',
            age: 23,
            images: [
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
                {
                    isFile: true,
                    path: resolve(__dirname, 'a6806349.JPG'),
                },
            ],
        };

        const data = await graphqlPost(uploadImagesWfields, {
            variables: { fields: inputVariables },
            url,
        });
        expect(data.testUploadWfields);
        expect(data.testUploadWfields.code).toEqual('200');
        expect(data.testUploadWfields.success).toEqual(true);
    });
});
