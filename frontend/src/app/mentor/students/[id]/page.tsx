"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Flame, MessageSquare, Activity, Loader2, User, CheckCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore, API_URL } from "@/store/authStore";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function StudentInsightPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute allowedRoles={["mentor"]}>
      <StudentInsightContent studentId={id} />
    </ProtectedRoute>
  );
}

function StudentInsightContent({ studentId }: { studentId: string }) {
  const { getAuthHeader } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be a dedicated "get student insight" endpoint
    // For now, we fetch dashboard-like stats for this specific student ID
    fetch(`${API_URL}/students/dashboard`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
    </div>
  );

  const progressData = data?.weeklyScores || [
    { day: 'Mon', score: 65 }, { day: 'Tue', score: 68 }, { day: 'Wed', score: 75 },
    { day: 'Thu', score: 71 }, { day: 'Fri', score: 85 }, { day: 'Sat', score: 82 }, { day: 'Sun', score: 90 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={() => router.back()} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl hover:bg-slate-200 transition-all">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Student Insight: Suresh Kumar</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Mentor Oversight Mode</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <ThemeToggle />
             <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest ${data?.riskLevel === 'Safe' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                Risk: {data?.riskLevel || 'Safe'}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700">
               <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 flex items-center">
                 <Activity className="w-6 h-6 mr-3 text-primary-500" /> Academic Performance History
               </h3>
               <div className="h-[350px] w-full">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Recent Activity</h4>
                  <div className="space-y-6">
                     {[
                       { task: "Completed Algebra Quiz", time: "2h ago", color: "text-emerald-500" },
                       { task: "Watched Science Video", time: "5h ago", color: "text-blue-500" },
                       { task: "Logged in via Mobile", time: "1d ago", color: "text-slate-400" },
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                             <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`}></div>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.task}</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 italic">{item.time}</span>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4">
                     <Flame className="w-8 h-8 text-amber-500" />
                  </div>
                  <h4 className="text-3xl font-black text-slate-800 dark:text-white">{data?.streak || 7} Days</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Current Learning Streak</p>
               </div>
            </div>
          </div>

          {/* Goals & Intervention */}
          <div className="space-y-10">
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-8 flex items-center uppercase tracking-widest text-xs">
                <Target className="w-5 h-5 mr-3 text-rose-500" /> Current Daily Goals
              </h3>
              <div className="space-y-4">
                {(data?.dailyGoals || [
                  { label: "Complete Math Quiz", done: true },
                  { label: "Read Science Chapter", done: false },
                  { label: "Practice English Vocab", done: false }
                ]).map((task: any, i: number) => (
                  <div key={i} className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className={`w-7 h-7 rounded-xl flex justify-center items-center border-2 ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                      {task.done && <CheckCircle className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm font-bold ${task.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{task.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <h3 className="text-xl font-black mb-6">Mentor Intervention</h3>
               <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Student is falling behind in <span className="text-primary-400 font-bold">Science</span>. Would you like to schedule a 1:1 call or send special material?</p>
               <div className="space-y-3">
                  <button onClick={() => router.push('/mentor/chat')} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-900 hover:scale-105 transition-all">Send Direct Message</button>
                  <button className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all">Assign Remedial Material</button>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
