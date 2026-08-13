"""
FastAPI Main Application
Endpoints for document classification and processing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from app.domain_classifier import get_classifier

# Initialize FastAPI app
app = FastAPI(
    title="HackOrbit API",
    description="Document classification and processing API",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Pydantic Models (Data Validation)
# ============================================================================

class ClassificationRequest(BaseModel):
    """Single text classification request"""
    text: str
    top_k: int = 1


class BatchClassificationRequest(BaseModel):
    """Batch text classification request"""
    texts: List[str]
    top_k: int = 1


class ClassificationResponse(BaseModel):
    """Classification result"""
    domain: str
    confidence: float


class BatchClassificationResponse(BaseModel):
    """Batch classification response"""
    text: str
    predictions: List[ClassificationResponse]


# ============================================================================
# Health Check Endpoint
# ============================================================================

@app.get("/")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "ok",
        "message": "HackOrbit API is running",
        "version": "1.0.0"
    }


# ============================================================================
# Classification Endpoints
# ============================================================================

@app.post("/classify", response_model=List[ClassificationResponse])
async def classify_text(request: ClassificationRequest):
    """
    Classify a single text into domain(s)
    
    Example:
        POST /classify
        {
            "text": "All employees must follow labor laws",
            "top_k": 2
        }
    """
    try:
        classifier = get_classifier()
        predictions = classifier.classify(request.text, top_k=request.top_k)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify/batch", response_model=List[BatchClassificationResponse])
async def classify_batch(request: BatchClassificationRequest):
    """
    Classify multiple texts
    
    Example:
        POST /classify/batch
        {
            "texts": ["text1", "text2"],
            "top_k": 1
        }
    """
    try:
        classifier = get_classifier()
        batch_results = classifier.batch_classify(
            request.texts, 
            top_k=request.top_k
        )
        
        response = []
        for text, predictions in zip(request.texts, batch_results):
            response.append({
                "text": text,
                "predictions": predictions
            })
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Model Info Endpoint
# ============================================================================

@app.get("/model/info")
async def get_model_info():
    """
    Get information about the loaded model
    """
    try:
        classifier = get_classifier()
        return {
            "status": "loaded",
            "device": str(classifier.device),
            "num_domains": len(classifier.labels),
            "domains": classifier.labels
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Run Server
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Run with: python -m uvicorn main:app --reload
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
