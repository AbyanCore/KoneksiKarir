"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface User {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check if cookie exists first
      const token = Cookies.get("koneksi_karir_token");
      console.log("🔍 [Auth] Checking session, cookie exists:", !!token);

      if (!token) {
        // No cookie, no need to check session
        console.log("❌ [Auth] No token found, user not authenticated");
        setIsLoading(false);
        return;
      }

      console.log("📡 [Auth] Fetching session from /api/auth/session");
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      console.log("📥 [Auth] Session response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("📦 [Auth] Session data:", data);

        if (data.authenticated) {
          console.log("✅ [Auth] User authenticated:", data.user);
          setUser(data.user);
        } else {
          console.log(
            "⚠️ [Auth] Session returned authenticated=false, removing cookie"
          );
          // Session invalid, remove cookie (stateless cleanup)
          Cookies.remove("koneksi_karir_token", { path: "/" });
        }
      } else {
        console.log(
          "❌ [Auth] Session check failed with status:",
          response.status
        );
        // Session check failed, remove invalid cookie
        Cookies.remove("koneksi_karir_token", { path: "/" });
      }
    } catch (error) {
      console.error("❌ [Auth] Session check error:", error);
      // On error, remove potentially invalid cookie
      Cookies.remove("koneksi_karir_token", { path: "/" });
    } finally {
      setIsLoading(false);
      console.log("🏁 [Auth] Session check complete");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 [SignIn] Attempting to sign in:", email);

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: ensure cookies are handled
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("📡 [SignIn] Response received:", {
        status: response.status,
        data,
      });

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      console.log(
        "🎫 [SignIn] Token received:",
        data.token ? `${data.token.substring(0, 20)}...` : "null"
      );
      console.log("👤 [SignIn] User data:", data.user);

      // Calculate days until midnight for js-cookie
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);

      // js-cookie expects days as a number or Date object
      // Calculate fraction of days until midnight
      const millisecondsUntilMidnight = midnight.getTime() - now.getTime();
      const daysUntilMidnight =
        millisecondsUntilMidnight / (1000 * 60 * 60 * 24);

      console.log("⏰ [SignIn] Cookie expires in days:", daysUntilMidnight);

      // Set token in cookie (stateless - no httpOnly so we can manage it)
      Cookies.set("koneksi_karir_token", data.token, {
        expires: daysUntilMidnight, // Fraction of days until midnight
        path: "/",
        sameSite: "lax",
      });

      console.log(
        "🍪 [SignIn] Cookie set, verifying:",
        Cookies.get("koneksi_karir_token") ? "EXISTS" : "MISSING"
      );

      setUser(data.user);
      console.log("✅ [SignIn] User state updated, authenticated");

      toast.success("Signed in successfully!");

      // Redirect based on role
      const redirectPath =
        data.user.role === "ADMIN"
          ? "/s/admin/dashboard"
          : data.user.role === "ADMIN_COMPANY"
          ? "/s/company/dashboard"
          : data.user.role === "JOB_SEEKER"
          ? "/s/profile"
          : "/s/hub";

      console.log("🔀 [SignIn] Redirecting to:", redirectPath);
      router.push(redirectPath);
    } catch (error: any) {
      console.error("❌ [SignIn] Error:", error);
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Remove cookie from client side FIRST (stateless)
      Cookies.remove("koneksi_karir_token", { path: "/" });

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      toast.success("Signed out successfully!");
      router.push("/auth/signin");
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if API fails, cookie is removed, so still clear user state
      Cookies.remove("koneksi_karir_token", { path: "/" });
      setUser(null);
      router.push("/auth/signin");
    }
  };

  const refreshSession = async () => {
    await checkSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
