"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Target, Flame, ChevronRight, MessageSquare, PlayCircle, BellRing, X, LogOut, Loader2, User, Calendar } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}

function StudentDashboardContent() {
  const { user, logout, getAuthHeader } = useAuthStore();
  const { t } = useTranslation();
  const [showReminder, setShowReminder] = useState(false);
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setShowReminder(true), 2500);
    loadData();
    return () => clearTimeout(timer);
  }, []);

  const loadData = () => {
    fetch(`${API_URL}/students/dashboard`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => { setDashData(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const analyzePerformance = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_URL}/ai/analyze-performance`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: progressData })
      });
      const data = await res.json();
      setAiInsight(data.analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const postFeedback = async () => {
    try {
      const res = await fetch(`${API_URL}/students/mentor/feedback`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 5, comment: "Great support!" })
      });
      if (res.ok) alert("Thank you for your feedback!");
    } catch (e) { console.error(e); }
  };

  const endSession = async () => {
    if (!confirm("Are you sure you want to end this session? You will need to rematched later.")) return;
    try {
      const res = await fetch(`${API_URL}/students/mentor/end-session`, {
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        method: 'POST'
      });
      if (res.ok) {
        alert("Session ended. Redirecting...");
        loadData();
      }
    } catch (e) { console.error(e); }
  };

  const toggleGoal = (idx: number) => {
    const newData = { ...dashData };
    if (newData.dailyGoals) {
      newData.dailyGoals[idx].done = !newData.dailyGoals[idx].done;
      setDashData(newData);
    }
  };

  const dailyGoals = [
    { label: "Complete Math Quiz", done: false },
    { label: "Read Science Chapter", done: false },
    { label: "Practice English Vocab", done: false }
  ];

  const progressData = dashData?.weeklyScores?.length > 0
    ? dashData.weeklyScores
    : [
        { day: 'Mon', score: 65 }, { day: 'Tue', score: 68 }, { day: 'Wed', score: 75 },
        { day: 'Thu', score: 71 }, { day: 'Fri', score: 85 }, { day: 'Sat', score: 82 }, { day: 'Sun', score: 90 },
      ];

  const streak = dashData?.streak || 1;
  const mentor = dashData?.mentor || { name: "Dr. Ananya Sharma", subject: "Math Expert", rating: 4.8 };
  
  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 transition-colors min-h-screen relative overflow-hidden">
      
      {/* Reminder Toast System */}
      <AnimatePresence>
        {showReminder && dashData?.pendingAssignments > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-indigo-400"
          >
            <BellRing className="w-6 h-6 animate-pulse" />
            <div>
              <p className="font-bold text-sm">System Reminder</p>
              <p className="text-indigo-100 text-xs mt-0.5">Don&apos;t forget your tasks are waiting! Check your assignments.</p>
            </div>
            <button onClick={() => setShowReminder(false)} className="bg-indigo-700 p-1.5 rounded-full hover:bg-indigo-800 transition-colors ml-4">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col p-6 shadow-sm z-10 transition-colors">
        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500 mb-8 tracking-tight px-2">
          EduBridge AI
        </h2>
        <nav className="flex-1 space-y-2">
          {['dashboard', 'assignments', 'ai_assistant', 'ask_mentor', 'badges'].map((key, i) => {
            const paths = ['/student', '/student/assignments', '/student/ai-assistant', '/student/ask-mentor', '/student/badges'];
            return (
              <Link key={i} href={paths[i]} className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all ${i === 0 ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/20 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                <span className="text-sm">{t(`nav.${key}`)}</span>
                {i === 0 && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></motion.div>}
              </Link>
            )
          })}
          {user?.role === 'ngo' && (
            <Link href="/ngo" className="flex items-center space-x-3 p-3.5 rounded-2xl text-indigo-600 hover:bg-indigo-50 font-bold">
               <span className="text-sm">NGO Portal</span>
            </Link>
          )}
        </nav>
        <button onClick={() => { logout(); window.location.href = '/login'; }} className="flex items-center space-x-3 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-bold mt-4">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">{t('nav.logout')}</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'Student'} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('dashboard.journey')}</p>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full font-black text-sm uppercase tracking-tighter">
              <Flame className="w-5 h-5 mr-2" /> {streak} {t('dashboard.streak')}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            <motion.div 
              initial={{opacity: 0, y: 10}} 
              animate={{opacity: 1, y: 0}}
              className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('dashboard.progress')}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Academic Insights Powered by AI</p>
                </div>
                <button 
                  onClick={analyzePerformance}
                  disabled={analyzing}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-lg transition-all active:scale-95"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Target className="w-4 h-4 mr-2" />}
                  Analyze with AI
                </button>
              </div>

              {aiInsight && (
                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl text-sm font-medium text-indigo-700 dark:text-indigo-300 leading-relaxed italic">
                  &quot;{aiInsight}&quot;
                </motion.div>
              )}

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={6} dot={{r: 6, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 10}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div 
              initial={{opacity: 0, y: 10}} 
              animate={{opacity: 1, y: 0}} 
              transition={{delay: 0.1}}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-[10s]"></div>
                <h4 className="font-black text-white/70 uppercase text-[11px] tracking-widest mb-3">{t('dashboard.next_lesson')}</h4>
                <h3 className="text-3xl font-black mb-8 leading-tight">Advanced Logic: Complex Probabilities</h3>
                <Link href="/student/assignments" className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-black text-sm inline-flex items-center shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                  <PlayCircle className="w-5 h-5 mr-3" /> {t('dashboard.start_now')}
                </Link>
              </div>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary-500" /> Your Assigned Mentor
                </h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center shadow-inner overflow-hidden border border-slate-200 dark:border-slate-600">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} alt="Mentor" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white text-lg">{mentor.name}</p>
                    <p className="text-xs font-bold text-slate-400 tracking-wide">{mentor.subject} Expert • {mentor.rating}⭐</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={postFeedback} className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all">Support Feedback</button>
                  <button onClick={endSession} className="px-5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all">End Session</button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-10">
            <motion.div 
              initial={{opacity: 0, x: 10}} 
              animate={{opacity: 1, x: 0}}
              className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-8 flex items-center uppercase tracking-widest text-xs">
                <Target className="w-5 h-5 mr-3 text-rose-500" /> {t('dashboard.goals')}
              </h3>
              <div className="space-y-4">
                {(dashData?.dailyGoals || dailyGoals).map((task: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => toggleGoal(i)}
                    className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-primary-200 transition-colors cursor-pointer group"
                  >
                    <div className={`w-7 h-7 rounded-xl flex justify-center items-center border-2 transition-all ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700 group-hover:border-primary-500'}`}>
                      {task.done && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm font-bold ${task.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{task.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-900/80 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
                 <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl flex items-center justify-center mb-6 relative z-10"><Flame className="w-8 h-8 text-orange-500 animate-bounce" /></div>
                 <h4 className="font-black text-slate-800 dark:text-white text-lg mb-2 relative z-10">{streak} {t('dashboard.streak')} Day Streak</h4>
                 <p className="text-[11px] uppercase font-bold text-slate-400 tracking-widest relative z-10">Ignite Your Potential</p>
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-100 dark:bg-orange-900/10 rounded-full blur-3xl opacity-50"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
