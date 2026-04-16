import os
import json
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent.resolve()
load_dotenv(BASE_DIR / ".env", override=True)
load_dotenv(BASE_DIR.parent / ".env", override=True)  # Also load root .env

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """
You are MediWallet, a health finance assistant for India. 
Respond in the same language the user writes in (Hindi or English).
Your goal is to help users understand medical costs and find government schemes.

If the user mentions a medical procedure or symptoms, you must extract:
- procedure (e.g., 'knee replacement', 'cataract')
- city (e.g., 'Pune', 'Mumbai')
- hospital_tier (1 for Metros, 2 for Tier 2, 3 for others)
- patient_age (int)

Always return your extracted data in JSON format at the end of your response if all fields are found or partially found.
Format: { "intent_extracted": true, "data": { "procedure": "...", "city": "...", "tier": 1, "age": 45, "language": "en" } }
If fields are missing, ask the user for them politely in their language.
"""

def extract_intent(user_msg):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"User says: {user_msg}\n\nExtract the data. If data is missing, ask for it. If data is complete, provide the JSON block."}
            ],
            temperature=0.3,
            max_tokens=1024,
        )
        text = response.choices[0].message.content
        
        # Try to find JSON in text
        start = text.find('{')
        end = text.rfind('}') + 1
        if start != -1 and end != -1:
            try:
                data = json.loads(text[start:end])
                return data, text[:start].strip()
            except:
                pass
        
        return None, text
    except Exception as e:
        print(f"Error in extract_intent: {e}")
        return None, f"I'm sorry, I'm having trouble understanding right now. (Error: {e})"

def generate_response(intent_data, cost_estimate, schemes, user_lang="en"):
    # This function uses Groq to format the final reply naturally
    # including the technical data we calculated
    
    context = f"""
    User Intent: {intent_data}
    Estimated Cost: {cost_estimate}
    Matched Schemes: {schemes}
    Language: {user_lang}
    
    Task: Formulate a natural, helpful response in {user_lang}. 
    Inform the user about the estimated cost and the schemes they might be eligible for.
    Be empathetic and clear. 
    If a scheme like Ayushman Bharat is found, highlight that it's a great option.
    Mention that they can also buy a micro-insurance top-up for extra peace of mind.
    """
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are MediWallet, a helpful health finance assistant for India. Respond naturally and empathetically."},
                {"role": "user", "content": context}
            ],
            temperature=0.5,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Estimated cost is {cost_estimate.get('low')} - {cost_estimate.get('high')} INR. You might be eligible for schemes like {', '.join([s['name'] for s in schemes])}."
