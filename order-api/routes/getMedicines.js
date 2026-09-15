const express = require("express");

const router = express.Router();

const {
    getInventory
} = require("../inventoryService");

router.get("/medicines", async (
    req,
    res
) => {

    try {

        const inventory =
            await getInventory();

        const medicines =
            Object.entries(
                inventory.items
            ).map(
                ([code, medicine]) => ({

                    medicineCode: code,

                    medicineName:
                        medicine.medicineName,

                    strength:
                        medicine.strength,

                    form:
                        medicine.form,

                    availableQuantity:
                        medicine.availableQuantity
                })
            );

        res.status(200).json(
            medicines
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Unable to retrieve medicines"
        });
    }
});

module.exports = router;
