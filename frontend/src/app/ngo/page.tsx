"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Users, AlertTriangle, TrendingUp, ChevronRight, LogOut, Loader2, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";

export default function NgoDashboard() {
  return (
    <ProtectedRoute allowedRoles={["ngo"]}>
      <NgoDashboardContent />
    </ProtectedRoute>
  );
}

function NgoDashboardContent() {
  const { user, logout, getAuthHeader } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/ngo`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => { setData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Students Impacted", value: data?.totalImpacted || "0", icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Critical Intervention Zones", value: data?.criticalZonesCount || "0", icon: <AlertTriangle className="w-5 h-5" />, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
    { label: "Active Mentors", value: data?.totalMentors || "0", icon: <Globe className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
    { label: "Success Rate", value: "92%", icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  ];

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden lg:flex flex-col p-6 shadow-sm z-10 transition-colors">
        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 mb-10 px-2 tracking-tight">
          EduBridge NGO
        </h2>
        <nav className="flex-1 space-y-2">
          {[
            { label: 'Impact Heatmap', path: '/ngo', active: true },
            { label: 'Regional Reports', path: '/ngo/reports' },
            { label: 'Volunteer Network', path: '#' },
            { label: 'Data Export', path: '#' },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.path} 
              className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <span className="text-sm">{item.label}</span>
              {item.active && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></motion.div>}
            </Link>
          ))}
        </nav>
        <button onClick={() => { logout(); window.location.href='/login'; }} className="flex items-center space-x-3 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-bold mt-4">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Log Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Impact Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time educational monitoring across rural districts.</p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
               <div className="px-4 py-2 text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Administrator</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{user?.name || "NGO Admin"}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30">
                  {user?.name?.[0] || 'N'}
               </div>
            </div>
          </div>
        </header>

        {loading ? (
           <div className="flex justify-center items-center h-[300px]"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-6 hover:shadow-xl transition-all"
                >
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Heatmap Area */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm p-10 h-[500px] relative overflow-hidden group">
                  <div className="flex justify-between items-center relative z-10 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white">Active Impact Heatmap</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Refining clusters based on 50 live data points.</p>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                       <MapPin className="w-4 h-4 text-rose-500" />
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-300">West Bengal Cluster</span>
                    </div>
                  </div>

                  {/* Enhanced Heatmap Background Visualization */}
                  <div className="absolute inset-0 z-0 bg-slate-50 dark:bg-slate-900/50 mt-24 flex items-center justify-center opacity-60 dark:opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-[10s]">
                    <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none">
                      <motion.path d="M100 200 Q200 100 400 200 T700 200" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" className="text-slate-300 dark:text-slate-600" />
                      <motion.path d="M150 150 Q300 300 450 150 T750 250" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" className="text-slate-300 dark:text-slate-600" />
                    </svg>
                  </div>

                  {/* Dynamic Nodes from Backend */}
                  <div className="relative z-10 h-full">
                    {data?.heatmap?.map((node: any, i: number) => {
                      // Use a systematic grid-like placement but with some random jitter for "organic" look
                      const rows = 2;
                      const cols = 2;
                      const r = Math.floor(i / cols);
                      const c = i % cols;
                      const top = 10 + r * 35 + (i * 7 % 15);
                      const left = 10 + c * 35 + (i * 3 % 15);
                      
                      const isCritical = node.averageRiskScore >= 60;
                      const isModerate = node.averageRiskScore >= 40 && node.averageRiskScore < 60;

                      return (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                          style={{ top: `${top}%`, left: `${left}%` }}
                          className="absolute flex items-center space-x-3 group/node cursor-help"
                        >
                          <div className={`relative w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 shadow-xl transition-all group-hover/node:scale-150 ${isCritical ? 'bg-rose-500 shadow-rose-200' : isModerate ? 'bg-orange-500 shadow-orange-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                             <motion.div 
                               animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} 
                               transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                               className={`absolute inset-0 rounded-full ${isCritical ? 'bg-rose-500' : isModerate ? 'bg-orange-500' : 'bg-emerald-500'}`}
                             ></motion.div>
                          </div>
                          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-100 dark:border-slate-700 p-3 rounded-2xl shadow-2xl opacity-0 group-hover/node:opacity-100 transition-all -translate-y-4 scale-95 group-hover/node:scale-100 translate-x-4">
                             <h4 className="font-black text-slate-800 dark:text-white text-xs">{node.village}</h4>
                             <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Risk Factor: <span className={isCritical ? 'text-rose-500' : 'text-emerald-500'}>{node.averageRiskScore}%</span></p>
                             <div className="flex items-center mt-2 space-x-2">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md font-bold text-slate-500 dark:text-slate-300">{node.totalStudents} Students</span>
                             </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar Reports Preview */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm p-8 min-h-full h-full relative overflow-hidden transition-colors">
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest flex items-center">
                       <TrendUpIcon className="w-4 h-4 mr-2 text-indigo-500" /> Sector Predictions
                    </h3>
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                     {[
                       { region: 'East Bengal', status: 'Improving', pct: 15, color: 'text-emerald-500', up: true },
                       { region: 'Rural South', status: 'Declining', pct: 8, color: 'text-rose-500', up: false },
                       { region: 'West District', status: 'Stable', pct: 2, color: 'text-slate-400', up: true },
                     ].map((item, i) => (
                        <div key={i} className="flex flex-col">
                           <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-800 dark:text-white text-sm">{item.region}</span>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${60 + i * 15}%` }} 
                                transition={{ delay: 0.5 + i * 0.2, duration: 1 }}
                                className={`h-full ${item.up ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              ></motion.div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-700 relative z-10">
                    <Link href="/ngo/reports" className="w-full flex items-center justify-between p-4 bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl group">
                       <span>Full Field Reports</span>
                       <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
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

function TrendUpIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
    </svg>
  );
}
