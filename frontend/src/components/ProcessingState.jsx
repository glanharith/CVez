import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, FileSearch, Sparkles, FileText } from 'lucide-react';

export default function ProcessingState() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep(2), 1200);
    const timer2 = setTimeout(() => setActiveStep(3), 2800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const steps = [
    { id: 1, label: 'Extracting text from uploaded CV document...', icon: FileSearch },
    { id: 2, label: 'Analyzing Job Description & AI tailoring experience...', icon: Sparkles },
    { id: 3, label: 'Rendering ATS-friendly Jinja2 PDF document...', icon: FileText }
  ];

  return (
    <div className="glass-card rounded-2xl p-8 border border-blue-500/30 text-center space-y-6 animate-fade-in shadow-2xl shadow-blue-500/10">
      
      {/* Animated Spinner Icon */}
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white font-outfit">Crafting Your Tailored CV</h3>
        <p className="text-xs text-slate-400 mt-1">Please wait a moment while AI optimizes your resume for ATS compliance.</p>
      </div>

      {/* Steps List */}
      <div className="max-w-md mx-auto space-y-3 text-left">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = activeStep > step.id;
          const isCurrent = activeStep === step.id;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-200'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
              ) : (
                <Icon className="w-5 h-5 text-slate-600 shrink-0" />
              )}
              <span className="text-xs font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
