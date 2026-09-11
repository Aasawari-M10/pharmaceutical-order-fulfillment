const { ServiceBusClient } = require("@azure/service-bus");
require("dotenv").config();

const connectionString =
    process.env.SERVICE_BUS_CONNECTION_STRING;

const queueName =
    process.env.SERVICE_BUS_QUEUE;

const sbClient =
    new ServiceBusClient(connectionString);

const receiver =
    sbClient.createReceiver(queueName);

module.exports = {
    receiver
};
