# graphql-multipart-request-server-upload

#### A library that provides users with an easy way to test and upload files to a Graphql server while meeting the Graphql multipart request upload specifications.

###### [mutlipart upload spec](https://projects.eoas.muhammed-aldulaimi.com/)

### Installation:

`$ npm i`

### Examples:

#### Single file upload:

```js
const graphqlPost = require('./index');
const { resolve } = require('path');

const SDL = `
    mutation TestUpload($image: Upload, $name: String, $age: Int) {
            testUpload(image: $image, name: $name, age: $age) {
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
    image: {
        isFile: true,
        path: resolve(__dirname, 'image.JPG'),
    },
};

(async () => {
    const data = await graphqlPost(SDL, {
        url: url,
        variables: variables,
    });
    console.log({ data });
})();
```

#### Multiple files upload:

```js
const graphqlPost = require('./index');
const { resolve } = require('path');

const SDL = `
    mutation TestUpload($files: [Upload!], $name: String, $age: Int) {
            testUpload(files: $files, name: $name, age: $age) {
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
    files: [
        {
            isFile: true,
            path: resolve(__dirname, 'image1.JPG'),
        },
        {
            isFile: true,
            path: resolve(__dirname, 'image2.JPG'),
        },
        {
            isFile: true,
            path: resolve(__dirname, 'image3.JPG'),
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
```

#### With graphql input types:

```js
const graphqlPost = require('./index');
const { resolve } = require('path');

const SDL = `
    mutation TestUpload($fields: YourCustomGraphqlInputType) {
            testUpload(fields: $fields) {
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
    files: [
        {
            isFile: true,
            path: resolve(__dirname, 'image1.JPG'),
        },
        {
            isFile: true,
            path: resolve(__dirname, 'image2.JPG'),
        },
        {
            isFile: true,
            path: resolve(__dirname, 'image3.JPG'),
        },
    ],
};

(async () => {
    const data = await graphqlPost(SDL, {
        url: url,
        variables: { fields: variables },
    });
    console.log({ data });
})();
```

### How it works

the main function exported from the package

```js
const graphqlPost = require('./index');
```

Is the one that handles sending a multipart/form-data request to the graphql server, **and it returns a promise**.

The first argument is the **SDL** to be used in the query

```js
await graphqlPost(SDL);
```

The second argument is an **options object**, it takes 3 fields: **url**, **variables** and **headers**

```js
await graphqlPost(SDL, {
    url,
    variables,
    headers,
});
```

| field     | type   | required/optional | description                                                 |
| --------- | ------ | ----------------- | ----------------------------------------------------------- |
| url       | string | required          | Graphql server's URL                                        |
| variables | object | required          | An object that stores the variables to be used in the query |
| headers   | object | optional          | HTTP headers to be included in the request                  |

The variables object is used to dynamically add information to a query

```js
const SDL = `
    mutation uploadToServer($image: Upload, $name: String, $age: Int) {
            upload(image: $image, name: $name, age: $age) {
            code
            success
            message
        }
    }
`;

const variables = {
    name: 'Some name',
    age: 'Some age',
    image: '',
};
```

in order to upload a file, we need to give the **file field an object**, that object would store two fields: **isFile and path**

```js
const SDL = `
    mutation uploadToServer($image: Upload, $name: String, $age: Int) {
            upload(image: $image, name: $name, age: $age) {
            code
            success
            message
        }
    }
`;

const variables = {
    name: 'Some name',
    age: 'Some age',
    image: {
        isFile: true,
        path: 'path/to/file',
    },
};
```

in the case of multiple files, we do the same thing but we store our **objects** in an **array**

```js
const SDL = `
    mutation uploadToServer($images: [Upload!], $name: String, $age: Int) {
            upload(images: $images, name: $name, age: $age) {
            code
            success
            message
        }
    }
`;

const variables = {
    name: 'Some name',
    age: 'Some age',
    images: [
        {
            isFile: true,
            path: 'path/to/file',
        },
        {
            isFile: true,
            path: 'path/to/file',
        },
        {
            isFile: true,
            path: 'path/to/file',
        },
    ],
};
```

**The path field must be an absolute path to where the file is stored (useing nodejs \_\_dirname var and path.resolve is recommended)**.

The function handles correctly parsing the variables object, by looking for fields that store an object and that object stores **isFile** and **path** fields, or fields that store an array which store said objects. It reads the data as a buffer, creates a **formData** instance, then handles formatting correct key-value pairs to be appended to the created formdata, finally it sends an HTTP multipart/form-data request and returns the sent data.

### Possible issues

The library sends the data as a buffer, but the server-side graphql multipart/form-data upload specification parses it as a stream. Once the server receives the data, the data's mimetype is **application/octet-stream**, and the filename is **undefined**
Nevertheless, when creating a write stream, if you give the correct file extension during piping and a randomly generated name for the file (using a random id generator library is an option), the file is would be saved and accessed without any issue.
I haven't found a way to correctly append the data's mimetype or the filename to the formdata. I welcome any PRs that solves the issue.
But for a temporary workaround, you could use the NPM [FileType](https://www.npmjs.com/package/file-type) library that detects the mimetype of the file. Something like this:

```js
const FileType = require('file-type');

(async () => {
    const {
        createReadStream,
        filename: fname,
        mimetype,
        encoding,
    } = await file;

    const fileType = await FileType.fromStream(stream);
    const extension = fileType.ext;
})();
```

### Thank you for reading!
