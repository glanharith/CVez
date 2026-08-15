import React from 'react';
import { Sliders, Cpu, MessageSquare } from 'lucide-react';

export default function TailorControls({
  provider,
  onProviderChange,
  customInstructions,
  onInstructionsChange
}) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center space-x-2 text-slate-200 border-b border-slate-800 pb-3">
        <Sliders className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold">3. Advanced Tailoring Options</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LLM Engine Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center">
            <Cpu className="w-3.5 h-3.5 mr-1 text-slate-400" /> AI Provider Choice
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'openai', label: 'OpenAI' },
              { id: 'anthropic', label: 'Anthropic' },
              { id: 'gemini', label: 'Gemini' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onProviderChange(p.id)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                  provider === p.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm shadow-blue-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Instructions */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center">
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-400" /> Optional Focus / Custom Directives
          </label>
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="e.g. Emphasize leadership skills, highlight cloud architecture metrics"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
