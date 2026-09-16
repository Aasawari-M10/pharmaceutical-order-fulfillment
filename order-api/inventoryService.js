const {

    BlobServiceClient

} = require("@azure/storage-blob");


require("dotenv").config();


const blobServiceClient =

    BlobServiceClient.fromConnectionString(

        process.env.AZURE_STORAGE_CONNECTION_STRING

    );


const containerClient =

    blobServiceClient.getContainerClient(

        process.env.INVENTORY_CONTAINER

    );
console.log("Storage String Exists:", !!storageConnectionString);
console.log("Container Name:", containerName);
console.log("Inventory Blob:", inventoryBlobName);
const blobClient =

    containerClient.getBlockBlobClient(

        process.env.INVENTORY_BLOB

    );


async function streamToString(

    readableStream

) {

    let data = "";


    for await (const chunk of readableStream) {

        data += chunk.toString();

    }


    return data;

}


async function getInventory() {


    const response =

        await blobClient.download();


    const content =

        await streamToString(

            response.readableStreamBody

        );


    return JSON.parse(content);

}


module.exports = {

    getInventory

};
 
