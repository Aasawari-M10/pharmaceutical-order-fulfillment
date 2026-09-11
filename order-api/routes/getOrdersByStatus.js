const express = require("express");
const router = express.Router();

const { sql, poolPromise } = require("../db");

router.get("/", async (req, res) => {

    try {

        const status = req.query.status;

        const pool = await poolPromise;

        const result = await pool.request()
            .input("Status", sql.VarChar, status)
            .query(`
                SELECT *
                FROM MedicineOrders
                WHERE Status = @Status
            `);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

module.exports = router;
