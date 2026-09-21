const express = require("express");

const router = express.Router();

const { sql, poolPromise } = require("../db");
const { sendOrderMessage } = require("../serviceBus");
const { getInventory } = require("../inventoryService");


router.post("/", async (req, res) => {

    try {

        // Frontend sends ONLY these two fields
        const {
            medicineCode,
            quantity
        } = req.body;


        // Get logged-in user's Entra Object ID from JWT
        const entraObjectId = req.user.oid;


        // Validate request
        if (
            !entraObjectId ||
            !medicineCode ||
            !quantity ||
            quantity <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Order Request"
            });

        }


        const pool = await poolPromise;


        // --------------------------------------------------
        // CHECK MEDICINE IN INVENTORY
        // --------------------------------------------------

        const inventory = await getInventory();

        // Remove extra spaces and make medicine code uppercase
        const normalizedMedicineCode =
            String(medicineCode).trim().toUpperCase();


        // Check whether medicine exists in inventory
        const medicine =
            inventory.items[normalizedMedicineCode];


        if (!medicine) {

            return res.status(400).json({
                message:
                    `Medicine ${normalizedMedicineCode} is not available in inventory.`
            });

        }


        // --------------------------------------------------
        // FIND CUSTOMER ASSOCIATED WITH LOGGED-IN USER
        // --------------------------------------------------

        const customerResult = await pool.request()

            .input(
                "EntraObjectId",
                sql.VarChar,
                entraObjectId
            )

            .query(`
                SELECT
                    CustomerId,
                    CustomerType
                FROM CustomerUsersF
                WHERE EntraObjectId = @EntraObjectId
            `);


        // User is authenticated but not registered
        if (customerResult.recordset.length === 0) {

            return res.status(403).json({
                message:
                    "User is not registered with a customer organization"
            });

        }


        // Get customer information
        const customer = customerResult.recordset[0];

        const customerId = customer.CustomerId;
        const customerType = customer.CustomerType;


        // --------------------------------------------------
        // GENERATE ORDER ID
        // --------------------------------------------------

        const orderId = `ORD-${Date.now()}`;


        // --------------------------------------------------
        // INSERT ORDER INTO DATABASE
        // --------------------------------------------------

        await pool.request()

            .input(
                "OrderId",
                sql.VarChar,
                orderId
            )

            .input(
                "CustomerType",
                sql.VarChar,
                customerType
            )

            .input(
                "CustomerId",
                sql.VarChar,
                customerId
            )

            .input(
                "MedicineCode",
                sql.VarChar,
                normalizedMedicineCode
            )

            .input(
                "Quantity",
                sql.Int,
                quantity
            )

            .input(
                "Status",
                sql.VarChar,
                "PENDING"
            )

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


        // --------------------------------------------------
        // SEND MESSAGE TO SERVICE BUS
        // --------------------------------------------------

        const orderMessage = {

            orderId,

            customerType,

            customerId,

            medicineCode: normalizedMedicineCode,

            quantity,

            status: "PENDING"

        };


        await sendOrderMessage(orderMessage);


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

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
