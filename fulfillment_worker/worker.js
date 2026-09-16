require("dotenv").config();
require("./healthServer");

const { receiver } = require("./serviceBus");
const { sql, poolPromise } = require("./db");

const {
    checkAndReserveStock
} = require("./inventoryService");

async function updateStatus(
    orderId,
    status,
    statusMessage = null
) {
    const pool = await poolPromise;

    await pool.request()
        .input("OrderId", sql.VarChar, orderId)
        .input("Status", sql.VarChar, status)
        .input(
            "StatusMessage",
            sql.VarChar,
            statusMessage
        )
        .query(`
            UPDATE MedicineOrders
            SET
                Status = @Status,
                StatusMessage = @StatusMessage
            WHERE OrderId = @OrderId
        `);

    console.log(
        `[SQL] ${orderId} -> ${status}`
    );
}

async function processOrder(message) {

    const order = message.body;

    try {

        console.log(
            "[RECEIVED]",
            order
        );

        await updateStatus(
            order.orderId,
            "PROCESSING",
            "Inventory validation started"
        );

        const stockResult =
            await checkAndReserveStock(
                order.medicineCode,
                order.quantity
            );

        console.log(
            "[INVENTORY RESULT]",
            stockResult
        );

        if (!stockResult.success) {

            let cancellationReason =
                "UNKNOWN_ERROR";

            if (
                stockResult.reason ===
                "MEDICINE_NOT_FOUND"
            ) {

                cancellationReason =
                    `MEDICINE_NOT_FOUND: ${order.medicineCode}`;
            }

            else if (
                stockResult.reason ===
                "OUT_OF_STOCK"
            ) {

                cancellationReason =
                    `OUT_OF_STOCK: requested ${order.quantity}, available ${stockResult.availableQuantity}`;
            }

            else if (
                stockResult.reason ===
                "INVALID_QUANTITY"
            ) {

                cancellationReason =
                    `INVALID_QUANTITY: ${order.quantity}`;
            }

            await updateStatus(
                order.orderId,
                "CANCELLED",
                cancellationReason
            );

            console.log(
                `[CANCELLED] ${order.orderId} - ${cancellationReason}`
            );

            return;
        }

        await updateStatus(
            order.orderId,
            "FULFILLED",
            `Medicine allocated successfully. Remaining stock: ${stockResult.remainingQuantity}`
        );

        console.log(
            `[FULFILLED] ${order.orderId}`
        );

    } catch (error) {

        console.error(
            `[ERROR] ${order.orderId}`,
            error
        );

        await updateStatus(
            order.orderId,
            "FAILED",
            error.message
        );
    }
}

receiver.subscribe(
{
    processMessage: async (
        message
    ) => {

        await processOrder(
            message
        );
    },

    processError: async (
        args
    ) => {

        console.error(
            "[SERVICE BUS ERROR]",
            args.error
        );
    }

},
{
    maxConcurrentCalls: 1
});

console.log(
    "Fulfillment Worker Listening..."
);
