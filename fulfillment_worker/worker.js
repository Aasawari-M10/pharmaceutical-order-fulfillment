require("dotenv").config();

const { receiver } = require("./serviceBus");
const { sql, poolPromise } = require("./db");

const {
    checkAndReserveStock
} = require("./inventoryService");

const delay = milliseconds =>
    new Promise(resolve =>
        setTimeout(resolve, milliseconds)
    );

async function updateStatus(
    orderId,
    status,
    statusMessage = null
) {
    const pool = await poolPromise;

    if (!pool) {
        throw new Error(
            "Azure SQL connection is unavailable"
        );
    }

    const result = await pool.request()
        .input(
            "OrderId",
            sql.VarChar(30),
            orderId
        )
        .input(
            "Status",
            sql.VarChar(30),
            status
        )
        .input(
            "StatusMessage",
            sql.VarChar(200),
            statusMessage
        )
        .query(`
            UPDATE MedicineOrders
            SET
                Status = @Status,
                StatusMessage = @StatusMessage
            WHERE OrderId = @OrderId
        `);

    if (result.rowsAffected[0] === 0) {
        throw new Error(
            `Order ${orderId} was not found`
        );
    }

    console.log(
        `Order ${orderId} updated to ${status}`
    );

    if (statusMessage) {
        console.log(
            `Status message: ${statusMessage}`
        );
    }
}

function validateQueueMessage(order) {
    if (!order) {
        return "Message body is missing";
    }

    if (!order.orderId) {
        return "orderId is missing";
    }

    if (!order.medicineCode) {
        return "medicineCode is missing";
    }

    const quantity = Number(order.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return "quantity must be a positive integer";
    }

    return null;
}

async function processOrder(message) {
    const order = message.body;

    const validationError =
        validateQueueMessage(order);

    if (validationError) {
        throw new Error(
            `Invalid Service Bus message: ${validationError}`
        );
    }

    const orderId =
        String(order.orderId).trim();

    const medicineCode =
        String(order.medicineCode)
            .trim()
            .toUpperCase();

    const quantity =
        Number(order.quantity);

    console.log("Received order:", {
        orderId,
        medicineCode,
        quantity
    });

    /*
     * The order is already PENDING because the Order API
     * inserted it into Azure SQL.
     */

    await updateStatus(
        orderId,
        "PROCESSING",
        "Checking medicine inventory"
    );

    const stockResult =
        await checkAndReserveStock(
            medicineCode,
            quantity
        );

    if (!stockResult.success) {
        if (
            stockResult.reason ===
            "MEDICINE_NOT_FOUND"
        ) {
            await updateStatus(
                orderId,
                "CANCELLED",
                `MEDICINE_NOT_FOUND: ${medicineCode} ` +
                "does not exist in inventory"
            );

            console.log(
                `Order ${orderId} cancelled because ` +
                `${medicineCode} was not found`
            );

            return;
        }

        if (
            stockResult.reason ===
            "OUT_OF_STOCK"
        ) {
            await updateStatus(
                orderId,
                "CANCELLED",
                `OUT_OF_STOCK: requested ${quantity}, ` +
                `available ${stockResult.availableQuantity}`
            );

            console.log(
                `Order ${orderId} cancelled due to ` +
                "insufficient stock"
            );

            return;
        }

        if (
            stockResult.reason ===
            "INVALID_QUANTITY"
        ) {
            await updateStatus(
                orderId,
                "CANCELLED",
                "INVALID_QUANTITY"
            );

            return;
        }

        throw new Error(
            `Unhandled inventory result for order ${orderId}`
        );
    }

    console.log(
        `Stock reserved for ${orderId}:`,
        {
            medicineCode:
                stockResult.medicineCode,

            medicineName:
                stockResult.medicineName,

            requestedQuantity:
                stockResult.requestedQuantity,

            remainingQuantity:
                stockResult.remainingQuantity
        }
    );

    /*
     * Simulated medicine allocation and fulfillment.
     */
    await delay(5000);

    await updateStatus(
        orderId,
        "FULFILLED",
        `Medicine allocated successfully. ` +
        `Remaining stock: ${stockResult.remainingQuantity}`
    );

    console.log(
        `Order ${orderId} fulfilled successfully`
    );
}

const subscription = receiver.subscribe({
    processMessage: async message => {
        try {
            await processOrder(message);
        } catch (error) {
            console.error(
                "Order processing failed:",
                error
            );

            /*
             * Re-throw the error.
             * Service Bus will treat processing as failed
             * instead of silently completing the message.
             */
            throw error;
        }
    },

    processError: async args => {
        console.error(
            "Service Bus receiver error:",
            args.error
        );
    }
});

async function shutdown() {
    console.log(
        "Stopping Fulfillment Worker..."
    );

    await subscription.close();
    await receiver.close();

    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(
    "Fulfillment Worker Listening..."
);
