const express = require('express');
const fs = require('fs');
const { ApolloServer, gql } = require('apollo-server-express');
const FileType = require('file-type');
const {
    GraphQLUpload,
    graphqlUploadExpress, // A Koa implementation is also exported.
} = require('graphql-upload');
const { finished } = require('stream/promises');
const path = require('path');

const typeDefs = gql`
    scalar Upload

    type Response {
        success: Boolean!
    }

    type Query {
        # This is only here to satisfy the requirement that at least one
        # field be present within the 'Query' type.
        otherFields: Boolean!
    }

    type Mutation {
        singleUpload(file: Upload!): Response
    }
`;

const resolvers = {
    // This maps the `Upload` scalar to the implementation provided
    // by the `graphql-upload` package.
    Upload: GraphQLUpload,

    Mutation: {
        // singleUpload: async (parent, { file }) => {
        //     try {
        //         const { createReadStream, filename, mimetype, encoding } =
        //             await file;

        //         const readStream = createReadStream();

        //         const fileType = await FileType.fromStream(readStream);
        //         const extension = fileType.ext;
        //         console.log({ extension });

        //         const randomFileName = Math.floor(1000 + Math.random() * 9000);
        //         console.log({ randomFileName });

        //         const filePath = path.resolve(
        //             __dirname,
        //             'images',
        //             'local-file-output.jpg'
        //         );

        //         await new Promise((resolve, reject) => {
        //             // Create a stream to which the upload will be written.
        //             const writeStream = fs.createWriteStream(filePath);

        //             // When the upload is fully written, resolve the promise.
        //             writeStream.on('finish', async (data) => {
        //                 resolve(data);
        //             });

        //             writeStream.on('error', (error) => {
        //                 console.error(error);
        //                 reject(error);
        //             });

        //             // In Node.js <= v13, errors are not automatically propagated between piped
        //             // streams. If there is an error receiving the upload, destroy the write
        //             // stream with the corresponding error.
        //             readStream.on('error', (error) => {
        //                 console.error(error);
        //                 writeStream.destroy(error);
        //             });

        //             // Pipe the upload into the write stream.
        //             readStream.pipe(writeStream);
        //         });

        //         console.log('finished');

        //         return { success: true };
        //     } catch (error) {
        //         console.error(error);
        //         return {
        //             success: false,
        //         };
        //     }
        // },
        singleUpload: async (parent, { file }) => {
            try {
                const { createReadStream, filename, mimetype, encoding } =
                    await file;

                const readStream = createReadStream();

                const extension = await new Promise(async (r) => {
                    const fileType = await FileType.fromStream(readStream);
                    console.log({ fileType });
                    const extension = fileType.ext;
                    console.log({ extension });
                    r(fileType.ext);
                });

                const randomFileName = Math.floor(1000 + Math.random() * 9000);

                const filePath = path.resolve(
                    __dirname,
                    'images',
                    'local-file-output.jpg'
                );
                const out = require('fs').createWriteStream(filePath);
                readStream.pipe(out);
                // finished(out);

                return { success: true };
            } catch (error) {
                console.log(error);
                return { success: false };
            }
        },
    },
};

async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });
    await server.start();

    const app = express();

    // This middleware should be added before calling `applyMiddleware`.
    app.use(graphqlUploadExpress());

    server.applyMiddleware({ app });

    await new Promise((r) => app.listen({ port: 4000 }, r));

    console.log(
        `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
}

module.exports = startServer;
