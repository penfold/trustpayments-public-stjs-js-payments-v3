import json
import jwt


def decode_jwt(jwt_string):
    """
    DECODE JWT AND RETURNS JSON
    """
    decoded = jwt.decode(jwt_string, options={"verify_signature": False}, algorithms=["HS256"])

    return json.loads(json.dumps(decoded))


JWT_SRC = "TYPE_JWT_HERE"

# DECODE AND READ JSON
json_file = decode_jwt(JWT_SRC)

# SAVE TIMESTAMP
timestamp = json_file["payload"]["response"][0]["transactionstartedtimestamp"]

# DECODE CHECKOUT RESPONSE JWT
wallet_token = decode_jwt(json_file["payload"]["jwt"])["payload"]["wallettoken"]
response = json.loads(wallet_token)["checkoutResponse"]
checkout_response = json.loads(json.dumps(jwt.decode(response,
                                                     options={"verify_signature": False},
                                                     algorithms=["HS256"])))

# SAVE CORRELATION ID AND TRANSACTION ID
correlation_id = checkout_response["srcCorrelationId"]
transaction_id = checkout_response["srciTransactionId"]

# PRINT DATA
print("transactionstartedtimestamp: " + timestamp)
print("srcCorrelationId: " + correlation_id)
print("srciTransactionId: " + transaction_id)
