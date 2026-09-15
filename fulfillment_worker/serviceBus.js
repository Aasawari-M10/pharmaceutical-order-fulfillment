const {

    ServiceBusClient

} = require("@azure/service-bus");


require("dotenv").config();


const connectionString =

    process.env.SERVICE_BUS_CONNECTION_STRING;


const queueName =

    process.env.SERVICE_BUS_QUEUE;


if (!connectionString) {

    throw new Error(

        "SERVICE_BUS_CONNECTION_STRING is missing"

    );

}


if (!queueName) {

    throw new Error(

        "SERVICE_BUS_QUEUE is missing"

    );

}


const serviceBusClient =

    new ServiceBusClient(connectionString);


const receiver =

    serviceBusClient.createReceiver(queueName);


module.exports = {

    receiver,

    serviceBusClient

};
 
