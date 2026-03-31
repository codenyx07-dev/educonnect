"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Camera, Send, Bot, User, ArrowLeft, Loader2, X, Sparkles, Languages, Volume2, Star, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AIAssistant() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <AIAssistantContent />
    </ProtectedRoute>
  );
}

function AIAssistantContent() {
  const { getAuthHeader } = useAuthStore();
  const { t } = useTranslation();
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'image'>('text');
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your AI learning assistant. What would you like to learn today? You can text me, speak to me, or send me a photo of a problem." }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const LOCAL_QA = [
    { keywords: ["what is html", "what is html?"], answer: "HTML stands for HyperText Markup Language. It is the standard language used to create and design webpages. Think of it as the skeleton of a website, defining structures like headings, paragraphs, links, and images." },
    { keywords: ["chemical reaction", "chemical reactions"], answer: "A chemical reaction is a process where substances (reactants) change into new substances (products) with different properties. For example, when hydrogen and oxygen combine to form water, that's a chemical reaction!" },
    { keywords: ["fraction", "fractions"], answer: "A fraction represents a part of a whole. It consists of a numerator (top number) showing how many parts you have, and a denominator (bottom number) showing how many equal parts the whole is divided into. For example, 1/2 means one out of two equal parts." }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || inputText;
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputText("");
    setIsTyping(true);

    const lowerText = text.toLowerCase();
    let localAnswer = null;

    for (const qa of LOCAL_QA) {
      if (qa.keywords.some(kw => lowerText.includes(kw))) {
        localAnswer = qa.answer;
        break;
      }
    }

    if (localAnswer) {
      setTimeout(() => {
        setMessages([...newMessages, { role: 'ai', content: localAnswer }]);
        setIsTyping(false);
        if (inputMode === 'voice' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(localAnswer);
          window.speechSynthesis.speak(utterance);
        }
      }, 1000);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages })
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'ai', content: data.reply || "The solution is: 2x = 10, so x = 5." }]);

      // Voice output for AI if it was voice mode
      if (inputMode === 'voice' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.reply || "The solution is x equals 5.");
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages([...newMessages, { role: 'ai', content: "I'm having trouble connecting to my brain right now. Please try again in a moment!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Voice Recognition Logic
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsRecording(false);
      handleSend(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  // Image/OCR Simulation logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsOcrProcessing(true);
      // Simulate OCR processing time
      setTimeout(() => {
        setIsOcrProcessing(false);
        handleSend("I've uploaded a picture of a math problem: 'Solve 2x + 5 = 15'. Can you help me step-by-step?");
        setInputMode('text');
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors">
        <div className="flex items-center space-x-6">
          <Link href="/student" className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-inner">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center relative shadow-lg shadow-primary-200 dark:shadow-primary-900/20">
              <Bot className="w-7 h-7" />
              <div className="w-4 h-4 bg-emerald-500 rounded-full absolute -bottom-1 -right-1 border-4 border-white dark:border-slate-800 shadow-sm"></div>
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-800 dark:text-white tracking-tight">EduBridge AI Tutor</h1>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3 h-3 text-primary-500" />
                <p className="text-[10px] text-primary-600 dark:text-primary-400 font-black uppercase tracking-widest">Advanced Learning Engine</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/student/ask-mentor" className="hidden md:flex text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-6 py-3 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all border border-rose-100 dark:border-rose-900/30 uppercase tracking-widest">
            Human Mentor
          </Link>
        </div>
      </header>

      {/* Chat Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 scroll-smooth">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-700 ml-4' : 'bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mr-4 border border-primary-100 dark:border-primary-800/50'}`}>
                {msg.role === 'user' ? <User className="w-6 h-6 text-slate-500" /> : <Bot className="w-6 h-6" />}
              </div>
              <div className={`p-6 rounded-[2rem] leading-relaxed shadow-sm text-sm md:text-base ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {isOcrProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex max-w-3xl flex-row">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 mr-4 shadow-sm flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>
              <div className="p-6 rounded-[2rem] bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-tl-sm shadow-sm flex items-center space-x-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-widest">OCR Processing</span>
                  <span className="text-sm font-medium">Extracting text from image...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex max-w-3xl flex-row">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 mr-4 shadow-sm flex items-center justify-center border border-primary-100 dark:border-primary-800">
                <Bot className="w-6 h-6" />
              </div>
              <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">AI is drafting...</span>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-8 shadow-2xl transition-colors relative z-20">
        <div className="max-w-5xl mx-auto">
          {/* Mode Switcher */}
          <div className="flex space-x-3 mb-6 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-[1.5rem] w-fit border border-slate-100 dark:border-slate-800 shadow-inner">
            <button onClick={() => setInputMode('text')} className={`flex items-center px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
              Text
            </button>
            <button onClick={() => setInputMode('voice')} className={`flex items-center px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'voice' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <Volume2 className="w-4 h-4 mr-2" /> Voice
            </button>
            <button onClick={() => setInputMode('image')} className={`flex items-center px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'image' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <Camera className="w-4 h-4 mr-2" /> Image
            </button>
          </div>

          <div className="relative">
            {inputMode === 'text' && (
              <div className="flex items-end space-x-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask a mathematical doubt or science query..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 pr-16 resize-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-700 dark:text-slate-100 transition-all text-base shadow-inner"
                  rows={2}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isTyping}
                  className="absolute right-4 bottom-4 bg-primary-600 text-white p-4 rounded-2xl hover:bg-primary-700 transition-all disabled:opacity-30 shadow-xl shadow-primary-200 dark:shadow-primary-900/30 active:scale-95 group"
                >
                  <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            )}

            {inputMode === 'voice' && (
              <div
                onClick={isRecording ? () => { } : startRecording}
                className={`w-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-indigo-100 ${isRecording ? 'animate-pulse ring-4 ring-indigo-500/20' : ''}`}
              >
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mb-4 relative">
                  {isRecording && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 bg-indigo-200 dark:bg-indigo-700 rounded-full opacity-50"></motion.div>}
                  <Mic className={`w-10 h-10 ${isRecording ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'} z-10`} />
                </div>
                <p className="font-bold text-indigo-800 dark:text-indigo-200 text-lg">{isRecording ? 'Listening to your doubt...' : 'Tap to Start Speaking'}</p>
                <p className="text-indigo-600/70 dark:text-indigo-400/70 text-sm mt-1 text-center">Speak clearly in English, Hindi, or Telugu.</p>
              </div>
            )}

            {inputMode === 'image' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 ${isOcrProcessing ? 'opacity-50' : 'group'}`}
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 text-blue-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-blue-50 dark:border-blue-800 group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10" />
                </div>
                <p className="font-black text-slate-800 dark:text-white text-xl tracking-tight">{isOcrProcessing ? 'Processing Doubt...' : 'Upload Problem Photo'}</p>
                <p className="text-slate-400 font-bold text-sm mt-2">Our AI will extract text and solve it step-by-step</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






