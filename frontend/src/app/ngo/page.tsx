"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Star, Activity, Globe, ShieldAlert, Download, LogOut, Map, Clock } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from 'next/link';

export default function NgoDashboard() {
  return (
    <ProtectedRoute allowedRoles={["ngo"]}>
      <NgoDashboardContent />
    </ProtectedRoute>
  );
}

function NgoDashboardContent() {
  const { user, getAuthHeader, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [mentors, setMentors] = useState<any[]>([]);
  const [localMatches, setLocalMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recentNgoMatches') || '[]');
      setLocalMatches(saved);
    } catch (e) {}

    // Fetch stats and mentor list
    fetch(`${API_URL}/dashboard/ngo`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        // Mocking mentor list for display
        setMentors([
          { name: "Dr. Ananya Sharma", students: 12, rating: 4.8, status: "Active", primarySubject: "Math" },
          { name: "Prof. Rajesh Kumar", students: 8, rating: 4.5, status: "Active", primarySubject: "Science" },
          { name: "Sarah Jenkins", students: 15, rating: 4.9, status: "Active", primarySubject: "English" },
          { name: "Amit Patel", students: 5, rating: 4.2, status: "On Leave", primarySubject: "History" },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <Globe className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Social Impact Dashboard</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">NGO Administrative Oversight</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <ThemeToggle />
             <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-2xl">
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">{user?.name}</p>
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center font-bold text-indigo-600">N</div>
             </div>
             <button onClick={() => { logout(); window.location.href = '/login'; }} className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
           {[
             { label: "Total Impacted", value: stats?.totalImpacted || "1,248", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
             { label: "Active Mentors", value: stats?.totalMentors || "42", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
             { label: "Avg Platform Rating", value: "4.7/5", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
             { label: "Critical Support Needed", value: stats?.criticalZonesCount || "8", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
           ].map((stat, i) => (
             <motion.div 
               key={i} 
               initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: i * 0.1}}
               className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-xl transition-all"
             >
               <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                 <stat.icon className="w-7 h-7" />
               </div>
               <p className="text-[11px] uppercase font-black text-slate-400 tracking-widest mb-1">{stat.label}</p>
               <div className="flex items-baseline space-x-2">
                 <h2 className="text-3xl font-black text-slate-800 dark:text-white">{stat.value}</h2>
                 <span className="text-emerald-500 text-[10px] font-black">+14%</span>
               </div>
             </motion.div>
           ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Mentor Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-10">
               <div>
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Mentor Performance</h3>
                 <p className="text-slate-400 text-sm font-medium mt-1">Real-time status of academic educators</p>
               </div>
               <div className="flex space-x-3">
                 <button className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-500"><Download className="w-5 h-5" /></button>
                 <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">Add New Mentor</button>
               </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50 dark:border-slate-700 pb-4">
                      <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Educator</th>
                      <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Students</th>
                      <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Avg Rating</th>
                      <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                      <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {mentors.map((mentor, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-6">
                           <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shadow-inner border border-white dark:border-slate-600 flex items-center justify-center p-1">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} alt="Avatar" />
                              </div>
                              <p className="font-bold text-slate-700 dark:text-slate-200">{mentor.name}</p>
                           </div>
                        </td>
                        <td className="py-6 text-center font-black text-slate-800 dark:text-white">{mentor.students}</td>
                        <td className="py-6">
                           <div className="flex items-center justify-center space-x-1.5 text-amber-500 font-black">
                             <Star className="w-4 h-4 fill-amber-500" />
                             <span>{mentor.rating}</span>
                           </div>
                        </td>
                        <td className="py-6">
                          <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black uppercase tracking-widest">{mentor.primarySubject}</span>
                        </td>
                        <td className="py-6 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${mentor.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {mentor.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>

          {/* Impact Snapshot */}
          <div className="space-y-10">
            <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
               <h3 className="text-xl font-black mb-6">Mission Progress</h3>
               <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3 text-indigo-200">
                       <span>Student Reach</span>
                       <span>82%</span>
                    </div>
                    <div className="h-3 bg-indigo-900/30 rounded-full overflow-hidden border border-indigo-400/20">
                       <motion.div initial={{width: 0}} animate={{width: '82%'}} className="h-full bg-white shadow-[0_0_20px_white]"></motion.div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3 text-indigo-200">
                       <span>Mentor Capacity</span>
                       <span>65%</span>
                    </div>
                    <div className="h-3 bg-indigo-900/30 rounded-full overflow-hidden border border-indigo-400/20">
                       <motion.div initial={{width: 0}} animate={{width: '65%'}} className="h-full bg-indigo-300"></motion.div>
                    </div>
                  </div>
               </div>
               <button className="w-full mt-10 bg-white text-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Generate Global Report</button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-700 shadow-sm">
               <h3 className="text-[11px] uppercase font-black text-slate-400 tracking-widest mb-8 flex items-center">
                 <Activity className="w-4 h-4 mr-2 text-rose-500" /> Platform Velocity
               </h3>
               <div className="space-y-6">
                  {[
                    { label: "Lesson Completion", value: "92%", color: "text-emerald-500" },
                    { label: "Community Engagement", value: "78%", color: "text-blue-500" },
                    { label: "Response Time", value: "1.2h", color: "text-amber-500" },
                  ].map((metric, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                       <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{metric.label}</p>
                       <p className={`font-black ${metric.color}`}>{metric.value}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Local Storage Matches & Regional Penetration Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
           {/* Regional Map */}
           <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="flex justify-between items-center mb-10">
               <div>
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center">
                   <Map className="w-6 h-6 mr-3 text-indigo-500" />
                   Regional Penetration
                 </h3>
                 <p className="text-slate-400 text-sm font-medium mt-1">Student distribution across geographical zones</p>
               </div>
             </div>
             
             <div className="relative w-full h-80 bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-6 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="absolute inset-0 opacity-20 dark:opacity-40">
                   <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                     <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor"/></pattern></defs>
                     <rect width="100%" height="100%" fill="url(#dots)" className="text-slate-300 dark:text-slate-700"/>
                   </svg>
                </div>

                <div className="relative z-10 w-full max-w-lg h-full grid grid-cols-3 grid-rows-3 gap-4">
                   {/* North */}
                   <div className="col-start-2 row-start-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white dark:border-slate-600 flex flex-col items-center justify-center transform hover:scale-105 transition-transform cursor-pointer group">
                      <div className="text-rose-500 font-black text-xl mb-1">34%</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">North Region</div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                         <div className="h-full bg-rose-500 w-[34%]"></div>
                      </div>
                   </div>
                   {/* West */}
                   <div className="col-start-1 row-start-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white dark:border-slate-600 flex flex-col items-center justify-center transform hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-blue-500 font-black text-xl mb-1">18%</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">West Region</div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                         <div className="h-full bg-blue-500 w-[18%]"></div>
                      </div>
                   </div>
                   {/* Central */}
                   <div className="col-start-2 row-start-2 bg-emerald-500 text-white rounded-[2rem] shadow-2xl shadow-emerald-500/30 flex flex-col items-center justify-center transform scale-110 z-20 hover:scale-125 transition-transform cursor-pointer relative overflow-hidden">
                      <div className="absolute inset-0 bg-white opacity-20 rounded-[2rem] animate-ping"></div>
                      <div className="font-black text-2xl mb-1">45%</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 text-center">Central Hub</div>
                   </div>
                   {/* East */}
                   <div className="col-start-3 row-start-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white dark:border-slate-600 flex flex-col items-center justify-center transform hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-amber-500 font-black text-xl mb-1">12%</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">East Region</div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                         <div className="h-full bg-amber-500 w-[12%]"></div>
                      </div>
                   </div>
                   {/* South */}
                   <div className="col-start-2 row-start-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white dark:border-slate-600 flex flex-col items-center justify-center transform hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-indigo-500 font-black text-xl mb-1">28%</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">South Region</div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                         <div className="h-full bg-indigo-500 w-[28%]"></div>
                      </div>
                   </div>
                </div>
             </div>
           </div>

           {/* Live Local Matches */}
           <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-700 shadow-sm">
             <h3 className="text-[11px] uppercase font-black text-slate-400 tracking-widest mb-8 flex items-center">
               <Clock className="w-4 h-4 mr-2 text-emerald-500" /> Recent Live Matches
             </h3>
             <div className="space-y-4">
                {localMatches.length > 0 ? localMatches.map((match, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:scale-105 transition-transform cursor-pointer">
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold overflow-hidden shadow-inner border border-white dark:border-slate-600">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.name}`} alt="Avatar" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{match.name}</p>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{match.primarySubject || 'General'} • {match.matchedScore}</p>
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <p className="text-slate-400 text-sm font-bold">No live matches in this session.</p>
                  </div>
                )}
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}
