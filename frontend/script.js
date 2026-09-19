const API_BASE = "https://apim-capstone-pharma-001.azure-api.net/orders";

async function createOrder() {

    const customerId =
        document.getElementById("customerId").value;

    const customerType =
        document.getElementById("customerType").value;

    const medicineCode =
        document.getElementById("medicineCode").value;

    const quantity =
        parseInt(document.getElementById("quantity").value);

    const payload = {
        customerType,
        customerId,
        medicineCode,
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create order");
        }

        document.getElementById("createResult").innerHTML = `
            <div class="success">
                ✅ Order Created Successfully
                <br>
                <strong>Order ID:</strong> ${data.orderId}
                <br>
                <strong>Status:</strong> ${data.status}
            </div>
        `;

    } catch (error) {

        console.error(error);

        document.getElementById("createResult").innerHTML = `
            <div class="error">
                ❌ ${error.message}
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Order not found");
        }

        document.getElementById("trackResult").innerHTML = `
            <h3>Order Details</h3>

            <p><strong>Order ID:</strong> ${data.orderId}</p>

            <p><strong>Customer ID:</strong> ${data.customerId}</p>

            <p><strong>Medicine Code:</strong> ${data.medicineCode}</p>

            <p><strong>Quantity:</strong> ${data.quantity}</p>

            <p><strong>Status:</strong> ${data.status}</p>
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

        const medicines = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load medicines");
        }

        let html = `
            <table>
                <tr>
                    <th>Medicine Code</th>
                    <th>Medicine Name</th>
                    <th>Stock</th>
                </tr>
        `;

        medicines.forEach((medicine) => {

            html += `
                <tr>
                    <td>${medicine.medicineCode}</td>
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
