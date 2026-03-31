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
  const [genLoading, setGenLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resType, setResType] = useState<'text' | 'url' | 'pdf' | 'quiz'>('text');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "Mathematics",
    description: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    resourceUrl: "",
    questions: [] as any[]
  });

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleAIByTopic = async () => {
    if (!formData.title) return alert("Please enter a topic in the Title field first!");
    setGenLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/generate-questions`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: formData.title, subject: formData.subject })
      });
      const data = await res.json();
      if (data.questions) {
        setFormData({ ...formData, questions: data.questions });
        setResType('quiz');
      }
    } catch (err) {
      console.error(err);
      alert("AI Generation failed. Please try again.");
    } finally {
      setGenLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      data.append('description', formData.description);
      data.append('dueDate', formData.dueDate);
      data.append('resourceType', resType);
      data.append('resourceUrl', formData.resourceUrl);
      data.append('questions', JSON.stringify(formData.questions));
      if (pdfFile) {
        data.append('pdfFile', pdfFile);
      }

      const response = await fetch(`${API_URL}/mentors/content`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${useAuthStore.getState().token}` 
        },
        body: data
      });
      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        setFormData({ 
          title: "", subject: "Mathematics", description: "", 
          dueDate: formData.dueDate, resourceUrl: "", questions: [] 
        });
        setPdfFile(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Deployment failed: " + result.message);
      }
    } catch (error) {
      console.error("Assignment Creation Error:", error);
      alert("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl p-8 md:p-10 space-y-8 relative overflow-hidden transition-colors">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end gap-4">
                    <label className="block flex-1">
                      <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block">Assignment Title / Topic</span>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Quadratic Equations"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 dark:text-white transition-all text-xl"
                        required
                      />
                    </label>
                    <button 
                      type="button"
                      onClick={handleAIByTopic}
                      disabled={genLoading}
                      className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-black p-4 px-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition-all flex items-center h-[58px]"
                    >
                      {genLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-3" />}
                      <span className="hidden md:inline">AI Generate Quiz</span>
                    </button>
                  </div>

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

                  <div className="space-y-4">
                    <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block text-center w-full">Select Resource Type</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['text', 'url', 'pdf', 'quiz'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setResType(type)}
                          className={`p-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${resType === type ? 'bg-primary-600 border-primary-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {resType === 'url' && (
                    <label className="block">
                      <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block">External Resource URL</span>
                      <input 
                        type="url" 
                        placeholder="https://..."
                        value={formData.resourceUrl}
                        onChange={(e) => setFormData({...formData, resourceUrl: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 dark:text-white transition-all"
                      />
                    </label>
                  )}

                  {resType === 'pdf' && (
                    <label className="block">
                      <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block">Upload PDF Document</span>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </label>
                  )}

                  <label className="block">
                    <span className="text-slate-700 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2 inline-block">Instructions & Content</span>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Detail the task steps or paste reading content here..."
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-primary-500/10 font-medium text-slate-700 dark:text-slate-200 transition-all resize-none leading-relaxed"
                    ></textarea>
                  </label>

                  {resType === 'quiz' && (
                    <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-700 mt-6">
                       <div className="flex justify-between items-center">
                          <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">Question Bank ({formData.questions.length})</h4>
                          <button 
                            type="button" 
                            onClick={handleAddQuestion}
                            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 px-4 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all"
                          >
                             + Add Question
                          </button>
                       </div>
                       <div className="space-y-8">
                          {formData.questions.map((q, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 relative">
                               <button 
                                 type="button" 
                                 onClick={() => handleRemoveQuestion(idx)}
                                 className="absolute top-4 right-4 text-rose-500 hover:bg-rose-50 p-2 rounded-full"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                               <label className="block mb-4">
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 inline-block">Question {idx + 1}</span>
                                  <input 
                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 font-bold text-slate-800 dark:text-white"
                                    value={q.question}
                                    onChange={(e) => {
                                      const nq = [...formData.questions];
                                      nq[idx].question = e.target.value;
                                      setFormData({...formData, questions: nq});
                                    }}
                                  />
                               </label>
                               <div className="grid grid-cols-2 gap-4">
                                  {q.options.map((opt: string, oi: number) => (
                                    <div key={oi} className="flex flex-col">
                                       <span className="text-[9px] font-black uppercase text-slate-400 mb-1">Option {oi + 1}</span>
                                       <input 
                                          className={`w-full p-2.5 rounded-xl text-sm font-medium border-2 transition-all ${q.correctAnswer === oi ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent bg-white dark:bg-slate-800'}`}
                                          value={opt}
                                          onChange={(e) => {
                                             const nq = [...formData.questions];
                                             nq[idx].options[oi] = e.target.value;
                                             setFormData({...formData, questions: nq});
                                          }}
                                          onClick={() => {
                                            const nq = [...formData.questions];
                                            nq[idx].correctAnswer = oi;
                                            setFormData({...formData, questions: nq});
                                          }}
                                       />
                                    </div>
                                  ))}
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
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
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, title: "", description: "", questions: []})}
                    className="p-5 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
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
                    className="absolute inset-x-0 bottom-10 px-10 z-10"
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
               <p className="text-indigo-100 text-sm italic font-medium leading-relaxed">&ldquo;Based on the current regional risk heatmap, prioritizing <strong>{formData.title || 'the current topic'}</strong> this week would benefit a significant portion of your student cluster.&rdquo;</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
               <h3 className="font-black text-slate-800 dark:text-white mb-2 uppercase text-xs tracking-widest flex items-center">
                  <LayoutGrid className="w-4 h-4 mr-2" /> Recent Assets
               </h3>
               <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-tight">Your previously deployed teaching materials</p>
               <div className="space-y-4">
                  {[
                    { label: 'Algebra Mock-up', type: 'QUIZ', date: '2h ago' },
                    { label: 'Science Lab URL', type: 'URL', date: '5h ago' },
                    { label: 'English Pdfs', type: 'PDF', date: 'Yesterday' },
                  ].map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary-500 transition-all">
                       <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white text-sm">{asset.label}</span>
                          <div className="flex items-center space-x-2">
                             <span className="text-[9px] font-black text-primary-500 tracking-widest">{asset.type}</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase">{asset.date}</span>
                          </div>
                       </div>
                       <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100">
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
