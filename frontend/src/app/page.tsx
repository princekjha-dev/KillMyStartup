"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Flame,
  ShieldAlert,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Award,
  Calendar,
  FileText,
  Sparkles,
  BarChart2,
  Building,
  Users,
  FileUp,
  Trash2,
  Rocket,
} from "lucide-react";
import { isSupabaseConfigured } from "./lib/supabase";

export default function Home() {
  const router = useRouter();
  const [startupName, setStartupName] = useState("");
  const [description, setDescription] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [revenueModel, setRevenueModel] = useState("");
  const [foundingTeam, setFoundingTeam] = useState("");
  const [stage, setStage] = useState("");

  // PDF Parsing States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");

  // UI Validation
  const [wordCount, setWordCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cleaned = description.trim();
    const count = cleaned === "" ? 0 : cleaned.split(/\s+/).length;
    setWordCount(count);
  }, [description]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Please upload a valid PDF file.");
      return;
    }

    setPdfFile(file);
    setPdfError("");
    setIsParsingPdf(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/api/parse-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPdfText(response.data.text);
    } catch (err: any) {
      console.error(err);
      setPdfError(err.response?.data?.detail || "Failed to extract text from PDF.");
      setPdfFile(null);
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleClearPdf = () => {
    setPdfFile(null);
    setPdfText("");
    setPdfError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (wordCount < 50) {
      setErrorMsg("Your description must be at least 50 words to receive a meaningful roast.");
      return;
    }

    if (wordCount > 1000) {
      setErrorMsg("Your description exceeds the maximum length of 1000 words. Keep it concise.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      startup_name: startupName,
      description,
      target_market: targetMarket || undefined,
      revenue_model: revenueModel || undefined,
      founding_team: foundingTeam || undefined,
      stage: stage || undefined,
      pdf_text: pdfText || undefined,
    };

    sessionStorage.setItem("pending_roast_payload", JSON.stringify(payload));
    router.push("/console");
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Title */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyber-red/10 rounded-full blur-3xl -z-10" />
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 uppercase">
          THE BRUTAL <span className="text-cyber-red">PITCH DESTROYER</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Surrounded by yes-men, soft mentors, and ghosting VCs? Enter your startup details and let
          the engine strip your business model, regulations, and market sizing raw.
        </p>
      </div>

      {/* Main Panel */}
      <form
        onSubmit={handleSubmit}
        className="w-full cyber-glass rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden border-red-500/10"
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 font-display mb-1.5 uppercase tracking-wider">
              Startup Name *
            </label>
            <input
              type="text"
              required
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g. ChaiCommerce"
              className="w-full bg-cyber-dark/80 border border-gray-800 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-red transition font-display"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 font-display mb-1.5 uppercase tracking-wider">
              Operational Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full bg-cyber-dark/80 border border-gray-800 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-red transition"
            >
              <option value="">Select Stage...</option>
              <option value="Idea Phase">Idea Phase</option>
              <option value="Pre-MVP / Building">Pre-MVP / Building</option>
              <option value="MVP Completed / Testing">MVP Completed / Testing</option>
              <option value="Early Revenue / Scale">Early Revenue / Scale</option>
            </select>
          </div>
        </div>

        {/* Pitch Text Area */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-gray-400 font-display uppercase tracking-wider">
              Startup Pitch / Description *
            </label>
            <span
              className={`text-[10px] font-mono ${
                wordCount < 50
                  ? "text-cyber-yellow"
                  : wordCount > 1000
                  ? "text-cyber-red"
                  : "text-cyber-green"
              }`}
            >
              {wordCount} / 1000 words (Min 50)
            </span>
          </div>
          <textarea
            required
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what your startup does, who it serves, how you solve the problem, and why you are building this. Be honest, the LLM will call out vague jargon instantly..."
            className="w-full bg-cyber-dark/80 border border-gray-800 rounded px-3 py-3 text-sm text-white focus:outline-none focus:border-cyber-red transition leading-relaxed"
          />
        </div>

        {/* Structured Grid Section */}
        <div className="border-t border-gray-900 pt-6">
          <h3 className="text-xs font-bold text-gray-400 font-display mb-4 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-cyber-red" />
            <span>Structured Data Fields (Optional)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 font-display mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                <BarChart2 className="h-3 w-3 text-gray-500" />
                <span>Target Market / User</span>
              </label>
              <input
                type="text"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder="e.g. Tier 2 Indian merchants"
                className="w-full bg-cyber-dark/80 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-red transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 font-display mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                <Building className="h-3 w-3 text-gray-500" />
                <span>Revenue Model</span>
              </label>
              <input
                type="text"
                value={revenueModel}
                onChange={(e) => setRevenueModel(e.target.value)}
                placeholder="e.g. 1.5% transaction commission"
                className="w-full bg-cyber-dark/80 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-red transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 font-display mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span>Founding Team Size</span>
              </label>
              <input
                type="text"
                value={foundingTeam}
                onChange={(e) => setFoundingTeam(e.target.value)}
                placeholder="e.g. 2 co-founders, 1 dev"
                className="w-full bg-cyber-dark/80 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-red transition"
              />
            </div>
          </div>
        </div>

        {/* Pitch Deck Upload */}
        <div className="border-t border-gray-900 pt-6">
          <label className="block text-xs font-semibold text-gray-400 font-display mb-1.5 uppercase tracking-wider">
            Pitch Deck Document (Optional PDF - Text Parsing Only)
          </label>

          {!pdfFile ? (
            <div className="border border-dashed border-gray-800 rounded-lg p-6 bg-cyber-dark/40 flex flex-col items-center justify-center hover:bg-cyber-dark/80 transition relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isParsingPdf}
              />
              <FileUp className="h-8 w-8 text-gray-500 mb-2" />
              <p className="text-xs text-gray-400 font-medium">
                {isParsingPdf
                  ? "Extracting layout text..."
                  : "Drag and drop your deck PDF, or click to browse"}
              </p>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">
                Supports standard PDF text sheets (Images are skipped)
              </p>
            </div>
          ) : (
            <div className="border border-gray-800 rounded-lg p-4 bg-gray-950 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="h-9 w-9 rounded bg-cyber-red/10 border border-cyber-red/20 flex items-center justify-center text-cyber-red text-xs font-mono font-bold">
                  PDF
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-300 font-medium truncate">{pdfFile.name}</p>
                  <p className="text-[10px] text-cyber-green font-mono">
                    {pdfText
                      ? `Parsed ${pdfText.split(/\s+/).length} words successfully.`
                      : "Processing..."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearPdf}
                className="p-2 rounded bg-gray-900 text-gray-400 hover:text-cyber-red transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {pdfError && (
            <p className="text-xs font-semibold text-cyber-red mt-2 flex items-center">
              <ShieldAlert className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{pdfError}</span>
            </p>
          )}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3.5 rounded border border-cyber-red/20 bg-cyber-red/5 text-xs text-cyber-red font-medium flex items-center">
            <ShieldAlert className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0 border-t border-gray-900">
          <div className="flex items-center text-xs text-gray-500">
            <ShieldAlert className="h-4 w-4 text-gray-600 mr-1.5 flex-shrink-0" />
            <p>Roast is AI-generated critique, not verified due diligence. Treat as a stress test.</p>
          </div>
          <button
            type="submit"
            disabled={wordCount < 50 || wordCount > 1000 || isParsingPdf}
            className="w-full sm:w-auto px-8 py-3 bg-cyber-red text-white font-display text-sm font-bold rounded hover:bg-cyber-red/90 transition shadow-lg shadow-cyber-red/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <Rocket className="h-4 w-4" />
            <span>Destroy My Idea</span>
          </button>
        </div>
      </form>
    </div>
  );
}
