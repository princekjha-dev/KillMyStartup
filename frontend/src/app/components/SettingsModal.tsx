"use client";

import { useState, useEffect } from "react";
import { X, Key, Shield, HelpCircle, Eye, EyeOff } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
  onSave?: () => void;
}

export default function SettingsModal({ onClose, onSave }: SettingsModalProps) {
  const [key, setKey] = useState("");
  const [model, setModel] = useState("anthropic/claude-3.5-sonnet:beta");
  const [showKey, setShowKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key") || "";
    const savedModel = localStorage.getItem("openrouter_model") || "anthropic/claude-3.5-sonnet:beta";
    setKey(savedKey);
    setModel(savedModel);
  }, []);

  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem("openrouter_api_key", key.trim());
      localStorage.setItem("openrouter_model", model);
      setStatusMessage("Settings saved successfully.");
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1000);
    } else {
      localStorage.removeItem("openrouter_api_key");
      localStorage.removeItem("openrouter_model");
      setStatusMessage("API key cleared. Engine will rely on server environment key.");
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-cyber-card p-6 shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 border-b border-gray-850 pb-4 mb-4">
          <Key className="h-5 w-5 text-cyber-yellow" />
          <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">Engine Settings</h2>
        </div>

        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          The Roast Engine requires an API key to execute the 7 parallel destruction checks. If you haven't configured a key in the backend environment, you can supply one here.
        </p>

        <div className="space-y-4">
          {/* API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 font-display mb-1 uppercase tracking-wider">
              OpenRouter API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-cyber-dark border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-yellow font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-white"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 font-mono">
              Saved locally in your browser. Passed in the request header.
            </p>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 font-display mb-1 uppercase tracking-wider">
              LLM Model Target
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-cyber-dark border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-yellow"
            >
              <option value="anthropic/claude-3.5-sonnet:beta">Claude 3.5 Sonnet (Recommended)</option>
              <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
            </select>
          </div>

          <div className="flex items-start space-x-2 rounded bg-cyber-yellow/5 border border-cyber-yellow/10 p-3 text-[11px] text-cyber-yellow/80">
            <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Security Policy:</strong> We do not store your startup details or keys in databases without authentication. Session details are cleared from backend logs immediately.
            </p>
          </div>

          {statusMessage && (
            <p className="text-center text-xs font-semibold text-cyber-green animate-pulse">
              {statusMessage}
            </p>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-800 hover:bg-gray-900 rounded font-display text-sm font-semibold text-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-cyber-yellow text-cyber-dark font-display text-sm font-bold rounded hover:bg-cyber-yellow/90 transition shadow-lg shadow-cyber-yellow/10"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
