const API_BASE = "https://apim-capstone-pharma-001.azure-api.net";

async function createOrder() {

    const customerId =
        document.getElementById("customerId").value;

    const customerType =
        document.getElementById("customerType").value;

    const medicineId =
        document.getElementById("medicineId").value;

    const quantity =
        parseInt(document.getElementById("quantity").value);

    const payload = {
        customerId,
        customerType,
        medicineId,
        quantity
    };

    try {

        const response = await fetch(
            `${API_BASE}/orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create order");
        }

        const data = await response.json();

        document.getElementById("createResult").innerHTML = `
            <div class="success">
                ✅ Order Created Successfully
                <br>
                <strong>Order ID:</strong>
                ${data.orderId || data.id || "Generated"}
            </div>
        `;

    } catch (error) {

        console.error(error);

        document.getElementById("createResult").innerHTML = `
            <div class="error">
                ❌ Failed to create order
            </div>
        `;
    }
}

async function trackOrder() {

    const orderId =
        document.getElementById("orderId").value;

    if (!orderId) {
        alert("Please enter Order ID");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/orders/${orderId}`
        );

        if (!response.ok) {
            throw new Error("Order not found");
        }

        const data = await response.json();

        document.getElementById("trackResult").innerHTML = `
            <h3>Order Details</h3>

            <p>
                <strong>Order ID:</strong>
                ${data.orderId}
            </p>

            <p>
                <strong>Customer ID:</strong>
                ${data.customerId}
            </p>

            <p>
                <strong>Medicine ID:</strong>
                ${data.medicineId}
            </p>

            <p>
                <strong>Quantity:</strong>
                ${data.quantity}
            </p>

            <p>
                <strong>Status:</strong>
                ${data.status}
            </p>
        `;

    } catch (error) {

        console.error(error);

        document.getElementById("trackResult").innerHTML = `
            <div class="error">
                ❌ Unable to track order
            </div>
        `;
    }
}

async function getMedicines() {

    try {

        const response = await fetch(
            `${API_BASE}/medicines`
        );

        if (!response.ok) {
            throw new Error("Unable to load medicines");
        }

        const medicines = await response.json();

        let html = `
            <table>
                <tr>
                    <th>Medicine ID</th>
                    <th>Medicine Name</th>
                    <th>Stock</th>
                </tr>
        `;

        medicines.forEach((medicine) => {

            html += `
                <tr>
                    <td>${medicine.medicineId}</td>
                    <td>${medicine.medicineName}</td>
                    <td>${medicine.stock}</td>
                </tr>
            `;
        });

        html += `</table>`;

        document.getElementById("medicineList").innerHTML =
            html;

    } catch (error) {

        console.error(error);

        document.getElementById("medicineList").innerHTML = `
            <div class="error">
                ❌ Failed to load medicines
            </div>
        `;
    }
}
