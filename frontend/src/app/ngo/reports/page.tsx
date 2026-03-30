"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Filter, MapPin, ArrowLeft, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";

export default function NgoReports() {
  return (
    <ProtectedRoute allowedRoles={["ngo"]}>
      <NgoReportsContent />
    </ProtectedRoute>
  );
}

function NgoReportsContent() {
  const { getAuthHeader } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/ngo/reports`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => { setReports(data.reports || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/ngo" className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Regional Impact Reports</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Deep dive into cluster-level educational metrics.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <ThemeToggle />
             <button className="bg-indigo-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center">
                <Download className="w-4 h-4 mr-2" /> PDF Export
             </button>
          </div>
        </header>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Generating Dataset...</p>
           </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden transition-colors">
            <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
               <div className="flex items-center space-x-2">
                 <Filter className="w-4 h-4 text-slate-400" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Filters: All Districts</span>
               </div>
               <div className="text-xs font-bold text-slate-500">Showing {reports.length} Analytical Clusters</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="py-6 px-8">Region / Village</th>
                    <th className="py-6 px-6">Student Body</th>
                    <th className="py-6 px-6">Mentor-Student Ratio</th>
                    <th className="py-6 px-6">Avg Risk %</th>
                    <th className="py-6 px-8 text-right">Trend Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {reports.map((report, i) => (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-6 px-8 font-black text-slate-800 dark:text-white flex items-center">
                        <MapPin className="w-4 h-4 mr-3 text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                        {report.region}
                      </td>
                      <td className="py-6 px-6 text-sm font-bold text-slate-600 dark:text-slate-300">
                        {report.students} <span className="text-[10px] text-slate-400 uppercase ml-1">Live</span>
                      </td>
                      <td className="py-6 px-6 text-sm font-bold text-slate-600 dark:text-slate-300">
                        1:{report.mentors}
                      </td>
                      <td className="py-6 px-6">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${parseInt(report.avgRisk) > 50 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                           {report.avgRisk}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className={`inline-flex items-center space-x-2 font-black text-[10px] uppercase tracking-tighter ${report.trend === 'Improving' ? 'text-emerald-500' : report.trend === 'Critical' ? 'text-rose-500' : 'text-slate-400'}`}>
                           {report.trend === 'Improving' ? <TrendingUp className="w-4 h-4" /> : report.trend === 'Critical' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                           <span>{report.trend}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reports.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
                <p className="text-slate-400 font-bold italic">No regional data points found. Syncing with backend...</p>
              </div>
            )}
            
            <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
               <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 bg-success rounded-full"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Educational Health: 92.4%</span>
               </div>
               <div className="flex space-x-2">
                  <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">Previous Page</button>
                  <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">Next Page</button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
