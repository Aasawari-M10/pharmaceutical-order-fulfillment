/*

* ============================================================
* PHARMAFLOW FRONTEND
* Microsoft Entra External ID + JWT
* ============================================================
  */

/* ============================================================

1. CONFIGURATION
   ============================================================ */

/*

* APIM base URL.
*
* IMPORTANT:
* Do NOT include /orders here.
*
* We will build:
*
* POST  /orders
* GET   /orders/{orderId}
* GET   /medicines
*

*/

const API_BASE =
"https://apim-capstone-pharma-001.azure-api.net/orders";

/*

* Microsoft Entra External ID configuration.
*
* These values will be filled after your
* External ID application configuration is complete.
*

*/

const msalConfig = {
    auth: {
        clientId: "9b0384a4-878b-4d9b-b8db-9e4f28622b2c",
        authority: "https://pharmaordercustomers2026.ciamlogin.com/bc709ab2-033c-47ac-8af2-baa9ae6e645a",
        redirectUri: window.location.origin
    },

    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};
/*

* API scope.
*
* This will be created when we configure
* the protected API application in Entra.
*
* Example:
*
* api://YOUR_API_CLIENT_ID/access_as_user
*

*/

const loginRequest = {

```
scopes: [

    "api://bdee7642-ca76-4f25-bf6b-0fe9006f58bd/access_as_user"

]
```

};

/* ============================================================
2. INITIALIZE MSAL
============================================================ */

let msalInstance = null;

let currentAccount = null;

/*

* Initialize the MSAL browser client.
  */

function initializeAuthentication() {

```
try {

    msalInstance =
        new msal.PublicClientApplication(msalConfig);

    handleAuthenticationResult();

}

catch (error) {

    console.error(
        "MSAL initialization failed:",
        error
    );

}
```

}

/* ============================================================
3. HANDLE LOGIN RESPONSE
============================================================ */

async function handleAuthenticationResult() {

```
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

}

catch (error) {

    console.error(
        "Authentication response error:",
        error
    );

}
```

}

/* ============================================================
4. LOGIN
============================================================ */

async function login() {

```
try {

    await msalInstance.loginRedirect(
        loginRequest
    );

}

catch (error) {

    console.error(
        "Login failed:",
        error
    );

    alert(
        "Login failed. Please try again."
    );

}
```

}

/* ============================================================
5. LOGOUT
============================================================ */

function logout() {

```
msalInstance.logoutRedirect();
```

}

/* ============================================================
6. UPDATE UI AFTER LOGIN
============================================================ */

function updateUserInterface() {

```
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

    loginButton.style.display =
        "none";

    logoutButton.style.display =
        "inline-block";

    loggedUser.style.display =
        "flex";

    loginMessage.style.display =
        "none";

    applicationContent.style.display =
        "block";


    userName.textContent =
        currentAccount.name ||
        currentAccount.username ||
        "Authenticated User";


    /*
     * At this stage we only display
     * the authenticated identity.
     *
     * Customer ID will later be obtained
     * from the backend/customer mapping.
     */

    loadCustomerInformation();

}

else {

    loginButton.style.display =
        "inline-block";

    logoutButton.style.display =
        "none";

    loggedUser.style.display =
        "none";

    loginMessage.style.display =
        "flex";

    applicationContent.style.display =
        "none";

}
```

}

/* ============================================================
7. GET ACCESS TOKEN
============================================================ */

async function getAccessToken() {

```
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

}

catch (error) {

    console.error(
        "Silent token acquisition failed:",
        error
    );


    /*
     * If silent acquisition fails,
     * ask the user to authenticate again.
     */

    await msalInstance.acquireTokenRedirect(
        loginRequest
    );

}
```

}

/* ============================================================
8. CUSTOMER INFORMATION
============================================================ */

async function loadCustomerInformation() {

```
/*
 * IMPORTANT:
 *
 * We will connect this to your
 * Order API/customer endpoint later.
 *
 * The backend will determine:
 *
 * JWT identity
 *       ↓
 * CustomerUsers
 *       ↓
 * HOSP100
 *
 * We should NOT trust a customer ID
 * entered by the browser.
 */


const customerName =
    document.getElementById(
        "customerName"
    );

const customerId =
    document.getElementById(
        "customerId"
    );


customerName.textContent =
    "Authenticated Organization";

customerId.textContent =
    "Resolved by platform";
```

}

/* ============================================================
9. CREATE ORDER
============================================================ */

async function createOrder() {

```
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

}

catch (error) {

    console.error(error);


    document.getElementById(
        "createResult"
    ).innerHTML = `

        <div class="error">

            ❌ ${error.message}

        </div>

    `;

}
```

}

/* ============================================================
10. TRACK ORDER
============================================================ */

async function trackOrder() {

```
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


    if (!response.ok) {

        throw new Error(
            "Order not found."
        );

    }


    document.getElementById(
        "trackResult"
    ).innerHTML = `

        <div class="success">

            <strong>
                Order Details
            </strong>

            <br><br>

            <strong>Order ID:</strong>
            ${data.orderId}

            <br>

            <strong>Customer ID:</strong>
            ${data.customerId}

            <br>

            <strong>Medicine:</strong>
            ${data.medicineCode}

            <br>

            <strong>Quantity:</strong>
            ${data.quantity}

            <br>

            <strong>Status:</strong>
            ${data.status}

        </div>

    `;

}

catch (error) {

    console.error(error);


    document.getElementById(
        "trackResult"
    ).innerHTML = `

        <div class="error">

            ❌ Unable to track order.

        </div>

    `;

}
```

}

/* ============================================================
11. GET MEDICINES
============================================================ */

async function getMedicines() {

```
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
    ).innerHTML =
        html;

}

catch (error) {

    console.error(error);


    document.getElementById(
        "medicineList"
    ).innerHTML = `

        <div class="error">

            ❌ Failed to load medicines.

        </div>

    `;

}
```

}

/* ============================================================
12. START APPLICATION
============================================================ */

window.addEventListener(
"DOMContentLoaded",
initializeAuthentication
);
