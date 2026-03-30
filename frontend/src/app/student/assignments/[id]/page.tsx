"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle, Loader2, Target, Trophy, X, ChevronRight, Calculator, BookOpen, ScrollText } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function TakeAssignment() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <TakeAssignmentContent />
    </ProtectedRoute>
  );
}

function TakeAssignmentContent() {
  const { id } = useParams();
  const router = useRouter();
  const { getAuthHeader } = useAuthStore();
  const { t } = useTranslation();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    fetch(`${API_URL}/students/assignments/${id}`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.isSubmitted) {
           router.push('/student/assignments');
        } else {
           setAssignment(data.assignment);
           setAnswers(new Array(data.assignment?.questions?.length || 0).fill(-1));
           setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (loading || result || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [loading, result, timeLeft]);

  const selectOption = (optIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/students/assignments/${id}/submit`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
       <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
    </div>
  );

  if (result) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center transition-colors">
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-xl w-full"
       >
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
             <Trophy className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">Challenge Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 text-lg">Great effort! Your score has been recorded and your mentor has been notified.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
             <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Final Score</p>
                <p className="text-3xl font-black text-primary-600 dark:text-primary-400">{result.score}%</p>
             </div>
             <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">XP Earned</p>
                <p className="text-3xl font-black text-orange-500">{result.score >= 90 ? '+150' : '+50'}</p>
             </div>
          </div>
          
          <button 
            onClick={() => router.push('/student')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary-200 dark:shadow-primary-900/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
             Back to Dashboard
          </button>
       </motion.div>
    </div>
  );

  const questions = assignment.questions || [];
  const currentQ = questions[currentQuestion];
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col">
       {/* Header */}
       <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 px-10 flex items-center justify-between transition-all shadow-sm relative z-10">
          <div className="flex items-center space-x-6">
             <button onClick={() => router.push('/student/assignments')} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-inner">
                <X className="w-5 h-5 text-slate-500" />
             </button>
             <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{assignment.title}</h2>
                <div className="flex items-center space-x-3 mt-1">
                   <span className="text-[10px] items-center font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">{assignment.subject}</span>
                   <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 mr-1.5" /> Time Left: {formatTime(timeLeft)}
                   </div>
                </div>
             </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             <div className="flex items-center space-x-2 mr-6 h-2 bg-slate-100 dark:bg-slate-700 w-64 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  className="h-full bg-primary-600"
                ></motion.div>
             </div>
             <LanguageSwitcher />
             <ThemeToggle />
          </div>
       </header>

       {/* Question Content */}
       <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-12">
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl"
          >
             <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border-2 border-white dark:border-slate-800">
                   {currentQuestion + 1}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight">{currentQ?.question}</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                {currentQ?.options?.map((option: string, idx: number) => (
                   <button
                     key={idx}
                     onClick={() => selectOption(idx)}
                     className={`p-8 rounded-[2.5rem] text-left text-lg font-bold transition-all relative group overflow-hidden border-2 ${
                       answers[currentQuestion] === idx 
                         ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-200 dark:shadow-primary-900/30' 
                         : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-800 text-slate-700 dark:text-slate-200 hover:shadow-lg'
                     }`}
                   >
                      <div className="relative z-10 flex items-center">
                         <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-5 text-sm font-black border-2 ${answers[currentQuestion] === idx ? 'bg-white/20 border-white/40' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:border-primary-100'}`}>
                            {String.fromCharCode(65 + idx)}
                         </div>
                         {option}
                      </div>
                      {answers[currentQuestion] === idx && (
                        <motion.div layoutId="selection" className="absolute inset-0 bg-primary-600 -z-0"></motion.div>
                      )}
                   </button>
                ))}
             </div>
          </motion.div>
       </main>

       {/* Footer Controls */}
       <footer className="bg-white dark:bg-slate-800 p-8 px-10 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center transition-all shadow-sm">
          <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
             Step {currentQuestion + 1} of {questions.length} • Accurate Selection Required
          </div>
          <div className="flex space-x-6">
             <button 
               disabled={currentQuestion === 0}
               onClick={() => setCurrentQuestion(prev => prev - 1)}
               className="p-5 px-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-30 flex items-center text-xs uppercase tracking-widest shadow-inner active:scale-95"
             >
                <ArrowLeft className="w-4 h-4 mr-3" /> Back
             </button>
             
             {currentQuestion === questions.length - 1 ? (
               <button 
                 disabled={submitting || answers.includes(-1)}
                 onClick={handleSubmit}
                 className="p-5 px-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all flex items-center shadow-xl shadow-emerald-200 dark:shadow-emerald-900/30 text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50"
               >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <ScrollText className="w-4 h-4 mr-3" />} Complete Task
               </button>
             ) : (
               <button 
                 onClick={() => setCurrentQuestion(prev => prev + 1)}
                 className="p-5 px-14 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black transition-all flex items-center shadow-xl shadow-primary-200 dark:shadow-primary-900/30 text-xs uppercase tracking-widest active:scale-95 group"
               >
                  Next Problem <ChevronRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
               </button>
             )}
          </div>
       </footer>

       {/* Interactive Visual Elements */}
       <div className="fixed top-1/2 left-0 -translate-y-1/2 -z-10 opacity-20 hidden lg:block">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="p-20 text-indigo-500/20"><Calculator className="w-64 h-64" /></motion.div>
       </div>
       <div className="fixed top-1/2 right-0 -translate-y-1/2 -z-10 opacity-20 hidden lg:block">
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="p-20 text-purple-500/20"><BookOpen className="w-64 h-64" /></motion.div>
       </div>
    </div>
  );
}
