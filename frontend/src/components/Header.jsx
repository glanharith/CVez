import React, { useEffect, useState } from 'react';
import { Sparkles, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header() {
  const [backendStatus, setBackendStatus] = useState({ online: false, app: '', mockMode: true });

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => {
        const hasKey = data.openai_key_configured || data.anthropic_key_configured || data.gemini_key_configured;
        setBackendStatus({
          online: true,
          app: data.app,
          mockMode: !hasKey
        });
      })
      .catch(() => {
        setBackendStatus({ online: false, app: 'CVez Server', mockMode: true });
      });
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-outfit">CVez</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Local Dev</span>
            </div>
            <p className="text-xs text-slate-400 font-sans">Automated ATS Resume Tailoring</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Backend:</span>
            {backendStatus.online ? (
              <span className="flex items-center text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Online
              </span>
            ) : (
              <span className="flex items-center text-amber-400 font-medium">
                <AlertCircle className="w-3 h-3 mr-1" /> Offline
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Mode:</span>
            {backendStatus.mockMode ? (
              <span className="text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Mock Mode (Local)
              </span>
            ) : (
              <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live AI API
              </span>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
