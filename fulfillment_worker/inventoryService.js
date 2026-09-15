const {
    BlobServiceClient
} = require("@azure/storage-blob");

require("dotenv").config();

const storageConnectionString =
    process.env.AZURE_STORAGE_CONNECTION_STRING;

const containerName =
    process.env.INVENTORY_CONTAINER || "inventory";

const inventoryBlobName =
    process.env.INVENTORY_BLOB || "inventory.json";

if (!storageConnectionString) {
    throw new Error(
        "AZURE_STORAGE_CONNECTION_STRING is missing"
    );
}

const blobServiceClient =
    BlobServiceClient.fromConnectionString(
        storageConnectionString
    );

const containerClient =
    blobServiceClient.getContainerClient(containerName);

const blockBlobClient =
    containerClient.getBlockBlobClient(inventoryBlobName);

async function streamToString(readableStream) {
    let result = "";

    for await (const chunk of readableStream) {
        result += chunk.toString();
    }

    return result;
}

async function getInventory() {
    const exists = await blockBlobClient.exists();

    if (!exists) {
        throw new Error(
            `Inventory file ${inventoryBlobName} was not found`
        );
    }

    const downloadResponse =
        await blockBlobClient.download(0);

    const inventoryText =
        await streamToString(
            downloadResponse.readableStreamBody
        );

    const inventory = JSON.parse(inventoryText);

    if (!inventory.items) {
        throw new Error(
            "Invalid inventory format: items object is missing"
        );
    }

    return {
        inventory,
        etag: downloadResponse.etag
    };
}

async function saveInventory(inventory, etag) {
    const inventoryText =
        JSON.stringify(inventory, null, 2);

    await blockBlobClient.upload(
        inventoryText,
        Buffer.byteLength(inventoryText),
        {
            overwrite: true,

            blobHTTPHeaders: {
                blobContentType: "application/json"
            },

            conditions: {
                ifMatch: etag
            }
        }
    );
}

async function checkAndReserveStock(
    medicineCode,
    requestedQuantity
) {
    const normalizedMedicineCode =
        String(medicineCode)
            .trim()
            .toUpperCase();

    const quantity = Number(requestedQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return {
            success: false,
            reason: "INVALID_QUANTITY"
        };
    }

    const {
        inventory,
        etag
    } = await getInventory();

    const medicine =
        inventory.items[normalizedMedicineCode];

    if (!medicine) {
        return {
            success: false,
            reason: "MEDICINE_NOT_FOUND",
            medicineCode: normalizedMedicineCode
        };
    }

    const availableQuantity =
        Number(medicine.availableQuantity);

    if (
        !Number.isInteger(availableQuantity) ||
        availableQuantity < 0
    ) {
        throw new Error(
            `Invalid inventory quantity for ${normalizedMedicineCode}`
        );
    }

    if (availableQuantity < quantity) {
        return {
            success: false,
            reason: "OUT_OF_STOCK",
            medicineCode: normalizedMedicineCode,
            medicineName: medicine.medicineName,
            requestedQuantity: quantity,
            availableQuantity
        };
    }

    medicine.availableQuantity =
        availableQuantity - quantity;

    await saveInventory(inventory, etag);

    return {
        success: true,
        medicineCode: normalizedMedicineCode,
        medicineName: medicine.medicineName,
        requestedQuantity: quantity,
        previousQuantity: availableQuantity,
        remainingQuantity:
            medicine.availableQuantity
    };
}

module.exports = {
    getInventory,
    checkAndReserveStock
};
