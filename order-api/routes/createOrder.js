const express = require("express");

const router = express.Router();


const { sql, poolPromise } = require("../db");

const { sendOrderMessage } = require("../serviceBus");


router.post("/", async (req, res) => {


    try {


        const {

            customerType,

            customerId,

            medicineCode,

            quantity

        } = req.body;


        // Generate Order ID automatically

        const orderId = `ORD-${Date.now()}`;


        // Validation

        if (

            !customerType ||

            !customerId ||

            !medicineCode ||

            !quantity ||

            quantity <= 0

        ) {

            return res.status(400).json({

                message: "Invalid Order Request"

            });

        }


        const pool = await poolPromise;


        await pool.request()

            .input("OrderId", sql.VarChar, orderId)

            .input("CustomerType", sql.VarChar, customerType)

            .input("CustomerId", sql.VarChar, customerId)

            .input("MedicineCode", sql.VarChar, medicineCode)

            .input("Quantity", sql.Int, quantity)

            .input("Status", sql.VarChar, "PENDING")

            .query(`

                INSERT INTO MedicineOrders

                (

                    OrderId,

                    CustomerType,

                    CustomerId,

                    MedicineCode,

                    Quantity,

                    Status

                )

                VALUES

                (

                    @OrderId,

                    @CustomerType,

                    @CustomerId,

                    @MedicineCode,

                    @Quantity,

                    @Status

                )

            `);


        const orderMessage = {

            orderId,

            customerType,

            customerId,

            medicineCode,

            quantity,

            status: "PENDING"

        };


        await sendOrderMessage(orderMessage);


        res.status(201).json({

            message: "Order Created",

            orderId,

            status: "PENDING",

            queue: "order-fulfillment"

        });


    } catch (error) {


        console.error("Create Order Error:", error);


        res.status(500).json({

            error: "Internal Server Error"

        });

    }

});


module.exports = router;
