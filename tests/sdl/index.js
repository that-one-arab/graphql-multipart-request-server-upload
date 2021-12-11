/** I created a testing graphql server with the below mutations */

module.exports = {
    uploadImageSDL: `
        mutation uploadImageSDL($image: Upload) {
                testUpload(image: $image) {
                code
                success
                message
            }
        }
    `,

    uploadImageWithInfoSDL: `
        mutation TestUpload($image: Upload, $name: String, $age: Int) {
                testUpload(image: $image, name: $name, age: $age) {
                code
                success
                message
            }
        }
    `,

    uploadImagesSDL: `
        mutation TestUpload($images: [Upload!]) {
                testUpload(images: $images) {
                code
                success
                message
            }
        }
    `,

    uploadImagesWithInfoSDL: `
        mutation TestUpload($images: [Upload!], $name: String, $age: Int, $image: Upload) {
                testUpload(images: $images, name: $name, age: $age, image: $image) {
                code
                success
                message
            }
        }
    `,

    uploadImagesWfields: `
        mutation TestUploadWfields($fields: TestUploadFields) {
                testUploadWfields(fields: $fields) {
                code
                message
                success
            }
        }
    `,
};
