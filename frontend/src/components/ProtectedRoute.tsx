"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their correct dashboard
      if (user.role === "student") router.replace("/student");
      else if (user.role === "mentor") router.replace("/mentor");
      else if (user.role === "ngo") router.replace("/ngo");
      return;
    }

    setChecked(true);
  }, [token, user, allowedRoles, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
