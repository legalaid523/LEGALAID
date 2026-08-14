# main.py
"""
FastAPI server for LegalAId backend.

Exposes the full pipeline (classifier → extraction → matcher → question engine)
as REST endpoints consumed by the React frontend.
"""
import os
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.classifier import load_classifier, classify
from app.conversation import start_conversation, handle_message
from app.supabase_client import load_cache


# ─── Lifespan (startup / shutdown) ───────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load Supabase cache and classifier on startup."""
    print("🚀 Starting LegalAId backend...")
    load_cache()
    load_classifier()
    print("✅ Backend ready.")
    yield
    print("👋 Shutting down LegalAId backend.")


app = FastAPI(
    title="LegalAId API",
    version="0.1.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Models ────────────────────────────────────────────────

class StartSessionResponse(BaseModel):
    session_id: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en"


class ClassifyRequest(BaseModel):
    text: str
    top_k: int = 1


class ClassifyPrediction(BaseModel):
    domain: str
    confidence: float


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "LegalAId"}


@app.post("/api/session/start", response_model=StartSessionResponse)
async def api_start_session():
    """Create a new conversation session."""
    session_id = start_conversation()
    return StartSessionResponse(session_id=session_id)


@app.post("/api/chat")
async def api_chat(req: ChatRequest):
    """
    Process one turn of the multi-turn conversation.

    Returns the full pipeline result: classification, extracted facts,
    next question or matched section with applicable laws.
    """
    try:
        print(f"\n📩 [Chat] session={req.session_id} | msg='{req.message}' | lang={req.language}")
        result = handle_message(
            session_id=req.session_id,
            user_message=req.message,
            language=req.language,
        )
        print(f"📤 [Chat Result] status={result.get('status')} | facts={result.get('extracted_facts')} | next_q={bool(result.get('next_question'))}")
        return result
    except ValueError as e:
        print(f"⚠️ Chat session not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


@app.post("/api/classify", response_model=List[ClassifyPrediction])
async def api_classify(req: ClassifyRequest):
    """
    Standalone domain classification endpoint (for the test bench UI).

    Returns top-k predictions as [{ domain, confidence }].
    """
    try:
        domain, confidence = classify(req.text)

        # Build a top-k style response; our classifier returns a single prediction
        # but we pad with the other domains at lower confidence for the UI bar chart.
        DOMAINS = ["consumer", "labor", "tenant"]
        predictions = [ClassifyPrediction(domain=domain, confidence=confidence)]

        remaining = [d for d in DOMAINS if d != domain]
        remaining_conf = (1.0 - confidence) / max(len(remaining), 1)
        for d in remaining:
            predictions.append(ClassifyPrediction(domain=d, confidence=round(remaining_conf, 4)))

        # Sort by confidence desc, truncate to top_k
        predictions.sort(key=lambda p: p.confidence, reverse=True)
        return predictions[: req.top_k]

    except Exception as e:
        print(f"❌ Classify error: {e}")
        raise HTTPException(status_code=500, detail=f"Classification error: {e}")
