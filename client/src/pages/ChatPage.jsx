import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Send, Bot, Loader2, IndianRupee, ShieldCheck,
  ChevronRight, Mic, ArrowLeft, Sparkles, FileText
} from 'lucide-react';

const QUICK_PROMPTS = [
  "Knee replacement in Mumbai, age 55",
  "Cataract surgery cost in Chennai",
  "Normal delivery in Pune",
  "Appendix surgery estimate",
];

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userState = 'Maharashtra', income = 'Low' } = location.state || {};

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Namaste! 🙏 I'm MediWallet, your AI health finance guide.\n\nI can help you estimate surgery costs and find government schemes in **${userState}**.\n\nJust tell me your procedure or symptoms in Hindi or English!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastBotData, setLastBotData] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msgText = text || input;
    if (!msgText.trim()) return;

    const userMsg = { role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/chat', {
        message: msgText,
        state: userState,
        income: income
      });

      const botMsg = {
        role: 'bot',
        text: res.data.reply,
        data: res.data.data,
        cost: res.data.cost_estimate,
        schemes: res.data.matched_schemes,
        insurance: res.data.insurance_offer
      };
      setMessages(prev => [...prev, botMsg]);

      if (res.data.cost_estimate) {
        setLastBotData({
          cost: res.data.cost_estimate,
          scheme: res.data.matched_schemes?.[0]?.name || 'None',
          schemes: res.data.matched_schemes || [],
          insurance: null,
          procedure: res.data.data?.procedure || 'Surgery'
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: '⚠️ My server seems to be offline. Please make sure the backend is running on port 8000.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryClick = (msg, boughtInsurance = null) => {
    navigate('/summary', {
      state: {
        cost: msg.cost,
        scheme: msg.schemes?.[0]?.name || 'Ayushman Bharat PM-JAY',
        schemes: msg.schemes || [],
        gap: 0,
        insurance: boughtInsurance || (msg.insurance ? null : null), // Only show if actually bought
        procedure: msg.data?.procedure || 'Surgery'
      }
    });
  };

  const handleInsuranceClick = async (msg) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/create-order', {
        amount: msg.insurance.price,
        user_id: 'user_123',
        procedure: msg.data?.procedure || 'Surgery'
      });

      // If backend has no real Razorpay key, we simulate a fast checkout
      if (res.data.error) {
        setTimeout(() => {
          setLoading(false);
          alert('Demo Mode: Payment successful! (Razorpay not configured on backend)');
          handleSummaryClick(msg, msg.insurance);
        }, 800);
        return;
      }

      const options = {
        key: 'rzp_test_SdPWN2vvr9tRiL', // Actual razorpay test key
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'MediWallet',
        description: msg.insurance.label,
        order_id: res.data.id,
        handler: function (response) {
          alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id);
          handleSummaryClick(msg, msg.insurance);
        },
        prefill: {
          name: 'Demo User',
          email: 'demo@example.com'
        },
        theme: {
          color: '#7c3aed' // our primary color
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert('Payment Failed: ' + response.error.description);
      });
      rzp.open();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert('Error initiating payment');
    }
  };

  const formatText = (text) => {
    // Bold with **
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#0f172a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a0a3e] to-[#1e1b4b] px-4 py-3 flex items-center gap-3 border-b border-white/10">
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center">
          <ShieldCheck size={22} className="text-purple-300" />
        </div>
        <div className="flex-1">
          <h1 className="text-white font-bold text-base leading-tight">MediWallet AI</h1>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
            {userState} • {income} Income
          </p>
        </div>
        {lastBotData && (
          <button
            onClick={() => navigate('/summary', { state: lastBotData })}
            className="flex items-center gap-1 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-purple-500/30 transition-all"
          >
            <FileText size={12} /> Summary
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}>

        {/* Quick Prompts (only shown initially) */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1">
              <Sparkles size={10} /> Try these
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="bg-white/5 border border-white/10 text-white/70 text-xs px-3 py-2 rounded-xl text-left hover:bg-white/10 hover:border-purple-400/30 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mr-2 mt-1 shrink-0">
                <Bot size={14} className="text-purple-300" />
              </div>
            )}
            <div className={`max-w-[82%] ${msg.role === 'user' ? '' : 'flex-1'}`}>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-tr-none shadow-purple-500/20'
                  : 'bg-white/8 backdrop-blur border border-white/10 text-white/85 rounded-tl-none'
              }`}>
                <p>{formatText(msg.text)}</p>

                {/* Cost Card */}
                {msg.cost && (
                  <div className="mt-3 p-3 bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-400/20 rounded-xl">
                    <div className="flex items-center gap-2 text-orange-300 font-bold text-xs mb-1">
                      <IndianRupee size={12} /> ESTIMATED COST
                    </div>
                    <p className="text-xl font-black text-white">
                      ₹{msg.cost.low.toLocaleString('en-IN')}
                      <span className="text-white/50 font-normal"> – </span>
                      ₹{msg.cost.high.toLocaleString('en-IN')}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">Private hospital estimate</p>
                  </div>
                )}

                {/* Schemes */}
                {msg.schemes && msg.schemes.length > 0 && (
                  <div className="mt-2 p-3 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-400/20 rounded-xl">
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-2">
                      <ShieldCheck size={12} /> {msg.schemes.length} SCHEME{msg.schemes.length > 1 ? 'S' : ''} MATCHED
                    </div>
                    {msg.schemes.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2 mt-1">
                        <span className="text-teal-400 mt-0.5">•</span>
                        <div>
                          <p className="text-teal-100 text-xs font-semibold">{s.name}</p>
                          <p className="text-teal-300/60 text-xs">Up to ₹{(s.coverage_inr / 100000).toFixed(0)}L coverage</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Insurance CTA */}
                {msg.insurance && (
                  <button
                    onClick={() => handleInsuranceClick(msg)}
                    className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between group shadow-lg shadow-indigo-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🛡️</span>
                      <div className="text-left">
                        <p>{msg.insurance.label}</p>
                        <p className="text-indigo-200 font-normal">₹{msg.insurance.price} one-time</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {/* View Summary button after cost */}
                {msg.cost && (
                  <button
                    onClick={() => handleSummaryClick(msg)}
                    className="mt-2 w-full border border-white/10 text-white/50 hover:text-white hover:border-white/20 py-2 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={12} /> View Full Summary
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mr-2 mt-1">
              <Bot size={14} className="text-purple-300" />
            </div>
            <div className="bg-white/8 backdrop-blur border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(n => (
                  <span key={n} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${n * 0.15}s` }} />
                ))}
              </div>
              <span className="text-white/40 text-xs">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#1a0a3e]/80 backdrop-blur border-t border-white/10 flex items-center gap-2">
        <div className="flex-1 flex items-center bg-white/8 border border-white/15 rounded-2xl overflow-hidden focus-within:border-purple-400/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type in Hindi या English..."
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
