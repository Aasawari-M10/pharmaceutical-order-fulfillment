require("dotenv").config();

const { receiver } = require("./serviceBus");
const { sql, poolPromise } = require("./db");

const {
    checkAndReserveStock
} = require("./inventoryService");

const delay = (milliseconds) =>
    new Promise(resolve =>
        setTimeout(resolve, milliseconds)
    );

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
        `Order ${orderId} updated to ${status}`
    );
}

async function processOrder(message) {

    try {

        const order = message.body;

        console.log(
            "Received Order:",
            order
        );

        await updateStatus(
            order.orderId,
            "PROCESSING",
            `Priority: ${order.priority}`
        );

        const stockResult =
            await checkAndReserveStock(
                order.medicineCode,
                order.quantity
            );

        /*
         * Inventory Validation
         */

        if (!stockResult.success) {

            if (
                stockResult.reason ===
                "MEDICINE_NOT_FOUND"
            ) {

                await updateStatus(
                    order.orderId,
                    "CANCELLED",
                    "MEDICINE_NOT_FOUND"
                );

                return;
            }

            if (
                stockResult.reason ===
                "OUT_OF_STOCK"
            ) {

                await updateStatus(
                    order.orderId,
                    "CANCELLED",
                    `OUT_OF_STOCK: requested ${order.quantity}, available ${stockResult.availableQuantity}`
                );

                return;
            }

            if (
                stockResult.reason ===
                "INVALID_QUANTITY"
            ) {

                await updateStatus(
                    order.orderId,
                    "CANCELLED",
                    "INVALID_QUANTITY"
                );

                return;
            }
        }

        /*
         * Priority Business Logic
         *
         * URGENT  -> 2 seconds
         * NORMAL  -> 10 seconds
         */

        let processingDelay = 10000;

        if (
            order.priority &&
            order.priority.toUpperCase() ===
            "URGENT"
        ) {

            processingDelay = 2000;

            console.log(
                `URGENT Order ${order.orderId} detected`
            );
        }

        console.log(
            `Processing Order ${order.orderId} for ${processingDelay / 1000} seconds`
        );

        await delay(processingDelay);

        /*
         * Fulfillment Completed
         */

        await updateStatus(
            order.orderId,
            "FULFILLED",
            `Medicine allocated successfully. Remaining stock: ${stockResult.remainingQuantity}`
        );

        console.log(
            `Order ${order.orderId} fulfilled successfully`
        );

    } catch (error) {

        console.error(
            "Processing Error:",
            error
        );
    }
}

receiver.subscribe({

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
            "Service Bus Error:",
            args.error
        );
    }

});

console.log(
    "Fulfillment Worker Listening..."
);
