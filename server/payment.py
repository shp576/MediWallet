import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_insurance_order(amount_inr, user_id, procedure):
    if not client:
        return {"error": "Razorpay not configured"}
        
    data = {
        "amount": int(amount_inr * 100), # Amount in paise
        "currency": "INR",
        "receipt": f"ins_{user_id}_{procedure[:10]}",
        "notes": {
            "procedure": procedure,
            "user_id": user_id,
            "type": "micro-insurance"
        }
    }
    
    order = client.order.create(data=data)
    return order

def verify_payment_signature(params):
    if not client:
        return False
    try:
        client.utility.verify_payment_signature(params)
        return True
    except:
        return False
