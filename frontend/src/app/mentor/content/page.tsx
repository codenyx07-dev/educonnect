"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookPlus, CheckCircle, ArrowLeft, Loader2, Sparkles, AlertCircle, Trash2, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";

export default function MentorContent() {
  return (
    <ProtectedRoute allowedRoles={["mentor"]}>
      <MentorContentContent />
    </ProtectedRoute>
  );
}

function MentorContentContent() {
  const { getAuthHeader } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "Mathematics",
    description: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/mentors/content`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setFormData({ title: "", subject: "Mathematics", description: "", dueDate: formData.dueDate });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Assignment Creation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/mentor" className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Curriculum Control</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Create and manage student assignments.</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl p-8 md:p-10 space-y-8 relative overflow-hidden">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block">Assignment Title</span>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Logic & Reasoning 1.2"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 dark:text-white transition-all text-xl"
                      required
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="block">
                      <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block">Category</span>
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-700 dark:text-slate-200 transition-all appearance-none"
                      >
                        <option>Mathematics</option>
                        <option>Science</option>
                        <option>English</option>
                        <option>Social Studies</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block">Deadline</span>
                      <input 
                        type="date" 
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-700 dark:text-white transition-all"
                        required
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block">Instructions & Content</span>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Detail the task steps or paste reading content here..."
                      rows={6}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-primary-500/10 font-medium text-slate-700 dark:text-slate-200 transition-all resize-none leading-relaxed"
                    ></textarea>
                  </label>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary-200 dark:shadow-primary-900/20 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    ) : (
                      <BookPlus className="w-6 h-6 mr-3" />
                    )}
                    Deploy to All Students
                  </button>
                  <button type="button" className="p-5 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Trash2 className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-x-0 bottom-10 px-10"
                  >
                    <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-center font-bold">
                       <CheckCircle className="w-6 h-6 mr-3" /> Assignment Deployed Successfully!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Tips Section */}
          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-20 h-20" /></div>
               <h3 className="text-xl font-black mb-4">Curriculum Tip</h3>
               <p className="text-indigo-100 text-sm italic font-medium leading-relaxed">&ldquo;Based on the current regional risk heatmap, prioritizing <strong>Fractions</strong> and <strong>Spatial Geometry</strong> this week would benefit 40% of your student cluster.&rdquo;</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
               <h3 className="font-black text-slate-800 dark:text-white mb-6 uppercase text-xs tracking-widest flex items-center">
                  <LayoutGrid className="w-4 h-4 mr-2" /> Recent Assets
               </h3>
               <div className="space-y-4">
                  {[
                    { label: 'Calculus Basics', type: 'PDF' },
                    { label: 'Plant Biology Intro', type: 'VIDEO' },
                    { label: 'Grammar Quiz Set', type: 'QUIZ' },
                  ].map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white text-sm">{asset.label}</span>
                          <span className="text-[10px] font-black text-primary-500 tracking-widest">{asset.type}</span>
                       </div>
                       <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all">
                          <List className="w-4 h-4 text-slate-400" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
