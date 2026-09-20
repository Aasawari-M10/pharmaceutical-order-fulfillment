const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const tenantId = "bc709ab2-033c-47ac-8af2-baa9ae6e645a";

const client = jwksClient({
    jwksUri:
        `https://pharmaordercustomers2026.ciamlogin.com/${tenantId}/discovery/v2.0/keys`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err);
        }

        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(
        token,
        getKey,
        {
            algorithms: ["RS256"],
            issuer:
                `https://bc709ab2-033c-47ac-8af2-baa9ae6e645a.ciamlogin.com/${tenantId}/v2.0`,
            audience: "bdee7642-ca76-4f25-bf6b-0fe9006f58bd"
        },
        (err, decoded) => {

            if (err) {
                console.error("JWT validation error:", err);

                return res.status(401).json({
                    message: "Invalid access token"
                });
            }

            req.user = decoded;

            next();
        }
    );
}

module.exports = authenticateToken;
