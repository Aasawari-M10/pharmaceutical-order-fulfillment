const { ServiceBusClient } = require("@azure/service-bus");
require("dotenv").config();

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const queueName = process.env.SERVICE_BUS_QUEUE;

async function sendOrderMessage(order) {

    const client = new ServiceBusClient(connectionString);

    const sender = client.createSender(queueName);

    try {

        await sender.sendMessages({
            body: order
        });

        console.log("Message sent to Service Bus");

    } finally {

        await sender.close();
        await client.close();
    }
}

module.exports = {
    sendOrderMessage
};
