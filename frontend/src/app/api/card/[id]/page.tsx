"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Flame, ShieldAlert, Download, XIcon, CheckCircle2, XCircle, ArrowLeft, Loader2, Award, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

interface VectorResult {
  name: string;
  description: string;
  analysis: string;
  confidence: "HIGH" | "MEDIUM" | "UNCERTAIN";
  survival_points: number;
  survived: boolean;
  killer_quote: string;
}

interface RoastData {
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

export default function RoastDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<RoastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeVector, setActiveVector] = useState<string>("market_reality");

  useEffect(() => {
    if (!id) return;

    const fetchRoast = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/roasts/${id}`);
        setData(response.data);

        // If score is high (>= 60), throw confetti!
        if (response.data.survival_score >= 60) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#10B981", "#3B82F6", "#FBBF24"]
          });
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.response?.data?.detail || "Could not retrieve roast data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoast();
  }, [id]);

  const handleDownloadCard = async () => {
    if (!data) return;
    try {
      const response = await fetch(`/api/card/${data.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.startup_name.replace(/\s+/g, "_")}_roast_card.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Failed to download card", e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 text-cyber-red animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-mono">LOADING DESTRUCTION REPORT...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-12 px-6 bg-cyber-red/5 border border-cyber-red/20 rounded-xl mt-8">
        <ShieldAlert className="h-12 w-12 text-cyber-red mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold text-white mb-2 uppercase">Report Unavailable</h3>
        <p className="text-xs text-gray-400 mb-6">{errorMsg || "The requested roast could not be found."}</p>
        <Link href="/" className="px-6 py-2 bg-gray-950 border border-gray-800 rounded font-display text-xs font-semibold text-white hover:bg-gray-900 transition">
          Return to Launcher
        </Link>
      </div>
    );
  }

  // Count survived attacks
  const survivedCount = Object.values(data.vectors).filter(v => v.survived).length;

  // Format analysis text to highlight [UNCERTAIN] in yellow
  const renderAnalysis = (text: string) => {
    if (!text) return "";
    
    // Split text by [UNCERTAIN] tags
    const parts = text.split(/(\[UNCERTAIN\])/g);
    return parts.map((part, index) => {
      if (part === "[UNCERTAIN]") {
        return (
          <span key={index} className="bg-cyber-yellow/20 text-cyber-yellow px-1 py-0.5 rounded font-mono text-[11px] font-bold border border-cyber-yellow/20">
            [UNCERTAIN]
          </span>
        );
      }
      return part;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-cyber-green border-cyber-green/30 bg-cyber-green/5";
    if (score >= 40) return "text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/5";
    return "text-cyber-red border-cyber-red/30 bg-cyber-red/5";
  };

  const shareText = `My startup idea "${data.startup_name}" just took on the Brutal Pitch Destroyer and survived ${survivedCount} of 7 attacks! See the roast here: ${window.location.origin}/roast/${data.id} #KillMyStartupIdea`;

  return (
    <div className="w-full space-y-8">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition">
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Launcher</span>
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] text-cyber-red font-mono tracking-widest uppercase">
            ROAST ANALYTICAL DOSSIER
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white uppercase mt-1">
            {data.startup_name}
          </h1>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 font-mono">
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {new Date(data.created_at).toLocaleDateString()}
            </span>
            {data.stage && (
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px]">
                {data.stage}
              </span>
            )}
          </div>
        </div>

        {/* Score Shield */}
        <div className={`flex items-center space-x-4 border rounded-xl p-4 md:px-6 ${getScoreColor(data.survival_score)}`}>
          <div className="text-center">
            <span className="block text-[10px] font-mono tracking-wider uppercase opacity-80">
              Survival Score
            </span>
            <span className="font-display text-3xl md:text-4xl font-black">
              {data.survival_score}/100
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="text-xs font-medium">
            <p className="uppercase tracking-wider">
              {data.survival_score >= 70 ? "REAL POTENTIAL" : data.survival_score >= 40 ? "FRAGILE HYPOTHESIS" : "CRITICAL CASUALTY"}
            </p>
            <p className="text-[10px] opacity-75 mt-0.5">
              Survived {survivedCount} of 7 attack vectors
            </p>
          </div>
        </div>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Vectors Accordion & Detailed Critique */}
        <div className="lg:col-span-2 space-y-6">
          <div className="cyber-glass rounded-xl p-5 shadow-xl border-gray-900">
            <h2 className="font-display text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
              <Flame className="h-4 w-4 text-cyber-red mr-2" />
              <span>7 Destruction Vector Reports</span>
            </h2>

            {/* Grid of vector selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2 mb-6">
              {Object.entries(data.vectors).map(([key, vector]) => (
                <button
                  key={key}
                  onClick={() => setActiveVector(key)}
                  className={`px-2 py-3 rounded text-center border font-display text-[11px] font-bold uppercase transition flex flex-col items-center justify-between gap-1.5 ${
                    activeVector === key
                      ? "bg-cyber-red/10 border-cyber-red text-white"
                      : "bg-cyber-dark/40 border-gray-850 text-gray-450 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  <span className="truncate max-w-[80px]">{vector.name.split(" ")[0]}</span>
                  {vector.survived ? (
                    <span className="text-[9px] text-cyber-green flex items-center font-mono">
                      PASSED ({vector.survival_points})
                    </span>
                  ) : (
                    <span className="text-[9px] text-cyber-red flex items-center font-mono">
                      FAILED ({vector.survival_points})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Critique Output Area */}
            {activeVector && data.vectors[activeVector] && (
              <div className="bg-cyber-dark/80 border border-gray-850 rounded-lg p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-850 pb-3 gap-2">
                  <div>
                    <h3 className="font-display text-base font-extrabold text-white uppercase">
                      {data.vectors[activeVector].name}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                      {data.vectors[activeVector].description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      data.vectors[activeVector].confidence === "HIGH"
                        ? "text-cyber-green border-cyber-green/20 bg-cyber-green/5"
                        : data.vectors[activeVector].confidence === "MEDIUM"
                        ? "text-cyber-blue border-cyber-blue/20 bg-cyber-blue/5"
                        : "text-cyber-yellow border-cyber-yellow/20 bg-cyber-yellow/5"
                    }`}>
                      CONFIDENCE: {data.vectors[activeVector].confidence}
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      data.vectors[activeVector].survived ? "text-cyber-green" : "text-cyber-red"
                    }`}>
                      POINTS: {data.vectors[activeVector].survival_points}/10
                    </span>
                  </div>
                </div>

                {/* Brutal Quote */}
                <div className="border-l-4 border-cyber-red bg-cyber-red/5 p-4 rounded text-sm italic font-medium text-gray-300">
                  &ldquo;{data.vectors[activeVector].killer_quote}&rdquo;
                </div>

                {/* Analysis Body */}
                <div className="text-sm text-gray-400 leading-relaxed space-y-3 whitespace-pre-line font-light">
                  {renderAnalysis(data.vectors[activeVector].analysis)}
                </div>
              </div>
            )}
          </div>

          {/* PDF Report trigger & Input Summary */}
          <div className="cyber-glass rounded-xl p-5 shadow-xl border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Export Full Report</h4>
                <p className="text-[10px] text-gray-500">Download the detailed analysis dossier as a PDF.</p>
              </div>
            </div>
            <a
              href={`http://localhost:8000/api/roasts/${data.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-950 border border-gray-800 rounded font-display text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-900 transition flex items-center justify-center space-x-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* Right Side: Card Share & Assumptions */}
        <div className="space-y-6">
          {/* Viral share card */}
          <div className="cyber-glass rounded-xl p-5 shadow-xl border-gray-900 text-center">
            <h2 className="font-display text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
              Viral Roast Card
            </h2>
            
            {/* Satori Generated Card Image */}
            <div className="border border-gray-850 rounded-lg overflow-hidden bg-cyber-dark mb-4 aspect-[1200/630]">
              <img
                src={`/api/card/${data.id}`}
                alt={`${data.startup_name} Roast Card`}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadCard}
                className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded font-display text-xs font-semibold text-gray-300 hover:text-white transition flex items-center justify-center space-x-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Save PNG</span>
              </button>
              
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white rounded font-display text-xs font-semibold transition flex items-center justify-center space-x-1.5"
              >
                <Twitter className="h-4 w-4" />
                <span>Share Roast</span>
              </a>
            </div>
          </div>

          {/* Speculative assumptions (What Would Need to Be True) */}
          {data.survival_score < 40 && data.true_conditions && data.true_conditions.length > 0 && (
            <div className="cyber-glass rounded-xl p-5 shadow-xl border-gray-900 bg-cyber-yellow/5 border-cyber-yellow/15">
              <h2 className="font-display text-sm font-bold text-cyber-yellow uppercase tracking-widest mb-3 flex items-center">
                <Award className="h-4 w-4 text-cyber-yellow mr-2" />
                <span>What Would Need to Be True</span>
              </h2>
              <p className="text-[11px] text-cyber-yellow/70 mb-4 leading-normal">
                This idea scored below 40. For it to defy the odds and succeed, the following underlying assumptions must hold:
              </p>
              <ul className="space-y-3">
                {data.true_conditions.map((condition, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-gray-300 leading-normal border-b border-gray-850/50 pb-2 last:border-b-0 last:pb-0">
                    <span className="text-cyber-yellow font-bold mt-0.5">•</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-[10px] text-gray-500 font-mono text-center">
                * Speculative analysis based on critical weaknesses.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
