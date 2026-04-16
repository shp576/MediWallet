from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 20)
        self.cell(0, 10, 'MediWallet Product Pitch', ln=True, align='C')
        self.ln(10)

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 14)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 8, title, ln=True, fill=True)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('helvetica', '', 12)
        # Using multi_cell to wrap text
        self.multi_cell(0, 6, body)
        self.ln()

pdf = PDF()
pdf.add_page()

# Features list
features = [
    ("1. Multilingual AI Conversational Interface", 
     "Powered by high-speed Groq LLaMA models, the assistant speaks to users in their native language (e.g., Hindi and English). It translates complex medical vocabulary into friendly, easily understandable terms, ensuring a naturally flowing, empathetic conversation that puts users at ease."),
    ("2. Smart Intent Extraction & Cost Prediction", 
     "As the user explains their symptoms or upcoming procedure, the AI automatically extracts clinical intents (procedure name, city tier, hospital type, age). Calculates realistic high/low cost range predictions tailored to their demographics and location (Tier 1 vs Tier 2 cities)."),
    ("3. Automated Government Scheme Matching", 
     "Actively identifies state and income-based eligibility for various government health schemes (e.g., Ayushman Bharat PM-JAY, Mahatma Jyotiba Phule Jan Arogya Yojana). Clearly explains the potential coverage benefits so users can instantly know their financial options."),
    ("4. One-Click Micro-Insurance (Gap Cover)", 
     "Identifies potential financial gaps not covered by schemes and proactively offers affordable micro-insurance or surgical gap cover. Instantly processes live payments through Razorpay within the chat, enabling users to secure coverage without leaving the app."),
    ("5. Actionable Medical & Financial Summaries", 
     "Converts the entire conversational interaction into a clean, downloadable summary page. Beautifully presents a structured breakdown of predicted costs, schemes matched, out-of-pocket estimates, and purchased insurance."),
    ("6. Premium, Modern User Experience", 
     "Built with a stunning Dark Glassmorphism UI, fluid micro-animations, and dynamic chat bubbles. Responsive, mobile-first design tailored for on-the-go accessibility.")
]

pdf.set_font('helvetica', '', 12)
intro = "Many patients across India struggle to understand the true cost of medical procedures, face unexpected out-of-pocket expenses, and remain unaware of life-saving government schemes they're eligible for. MediWallet bridges this gap with an intelligent, conversational AI assistant that predicts medical costs, recommends appropriate government schemes, and offers bite-sized gap insurance."
pdf.multi_cell(0, 6, intro)
pdf.ln(10)

for title, body in features:
    pdf.chapter_title(title)
    pdf.chapter_body(body)

pdf.output("MediWallet_Pitch.pdf")
