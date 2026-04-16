from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import json
from pathlib import Path
from dotenv import load_dotenv
from agent import extract_intent, generate_response
from cost_model import get_cost_prediction
from payment import create_insurance_order, verify_payment_signature

# Resolve paths relative to this file so the server can be started from any directory
BASE_DIR = Path(__file__).parent.resolve()

load_dotenv(BASE_DIR / ".env", override=True)
load_dotenv(BASE_DIR.parent / ".env", override=True)  # Also load root .env

app = FastAPI(title="MediWallet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load schemes from JSON (absolute path so server works from any CWD)
with open(BASE_DIR / "schemes.json", "r", encoding="utf-8") as f:
    SCHEMES_DATA = json.load(f)


# ── Request Models ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    state: str = "Maharashtra"
    income: str = "Low"

class CostRequest(BaseModel):
    procedure: str
    tier: int = 2
    hosp_type: str = "private"
    age: int = 40

class OrderRequest(BaseModel):
    amount: int
    user_id: str
    procedure: str


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "MediWallet API is running 🚀", "version": "1.0.0"}


@app.post("/chat")
async def chat(req: ChatRequest):
    """Main AI chat endpoint – extracts intent, predicts cost, matches schemes."""
    intent_json, bot_reply = extract_intent(req.message)

    if intent_json and intent_json.get("intent_extracted"):
        data = intent_json["data"]

        # Cost prediction
        cost = get_cost_prediction(
            procedure=data.get("procedure", "surgery"),
            city_tier=data.get("tier", 2),
            hospital_type="private",
            age=data.get("age", 40)
        )

        # Scheme matching: by state and income
        matched_schemes = [
            s for s in SCHEMES_DATA
            if (
                req.state.lower() in [st.lower() for st in s["states"]]
                or "All" in s["states"]
            )
            and (req.income in s["eligible_if"].get("income_category", []))
        ]

        # Final NLG response from Gemini
        final_text = generate_response(
            intent_data=data,
            cost_estimate=cost,
            schemes=matched_schemes,
            user_lang=data.get("language", "en")
        )

        # Offer micro-insurance if cost > ₹50,000
        insurance_offer = None
        if cost["high"] > 50000:
            insurance_offer = {
                "price": 299,
                "label": "Surgical Gap Cover (₹2L extra)"
            }

        return {
            "reply": final_text,
            "data": data,
            "cost_estimate": cost,
            "matched_schemes": matched_schemes,
            "insurance_offer": insurance_offer
        }

    # Conversational reply (no procedure detected)
    return {"reply": bot_reply}


@app.post("/predict-cost")
async def predict_cost(req: CostRequest):
    """Standalone cost prediction endpoint."""
    return get_cost_prediction(req.procedure, req.tier, req.hosp_type, req.age)


@app.post("/match-schemes")
async def match_schemes(state: str, income: str):
    """Return all eligible schemes for a given state/income combination."""
    matched = [
        s for s in SCHEMES_DATA
        if (state.lower() in [st.lower() for st in s["states"]] or "All" in s["states"])
        and (income in s["eligible_if"].get("income_category", []))
    ]
    return matched


@app.post("/create-order")
async def create_order(req: OrderRequest):
    """Create a Razorpay payment order for micro-insurance."""
    order = create_insurance_order(req.amount, req.user_id, req.procedure)
    return order


@app.post("/verify-payment")
async def verify_payment(params: dict):
    """Verify Razorpay payment signature after checkout."""
    success = verify_payment_signature(params)
    return {"success": success}


@app.get("/schemes")
async def get_all_schemes():
    """Return all available schemes."""
    return SCHEMES_DATA


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
