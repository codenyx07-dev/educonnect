"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && token) {
      if (user.role === "student") router.replace("/student");
      else if (user.role === "mentor") router.replace("/mentor");
      else if (user.role === "ngo") router.replace("/ngo");
    }
  }, [user, token, router]);

  return (
    <main className="flex-1 flex flex-col items-center p-6 sm:p-24 bg-gradient-premium text-white relative overflow-hidden min-h-screen">
      {/* Top Nav */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20 max-w-7xl mx-auto left-0 right-0">
        <div className="text-2xl font-bold tracking-tight">EduBridge AI</div>
        <div className="space-x-4">
          <Link href="/login" className="font-semibold hover:text-emerald-300 transition-colors">Sign In</Link>
          <Link href="/register" className="bg-white text-primary-600 font-bold px-5 py-2.5 rounded-full hover:bg-slate-100 transition-colors shadow-lg">Get Started</Link>
        </div>
      </nav>

      {/* Background Decorative Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-20 -mt-20"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-40 -mb-40"></div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-3xl mt-16"
      >
        <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 inline-block backdrop-blur-md border border-white/20">
          Introducing EduBridge AI ✨
        </span>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-tight">
          Scalable Learning for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
            Every Student
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          AI + Mentor-assisted learning platform designed to support underserved students. Empowering rural and urban communities with accessible education.
        </p>
      </motion.div>

      {/* Role Selection Cards */}
      <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <RoleCard 
          href="/student" 
          icon={<BookOpen className="w-8 h-8 text-primary-500" />} 
          title="Student" 
          description="Learn at your own pace with AI and human mentors." 
          delay={0.1}
        />
        <RoleCard 
          href="/mentor" 
          icon={<Users className="w-8 h-8 text-primary-500" />} 
          title="Mentor" 
          description="Guide students, track progress, and make an impact." 
          delay={0.2}
        />
        <RoleCard 
          href="/ngo" 
          icon={<BarChart3 className="w-8 h-8 text-primary-500" />} 
          title="NGO / Admin" 
          description="Monitor area heatmaps & targeted interventions." 
          delay={0.3}
        />
      </div>
    </main>
  );
}

function RoleCard({ href, icon, title, description, delay }: { href: string, icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href} className="group block h-full">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl h-full transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:shadow-2xl hover:shadow-primary-500/20 text-left">
          <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-inner text-indigo-600">
            {icon}
          </div>
          <h2 className="text-2xl font-semibold mb-3">{title}</h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center text-sm font-medium text-emerald-300 group-hover:text-white transition-colors">
            Enter Portal <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
