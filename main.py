from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="Phishing Detection System API",
    description="Advanced AI-Based Phishing Detection System utilizing ML & LLMs",
    version="1.0.0"
)

# Configure CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Phishing Detection Backend Running"}
