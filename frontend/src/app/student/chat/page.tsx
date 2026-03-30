"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, Phone, Video, Info, MoreVertical, CheckCheck, Loader2, ArrowLeft, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function StudentChat() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentChatContent />
    </ProtectedRoute>
  );
}

function StudentChatContent() {
  const { user, getAuthHeader } = useAuthStore();
  const { t } = useTranslation();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For students, we just connect to their assigned mentor's room
    // For demo, we assume they have one assigned mentor from the seed
    const roomId = `room_${user?._id}_mentor_65f1a2b3c4d5e6f7a8b9c0d1`; // Mocked mentor ID for connectivity
    setActiveRoom(roomId);
    setMentor({ name: "Dr. Ananya Sharma", subject: "Mathematics Expert" });
    setLoading(false);

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("receiveMessage", (message) => {
       setMessages(prev => [...prev, message]);
    });

    newSocket.emit("joinRoom", { roomId, userName: user?.name });

    return () => {
      newSocket.close();
    };
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeRoom || !socket) return;

    socket.emit("sendMessage", {
      roomId: activeRoom,
      senderId: user?._id,
      senderName: user?.name,
      text: inputText
    });

    setInputText("");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors">
      
      {/* Sidebar: Simplified for Student */}
      <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col shadow-sm transition-colors">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700">
           <div className="flex items-center space-x-4 mb-8">
              <Link href="/student" className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-inner">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </Link>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('nav.ask_mentor')}</h2>
           </div>
           <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/50">
              <p className="text-[10px] font-black uppercase text-primary-600 dark:text-primary-400 tracking-widest mb-1">Assigned Support</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">You are connected with an expert mentor for 1:1 doubts.</p>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
           <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4 px-4">Active Sessions</h3>
           {mentor && (
             <div className="w-full flex items-center space-x-4 p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/40 text-primary-600 border border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} alt="Avatar" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <p className="font-black text-slate-800 dark:text-white truncate text-sm">{mentor.name}</p>
                  <p className="text-[10px] opacity-70 truncate font-bold uppercase tracking-tight">{mentor.subject}</p>
                </div>
             </div>
           )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700">
           <LanguageSwitcher />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-800 md:bg-slate-50 md:dark:bg-slate-900/50">
        {!mentor ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
           </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 px-10 flex items-center justify-between transition-all shadow-sm relative z-10">
              <div className="flex items-center space-x-5">
                 <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center font-black text-indigo-600 overflow-hidden shadow-inner border border-slate-100 dark:border-slate-700">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} alt="Avatar" />
                 </div>
                 <div>
                   <h3 className="font-black text-xl text-slate-800 dark:text-white tracking-tight">{mentor.name}</h3>
                   <div className="flex items-center">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-emerald-500/40 shadow-lg animate-pulse"></span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connected • Live Mentor</span>
                   </div>
                 </div>
              </div>
              <div className="flex items-center space-x-3">
                 <button className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"><Phone className="w-5 h-5" /></button>
                 <button className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"><Video className="w-5 h-5" /></button>
                 <button className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"><Info className="w-5 h-5" /></button>
              </div>
            </header>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6">
               <div className="flex justify-center mb-8">
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-sm">Secure Peer-to-Peer Encryption Active</div>
               </div>
               {messages.map((msg, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                 >
                   <div className={`p-5 rounded-[1.5rem] max-w-[75%] shadow-sm leading-relaxed ${msg.senderId === user?._id ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-tl-sm'}`}>
                     <p className="font-medium text-sm md:text-base">{msg.text}</p>
                     <div className={`flex items-center justify-end mt-3 space-x-1.5 ${msg.senderId === user?._id ? 'text-primary-100' : 'text-slate-400'}`}>
                        <span className="text-[10px] font-black uppercase">{msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.senderId === user?._id && <CheckCheck className="w-3 h-3" />}
                     </div>
                   </div>
                 </motion.div>
               ))}
            </div>

            {/* Chat Input */}
            <div className="bg-white dark:bg-slate-800 p-8 border-t border-slate-200 dark:border-slate-700 transition-all">
               <div className="flex items-center space-x-4 max-w-5xl mx-auto">
                  <button className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-primary-500 transition-all shadow-inner">
                     <Plus className="w-6 h-6" />
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your doubt or upload a question..." 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] p-4 px-6 pr-14 outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-700 dark:text-white transition-all text-sm shadow-inner" 
                    />
                    <button onClick={handleSend} className="absolute right-3 top-2.5 p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-200 dark:shadow-primary-900/20 hover:scale-105 active:scale-95 transition-all">
                       <Send className="w-5 h-5" />
                    </button>
                  </div>
               </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
