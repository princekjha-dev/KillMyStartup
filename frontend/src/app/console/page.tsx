"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Flame, ShieldAlert, Terminal, ShieldAlert as AlertIcon } from "lucide-react";

export default function Console() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<"scanning" | "error">("scanning");
  const [errorMsg, setErrorMsg] = useState("");
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const rawPayload = sessionStorage.getItem("pending_roast_payload");
    if (!rawPayload) {
      router.push("/");
      return;
    }

    const payload = JSON.parse(rawPayload);
    
    // Set up step-by-step logs
    addLog("INITIATING PITCH DESTRUCTION SEQUENCER...");
    
    const steps = [
      "Establishing parallel LLM connection pools...",
      "Analyzing: Market Reality Check (challenging TAM claims)...",
      "Analyzing: Competition Assassin (searching Indian/Global incumbents)...",
      "Analyzing: Execution Guillotine (inspecting distribution, capital & technical moats)...",
      "Analyzing: Unit Economics Destroyer (checking LTV/CAC at scale)...",
      "Analyzing: Timing Attack (validating timing windows & historical failures)...",
      "Analyzing: Regulatory Minefield (evaluating RBI, SEBI, FSSAI, MeitY limits)...",
      "Analyzing: Reliance/Tata Threat (cloning feasibility assessment)...",
      "Compiling destruction metrics and generating survival scores..."
    ];

    let stepIndex = 0;
    const logInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        addLog(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 850);

    // Call Roast API
    const runRoast = async () => {
      const apiKey = localStorage.getItem("openrouter_api_key") || "";
      const model = localStorage.getItem("openrouter_model") || "";
      
      const headers: any = {
        "Content-Type": "application/json"
      };
      
      if (apiKey) {
        headers["X-OpenRouter-Key"] = apiKey;
      }

      // Check auth headers
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        try {
          const { supabase } = await import("../lib/supabase");
          if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              headers["Authorization"] = `Bearer ${session.access_token}`;
            }
          }
        } catch (e) {
          console.error("Failed to load auth token", e);
        }
      }

      try {
        const response = await axios.post("http://localhost:8000/api/roast", payload, { headers });
        addLog("ANALYSIS COMPLETE! SAVING SCORE DATA...");
        
        // Wait briefly for dramatic effect
        setTimeout(() => {
          sessionStorage.removeItem("pending_roast_payload");
          router.push(`/roast/${response.data.id}`);
        }, 1200);

      } catch (err: any) {
        clearInterval(logInterval);
        setStatus("error");
        const errMsg = err.response?.data?.detail || "An unexpected network error occurred.";
        setErrorMsg(errMsg);
        addLog(`CRITICAL FAILURE: ${errMsg}`);
      }
    };

    runRoast();

    return () => clearInterval(logInterval);
  }, [router]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      
      {status === "scanning" ? (
        <div className="w-full flex flex-col items-center">
          {/* Radar Animation */}
          <div className="relative h-48 w-48 mb-12 flex items-center justify-center rounded-full border border-cyber-red/20 bg-cyber-red/5">
            {/* Spinning Radar sweep */}
            <div className="absolute inset-0 rounded-full border border-cyber-red/10 animate-radar-spin" style={{
              background: "conic-gradient(from 0deg, rgba(239, 68, 68, 0.15) 0deg, transparent 90deg)"
            }} />
            
            {/* Concentric circles */}
            <div className="absolute h-36 w-36 rounded-full border border-cyber-red/10 border-dashed" />
            <div className="absolute h-24 w-24 rounded-full border border-cyber-red/10" />
            <div className="absolute h-12 w-12 rounded-full border border-cyber-red/20 animate-ping" />
            
            <Flame className="h-8 w-8 text-cyber-red animate-pulse relative z-10" />
          </div>

          <h2 className="font-display text-xl font-bold tracking-wider text-white mb-2 uppercase animate-pulse">
            Destroying Startup Pitch
          </h2>
          <p className="text-xs text-gray-500 font-mono mb-8">
            DO NOT CLOSE THIS PAGE — RUNNING 7 PARALLEL VECTORS
          </p>
        </div>
      ) : (
        <div className="w-full max-w-md text-center p-6 bg-cyber-red/5 border border-cyber-red/20 rounded-xl mb-8 flex flex-col items-center">
          <AlertIcon className="h-12 w-12 text-cyber-red mb-3 animate-bounce" />
          <h3 className="font-display text-lg font-bold text-white mb-2 uppercase">Destruction Halted</h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            {errorMsg}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-gray-900 border border-gray-800 rounded font-display text-xs font-semibold text-white hover:bg-gray-850 transition"
          >
            Back to Launcher
          </button>
        </div>
      )}

      {/* Terminal logs */}
      <div className="w-full bg-cyber-card border border-gray-850 rounded-xl p-4 font-mono text-xs shadow-2xl relative">
        <div className="flex items-center space-x-2 border-b border-gray-850 pb-2 mb-3 text-gray-500">
          <Terminal className="h-4 w-4 text-cyber-red" />
          <span className="text-[10px] tracking-wider uppercase">SEQUENCER_OUTPUT_LOG</span>
        </div>
        <div className="h-48 overflow-y-auto space-y-1.5 scrollbar-thin text-gray-400 pr-2">
          {logs.map((log, index) => (
            <div key={index} className={`leading-relaxed border-l-2 pl-2 ${
              log.includes("FAILURE") 
                ? "border-cyber-red text-cyber-red" 
                : log.includes("COMPLETE")
                ? "border-cyber-green text-cyber-green"
                : "border-gray-800"
            }`}>
              {log}
            </div>
          ))}
          {status === "scanning" && (
            <div className="flex items-center text-cyber-red">
              <span className="mr-1">&gt;</span>
              <span>Running vectors...</span>
              <span className="terminal-cursor ml-1" />
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
