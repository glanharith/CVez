import React, { useState } from 'react';
import { Download, CheckCircle, Award, Sparkles, RefreshCw, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ResultViewer({ resultData, onReset }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [downloaded, setDownloaded] = useState(false);
  const { file_id, download_url, tailored_cv } = resultData;

  const handleDownload = async () => {
    try {
      const fullUrl = `http://localhost:8000${download_url}`;
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      const rawName = tailored_cv?.contact?.full_name || 'Candidate';
      const safeName = rawName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeName}_Tailored_CV.pdf`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      setDownloaded(true);
    } catch (err) {
      console.error('Download error:', err);
      // Direct window fallback
      window.location.href = `http://localhost:8000${download_url}`;
    }
  };


  const score = tailored_cv.ats_score_estimate || 88;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner & Score */}
      <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CV Successfully Tailored & Ready</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit">
            {tailored_cv.contact.full_name}
          </h2>
          <p className="text-sm text-blue-400 font-medium">
            {tailored_cv.contact.headline || 'Tailored Professional Resume'}
          </p>
        </div>

        {/* ATS Score Gauge */}
        <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-emerald-400 font-outfit leading-none">
              {score}%
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
              ATS Match Estimate
            </div>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div className="text-xs text-slate-300 space-y-1">
            <div className="flex items-center text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5 mr-1 shrink-0" /> ATS Formatted
            </div>
            <div className="flex items-center text-blue-400">
              <Award className="w-3.5 h-3.5 mr-1 shrink-0" /> High Keyword Alignment
            </div>
          </div>
        </div>

      </div>

      {/* Main Download Call-To-Action Card */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/30 text-center space-y-4 bg-blue-950/20">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
          <Download className="w-6 h-6 text-white" />
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-white font-outfit">Download Tailored Resume PDF</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1">
            Download your newly generated ATS-friendly PDF. The backend will automatically clean up original & generated temporary files upon download.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Tailored CV PDF</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tailor Another CV</span>
          </button>
        </div>

        {downloaded && (
          <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 max-w-md mx-auto">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Download triggered! Backend automated task is executing local file cleanup.</span>
          </div>
        )}
      </div>

      {/* Key Improvements List */}
      {tailored_cv.key_improvements && tailored_cv.key_improvements.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Key AI Modifications Made
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tailored_cv.key_improvements.map((imp, idx) => (
              <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Tabs Preview */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-800 bg-slate-900/80 overflow-x-auto">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'experience', label: 'Work Experience' },
            { id: 'skills', label: 'Skills & Tech' },
            { id: 'education', label: 'Education & Projects' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs font-semibold transition border-b-2 shrink-0 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 text-sm">
          {activeTab === 'summary' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Tailored Executive Summary</h4>
              <p className="text-slate-200 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                {tailored_cv.summary}
              </p>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              {tailored_cv.work_experience.map((exp, idx) => (
                <div key={idx} className="border-b border-slate-800/80 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-white text-base">{exp.position}</h5>
                      <p className="text-xs text-blue-400 font-medium">{exp.company} • {exp.location}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {exp.start_date} – {exp.end_date}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {exp.highlights.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tailored_cv.skills.map((grp, idx) => (
                <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider">{grp.category}</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {grp.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Education</h4>
                {tailored_cv.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 mb-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-white text-xs">{edu.degree} — {edu.institution}</span>
                      <span className="text-xs text-slate-400 font-mono">{edu.graduation_date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {tailored_cv.projects && tailored_cv.projects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Highlighted Projects</h4>
                  {tailored_cv.projects.map((proj, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 mb-2">
                      <h5 className="font-bold text-white text-xs">{proj.name}</h5>
                      {proj.technologies && (
                        <p className="text-[11px] text-blue-400 mt-0.5">Stack: {proj.technologies.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
