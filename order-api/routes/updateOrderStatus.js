const express = require("express");

const router = express.Router();


const { sql, poolPromise } = require("../db");


router.put("/:orderId/status", async (req, res) => {


    try {


        const { status } = req.body;


        const pool = await poolPromise;


        const result = await pool.request()

            .input("OrderId", sql.VarChar, req.params.orderId)

            .input("Status", sql.VarChar, status)

            .query(`

                UPDATE MedicineOrders

                SET Status = @Status

                WHERE OrderId = @OrderId

            `);


        if (result.rowsAffected[0] === 0) {


            return res.status(404).json({

                message: "Order Not Found"

            });

        }


        res.json({

            message: "Status Updated",

            orderId: req.params.orderId,

            status

        });


    } catch (error) {


        console.error(error);


        res.status(500).json({

            error: "Internal Server Error"

        });

    }

});


module.exports = router;
