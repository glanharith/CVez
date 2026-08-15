import React from 'react';
import { Briefcase, Sparkles } from 'lucide-react';

const PRESET_JOBS = [
  {
    title: "Senior Full Stack Engineer",
    text: `Target Role: Senior Full Stack Engineer (Python + React)
Responsibilities:
- Design, build, and maintain scalable microservices using Python (FastAPI/Django) and React.
- Optimize database queries (PostgreSQL/Redis) and RESTful/GraphQL API endpoints for low-latency performance.
- Drive DevOps best practices with Docker, Kubernetes, and CI/CD automation pipelines on AWS.
- Collaborate with product management and UX designers to deliver robust user experiences.

Requirements:
- 5+ years of software engineering experience.
- Strong proficiency in Python, JavaScript/TypeScript, React, and SQL.
- Experience with cloud infrastructure (AWS/GCP), containerization, and automated testing.
- Track record of delivering high-concurrency distributed systems with quantified impact.`
  },
  {
    title: "AI / ML Engineer",
    text: `Target Role: AI / Machine Learning Engineer
Responsibilities:
- Build and fine-tune Large Language Models (LLMs) and RAG applications for production deployment.
- Implement efficient vector database search (Pinecone/ChromaDB) and API integrations.
- Develop data pipelines for dataset cleaning, tokenization, and model evaluation.

Requirements:
- Proven experience with PyTorch, OpenAI API, Anthropic, LangChain, or LlamaIndex.
- Strong Python fundamentals and backend development skills (FastAPI, Docker).`
  },
  {
    title: "Technical Product Manager",
    text: `Target Role: Technical Product Manager
Responsibilities:
- Define product roadmap, feature requirements, and user stories for developer platform products.
- Work closely with engineering leads to prioritize technical debt vs new feature deliverables.
- Analyze user metrics and retention feedback to drive product optimization and growth.

Requirements:
- 4+ years of product management experience in SaaS or developer tools.
- Strong technical background (CS degree or former engineer) with agile team leadership skills.`
  }
];

export default function JobDescriptionInput({ value, onChange }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-200">
          2. Target Job Description <span className="text-red-400">*</span>
        </label>
        <span className="text-xs text-slate-400 font-mono">
          {wordCount} words • {charCount} chars
        </span>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 flex items-center shrink-0">
          <Sparkles className="w-3 h-3 mr-1 text-blue-400" /> Presets:
        </span>
        {PRESET_JOBS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChange(preset.text)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-blue-300 transition shrink-0"
          >
            {preset.title}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the target job description here (or click one of the quick presets above)..."
          rows={7}
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-sans leading-relaxed resize-none shadow-inner"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
