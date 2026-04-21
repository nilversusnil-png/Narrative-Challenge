import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link as LinkIcon, 
  Type as TextIcon, 
  Sparkles, 
  Loader2, 
  MessageSquare, 
  ShieldAlert, 
  RefreshCcw, 
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  BrainCircuit,
  Target,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { Question, InputMode } from './types';
import { generateQuestions } from './services/geminiService';

export default function App() {
  const [mode, setMode] = useState<InputMode>('url');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Critical' | 'Reflexive' | 'Evocative'>('All');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [debateMode, setDebateMode] = useState(false);
  const [currentDebateIndex, setCurrentDebateIndex] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScrape = async (url: string) => {
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to scrape URL');
    }
    return response.json();
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setDebateMode(false);

    try {
      let textToAnalyze = input;
      if (mode === 'url') {
        const { content } = await handleScrape(input);
        textToAnalyze = content;
      }

      const generated = await generateQuestions(textToAnalyze);
      setQuestions(generated);
      
      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredQuestions = activeTab === 'All' 
    ? questions 
    : questions.filter(q => q.type === activeTab);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Critical': return 'text-blue-400';
      case 'Reflexive': return 'text-purple-400';
      case 'Evocative': return 'text-orange-400';
      default: return 'text-white/40';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Critical': return <ShieldAlert className="w-3 h-3" />;
      case 'Reflexive': return <BrainCircuit className="w-3 h-3" />;
      case 'Evocative': return <Flame className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F0F0F0] font-sans flex flex-col md:h-screen overflow-hidden">
      {/* Header Section */}
      <header className="p-6 md:p-8 flex justify-between items-center border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
            <div className="w-4 h-4 bg-black rotate-45"></div>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase font-display">DebateQuest.ai</span>
        </div>
        <nav className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/50">
          <button onClick={() => setMode('url')} className={`transition-colors hover:text-white ${mode === 'url' ? 'text-white border-b border-white' : ''}`}>Link Engine</button>
          <button onClick={() => setMode('text')} className={`transition-colors hover:text-white ${mode === 'text' ? 'text-white border-b border-white' : ''}`}>Text Synth</button>
          <a href="#" className="hover:text-white transition-colors">Methodology</a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-hidden">
        {/* Left Sidebar: Input & Stats */}
        <section className="col-span-4 border-r border-white/10 p-8 flex flex-col justify-between bg-[#0F0F11] overflow-y-auto">
          <div className="space-y-12">
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-6xl md:text-7xl font-black leading-[0.85] tracking-tighter uppercase mb-6 font-display">
                CHALLENGE<br/><span className="text-white/20">THE</span><br/>NARRATIVE
              </h1>
              <p className="text-white/40 text-sm max-w-[280px] leading-relaxed font-medium">
                Paste your source text or article URL below to generate a deep-dive debate framework.
              </p>
            </motion.div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-3 block">
                  {mode === 'url' ? 'Source URL' : 'Text Content'}
                </label>
                <div className="relative">
                  {mode === 'url' ? (
                    <input 
                      type="url"
                      placeholder="https://article-link.com/..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm focus:outline-none focus:border-white/40 transition-colors"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                  ) : (
                    <textarea 
                      placeholder="Paste your content here..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm h-48 md:h-64 resize-none focus:outline-none focus:border-white/40 transition-colors"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  )}
                  <div className="absolute bottom-3 right-3 text-[9px] text-white/20 uppercase font-mono font-bold">Limit: 10k Chars</div>
                </div>
              </div>

              <button 
                disabled={isLoading || !input.trim()}
                onClick={handleGenerate}
                className="w-full py-5 bg-white text-black font-black uppercase text-sm tracking-tighter hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                   <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing...
                   </>
                ) : (
                  <>Synthesize Questions</>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase font-black tracking-widest leading-relaxed">
                  ERROR: {error}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex justify-between items-end border-t border-white/10 pt-8 mt-12">
            <div className="space-y-1">
              <span className="block text-3xl font-black leading-none font-display">1.2k</span>
              <span className="block text-[10px] uppercase font-bold text-white/30 tracking-widest">Debates Held</span>
            </div>
            <div className="space-y-1 text-right">
              <span className="block text-3xl font-black leading-none font-display">98%</span>
              <span className="block text-[10px] uppercase font-bold text-white/30 tracking-widest">Recall Score</span>
            </div>
          </div>
        </section>

        {/* Main Content: Question Grid */}
        <section className="col-span-8 p-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent flex flex-col overflow-y-auto scroller-hide">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">
              Current Session / <span className="text-white">{questions.length > 0 ? "Insights Generated" : "Ready for Input"}</span>
            </h2>
            <div className="flex gap-4">
              <span className="px-3 py-1 border border-white/20 rounded-full text-[10px] uppercase font-black tracking-widest">{questions.length} Questions Active</span>
              <span className="hidden md:inline-block px-3 py-1 bg-blue-600 rounded-full text-[10px] uppercase font-black tracking-widest">Auto-Save On</span>
            </div>
          </div>

          {questions.length > 0 ? (
            <div className="flex-1 flex flex-col gap-10">
              {/* Tab Filters */}
              <div ref={resultsRef} className="flex gap-3 overflow-x-auto scroller-hide">
                {(['All', 'Critical', 'Reflexive', 'Evocative'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setDebateMode(false);
                    }}
                    className={`px-4 py-2 border rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab 
                        ? 'bg-white text-black border-white' 
                        : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {!debateMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 scroller-hide">
                  <AnimatePresence mode="popLayout">
                    {filteredQuestions.map((q, idx) => (
                      <motion.div 
                        layout
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white/[0.03] border border-white/10 p-6 rounded-xl hover:bg-white/[0.05] transition-colors relative"
                      >
                        <div className="flex justify-between mb-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getTypeColor(q.type)}`}>
                            {getTypeIcon(q.type)}
                            {q.type}
                          </span>
                          <span className="text-[10px] font-mono text-white/20">{(idx + 1).toString().padStart(2, '0')}/{questions.length}</span>
                        </div>
                        <p className="text-lg md:text-xl font-bold leading-tight tracking-tight italic text-white/90 mb-4">
                          "{q.question}"
                        </p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider leading-relaxed">
                          {q.context}
                        </p>
                        
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(q.question, idx)}
                            className="p-1 px-2 border border-white/20 rounded text-[9px] uppercase font-black hover:bg-white hover:text-black transition-colors"
                          >
                           {copiedIndex === idx ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/[0.03] border border-white/10 p-12 md:p-20 rounded-[40px] text-center shadow-2xl relative overflow-hidden w-full max-w-2xl"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                      <motion.div 
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentDebateIndex + 1) / filteredQuestions.length) * 100}%` }}
                      />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-12">
                      <div className="space-y-4">
                        <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 ${getTypeColor(filteredQuestions[currentDebateIndex]?.type)}`}>
                          {getTypeIcon(filteredQuestions[currentDebateIndex]?.type)}
                          {filteredQuestions[currentDebateIndex]?.type} Inquiry
                        </div>
                        <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[9px]">Case Study {currentDebateIndex + 1} of {filteredQuestions.length}</p>
                      </div>

                      <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tighter italic text-white/95 min-h-[140px]">
                        "{filteredQuestions[currentDebateIndex]?.question}"
                      </h2>

                      <p className="text-white/40 text-xs font-bold uppercase tracking-[0.1em] max-w-md leading-relaxed">
                        {filteredQuestions[currentDebateIndex]?.context}
                      </p>

                      <div className="flex items-center gap-6 mt-12">
                        <button 
                          disabled={currentDebateIndex === 0}
                          onClick={() => setCurrentDebateIndex(prev => prev - 1)}
                          className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => copyToClipboard(filteredQuestions[currentDebateIndex]?.question, currentDebateIndex)}
                          className="flex items-center gap-3 px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-white/90 transition-all active:scale-95"
                        >
                          <Copy className="w-4 h-4" /> Copy Prompt
                        </button>
                        <button 
                          disabled={currentDebateIndex === filteredQuestions.length - 1}
                          onClick={() => setCurrentDebateIndex(prev => prev + 1)}
                          className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-[-40px] right-[-10px] text-[180px] font-black text-white/5 select-none font-display leading-none leading-[0.8]">
                      {currentDebateIndex + 1}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Action Tray */}
              <div className="mt-auto flex gap-4 pt-10">
                <button 
                  onClick={() => {
                    setDebateMode(!debateMode);
                    setCurrentDebateIndex(0);
                  }}
                  className={`flex-1 py-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all border ${
                    debateMode 
                      ? 'bg-white text-black border-white' 
                      : 'border-white/20 text-white hover:bg-white hover:text-black'
                  }`}
                >
                  {debateMode ? 'Close Debate Stage' : 'Enter Debate Stage'}
                </button>
                <button 
                   onClick={() => window.print()}
                   className="flex-1 py-4 border border-white/20 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Sync System (.PDF)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
              <div className="text-center space-y-6 opacity-30">
                <LayoutGrid className="w-16 h-16 mx-auto stroke-[0.5]" />
                <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Awaiting Logic</h3>
                  <p className="text-xs uppercase font-bold tracking-widest">Input source to populate matrix</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-10 px-8 hidden md:flex justify-between items-center text-[9px] uppercase font-black tracking-[0.3em] text-white/30 border-t border-white/10 bg-[#0F0F11] shrink-0">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Link Active</span>
          <span>Session ID: SOC-2938-X</span>
          <span>GPU-Synthesized (v4.2)</span>
        </div>
        <div>© 2026 DebateQuest Lab. Thinking is Mandatory.</div>
      </footer>
    </div>
  );
}
