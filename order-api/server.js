const express = require("express");

const app = express();

app.use(express.json());

app.use("/orders", require("./routes/createOrder"));
app.use("/orders", require("./routes/getOrder"));
app.use("/orders", require("./routes/updateOrderStatus"));
app.use("/orders", require("./routes/getOrdersByStatus"));

app.get("/health", (req, res) => {

    res.json({
        status: "UP"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
});
