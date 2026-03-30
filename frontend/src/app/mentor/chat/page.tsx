"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, Phone, Video, Info, MoreVertical, CheckCheck, Loader2, ArrowLeft, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore, API_URL } from "@/store/authStore";

export default function MentorChat() {
  return (
    <ProtectedRoute allowedRoles={["mentor"]}>
      <MentorChatContent />
    </ProtectedRoute>
  );
}

function MentorChatContent() {
  const { user, getAuthHeader } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeStudent, setActiveStudent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch students list first
    fetch(`${API_URL}/mentors/students`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => { 
        setStudents(data.students || []); 
        setLoading(false);
        if (data.students && data.students.length > 0) {
          selectRoom(data.students[0]);
        }
      })
      .catch(() => setLoading(false));

    // Connect to Socket.IO
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("receiveMessage", (message) => {
       setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectRoom = (student: any) => {
    setActiveStudent(student);
    const roomId = `room_${student.id}_mentor_${user?._id}`;
    setActiveRoom(roomId);
    setMessages([]); // In a real app, fetch history from API here
    
    if (socket) {
      socket.emit("joinRoom", { roomId, userName: user?.name });
    }
  };

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
      
      {/* Sidebar: Student List */}
      <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col shadow-sm transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
           <div className="flex items-center space-x-3 mb-6">
              <Link href="/mentor" className="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </Link>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Messages</h2>
           </div>
           <div className="relative">
             <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Search direct message..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-2.5 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-100" />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
          ) : (
            <>
              <div className="px-6 py-4">
                 <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4">Direct Messages</h3>
                 <div className="space-y-1">
                    {students.map((student, i) => (
                      <button 
                        key={i} 
                        onClick={() => selectRoom(student)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all ${activeStudent?.id === student.id ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                      >
                        <div className="relative">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="Avatar" className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-0.5" />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
                        </div>
                        <div className="text-left overflow-hidden flex-1">
                          <p className="font-bold text-slate-800 dark:text-white truncate text-sm">{student.name}</p>
                          <p className="text-[10px] opacity-70 truncate font-semibold uppercase tracking-tighter">{student.subject} Team</p>
                        </div>
                      </button>
                    ))}
                 </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {!activeStudent ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mb-6">
                 <MessageSquare className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">EduBridge Messenger</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-[280px] font-medium italic">Select a student from the panel to start a secure 1:1 learning session.</p>
           </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 px-8 flex items-center justify-between transition-colors">
              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center font-black text-indigo-600 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStudent.name}`} alt="Avatar" />
                 </div>
                 <div>
                   <h3 className="font-black text-slate-800 dark:text-white">{activeStudent.name}</h3>
                   <div className="flex items-center">
                     <span className="w-2 h-2 bg-success rounded-full mr-2 shadow-success/40 shadow-xl animate-pulse"></span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Academic Session</span>
                   </div>
                 </div>
              </div>
              <div className="flex items-center space-x-4">
                 <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"><Phone className="w-5 h-5" /></button>
                 <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"><Video className="w-5 h-5" /></button>
                 <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
                 <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"><Info className="w-5 h-5" /></button>
              </div>
            </header>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-900/50">
               {messages.length === 0 && (
                  <div className="flex justify-center py-10">
                     <div className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full">Conversation Started</div>
                  </div>
               )}
               {messages.map((msg, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                 >
                   <div className={`p-4 rounded-2xl max-w-[70%] shadow-sm ${msg.senderId === user?._id ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-tl-sm'}`}>
                     <p className="font-medium">{msg.text}</p>
                     <div className={`flex items-center justify-end mt-2 space-x-1 ${msg.senderId === user?._id ? 'text-primary-100' : 'text-slate-400'}`}>
                        <span className="text-[10px] font-bold">{msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.senderId === user?._id && <CheckCheck className="w-3 h-3" />}
                     </div>
                   </div>
                 </motion.div>
               ))}
            </div>

            {/* Chat Input */}
            <div className="bg-white dark:bg-slate-800 p-6 border-t border-slate-200 dark:border-slate-700 transition-colors">
               <div className="flex items-center space-x-4 max-w-5xl mx-auto">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..." 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-4 focus:ring-primary-500/10 font-medium transition-all text-slate-100" 
                    />
                    <button onClick={handleSend} className="absolute right-3 top-3 p-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-200 dark:shadow-primary-900/20 hover:scale-105 active:scale-95 transition-all">
                       <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-500 transition-colors">
                     <PlusIcon className="w-5 h-5 text-slate-400" />
                  </button>
               </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
    </svg>
  );
}
