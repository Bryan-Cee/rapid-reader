import React from "react";
import {
  ChevronLeft,
  Eye,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Zap,
} from "lucide-react";
import type { TextItem } from "../hooks/useLibrary";
import type { ThemeConfig } from "./SettingsOverlay";

interface ReaderViewProps {
  t: ThemeConfig;
  activeText: TextItem;
  words: string[];
  currentIndex: number;
  isPlaying: boolean;
  readerMode: "rsvp" | "pdf";
  showContext: boolean;
  showFocusLine: boolean;
  contextSnippet: string;
  pdfBlobs: Record<string, string>;
  onBackToLibrary: () => void;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onRestart: () => void;
  onToggleSettings: () => void;
  onToggleReaderMode: () => void;
}

const getORP = (word: string) => {
  if (!word) return { before: "", pivot: "", after: "" };
  const mid = Math.floor(word.length / 2);
  const pivot = word.length > 5 ? mid - 1 : mid;
  return {
    before: word.slice(0, pivot),
    pivot: word[pivot] ?? "",
    after: word.slice(pivot + 1),
  };
};

export const ReaderView: React.FC<ReaderViewProps> = ({
  t,
  activeText,
  words,
  currentIndex,
  isPlaying,
  readerMode,
  showContext,
  showFocusLine,
  contextSnippet,
  pdfBlobs,
  onBackToLibrary,
  onTogglePlay,
  onSkipBack,
  onRestart,
  onToggleSettings,
  onToggleReaderMode,
}) => {
  const word = words[currentIndex] || "";
  const { before, pivot, after } = getORP(word);

  return (
    <div
      className={`min-h-screen ${t.bg} flex flex-col p-0 sm:p-4 transition-colors duration-300`}
    >
      <div
        className={`w-full max-w-5xl mx-auto flex flex-col h-screen sm:h-[90vh] ${t.card} sm:rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300`}
      >
        <div
          className={`px-6 py-4 border-b ${t.border} flex items-center justify-between z-10`}
        >
          <button
            onClick={onBackToLibrary}
            className={`p-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-2 ${t.muted} hover:${t.text}`}
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline font-bold">Library</span>
          </button>
          <div className="text-center px-4 overflow-hidden">
            <h2
              className={`font-black truncate text-sm sm:text-base ${t.text}`}
            >
              {activeText.title}
            </h2>
            <span
              className={`text-[10px] sm:text-xs font-mono font-bold ${t.muted}`}
            >
              Word {currentIndex + 1} / {words.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeText.isPdf && pdfBlobs[activeText.id] && (
              <button
                onClick={onToggleReaderMode}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  readerMode === "pdf"
                    ? "bg-indigo-600 text-white"
                    : `${t.bg} ${t.text} hover:scale-105`
                }`}
              >
                {readerMode === "pdf" ? <Zap size={14} /> : <Eye size={14} />}
                <span className="hidden xs:inline">
                  {readerMode === "pdf" ? "RSVP" : "View PDF"}
                </span>
              </button>
            )}
            <button
              onClick={onToggleSettings}
              className={`p-2 rounded-full transition-colors ${t.muted} hover:${t.text}`}
            >
              <Settings size={22} />
            </button>
          </div>
        </div>

        <div className={`flex-grow relative ${t.readerBg} overflow-hidden`}>
          {readerMode === "rsvp" ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              {showContext && (
                <div
                  className={`mb-8 px-6 text-center max-w-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
                >
                  <p
                    className={`text-sm sm:text-base font-medium ${t.muted} opacity-40 leading-relaxed italic`}
                  >
                    ...{contextSnippet}...
                  </p>
                </div>
              )}

              <div className="relative">
                {showFocusLine && (
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-20 opacity-20 pointer-events-none rounded-full hidden sm:block ${t.btn}`}
                  ></div>
                )}
                {showFocusLine ? (
                  <div
                    className={`text-4xl sm:text-7xl font-mono flex items-center tracking-tight select-none transition-all duration-75`}
                  >
                    <span
                      className={`${t.muted} text-right min-w-[140px] sm:min-w-[300px] opacity-40`}
                    >
                      {before}
                    </span>
                    <span className={`${t.accent} font-black`}>{pivot}</span>
                    <span
                      className={`${t.text} text-left min-w-[140px] sm:min-w-[300px]`}
                    >
                      {after}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`text-4xl sm:text-7xl font-mono tracking-tight select-none transition-all duration-75 ${t.text}`}
                  >
                    {word}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <iframe
              src={pdfBlobs[activeText.id]}
              className="w-full h-full border-none"
              title="PDF Viewer"
            />
          )}
        </div>

        <div className={`${t.card} border-t ${t.border}`}>
          <div className="w-full h-1.5 bg-black/5">
            <div
              className="h-full bg-indigo-500 transition-all duration-200"
              style={{
                width: `${(currentIndex / Math.max(1, words.length)) * 100}%`,
              }}
            ></div>
          </div>
          <div className="px-6 py-8 flex flex-col gap-6 items-center">
            {readerMode === "rsvp" && (
              <div className="flex items-center gap-6 sm:gap-12">
                <button
                  onClick={onSkipBack}
                  className={`p-3 transition-all ${t.muted} hover:${t.text}`}
                >
                  <RotateCcw size={28} />
                </button>
                <button
                  onClick={onTogglePlay}
                  className={`w-20 h-20 text-white rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${t.btn}`}
                >
                  {isPlaying ? (
                    <Pause size={36} fill="currentColor" />
                  ) : (
                    <Play size={36} fill="currentColor" className="ml-1" />
                  )}
                </button>
                <button
                  onClick={onRestart}
                  className={`p-3 transition-all ${t.muted} hover:${t.text}`}
                >
                  <RotateCcw size={28} className="scale-x-[-1]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
