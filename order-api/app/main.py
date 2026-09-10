from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Pharmaceutical Order Fulfillment Platform"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
