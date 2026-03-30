"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Trophy, Star, ArrowLeft, Zap, Loader2, Sparkles, Target, Flame } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-10 h-10 text-orange-500" />,
  Star: <Star className="w-10 h-10 text-yellow-500" />,
  Trophy: <Trophy className="w-10 h-10 text-primary-500" />,
  Award: <Award className="w-10 h-10 text-emerald-500" />,
};

export default function StudentBadges() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <BadgesContent />
    </ProtectedRoute>
  );
}

function BadgesContent() {
  const { getAuthHeader } = useAuthStore();
  const { t } = useTranslation();
  const [badges, setBadges] = useState<any[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/students/badges`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        setBadges(data.badges || []);
        setTotalXP(data.totalXP || 0);
        setLevel(data.level || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <main className="flex-1 p-8 md:p-12 max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
            <Link href="/student" className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t('nav.badges')}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Your achievements and learning milestones.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <LanguageSwitcher />
             <ThemeToggle />
          </div>
        </header>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <div className="md:col-span-2 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10 flex justify-between items-end">
                 <div>
                    <h2 className="text-xl font-bold opacity-80 mb-1 uppercase tracking-widest text-[10px]">Total Experience</h2>
                    <div className="flex items-baseline space-x-3">
                       <span className="text-7xl font-black tracking-tighter">{totalXP.toLocaleString()}</span>
                       <span className="text-2xl font-black opacity-60">XP</span>
                    </div>
                    <div className="mt-8 flex items-center bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-2xl w-fit">
                       <Sparkles className="w-4 h-4 mr-2" />
                       <span className="text-xs font-black uppercase tracking-widest leading-none">Level {level} Achiever</span>
                    </div>
                 </div>
                 <div className="hidden lg:block w-32 h-32 bg-white/20 rounded-[2rem] backdrop-blur-xl border border-white/30 flex items-center justify-center p-6">
                    <Trophy className="w-full h-full text-white" />
                 </div>
              </div>
           </div>
           
           <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center text-center shadow-sm">
              <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/30 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-orange-100 dark:border-orange-900/30">
                 <Flame className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">10 Day Streak</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">You&apos;re 4 days away from your next big bonus!</p>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                 <div className="h-full bg-orange-500 w-[60%] rounded-full shadow-lg shadow-orange-500/40"></div>
              </div>
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 px-4">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Your Trophy Collection</h3>
               <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-black text-xs uppercase">
                  <span>Show All Achievement</span>
                  <Target className="w-4 h-4" />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {badges.map((badge: any, i: number) => (
                <motion.div 
                  key={badge._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-10 rounded-[3rem] border-2 flex flex-col items-center text-center shadow-sm transition-all hover:shadow-2xl hover:scale-105 group relative overflow-hidden bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700`}
                >
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700`}>
                    {iconMap[badge.icon] || <Award className="w-10 h-10 text-emerald-500" />}
                  </div>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{badge.title}</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-2">{badge.description}</p>
                  <div className="mt-auto flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/30 px-5 py-2.5 rounded-2xl border border-primary-100 dark:border-primary-800/50">
                     <span className="text-xs font-black text-primary-600 dark:text-primary-400">+{badge.xpValue} XP</span>
                  </div>
                  
                  {/* Visual Background Element */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              ))}
              {badges.length === 0 && (
                <div className="col-span-full text-center py-24 flex flex-col items-center">
                   <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner text-slate-300">
                      <Trophy className="w-10 h-10" />
                   </div>
                   <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No badges earned yet. Keep learning to unlock trophies!</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
