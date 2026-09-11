require("dotenv").config();

const { receiver } = require("./serviceBus");
const { sql, poolPromise } = require("./db");

async function updateStatus(orderId, status) {

    const pool = await poolPromise;

    await pool.request()
        .input("OrderId", sql.VarChar, orderId)
        .input("Status", sql.VarChar, status)
        .query(`
            UPDATE MedicineOrders
            SET Status = @Status
            WHERE OrderId = @OrderId
        `);

    console.log(
        `Order ${orderId} updated to ${status}`
    );
}

async function processMessage(message) {

    try {

        const order = message.body;

        console.log("Received Order:", order);

        await updateStatus(
            order.orderId,
            "PROCESSING"
        );

        await new Promise(resolve =>
            setTimeout(resolve, 5000)
        );

        await updateStatus(
            order.orderId,
            "FULFILLED"
        );

    } catch (error) {

        console.error(
            "Processing Error:",
            error
        );
    }
}

receiver.subscribe({

    processMessage: async (message) => {

        await processMessage(message);
    },

    processError: async (args) => {

        console.error(
            "Service Bus Error:",
            args.error
        );
    }

});

console.log(
    "Fulfillment Worker Listening..."
);
