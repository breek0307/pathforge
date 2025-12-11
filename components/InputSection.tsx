import React, { useState, useRef, useCallback } from 'react';
import { UserInput } from '../types';
import { IconUpload, IconMic, IconTrash, IconFileImage, IconSparkles } from './Icons';

interface InputSectionProps {
  onSubmit: (data: UserInput) => void;
}

// Minimal Speech Recognition Type Shim
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const InputSection: React.FC<InputSectionProps> = ({ onSubmit }) => {
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).filter((file: File) => file.type.startsWith('image/'));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleListening = useCallback(() => {
    const windowObj = window as unknown as IWindow;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser does not support speech recognition.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContext(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  }, [isListening]);

  const handleSubmit = () => {
    if (!goal.trim()) return;
    onSubmit({ goal, context, images });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Define Your Journey
        </h2>
        <p className="text-slate-400 text-lg">
          Tell Gemini what you want to achieve. Upload notes or diagrams to personalize it.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Text Input Column */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl neon-glow border-t border-primary/20">
            <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
              Primary Goal
            </label>
            <input 
              type="text" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Become a Senior React Developer in 3 months"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="glass-panel p-6 rounded-2xl relative border-t border-secondary/20">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-secondary uppercase tracking-wider">
                Context & Context
              </label>
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <IconMic size={14} />
                {isListening ? 'Listening...' : 'Voice Input'}
              </button>
            </div>
            <textarea 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Tell us about your current skills, available time, preferred learning style, or past struggles..."
              className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none"
            />
          </div>
        </div>

        {/* Image Upload Column */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border-t border-accent/20">
          <label className="block text-sm font-semibold text-accent mb-2 uppercase tracking-wider">
            Upload Materials (Optional)
          </label>
          
          <div 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            className={`flex-1 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center p-6 text-center ${dragActive ? 'border-accent bg-accent/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/30'}`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*"
              className="hidden" 
              onChange={handleChange}
            />
            
            {images.length === 0 ? (
              <div className="space-y-4 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <IconUpload size={24} />
                </div>
                <div>
                  <p className="text-white font-medium">Drag & drop files here</p>
                  <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-slate-600">Supports: Screenshots, Diagrams, Handwritten Notes</p>
              </div>
            ) : (
              <div className="w-full space-y-3 max-h-64 overflow-y-auto pr-2">
                {images.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800/80 p-3 rounded-lg border border-slate-700 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center shrink-0">
                        <IconFileImage size={18} className="text-slate-400" />
                      </div>
                      <span className="text-sm text-slate-300 truncate">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => removeImage(idx)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary hover:underline mt-2"
                >
                  + Add more files
                </button>
              </div>
            )}
            
            {images.length === 0 && (
               <button 
               onClick={() => fileInputRef.current?.click()}
               className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors pointer-events-auto"
             >
               Browse Files
             </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={handleSubmit}
          disabled={!goal.trim()}
          className={`
            group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full 
            text-white font-bold text-lg shadow-lg shadow-primary/25 overflow-hidden transition-all
            ${!goal.trim() ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-primary/50 hover:scale-105'}
          `}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="flex items-center gap-3 relative z-10">
            <IconSparkles className="animate-pulse" />
            <span>Generate Roadmap</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default InputSection;