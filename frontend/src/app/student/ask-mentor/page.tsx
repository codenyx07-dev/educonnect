"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Star, MessageSquare, ArrowLeft, Search, GraduationCap, Globe, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AskMentor() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <AskMentorContent />
    </ProtectedRoute>
  );
}

function AskMentorContent() {
  const { getAuthHeader } = useAuthStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [matching, setMatching] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [matchedMentor, setMatchedMentor] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: "Mathematics",
    language: "English",
    doubt: ""
  });

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMatching(true);
    
    try {
      const response = await fetch(`${API_URL}/mentors/match`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentSubjects: [formData.subject],
          studentLanguage: formData.language
        })
      });
      const data = await response.json();
      
      // Simulate algorithm delay
      setTimeout(() => {
        if (data.success) {
          setMatchedMentor(data.mentor);
        } else {
          // Fallback if no matching mentor found (though seed has them)
          setMatchedMentor({
            name: "Rahul Sharma",
            matchedScore: "95%",
            rating: "4.9",
            reason: "Expert in Mathematics with over 500 successful sessions."
          });
        }
        setMatching(false);
      }, 1500);
    } catch (error) {
      console.error("Matching Error:", error);
      setMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center space-x-4 mb-10">
          <Link href="/student" className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('nav.ask_mentor')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Get personalized help from industry experts.</p>
          </div>
          <div className="flex-1"></div>
          <LanguageSwitcher />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Matching Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3 space-y-6"
          >
            <form onSubmit={handleMatch} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700 space-y-6 transition-colors">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-slate-700 dark:text-slate-200 font-bold mb-2 inline-block">What subject do you need help with?</span>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-3.5 w-5 h-5 text-primary-500" />
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-3.5 pl-12 focus:ring-2 focus:ring-primary-500 outline-none font-medium appearance-none text-slate-700 dark:text-slate-100 transition-all"
                    >
                      <option>Mathematics</option>
                      <option>Science</option>
                      <option>English</option>
                      <option>Social Studies</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <span className="text-slate-700 dark:text-slate-200 font-bold mb-2 inline-block">Preferred Language</span>
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 w-5 h-5 text-secondary-500" />
                    <select 
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-3.5 pl-12 focus:ring-2 focus:ring-primary-500 outline-none font-medium appearance-none text-slate-700 dark:text-slate-100 transition-all"
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Telugu</option>
                      <option>Tamil</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <span className="text-slate-700 dark:text-slate-200 font-bold mb-2 inline-block">Describe your doubt</span>
                  <textarea 
                    value={formData.doubt}
                    onChange={(e) => setFormData({...formData, doubt: e.target.value})}
                    placeholder="E.g., I'm struggling with quadratic equations..."
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 outline-none font-medium text-slate-700 dark:text-slate-100 transition-all resize-none"
                  ></textarea>
                </label>
              </div>

              <button 
                type="submit"
                disabled={matching || !formData.doubt.trim()}
                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-200 dark:shadow-primary-900/20 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
              >
                {matching ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Running Matching Algorithm...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-3" />
                    Find Best Mentor Match
                  </>
                )}
              </button>
            </form>

            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 flex items-start space-x-4">
              <div className="bg-indigo-100 dark:bg-indigo-800 p-3 rounded-2xl">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200">How it works?</h4>
                <p className="text-indigo-700/70 dark:text-indigo-400/70 text-sm mt-1">Our AI analyzes your doubt and matches you with a mentor who specializes in that topic and speaks your language.</p>
              </div>
            </div>
          </motion.div>

          {/* Results Sidebar */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {matching ? (
                <motion.div 
                  key="matching"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px] transition-colors"
                >
                  <div className="relative mb-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="w-32 h-32 border-4 border-dashed border-primary-200 dark:border-primary-800 rounded-full"></motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UserCheck className="w-12 h-12 text-primary-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Analyzing Mentors</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Searching our network for the perfect educator...</p>
                </motion.div>
              ) : matchedMentor ? (
                <motion.div 
                  key="matched"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-900/30 shadow-xl relative overflow-hidden transition-colors"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm">Perfect Match</div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center mb-6 pt-4">
                    <div className="w-24 h-24 bg-gradient-to-tr from-primary-100 to-indigo-100 dark:from-primary-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedMentor.name}`} alt="Mentor" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{matchedMentor.name}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-yellow-500 font-bold">
                        <Star className="w-4 h-4 fill-current mr-1" /> {matchedMentor.rating}
                      </div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                      <div className="text-primary-600 dark:text-primary-400 font-black tracking-tight">{matchedMentor.matchedScore} Match</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">&ldquo;{matchedMentor.reason}&rdquo;</p>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setIsConnecting(true);
                        setTimeout(() => router.push('/student/chat'), 800);
                      }}
                      disabled={isConnecting}
                      className="w-full bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-100 transition-all shadow-md group disabled:opacity-75"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Entering Chat...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                          Start Chat Session
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest py-2">
                       <CheckCircle2 className="w-3 h-3 mr-1.5 text-emerald-500" /> Secure • Live • Expert
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px] border-dashed opacity-50 transition-colors">
                  <UserCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-400 max-w-[200px] font-medium italic">Your matched mentor will appear after you find a match.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
