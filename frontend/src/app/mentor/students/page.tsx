"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MessageSquare, AlertTriangle, User, ArrowLeft, Loader2, MoreHorizontal, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";

export default function MentorStudents() {
  return (
    <ProtectedRoute allowedRoles={["mentor"]}>
      <MentorStudentsContent />
    </ProtectedRoute>
  );
}

function MentorStudentsContent() {
  const { getAuthHeader } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/mentors/students`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => { setStudents(data.students || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/mentor" className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Student Management</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring academic performance & risk alerts.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <ThemeToggle />
             <button className="bg-primary-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary-100 dark:shadow-primary-900/20 hover:scale-105 active:scale-95 transition-all">
                Export Reports
             </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl mb-8 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-100"
            />
          </div>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter Risk</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
             <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
             <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Fetching Roster...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="Student" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.riskColor}`}>
                    {student.risk}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{student.name}</h3>
                  <div className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                     <span className="text-primary-600 dark:text-primary-400">{student.subject}</span>
                     <span className="mx-2">•</span>
                     <span>Last Mastery: {student.score}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-slate-50 dark:border-slate-700">
                  <Link href="/mentor/chat" className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl py-2.5 font-bold text-sm hover:opacity-90 transition-opacity underline decoration-transparent">
                     <MessageSquare className="w-4 h-4" />
                     <span>Message</span>
                  </Link>
                  <button className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                     <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
            {!filteredStudents.length && (
              <div className="col-span-full py-20 text-center">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Search className="w-8 h-8 text-slate-300" />
                 </div>
                 <p className="text-slate-500 font-bold italic">No students matching your search.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
