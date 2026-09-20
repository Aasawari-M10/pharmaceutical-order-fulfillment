const express = require("express");

const app = express();

const authenticateToken = require("./middleware/auth");

app.use(express.json());

app.use(
    "/orders",
    authenticateToken,
    require("./routes/createOrder")
);

app.use(
    "/orders",
    authenticateToken,
    require("./routes/getOrder")
);

app.use(
    "/orders",
    authenticateToken,
    require("./routes/updateOrderStatus")
);

app.use(
    "/orders",
    authenticateToken,
    require("./routes/getOrdersByStatus")
);

app.use(
    "/",
    require("./routes/getMedicines")
);

app.get("/health", (req, res) => {

    res.json({
        status: "UP"
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});
