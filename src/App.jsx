import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Link as LinkIcon, MessageSquare, AlertTriangle, CheckCircle, Activity, Type, ArrowRight, Terminal, ShieldCheck } from 'lucide-react';

const tabs = [
  { id: 'url', label: 'URL / Link', icon: LinkIcon, placeholder: 'https://example.com/login...' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'Dear user, your account has been compromised...' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, placeholder: 'URGENT: Your package is delayed. Click here...' },
  { id: 'text', label: 'Raw Text', icon: Type, placeholder: 'Paste any suspicious text here...' },
];

function App() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 10) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.error("Playback interrupted", e));
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://phishscope-o7df.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, input_type: activeTab.id }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({
        status: "ERROR",
        ml_score: 0,
        confidence_score: 0,
        reasoning: "Failed to connect to the backend server.",
      });
    }

    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status.includes('SAFE')) return 'text-success';
    if (status.includes('SUSPICIOUS')) return 'text-warning';
    return 'text-danger';
  };

  const getBgColor = (status) => {
    if (status.includes('SAFE')) return 'bg-success/20 border-success/30';
    if (status.includes('SUSPICIOUS')) return 'bg-warning/20 border-warning/30';
    if (status.includes('SAFE')) return 'bg-green-900/20 border-green-500/30';
    if (status.includes('SUSPICIOUS')) return 'bg-yellow-900/20 border-yellow-500/30';
    return 'bg-red-900/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-black text-primary flex flex-col items-center py-12 px-4 md:px-8 font-mono overflow-x-hidden relative">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        className="fixed top-0 left-0 min-w-full min-h-full object-cover z-0 opacity-20 pointer-events-none mix-blend-screen"
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 w-full h-1 bg-primary/30 z-50 shadow-[0_0_15px_rgba(57,255,20,0.8)]" />
      
      <header className="text-center mb-12 relative z-10 w-full max-w-4xl">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center items-center gap-3 mb-4">
          <Shield size={48} className="text-primary animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-widest uppercase drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">
            PhishScope
          </h1>
        </motion.div>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-green-700 max-w-2xl mx-auto uppercase text-xs tracking-widest">
          Advanced Phishing Detection powered by traditional ML. Identifies manipulation, urgency, and deceit in real-time.
        </motion.p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div className="hacker-panel p-6 flex flex-col gap-6 border border-primary/20">
          <div className="flex bg-black border border-primary/20 p-1 mb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm transition-colors whitespace-nowrap uppercase tracking-wider font-bold ${activeTab.id === tab.id ? 'bg-primary/20 text-primary border border-primary shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'text-green-700 hover:text-primary hover:bg-white/5'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-semibold text-green-700 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={14} /> Analyze {activeTab.label}
            </label>
            <textarea
              className="w-full flex-1 min-h-[250px] bg-black/80 border border-primary/40 focus:border-primary text-primary placeholder-green-900 p-4 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none font-mono"
              placeholder={activeTab.placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button 
            onClick={handleAnalyze} 
            disabled={loading || !inputText.trim()}
            className="w-full py-4 px-6 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.1)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)]"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Activity size={20} />
              </motion.div>
            ) : (
              <>
                Scan for Threats
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="hacker-panel min-h-[400px] flex flex-col overflow-hidden relative border border-primary/20">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-green-700 p-8 flex-1">
                <Terminal size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">Awaiting Signal</h3>
                <p className="text-center text-sm opacity-80 uppercase tracking-widest text-xs">
                  Enter target payload into terminal and initiate scan to uncover threats.
                </p>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col gap-4">
                <div className={`p-6 ${getBgColor(result.status)} flex items-center justify-between border-b-2 border-dashed border-primary/20`}>
                  <div>
                    <p className="text-sm uppercase tracking-widest text-green-700 font-bold mb-1">Final Verdict</p>
                    <h2 className={`text-4xl font-bold tracking-wider ${getStatusColor(result.status)}`}>{result.status}</h2>
                  </div>
                  {result.status.includes('SAFE') ? <ShieldCheck size={56} className="text-green-500" /> : <AlertTriangle size={56} className="text-red-500" />}
                </div>

                <div className="grid grid-cols-2 gap-4 px-6 pt-2">
                  <div className="border border-primary/20 p-4 flex flex-col justify-center items-center bg-black/50">
                    <p className="text-sm text-green-700 mb-2 uppercase tracking-widest text-[10px]">Structural Analysis</p>
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(result.ml_score * 100)}%
                    </div>
                  </div>
                  <div className="border border-primary/20 p-4 flex flex-col justify-center items-center bg-black/50">
                    <p className="text-sm text-green-700 mb-2 uppercase tracking-widest text-[10px]">System Confidence</p>
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(result.confidence_score * 100)}%
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 bg-black/50 border-t border-primary/20 m-6 mt-2 relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary"></div>
                  <div className="flex justify-between items-start mb-4 border-b border-primary/20 pb-4">
                    <div className="text-left">
                      <span className="text-[10px] uppercase tracking-widest text-green-700 font-bold mb-1 block">Analysis Mode</span>
                      <span className="font-bold text-lg text-primary uppercase">ML + Web Context</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-green-700 font-bold mb-2 block">&gt; SYSTEM LOG ENTRY :</span>
                    <p className="text-sm text-primary leading-relaxed break-words opacity-90">
                      {result.reasoning}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
