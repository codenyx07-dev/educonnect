"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/register", formData);
      setAuth(data, data.token);
      
      if (data.role === "mentor") router.push("/mentor");
      else if (data.role === "ngo") router.push("/ngo");
      else router.push("/student");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400">Join EduBridge AI today</p>
        </div>

        {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {['student', 'mentor', 'ngo'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({...formData, role: r})}
                  className={`py-2 text-sm font-bold rounded-xl capitalize border ${formData.role === r ? 'bg-primary-50 text-primary-600 border-primary-200 shadow-inner' : 'bg-white dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600 hover:bg-slate-50'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link href="/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
