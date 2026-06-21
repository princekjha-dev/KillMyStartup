"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ShieldAlert, Key, User, Flame } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    // Redirect if already logged in
    supabase!.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/history");
      }
    });
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Registration successful! Please check your email for confirmation or proceed to login.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected registration error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md cyber-glass rounded-xl p-6 sm:p-8 shadow-2xl border-gray-900">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-red/10 border border-cyber-red/30 mb-2">
            <Flame className="h-5 w-5 text-cyber-red" />
          </div>
          <h2 className="font-display text-xl font-bold text-white uppercase tracking-wider">
            Register Account
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase">
            Stress-test & track multiple ideas
          </p>
        </div>

        {/* Warning if Supabase is missing */}
        {!isSupabaseConfigured ? (
          <div className="p-4 rounded border border-cyber-yellow/20 bg-cyber-yellow/5 text-xs text-cyber-yellow leading-relaxed space-y-2 text-center">
            <ShieldAlert className="h-6 w-6 text-cyber-yellow mx-auto" />
            <p><strong>Database Auth Unconfigured</strong></p>
            <p className="opacity-80">
              Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your frontend environment variables to enable authentication and history saving.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 font-display mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-cyber-dark border border-gray-800 rounded pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-red transition"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 font-display mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cyber-dark border border-gray-800 rounded pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-red transition"
                />
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded border border-cyber-red/20 bg-cyber-red/5 text-xs text-cyber-red font-medium">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded border border-cyber-green/20 bg-cyber-green/5 text-xs text-cyber-green font-medium leading-relaxed">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyber-red text-white font-display text-sm font-bold rounded hover:bg-cyber-red/90 transition shadow-lg shadow-cyber-red/10 disabled:opacity-50 uppercase tracking-wider"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-cyber-red hover:underline font-semibold">
                Login
              </Link>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
