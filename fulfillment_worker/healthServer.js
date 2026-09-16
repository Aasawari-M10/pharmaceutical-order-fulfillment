const express = require("express");

const app = express();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.status(200).json({
        service: "fulfillment-worker",
        status: "RUNNING"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "fulfillment-worker",
        status: "UP"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Fulfillment Worker health server running on port ${PORT}`
    );
});
