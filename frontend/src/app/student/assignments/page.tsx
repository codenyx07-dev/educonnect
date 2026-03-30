"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, Upload, ArrowLeft, Loader2, PlayCircle, Lock, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function StudentAssignments() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <AssignmentsContent />
    </ProtectedRoute>
  );
}

function AssignmentsContent() {
  const { getAuthHeader } = useAuthStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/students/assignments`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => { setAssignments(data.assignments || []); setLoading(false); })
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
              <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t('assignments.title')}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('assignments.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <LanguageSwitcher />
             <ThemeToggle />
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid gap-8">
            {assignments.map((assignment, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={assignment.id} 
                className={`p-10 rounded-[3rem] border-2 flex flex-col md:flex-row justify-between items-start md:items-center shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative ${
                  assignment.status === "submitted" || assignment.status === "graded"
                    ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800" 
                    : "bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-primary-100 dark:hover:border-primary-900"
                }`}
              >
                <div className="mb-6 md:mb-0 relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      assignment.subject === 'Mathematics' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' :
                      assignment.subject === 'Science' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                    }`}>{assignment.subject}</span>
                    <span className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5 mr-2" /> {t('assignments.due')}: {assignment.due}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{assignment.title}</h3>
                  {assignment.description && (
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-lg leading-relaxed">{assignment.description}</p>
                  )}
                  
                  {assignment.status === 'graded' && (
                     <div className="mt-6 flex items-center space-x-3 bg-white dark:bg-slate-900 shadow-inner border border-slate-100 dark:border-slate-800 p-3 rounded-2xl w-fit">
                        <Star className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Your Grade: <span className="text-primary-600 dark:text-primary-400">92/100</span></span>
                     </div>
                  )}
                </div>
                
                <div className="relative z-10 w-full md:w-auto">
                  {assignment.status === 'submitted' || assignment.status === 'graded' ? (
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 px-10 py-5 rounded-[1.5rem] shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 text-xs w-full justify-center">
                      <CheckCircle className="w-5 h-5 mr-3" /> {t('assignments.completed')}
                    </div>
                  ) : (
                    <button 
                      onClick={() => router.push(`/student/assignments/${assignment.id}`)} 
                      className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-black px-10 py-5 rounded-[1.5rem] transition-all shadow-xl shadow-primary-200 dark:shadow-primary-900/20 hover:scale-105 active:scale-95 text-xs uppercase tracking-widest w-full justify-center group"
                    >
                      <PlayCircle className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                      {t('assignments.take')}
                    </button>
                  )}
                </div>
                
                {/* Visual Flair */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl opacity-50 transition-transform group-hover:scale-150 duration-1000 -z-0"></div>
              </motion.div>
            ))}
            
            {assignments.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-slate-200 dark:border-slate-700">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                 </div>
                 <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Active Tasks Assigned Yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
