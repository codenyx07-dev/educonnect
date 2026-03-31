"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, MessageCircle, BookOpen, ChevronRight, LogOut, Loader2, ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";

export default function MentorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["mentor"]}>
      <MentorDashboardContent />
    </ProtectedRoute>
  );
}

function MentorDashboardContent() {
  const { user, logout, getAuthHeader } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/mentors/dashboard`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "My Students", value: stats?.totalStudents || "0", icon: <Users className="w-6 h-6" />, color: "bg-blue-500", shadow: "shadow-blue-200" },
    { label: "At-Risk Detection", value: stats?.atRiskCount || "0", icon: <AlertTriangle className="w-6 h-6" />, color: "bg-rose-500", shadow: "shadow-rose-200" },
    { label: "Pending Doubts", value: stats?.pendingDoubts || "0", icon: <MessageCircle className="w-6 h-6" />, color: "bg-amber-500", shadow: "shadow-amber-200" },
    { label: "Assignments", value: stats?.assignmentCount || "0", icon: <BookOpen className="w-6 h-6" />, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
  ];

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden lg:flex flex-col p-6 shadow-sm z-10 transition-colors">
        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 mb-10 px-2 tracking-tight">
          EduBridge
        </h2>
        <nav className="flex-1 space-y-2">
          {[
            { label: 'Overview', path: '/mentor', active: true },
            { label: 'My Students', path: '/mentor/students' },
            { label: 'Curriculum & Tasks', path: '/mentor/content' },
            { label: 'Message Center', path: '/mentor/chat' },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.path} 
              className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/20 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <span className="text-sm">{item.label}</span>
              {item.active && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></motion.div>}
            </Link>
          ))}
        </nav>
        <button onClick={() => { logout(); window.location.href='/login'; }} className="flex items-center space-x-3 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-bold mt-4">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Mentor Terminal</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Empowering the next generation of learners.</p>
          </div>
          <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <ThemeToggle />
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center space-x-3 px-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{user?.name || "Mentor"}</p>
                <p className="text-[10px] text-primary-600 font-bold">Verified Educator</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.name?.[0] || "M"}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
             <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {statCards.map((card, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 ${card.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <h4 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">{card.label}</h4>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{card.value}</span>
                    <span className="text-xs font-bold text-success flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> +2</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Critical Attention Students */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm h-full">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">AI Early Risk Alerts</h3>
                    <Link href="/mentor/students" className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:underline flex items-center">
                      View Full List <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {stats?.atRiskStudents?.map((student: any, i: number) => (
                      <motion.div 
                        key={i}
                        whileHover={{ x: 10 }}
                        className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-slate-400">
                             {student.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">{student.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">Risk: {student.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${student.risk === 'Critical' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                            {student.risk}
                          </div>
                          <Link href="/mentor/chat" className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors">
                            <MessageCircle className="w-4 h-4 text-slate-400" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                    {!stats?.atRiskStudents?.length && (
                      <div className="text-center py-10 text-slate-400 italic">No high-risk students detected. Great job!</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8 h-full">
                <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><BookOpen className="w-24 h-24" /></div>
                  <h3 className="text-2xl font-black mb-4 leading-tight relative z-10">Assign New Content</h3>
                  <p className="text-indigo-100 text-sm mb-8 font-medium leading-relaxed relative z-10">Deploy tasks to your student groups based on real-time mastery analytics.</p>
                  <Link href="/mentor/content" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-center block relative z-10">
                    Curate Assignment
                  </Link>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                   <h3 className="font-black text-slate-800 dark:text-white mb-6 flex items-center">
                     <Search className="w-4 h-4 mr-2 text-primary-500" /> Quick Search
                   </h3>
                   <div className="relative">
                     <input 
                       type="text" 
                       placeholder="Find a student..." 
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                           window.location.href = `/mentor/students?search=${(e.target as HTMLInputElement).value}`;
                         }
                       }}
                       className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-800 dark:text-white shadow-inner" 
                     />
                     <Search className="absolute right-4 top-4 w-5 h-5 text-slate-400" />
                   </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
