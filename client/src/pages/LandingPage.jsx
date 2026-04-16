import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Heart, Sparkles, MapPin, IndianRupee } from 'lucide-react';

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
  "Gujarat", "Haryana", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

const INCOME_OPTIONS = [
  { value: "BPL", label: "Below Poverty Line (BPL)", desc: "Annual income < ₹1 Lakh", color: "#ef4444" },
  { value: "Low", label: "Low Income", desc: "Annual income ₹1L – ₹3L", color: "#f97316" },
  { value: "Middle", label: "Middle Income", desc: "Annual income ₹3L – ₹10L", color: "#eab308" },
  { value: "Salaried", label: "Salaried / ESIC", desc: "Government or private sector employee", color: "#22c55e" },
  { value: "High", label: "High Income", desc: "Annual income > ₹10L", color: "#6366f1" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = welcome, 2 = state, 3 = income
  const [selectedState, setSelectedState] = useState('');
  const [selectedIncome, setSelectedIncome] = useState('');
  const [stateSearch, setStateSearch] = useState('');

  const filteredStates = STATES.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleContinue = () => {
    if (step === 1) setStep(2);
    else if (step === 2 && selectedState) setStep(3);
    else if (step === 3 && selectedIncome) {
      navigate('/chat', { state: { userState: selectedState, income: selectedIncome } });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1e0533] via-[#2d1065] to-[#0f172a] relative overflow-hidden">
      {/* Animated BG Blobs */}
      <div className="absolute top-[-80px] left-[-60px] w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

      {/* Step 1: Welcome */}
      {step === 1 && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center relative z-10">
          {/* Logo */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
              <ShieldCheck size={48} className="text-purple-300" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Medi<span className="text-purple-300">Wallet</span>
          </h1>
          <p className="text-purple-200 text-sm mb-8">
            AI-powered Health Finance Assistant
          </p>

          {/* Feature pills */}
          <div className="space-y-3 w-full mb-10">
            {[
              { icon: '🔍', text: 'Estimate procedure costs instantly' },
              { icon: '🏥', text: 'Match government health schemes' },
              { icon: '🛡️', text: 'Buy micro-insurance top-up in 1 tap' },
              { icon: '🌐', text: 'Works in Hindi & English' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/8 backdrop-blur border border-white/10 rounded-2xl px-4 py-3">
                <span className="text-xl">{f.icon}</span>
                <p className="text-white/80 text-sm font-medium">{f.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Get Started <ChevronRight size={20} />
          </button>

          <p className="text-white/30 text-xs mt-4">Free • No registration required</p>
        </div>
      )}

      {/* Step 2: Select State */}
      {step === 2 && (
        <div className="flex flex-col flex-1 px-6 py-10 relative z-10">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={18} className="text-purple-300" />
              <span className="text-purple-300 text-xs font-bold uppercase tracking-widest">Step 1 of 2</span>
            </div>
            <h2 className="text-2xl font-black text-white">Which state are you in?</h2>
            <p className="text-white/50 text-sm mt-1">This helps us find state-specific health schemes</p>
          </div>

          <input
            type="text"
            value={stateSearch}
            onChange={e => setStateSearch(e.target.value)}
            placeholder="Search states..."
            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur"
          />

          <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-1">
            {filteredStates.map(state => (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedState === state
                    ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/8 border-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {state}
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedState}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Step 3: Income Category */}
      {step === 3 && (
        <div className="flex flex-col flex-1 px-6 py-10 relative z-10">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee size={18} className="text-purple-300" />
              <span className="text-purple-300 text-xs font-bold uppercase tracking-widest">Step 2 of 2</span>
            </div>
            <h2 className="text-2xl font-black text-white">Income category?</h2>
            <p className="text-white/50 text-sm mt-1">Used only to match eligible government schemes</p>
          </div>

          <div className="space-y-3 flex-1 mb-6">
            {INCOME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedIncome(opt.value)}
                className={`w-full text-left px-4 py-4 rounded-xl border transition-all ${
                  selectedIncome === opt.value
                    ? 'border-2 bg-white/12 shadow-lg'
                    : 'bg-white/8 border-white/10 hover:bg-white/12'
                }`}
                style={selectedIncome === opt.value ? { borderColor: opt.color } : {}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{opt.label}</p>
                    <p className="text-white/50 text-xs mt-0.5">{opt.desc}</p>
                  </div>
                  {selectedIncome === opt.value && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: opt.color }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedIncome}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Heart size={18} /> Start My Health Journey
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
