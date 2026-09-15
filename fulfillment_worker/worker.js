require("dotenv").config();

const { receiver } = require("./serviceBus");
const { sql, poolPromise } = require("./db");

const {
    checkAndReserveStock
} = require("./inventoryService");

const delay = (ms) =>
    new Promise(resolve =>
        setTimeout(resolve, ms)
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
            `Priority: ${order.priority}`
        );

        /*
         * PRIORITY CHECK FIRST
         */

        let processingDelay = 10000;

        const priority =
            String(
                order.priority || "NORMAL"
            ).toUpperCase();

        if (
            priority === "URGENT"
        ) {

            processingDelay = 2000;
        }

        console.log(
            `[PRIORITY] ${order.orderId} = ${priority}`
        );

        console.log(
            `[WAIT] ${order.orderId} sleeping for ${processingDelay} ms`
        );

        await delay(
            processingDelay
        );

        /*
         * INVENTORY CHECK AFTER PRIORITY DELAY
         */

        const stockResult =
            await checkAndReserveStock(
                order.medicineCode,
                order.quantity
            );

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
         * ORDER FULFILLED
         */

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
