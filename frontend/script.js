/*
 * ============================================================
 * PHARMAFLOW FRONTEND
 * Microsoft Entra External ID + JWT
 * ============================================================
 */


/* ============================================================
   1. CONFIGURATION
   ============================================================ */

const API_BASE =
    "https://apim-capstone-pharma-001.azure-api.net/orders";


const msalConfig = {
    auth: {
        clientId:
            "9b0384a4-878b-4d9b-b8db-9e4f28622b2c",

        authority:
            "https://pharmaordercustomers2026.ciamlogin.com/bc709ab2-033c-47ac-8af2-baa9ae6e645a",

        knownAuthorities: [
            "pharmaordercustomers2026.ciamlogin.com"
        ],

        redirectUri: window.location.origin
    },

    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};


const loginRequest = {
    scopes: [
        "api://bdee7642-ca76-4f25-bf6b-0fe9006f58bd/access_as_user"
    ]
};


/* ============================================================
   2. INITIALIZE MSAL
   ============================================================ */

let msalInstance = null;
let currentAccount = null;


function initializeAuthentication() {

    try {

        msalInstance =
            new msal.PublicClientApplication(msalConfig);

        handleAuthenticationResult();

    } catch (error) {

        console.error(
            "MSAL initialization failed:",
            error
        );

    }
}


/* ============================================================
   3. HANDLE LOGIN RESPONSE
   ============================================================ */

async function handleAuthenticationResult() {

    try {

        const response =
            await msalInstance.handleRedirectPromise();


        if (response) {

            currentAccount =
                response.account;

            updateUserInterface();

            return;
        }


        const accounts =
            msalInstance.getAllAccounts();


        if (accounts.length > 0) {

            currentAccount =
                accounts[0];

            updateUserInterface();
        }


    } catch (error) {

        console.error(
            "Authentication response error:",
            error
        );

    }
}


/* ============================================================
   4. LOGIN
   ============================================================ */

async function login() {

    try {

        await msalInstance.loginRedirect(
            loginRequest
        );

    } catch (error) {

        console.error(
            "Login failed:",
            error
        );

        alert(
            "Login failed. Please try again."
        );

    }
}


/* ============================================================
   5. LOGOUT
   ============================================================ */

function logout() {

    msalInstance.logoutRedirect();

}


/* ============================================================
   6. UPDATE UI AFTER LOGIN
   ============================================================ */

