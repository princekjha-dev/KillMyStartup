"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ShieldAlert, Trash2, Calendar, Award, GitCompare, ChevronRight, X, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import Link from "next/link";

interface VectorResult {
  name: string;
  survival_points: number;
  killer_quote: string;
}

interface RoastSummary {
  id: string;
  startup_name: string;
  raw_input: string;
  target_market?: string;
  revenue_model?: string;
  stage?: string;
  survival_score: number;
  vectors: Record<string, VectorResult>;
  true_conditions?: string[];
  created_at: string;
}

export default function History() {
  const router = useRouter();
  const [roasts, setRoasts] = useState<RoastSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Selection states for comparison
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compData, setCompData] = useState<{ itemA: RoastSummary; itemB: RoastSummary } | null>(null);

  const fetchHistory = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await axios.get("http://localhost:8000/api/roasts", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      setRoasts(response.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to retrieve your saved roasts history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [router]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!window.confirm("Are you sure you want to delete this roast from your history?")) {
      return;
    }

    try {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) return;

      await axios.delete(`http://localhost:8000/api/roasts/${id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      setRoasts((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete roast.");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        // limit selection to 2 maximum
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleLaunchCompare = () => {
    if (selectedIds.length !== 2) return;
    const itemA = roasts.find((r) => r.id === selectedIds[0]);
    const itemB = roasts.find((r) => r.id === selectedIds[1]);
    
    if (itemA && itemB) {
      // Sort A and B by date so itemA is older and itemB is newer for progression
      const dateA = new Date(itemA.created_at).getTime();
      const dateB = new Date(itemB.created_at).getTime();
      if (dateA > dateB) {
        setCompData({ itemA: itemB, itemB: itemA });
      } else {
        setCompData({ itemA, itemB });
      }
      setCompareMode(true);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-12 px-6 bg-cyber-yellow/5 border border-cyber-yellow/20 rounded-xl mt-8">
        <ShieldAlert className="h-12 w-12 text-cyber-yellow mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold text-white mb-2 uppercase">Feature Unavailable</h3>
        <p className="text-xs text-gray-400 mb-6">
          History saving requires a Supabase PostgreSQL instance. Please configure frontend parameters.
        </p>
        <Link href="/" className="px-6 py-2 bg-gray-950 border border-gray-800 rounded font-display text-xs font-semibold text-white hover:bg-gray-900 transition">
          Return to Launcher
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-cyber-red animate-spin mb-4" />
        <p className="text-xs text-gray-500 font-mono">LOADING ROAST HISTORIES...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 relative">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-900 pb-4 gap-4">
        <div>
          <span className="text-[10px] text-cyber-red font-mono tracking-wider uppercase">Saved Archive</span>
          <h1 className="font-display text-2xl font-extrabold text-white uppercase mt-0.5">Roast Dossier History</h1>
        </div>
        {selectedIds.length === 2 && (
          <button
            onClick={handleLaunchCompare}
            className="w-full sm:w-auto px-5 py-2 bg-cyber-blue text-white font-display text-xs font-bold rounded hover:bg-cyber-blue/90 transition shadow-lg shadow-cyber-blue/15 flex items-center justify-center space-x-1.5 animate-pulse"
          >
            <GitCompare className="h-4 w-4" />
            <span>Compare Selected Ideas</span>
          </button>
        )}
      </div>

      {roasts.length === 0 ? (
        <div className="text-center py-16 cyber-glass rounded-xl border-gray-900">
          <Award className="h-10 w-10 text-gray-600 mx-auto mb-2" />
          <h3 className="font-display text-sm font-bold text-white uppercase">Dossier Archive Empty</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 leading-normal">
            You haven't saved any pitch roasts yet. Run an analysis from the launcher screen to populate history.
          </p>
          <Link href="/" className="inline-block mt-4 px-5 py-2 bg-cyber-red text-white font-display text-xs font-bold rounded hover:bg-cyber-red/90 transition">
            Launch New Roast
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {roasts.map((roast) => {
            const isSelected = selectedIds.includes(roast.id);
            return (
              <div
                key={roast.id}
                onClick={() => router.push(`/roast/${roast.id}`)}
                className={`w-full cyber-glass rounded-xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-gray-700 transition ${
                  isSelected ? "border-cyber-blue/50 bg-cyber-blue/5" : "border-gray-900"
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Select for comparison Checkbox */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(roast.id);
                    }}
                    className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition ${
                      isSelected 
                        ? "bg-cyber-blue border-cyber-blue text-white" 
                        : "border-gray-800 bg-cyber-dark hover:border-gray-700"
                    }`}
                  >
                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                  </div>

                  <div>
                    <h3 className="font-display text-base font-extrabold text-white uppercase group-hover:text-cyber-red transition">
                      {roast.startup_name}
                    </h3>
                    <div className="flex items-center space-x-3 text-[10px] text-gray-500 font-mono mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(roast.created_at).toLocaleDateString()}
                      </span>
                      {roast.stage && <span>{roast.stage}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                      SURVIVAL
                    </span>
                    <span className={`font-display text-base font-black ${
                      roast.survival_score >= 70 
                        ? "text-cyber-green" 
                        : roast.survival_score >= 40 
                        ? "text-cyber-yellow" 
                        : "text-cyber-red"
                    }`}>
                      {roast.survival_score}%
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(roast.id, e)}
                    className="p-2.5 rounded bg-gray-950 border border-gray-850 hover:border-cyber-red hover:text-cyber-red text-gray-500 transition"
                    title="Delete saved roast"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <ChevronRight className="h-5 w-5 text-gray-700 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Overlay Matrix Modal */}
      {compareMode && compData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-xl border border-gray-850 bg-cyber-card p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setCompareMode(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <div className="flex items-center space-x-2 border-b border-gray-850 pb-4 mb-6">
              <GitCompare className="h-5 w-5 text-cyber-blue" />
              <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                Startup Pitch Comparison Matrix
              </h2>
            </div>

            {/* Main grid A vs B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Pitch A */}
              <div className="space-y-4">
                <div className="border border-gray-800 rounded-lg p-4 bg-cyber-dark/40 relative">
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-gray-950 border border-gray-850 text-[8px] font-mono text-gray-500">
                    VERSION A (OLDER)
                  </span>
                  <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight">
                    {compData.itemA.startup_name}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">
                    Analyzed {new Date(compData.itemA.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-4 text-2xl font-display font-black text-gray-300">
                    <span>{compData.itemA.survival_score}%</span>
                    <span className="text-xs font-mono font-normal text-gray-500">SURVIVAL SCORE</span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                  {Object.entries(compData.itemA.vectors).map(([key, v]) => (
                    <div key={key} className="p-3 bg-cyber-dark/60 border border-gray-850 rounded text-xs space-y-1">
                      <div className="flex justify-between font-bold text-gray-400">
                        <span>{v.name}</span>
                        <span className={v.survival_points >= 6 ? "text-cyber-green" : "text-cyber-red"}>
                          {v.survival_points}/10
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-550 italic leading-snug">&ldquo;{v.killer_quote}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitch B */}
              <div className="space-y-4">
                <div className="border border-cyber-blue/30 rounded-lg p-4 bg-cyber-blue/5 relative">
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-cyber-blue/20 border border-cyber-blue/30 text-[8px] font-mono text-cyber-blue">
                    VERSION B (NEWER)
                  </span>
                  <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight">
                    {compData.itemB.startup_name}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">
                    Analyzed {new Date(compData.itemB.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-4 text-2xl font-display font-black text-white">
                    <span>{compData.itemB.survival_score}%</span>
                    <span className="text-xs font-mono font-normal text-gray-400">SURVIVAL SCORE</span>

                    {/* Score Difference Badge */}
                    {compData.itemB.survival_score - compData.itemA.survival_score > 0 ? (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-cyber-green/10 border border-cyber-green/20 text-cyber-green">
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                        +{compData.itemB.survival_score - compData.itemA.survival_score}
                      </span>
                    ) : compData.itemB.survival_score - compData.itemA.survival_score < 0 ? (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-cyber-red/10 border border-cyber-red/20 text-cyber-red">
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                        {compData.itemB.survival_score - compData.itemA.survival_score}
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-900 border border-gray-800 text-gray-450">
                        <Minus className="h-3 w-3 mr-0.5" />
                        0
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                  {Object.entries(compData.itemB.vectors).map(([key, v]) => {
                    const diff = v.survival_points - (compData.itemA.vectors[key]?.survival_points || 0);
                    return (
                      <div key={key} className="p-3 bg-cyber-dark/60 border border-gray-850 rounded text-xs space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{v.name}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className={v.survival_points >= 6 ? "text-cyber-green" : "text-cyber-red"}>
                              {v.survival_points}/10
                            </span>
                            {diff !== 0 && (
                              <span className={`text-[10px] font-mono font-bold ${diff > 0 ? "text-cyber-green" : "text-cyber-red"}`}>
                                ({diff > 0 ? `+${diff}` : diff})
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 italic leading-snug">&ldquo;{v.killer_quote}&rdquo;</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer options */}
            <div className="flex justify-end border-t border-gray-850 mt-6 pt-4">
              <button
                onClick={() => setCompareMode(false)}
                className="px-6 py-2 bg-gray-900 border border-gray-800 rounded font-display text-xs font-bold text-white hover:bg-gray-850 transition"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
