const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

const orderRoutes = require("./routes/orders");

app.use("/orders", orderRoutes);

app.get("/health", (req, res) => {
    res.json({
        status: "UP"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