function updateUserInterface() {

    const loginButton =
        document.getElementById("loginButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const loggedUser =
        document.getElementById("loggedUser");

    const loginMessage =
        document.getElementById("loginMessage");

    const applicationContent =
        document.getElementById(
            "applicationContent"
        );

    const userName =
        document.getElementById("userName");


    if (currentAccount) {

        if (loginButton) {

            loginButton.style.display =
                "none";
        }


        if (logoutButton) {

            logoutButton.style.display =
                "inline-block";
        }


        if (loggedUser) {

            loggedUser.style.display =
                "flex";
        }


        if (loginMessage) {

            loginMessage.style.display =
                "none";
        }


        if (applicationContent) {

            applicationContent.style.display =
                "block";
        }


        if (userName) {

            userName.textContent =
                currentAccount.name ||
                currentAccount.username ||
                "Authenticated User";
        }


        loadCustomerInformation();


    } else {

        if (loginButton) {

            loginButton.style.display =
                "inline-block";
        }


        if (logoutButton) {

            logoutButton.style.display =
                "none";
        }


        if (loggedUser) {

            loggedUser.style.display =
                "none";
        }


        if (loginMessage) {

            loginMessage.style.display =
                "flex";
        }


        if (applicationContent) {

            applicationContent.style.display =
                "none";
        }

    }
}


/* ============================================================
   7. GET ACCESS TOKEN
   ============================================================ */

async function getAccessToken() {

    if (!currentAccount) {

        throw new Error(
            "User is not logged in."
        );

    }


    try {

        const response =
            await msalInstance.acquireTokenSilent({

                ...loginRequest,

                account:
                    currentAccount
            });


        return response.accessToken;


    } catch (error) {

        console.error(
            "Silent token acquisition failed:",
            error
        );


        await msalInstance.acquireTokenRedirect(
            loginRequest
        );

    }
}


/* ============================================================
   8. CUSTOMER INFORMATION
   ============================================================ */

async function loadCustomerInformation() {

    const customerName =
        document.getElementById(
            "customerName"
        );

    const customerId =
        document.getElementById(
            "customerId"
        );


    if (customerName) {

        customerName.textContent =
            "Authenticated Organization";
    }


    if (customerId) {

        customerId.textContent =
            "Resolved by platform";
    }

}


/* ============================================================
   9. CREATE ORDER
   ============================================================ */

async function createOrder() {

    const medicineCode =
        document.getElementById(
            "medicineCode"
        ).value.trim();


    const quantity =
        parseInt(
            document.getElementById(
                "quantity"
            ).value
        );


    if (!medicineCode) {

        alert(
            "Please enter a medicine code."
        );

        return;
    }


    if (!quantity || quantity <= 0) {

        alert(
            "Please enter a valid quantity."
        );

        return;
    }


    try {

        const accessToken =
            await getAccessToken();


        const payload = {

            medicineCode:
                medicineCode,

            quantity:
                quantity

        };


        const response =
            await fetch(
                `${API_BASE}/orders`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${accessToken}`

                    },

                    body:
                        JSON.stringify(payload)

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create order"
            );

        }


        document.getElementById(
            "createResult"
        ).innerHTML = `

            <div class="success">

                <strong>
                    ✅ Order Created Successfully
                </strong>

                <br>

                Order ID:

                <strong>
                    ${data.orderId}
                </strong>

                <br>

                Status:

                <strong>
                    ${data.status}
                </strong>

            </div>

        `;


    } catch (error) {

        console.error(error);


        document.getElementById(
            "createResult"
        ).innerHTML = `

            <div class="error">

                ❌ ${error.message}

            </div>

        `;

    }
}


/* ============================================================
   10. TRACK ORDER
   ============================================================ */

async function trackOrder() {

    const orderId =
        document.getElementById(
            "orderId"
        ).value.trim();


    if (!orderId) {

        alert(
            "Please enter Order ID."
        );

        return;
    }


    try {

        const accessToken =
            await getAccessToken();


        const response =
            await fetch(
                `${API_BASE}/orders/${orderId}`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${accessToken}`

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "TRACK ORDER RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Order not found."
            );

        }


        /* ----------------------------------------------------
           CANCELLATION REASON
           ---------------------------------------------------- */

        let cancellationReason = "";


        if (
            data.Status &&
            data.Status.toUpperCase() === "CANCELLED"
        ) {

            let reason =
                data.StatusMessage ||
                "Not specified";


            const upperReason =
                reason.toUpperCase();


            /*
             * Convert backend status messages
             * into user-friendly messages.
             */

            if (
                upperReason.includes(
                    "OUT_OF_STOCK"
                )
            ) {

                reason =
                    "Out of Stock";

            }

            else if (
                upperReason.includes(
                    "MEDICINE_NOT_FOUND"
                )
            ) {

                reason =
                    "Medicine not found";

            }


            cancellationReason = `

                <br>

                <strong>
                    Cancellation Reason:
                </strong>

                ${reason}

            `;
        }


        /* ----------------------------------------------------
           DISPLAY ORDER
           ---------------------------------------------------- */

        document.getElementById(
            "trackResult"
        ).innerHTML = `

            <div class="success">

                <strong>
                    Order Details
                </strong>

                <br><br>


                <strong>
                    Order ID:
                </strong>

                ${data.OrderId}

                <br>


                <strong>
                    Customer ID:
                </strong>

                ${data.CustomerId}

                <br>


                <strong>
                    Customer Type:
                </strong>

                ${data.CustomerType}

                <br>


                <strong>
                    Medicine:
                </strong>

                ${data.MedicineCode}

                <br>


                <strong>
                    Quantity:
                </strong>

                ${data.Quantity}

                <br>


                <strong>
                    Status:
                </strong>

                ${data.Status}


                ${cancellationReason}

            </div>

        `;


    } catch (error) {

        console.error(
            "Track Order Error:",
            error
        );


        document.getElementById(
            "trackResult"
        ).innerHTML = `

            <div class="error">

                ❌ ${error.message}

            </div>

        `;

    }
}


/* ============================================================
   11. GET MEDICINES
   ============================================================ */

async function getMedicines() {

    try {

        const accessToken =
            await getAccessToken();


        const response =
            await fetch(
                `${API_BASE}/medicines`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${accessToken}`

                    }

                }
            );


        const medicines =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Unable to load medicines."
            );

        }


        let html = `

            <table>

                <thead>

                    <tr>

                        <th>
                            Medicine Code
                        </th>

                        <th>
                            Medicine Name
                        </th>

                        <th>
                            Stock
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;


        medicines.forEach(
            (medicine) => {

                html += `

                    <tr>

                        <td>
                            ${medicine.medicineCode}
                        </td>

                        <td>
                            ${medicine.medicineName}
                        </td>

                        <td>
                            ${medicine.stock}
                        </td>

                    </tr>

                `;

            }
        );


        html += `

                </tbody>

            </table>

        `;


        document.getElementById(
            "medicineList"
        ).innerHTML = html;


    } catch (error) {

        console.error(error);


        document.getElementById(
            "medicineList"
        ).innerHTML = `

            <div class="error">

                ❌ Failed to load medicines.

            </div>

        `;

    }
}


/* ============================================================
   TESTING
   ============================================================ */

async function debugToken() {

    try {

        const token =
            await getAccessToken();


        const payload =
            JSON.parse(

                atob(

                    token
                        .split(".")[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")

                )

            );


        console.log(
            "JWT CLAIMS:"
        );

        console.log(
            payload
        );


    } catch (error) {

        console.error(
            "Token debug failed:",
            error
        );

    }
}


/* ============================================================
   12. START APPLICATION
   ============================================================ */

window.addEventListener(
    "DOMContentLoaded",
    initializeAuthentication
);
