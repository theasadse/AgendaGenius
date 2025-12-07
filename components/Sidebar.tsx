import React, { useCallback } from 'react';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { FileData } from '../types';

interface SidebarProps {
  onFileUpload: (file: FileData) => void;
  isProcessing: boolean;
  uploadedFile: FileData | null;
  error: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileUpload, isProcessing, uploadedFile, error }) => {

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 part
      const base64Data = result.split(',')[1];
      
      onFileUpload({
        name: file.name,
        type: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  }, [onFileUpload]);

  return (
    <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 h-screen flex flex-col p-6 sticky top-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span className="bg-primary text-white p-1 rounded">AG</span>
          AgendaGenius
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Turn your documents into structured meeting plans instantly.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Upload Document
            </label>
            <div className={`
              border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
              ${isProcessing ? 'bg-slate-100 border-slate-300 opacity-50 cursor-not-allowed' : 'border-slate-300 hover:border-primary hover:bg-slate-100'}
            `}>
              <input 
                type="file" 
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
                title="Upload file"
              />
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              ) : (
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
              )}
              <p className="text-sm text-slate-600 font-medium">
                {isProcessing ? 'Analyzing...' : 'Click to upload'}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, TXT, DOCX</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current File Status */}
          {uploadedFile && !isProcessing && !error && (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 truncate max-w-[150px]">
                    {uploadedFile.name}
                  </h3>
                  <p className="text-xs text-green-600">Successfully processed</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FileText size={16} /> How it works
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs opacity-80">
              <li>Upload a project brief or notes.</li>
              <li>AI extracts stakeholders & topics.</li>
              <li>Review the generated timeline.</li>
              <li>Chat with the AI to refine.</li>
            </ol>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-slate-400 mt-auto pt-6 border-t">
        Powered by Gemini 2.5 Flash & 3.0 Pro
      </div>
    </div>
  );
};

export default Sidebar;
