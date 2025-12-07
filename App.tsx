import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TimelineItem from './components/TimelineItem';
import ChatBot from './components/ChatBot';
import { generateAgendaFromFile } from './services/geminiService';
import { FileData, GeneratedAgenda } from './types';
import { Calendar, Users, Clock, FileQuestion, ChevronRight } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState<FileData | null>(null);
  const [agenda, setAgenda] = useState<GeneratedAgenda | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (uploadedFile: FileData) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setError(null);
    setAgenda(null);

    try {
      const generatedAgenda = await generateAgendaFromFile(uploadedFile);
      setAgenda(generatedAgenda);
    } catch (err) {
      setError("Failed to generate agenda. Please try again with a different file.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to calculate start times based on duration
  const calculateStartTimes = (items: GeneratedAgenda['items']) => {
    let currentTime = new Date();
    currentTime.setHours(9, 0, 0, 0); // Default start 9:00 AM if specific date not used
    
    return items.map(item => {
      const startTimeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentTime = new Date(currentTime.getTime() + item.durationMinutes * 60000);
      return startTimeStr;
    });
  };

  const startTimes = agenda ? calculateStartTimes(agenda.items) : [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Left Sidebar */}
      <Sidebar 
        onFileUpload={handleFileUpload} 
        isProcessing={isProcessing}
        uploadedFile={file}
        error={error}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen">
        {!agenda && !isProcessing && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto opacity-50">
            <div className="bg-slate-200 p-6 rounded-full mb-6">
              <FileQuestion size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">No Agenda Yet</h2>
            <p className="text-slate-500">
              Upload a document on the left to generate your smart meeting agenda.
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
             <div className="h-4 bg-slate-200 rounded w-1/3"></div>
             <div className="h-8 bg-slate-200 rounded w-1/2"></div>
             <div className="space-y-3 w-full max-w-2xl mt-8">
               <div className="h-32 bg-slate-200 rounded-lg w-full"></div>
               <div className="h-32 bg-slate-200 rounded-lg w-full"></div>
               <div className="h-32 bg-slate-200 rounded-lg w-full"></div>
             </div>
          </div>
        )}

        {agenda && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Header Section */}
            <header className="mb-10">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-2">
                <Calendar className="h-4 w-4" />
                <span>{agenda.date || "Upcoming Meeting"}</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                {agenda.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {agenda.overview}
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Timeline Section (Main) */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-400" />
                    Timeline
                  </h2>
                  <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">
                    Total: {agenda.items.reduce((acc, item) => acc + item.durationMinutes, 0)} mins
                  </span>
                </div>
                
                <div className="relative pl-2">
                   {/* Continuous Vertical Line Background */}
                   <div className="absolute left-[5.5rem] top-4 bottom-8 w-0.5 bg-slate-100 -z-0"></div>

                   {agenda.items.map((item, index) => (
                     <TimelineItem 
                        key={index} 
                        item={item} 
                        startTime={startTimes[index]}
                        isLast={index === agenda.items.length - 1}
                      />
                   ))}
                </div>
              </div>

              {/* Sidebar Section (Stakeholders) */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <Users className="h-5 w-5 text-slate-400" />
                    Stakeholders
                  </h2>
                  
                  {agenda.stakeholders.length > 0 ? (
                    <ul className="space-y-3">
                      {agenda.stakeholders.map((person, idx) => (
                        <li key={idx} className="flex items-start gap-3 group">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                            {person.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                            <p className="text-xs text-slate-500">{person.role}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No specific stakeholders identified.</p>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-100">
                     <button className="w-full text-sm text-primary hover:bg-slate-50 py-2 rounded flex items-center justify-center gap-1 transition-colors">
                        View Details <ChevronRight size={14} />
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Chat Bot Overlay */}
      <ChatBot contextFile={file} />
    </div>
  );
}
