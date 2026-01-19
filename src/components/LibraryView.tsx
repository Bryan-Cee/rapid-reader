import React from "react";
import {
  BookOpen,
  Clock,
  FileUp,
  Loader2,
  Settings,
  Trash2,
} from "lucide-react";
import type { TextItem } from "../hooks/useLibrary";
import type { ThemeConfig } from "./SettingsOverlay";

interface LibraryViewProps {
  t: ThemeConfig;
  texts: TextItem[];
  isProcessingPdf: boolean;
  pdfInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenReader: (text: TextItem) => void;
  onDeleteText: (id: string) => void;
  onOpenSettings: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  t,
  texts,
  isProcessingPdf,
  pdfInputRef,
  onFileChange,
  onOpenReader,
  onDeleteText,
  onOpenSettings,
}) => {
  return (
    <div
      className={`min-h-screen ${t.bg} p-4 md:p-10 transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className={`text-5xl font-black tracking-tighter ${t.text}`}>
              RapidReader
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className={`font-bold ${t.muted}`}>
                Accelerate your knowledge intake.
              </p>
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-500`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-slate-500" />
                Local Only
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              ref={pdfInputRef}
              onChange={onFileChange}
            />
            <button
              onClick={() => pdfInputRef.current?.click()}
              disabled={isProcessingPdf}
              className={`flex items-center gap-2 px-8 py-4 ${t.card} border-2 ${t.border} ${t.text} font-black rounded-2xl hover:scale-105 transition-all shadow-sm disabled:opacity-50`}
            >
              {isProcessingPdf ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <FileUp size={20} className={t.accent} />
              )}
              {isProcessingPdf ? "Extracting..." : "Upload PDF"}
            </button>
            <button
              onClick={onOpenSettings}
              className={`p-4 ${t.card} border-2 ${t.border} ${t.muted} rounded-2xl`}
            >
              <Settings size={24} />
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div
              className={`${t.card} rounded-[2.5rem] p-8 border ${t.border} shadow-sm space-y-6`}
            >
              <h3 className={`font-black text-xl ${t.text}`}>Direct Input</h3>
              {/* Direct input handled in parent for better control */}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className={`font-black text-xl ${t.text}`}>
                Your Collection
              </h3>
              <span
                className={`px-4 py-1 rounded-full text-xs font-bold ${t.muted} ${t.card} border ${t.border}`}
              >
                {texts.length} Entries
              </span>
            </div>

            {texts.length === 0 && !isProcessingPdf ? (
              <div
                className={`${t.card} border-2 border-dashed ${t.border} rounded-[2.5rem] p-24 text-center ${t.muted}`}
              >
                <BookOpen size={64} className="mx-auto mb-6 opacity-10" />
                <p className="font-bold">
                  Ready to read? Upload a PDF to start.
                </p>
                <p className="text-xs mt-2 opacity-60">
                  Your data is stored locally in this browser.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {isProcessingPdf && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-8 animate-pulse flex items-center gap-4 text-indigo-500 font-bold">
                    <Loader2 className="animate-spin" /> Processing document...
                  </div>
                )}
                {texts.map((text) => {
                  const wordsArr = text.content
                    .split(/\s+/)
                    .filter((w) => w.length > 0);
                  const progress =
                    wordsArr.length > 0
                      ? Math.round((text.lastIndex / wordsArr.length) * 100)
                      : 0;
                  return (
                    <div
                      key={text.id}
                      onClick={() => onOpenReader(text)}
                      className={`group ${t.card} border ${t.border} rounded-[2.5rem] p-8 hover:border-indigo-400 transition-all cursor-pointer relative flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          {text.isPdf && (
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                              PDF Document
                            </span>
                          )}
                          <h4
                            className={`font-black truncate max-w-[180px] ${t.text}`}
                          >
                            {text.title}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmed = window.confirm(
                              "Are you sure you want to delete this entry? This cannot be undone.",
                            );
                            if (!confirmed) return;
                            onDeleteText(text.id);
                          }}
                          className={`p-2 transition-colors ${t.muted} hover:text-red-500`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p
                        className={`text-sm line-clamp-2 mb-8 leading-relaxed flex-grow font-medium ${t.muted}`}
                      >
                        {text.content}
                      </p>
                      <div
                        className={`flex items-center justify-between pt-6 border-t ${t.border} mt-auto`}
                      >
                        <div
                          className={`flex items-center gap-1.5 text-xs font-black ${t.muted}`}
                        >
                          <Clock size={14} /> {progress}%
                        </div>
                        <div className="w-24 h-2 bg-black/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
