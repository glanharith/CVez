import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import JobDescriptionInput from './components/JobDescriptionInput';
import TailorControls from './components/TailorControls';
import ProcessingState from './components/ProcessingState';
import ResultViewer from './components/ResultViewer';
import { Sparkles, ArrowRight, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [provider, setProvider] = useState('gemini');

  const [customInstructions, setCustomInstructions] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleTailorSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedFile) {
      setErrorMsg('Please upload your original CV (.pdf or .docx) to proceed.');
      return;
    }

    if (!jobDescription.trim()) {
      setErrorMsg('Please enter or select a target job description.');
      return;
    }

    setIsProcessing(true);
    setResultData(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('job_description', jobDescription);
      formData.append('provider', provider);
      formData.append('custom_instructions', customInstructions);

      const response = await fetch('http://localhost:8000/api/tailor-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      setResultData(data);
    } catch (err) {
      console.error('Tailor error:', err);
      setErrorMsg(err.message || 'Failed to tailor CV. Please verify backend server status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJobDescription('');
    setCustomInstructions('');
    setResultData(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Glow Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 space-y-8">
        
        {/* Top Hero Banner */}
        {!resultData && !isProcessing && (
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Local CV Tailoring & ATS Optimization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-outfit">
              Tailor Your CV for Any Job in <span className="text-gradient">Seconds</span>
            </h1>
            <p className="text-sm text-slate-400">
              Upload your existing resume, paste the target job post, and get a keyword-aligned, ATS-ready PDF tailored specifically to boost your match score.
            </p>
          </div>
        )}

        {/* Global Error Alert */}
        {errorMsg && (
          <div className="glass-card rounded-2xl p-4 border border-red-500/30 bg-red-500/10 flex items-center space-x-3 text-sm text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Processing State View */}
        {isProcessing && <ProcessingState />}

        {/* Result View */}
        {!isProcessing && resultData && (
          <ResultViewer resultData={resultData} onReset={handleReset} />
        )}

        {/* Input Form View */}
        {!isProcessing && !resultData && (
          <form onSubmit={handleTailorSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                selectedFile={selectedFile}
                onFileSelect={(file) => setSelectedFile(file)}
                onFileRemove={() => setSelectedFile(null)}
              />
              <JobDescriptionInput
                value={jobDescription}
                onChange={(val) => setJobDescription(val)}
              />
            </div>

            <TailorControls
              provider={provider}
              onProviderChange={setProvider}
              customInstructions={customInstructions}
              onInstructionsChange={setCustomInstructions}
            />

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 transition transform hover:scale-[1.005] active:scale-[0.995]"
              >
                <Sparkles className="w-5 h-5" />
                <span>Tailor CV & Generate ATS PDF</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </form>
        )}

        {/* Footer Features */}
        {!isProcessing && !resultData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/60 text-xs text-slate-400">
            <div className="flex items-center space-x-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Stateless & Local:</strong> Files auto-cleaned after download.</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
              <Zap className="w-4 h-4 text-blue-400 shrink-0" />
              <span><strong>Fast Processing:</strong> Rapid extraction & AI structuring.</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span><strong>ATS Compliant:</strong> PDF rendered with Jinja2 template.</span>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 z-10">
        CVez Local Dev Version • Built with FastAPI & React Vite
      </footer>

    </div>
  );
}
