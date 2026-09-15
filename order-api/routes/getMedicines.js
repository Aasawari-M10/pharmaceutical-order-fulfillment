const express = require("express");

const router = express.Router();

const {
    getInventory
} = require("../inventoryService");

router.get("/medicines", async (req, res) => {

    try {

        const inventory =
            await getInventory();

        const medicines =
            Object.entries(
                inventory.items
            ).map(
                ([medicineCode, medicine]) => ({

                    medicineCode,

                    medicineName:
                        medicine.medicineName
                })
            );

        res.status(200).json(
            medicines
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Unable to fetch medicines"
        });
    }
});

module.exports = router;
