"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Key, ShieldAlert, History, Flame, User, LogOut, Settings } from "lucide-react";
import SettingsModal from "./SettingsModal";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<"configured" | "missing">("missing");

  useEffect(() => {
    // Check local API key status
    const key = localStorage.getItem("openrouter_api_key");
    setApiKeyStatus(key ? "configured" : "missing");

    if (!isSupabaseConfigured) return;

    // Get current session
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleKeySave = () => {
    const key = localStorage.getItem("openrouter_api_key");
    setApiKeyStatus(key ? "configured" : "missing");
  };

  return (
    <header className="border-b border-gray-900 bg-cyber-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-red/10 border border-cyber-red/30 group-hover:bg-cyber-red/20 group-hover:border-cyber-red/50 transition-all duration-300">
              <Flame className="h-5 w-5 text-cyber-red animate-pulse" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-cyber-red transition-colors">
                KILL MY STARTUP IDEA
              </span>
              <span className="block text-[10px] text-gray-500 font-mono tracking-wider -mt-1 uppercase">
                Brutal Pitch Destroyer
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="flex items-center space-x-1 sm:space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium font-display transition-colors ${
                pathname === "/" 
                  ? "text-white bg-gray-900/50 border border-gray-800" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Destroy Idea
            </Link>

            {isSupabaseConfigured && user && (
              <Link
                href="/history"
                className={`px-3 py-2 rounded-md text-sm font-medium font-display transition-colors flex items-center space-x-1 ${
                  pathname === "/history"
                    ? "text-white bg-gray-900/50 border border-gray-800"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </Link>
            )}

            {/* Config warning indicator if missing key */}
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-md text-sm font-medium relative border transition-all duration-200 ${
                apiKeyStatus === "missing"
                  ? "bg-cyber-yellow/10 border-cyber-yellow/30 text-cyber-yellow hover:bg-cyber-yellow/20"
                  : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
              }`}
              title="Configure API Keys"
            >
              <Settings className="h-4 w-4" />
              {apiKeyStatus === "missing" && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-yellow opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-yellow"></span>
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {isSupabaseConfigured ? (
              user ? (
                <div className="flex items-center space-x-3 pl-2 border-l border-gray-850">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs text-gray-300 font-medium truncate max-w-[120px]">
                      {user.email}
                    </span>
                    <span className="text-[10px] text-cyber-green font-mono">
                      FOUNDER
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pl-2 border-l border-gray-850">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-cyber-red/10 border border-cyber-red/30 text-cyber-red hover:bg-cyber-red/20 hover:border-cyber-red/50 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )
            ) : (
              <div className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-mono rounded bg-gray-900/60 border border-gray-850 text-gray-500">
                <ShieldAlert className="h-3 w-3 mr-1 text-gray-600" />
                <span>GUEST MODE</span>
              </div>
            )}
          </nav>
        </div>
      </div>

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)} 
          onSave={handleKeySave}
        />
      )}
    </header>
  );
}
