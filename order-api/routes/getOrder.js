const express = require("express");

const router = express.Router();


const { sql, poolPromise } = require("../db");


router.get("/:orderId", async (req, res) => {


    try {


        const pool = await poolPromise;


        const result = await pool.request()

            .input("OrderId", sql.VarChar, req.params.orderId)

            .query(`

                SELECT *

                FROM MedicineOrders

                WHERE OrderId = @OrderId

            `);


        if (result.recordset.length === 0) {


            return res.status(404).json({

                message: "Order Not Found"

            });

        }


        res.json(result.recordset[0]);


    } catch (error) {


        console.error(error);


        res.status(500).json({

            error: "Internal Server Error"

        });

    }

});


module.exports = router;
 
