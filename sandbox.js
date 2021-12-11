const graphqlPost = require('./index');
const { resolve } = require('path');

const SDL = `
    mutation TestUpload($images: [Upload!], $name: String, $age: Int) {
            testUpload(images: $images, name: $name, age: $age) {
            code
            success
            message
        }
    }
`;

const url = 'http://localhost:4000/api/graphql';

const variables = {
    name: 'Some name',
    age: 99,
    images: [
        {
            isFile: true,
            path: resolve(__dirname, 'tests/a6806349.JPG'),
        },
        {
            isFile: true,
            path: resolve(__dirname, 'tests/a6806349.JPG'),
        },
        {
            isFile: true,
            path: resolve(__dirname, 'tests/a6806349.JPG'),
        },
    ],
};

(async () => {
    const data = await graphqlPost(SDL, {
        url: url,
        variables: variables,
    });
    console.log({ data });
})();
