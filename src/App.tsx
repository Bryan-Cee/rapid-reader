import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileUp, Loader2, Settings, Trash2 } from "lucide-react";
import { useLibrary, type TextItem } from "./hooks/useLibrary";
import {
  SettingsOverlay,
  type ThemeConfig,
} from "./components/SettingsOverlay";
import { ReaderView } from "./components/ReaderView";
import { LibraryView } from "./components/LibraryView";
import { extractPdfText } from "./lib/pdf";

const THEMES: Record<string, ThemeConfig> = {
  light: {
    name: "Light",
    bg: "bg-slate-50",
    card: "bg-white",
    text: "text-slate-900",
    muted: "text-slate-500",
    border: "border-slate-200",
    accent: "text-indigo-600",
    btn: "bg-indigo-600 hover:bg-indigo-700",
    readerBg: "bg-white",
  },
  dark: {
    name: "Midnight",
    bg: "bg-slate-950",
    card: "bg-slate-900",
    text: "text-slate-50",
    muted: "text-slate-400",
    border: "border-slate-700",
    accent: "text-indigo-300",
    btn: "bg-indigo-500 hover:bg-indigo-600",
    readerBg: "bg-slate-950",
  },
  sepia: {
    name: "Sepia",
    bg: "bg-[#f4ecd8]",
    card: "bg-[#fcf5e5]",
    text: "text-[#5b4636]",
    muted: "text-[#8c7a6b]",
    border: "border-[#e4d5b7]",
    accent: "text-[#a35d32]",
    btn: "bg-[#a35d32] hover:bg-[#8c4b26]",
    readerBg: "bg-[#fcf5e5]",
  },
};

type View = "library" | "reader";
type ReaderMode = "rsvp" | "pdf";

const SETTINGS_STORAGE_KEY = "rapid_reader_settings_v1";

const getWords = (content: string): string[] =>
  content.split(/\s+/).filter((w) => w.length > 0);

function getInitialSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {
        theme: "light" as const,
        wpm: 225,
        showContext: true,
        showFocusLine: true,
      };
    }

    const parsed = JSON.parse(raw) as {
      theme?: string;
      wpm?: number;
      showContext?: boolean;
      showFocusLine?: boolean;
    };

    const theme =
      parsed.theme && Object.prototype.hasOwnProperty.call(THEMES, parsed.theme)
        ? (parsed.theme as "light" | "dark" | "sepia")
        : ("light" as const);

    const wpm =
      typeof parsed.wpm === "number" && parsed.wpm >= 50 && parsed.wpm <= 1000
        ? parsed.wpm
        : 225;

    const showContext =
      typeof parsed.showContext === "boolean" ? parsed.showContext : true;

    const showFocusLine =
      typeof parsed.showFocusLine === "boolean" ? parsed.showFocusLine : true;

    return { theme, wpm, showContext, showFocusLine };
  } catch {
    return {
      theme: "light" as const,
      wpm: 225,
      showContext: true,
      showFocusLine: true,
    };
  }
}

export default function App() {
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const initial = getInitialSettings();
  const [wpm, setWpm] = useState(initial.wpm);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">(initial.theme);
  const [showContext, setShowContext] = useState(initial.showContext);
  const [showFocusLine, setShowFocusLine] = useState(initial.showFocusLine);
  const [view, setView] = useState<View>("library");
  const [readerMode, setReaderMode] = useState<ReaderMode>("rsvp");
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfBlobs, setPdfBlobs] = useState<Record<string, string>>({});
  const [newTextTitle, setNewTextTitle] = useState("");
  const [newTextContent, setNewTextContent] = useState("");
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    texts,
    activeText,
    saveToLibrary,
    deleteFromLibrary,
    updateProgress,
    updateProgress: updateProgressFromHook,
    updateText,
  } = useLibrary(currentTextId);

  const t = THEMES[theme];

  const words = useMemo(
    () => (activeText ? getWords(activeText.content) : []),
    [activeText],
  );

  // Persist settings whenever they change
  useEffect(() => {
    try {
      const payload = {
        theme,
        wpm,
        showContext,
        showFocusLine,
      };
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(payload),
      );
    } catch (error) {
      console.error("Failed to save RapidReader settings", error);
    }
  }, [theme, wpm, showContext, showFocusLine]);

  useEffect(() => {
    if (isPlaying && currentIndex < words.length) {
      const delay = (60 / wpm) * 1000;
      const id = window.setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (currentTextId) {
            void updateProgressFromHook(currentTextId, next);
          }
          return next;
        });
      }, delay);
      timerRef.current = id;
    } else if (currentIndex >= words.length) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    isPlaying,
    currentIndex,
    wpm,
    words,
    currentTextId,
    updateProgressFromHook,
  ]);

  const getContextSnippet = () => {
    if (!words.length) return "";
    const start = Math.max(0, currentIndex - 3);
    const end = Math.min(words.length, currentIndex + 5);
    return words.slice(start, end).join(" ");
  };

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;
    setIsProcessingPdf(true);
    try {
      const { text, url } = await extractPdfText(file);
      const textId = await saveToLibrary(
        file.name.replace(/\.pdf$/i, ""),
        text,
        true,
      );
      if (textId) {
        setPdfBlobs((prev) => ({ ...prev, [textId]: url }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openReader = (textId: string, lastIndex: number) => {
    setCurrentTextId(textId);
    setCurrentIndex(lastIndex || 0);
    setReaderMode("rsvp");
    setView("reader");
  };

  const handleDirectInputSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (editingTextId) {
      await updateText(editingTextId, newTextTitle, newTextContent);
      setEditingTextId(null);
      setNewTextTitle("");
      setNewTextContent("");
      return;
    }

    const id = await saveToLibrary(newTextTitle, newTextContent, false);
    if (id) {
      setNewTextTitle("");
      setNewTextContent("");
    }
  };

  const handleStartEditing = (text: TextItem) => {
    if (text.isPdf) return;
    setEditingTextId(text.id);
    setNewTextTitle(text.title);
    setNewTextContent(text.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entry? This cannot be undone.",
    );
    if (!confirmed) return;

    if (editingTextId === id) {
      setEditingTextId(null);
      setNewTextTitle("");
      setNewTextContent("");
    }

    await deleteFromLibrary(id);
  };

  if (view === "reader" && activeText) {
    const contextSnippet = getContextSnippet();

    return (
      <>
        {showSettings && (
          <SettingsOverlay
            t={t}
            theme={theme}
            showContext={showContext}
            showFocusLine={showFocusLine}
            wpm={wpm}
            onClose={() => setShowSettings(false)}
            onToggleContext={() => setShowContext((prev) => !prev)}
            onToggleFocusLine={() => setShowFocusLine((prev) => !prev)}
            onThemeChange={(key) => setTheme(key as typeof theme)}
            onWpmChange={setWpm}
            themes={THEMES}
          />
        )}
        <ReaderView
          t={t}
          activeText={activeText}
          words={words}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          readerMode={readerMode}
          showContext={showContext}
          showFocusLine={showFocusLine}
          contextSnippet={contextSnippet}
          pdfBlobs={pdfBlobs}
          onBackToLibrary={() => {
            setIsPlaying(false);
            setView("library");
          }}
          onTogglePlay={() => setIsPlaying((prev) => !prev)}
          onSkipBack={() => setCurrentIndex((prev) => Math.max(0, prev - 25))}
          onRestart={() => {
            setCurrentIndex(0);
            setIsPlaying(false);
            if (currentTextId) {
              void updateProgress(currentTextId, 0);
            }
          }}
          onToggleSettings={() => setShowSettings(true)}
          onToggleReaderMode={() => {
            setIsPlaying(false);
            setReaderMode((prev) => (prev === "rsvp" ? "pdf" : "rsvp"));
          }}
        />
      </>
    );
  }

  return (
    <>
      {showSettings && (
        <SettingsOverlay
          t={t}
          theme={theme}
          showContext={showContext}
          showFocusLine={showFocusLine}
          wpm={wpm}
          onClose={() => setShowSettings(false)}
          onToggleContext={() => setShowContext((prev) => !prev)}
          onToggleFocusLine={() => setShowFocusLine((prev) => !prev)}
          onThemeChange={(key) => setTheme(key as typeof theme)}
          onWpmChange={setWpm}
          themes={THEMES}
        />
      )}
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
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-500">
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
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
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
                onClick={() => setShowSettings(true)}
                className={`${t.card} border-2 ${t.border} ${t.muted} rounded-2xl p-4 flex items-center gap-2`}
              >
                <Settings size={22} className={t.muted} />
              </button>
            </div>
          </header>

          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-8">
              <div
                className={`${t.card} rounded-[2rem] p-8 border ${t.border} shadow-sm space-y-6`}
              >
                <h3 className={`font-black text-xl ${t.text}`}>
                  {editingTextId ? "Edit Entry" : "Direct Input"}
                </h3>
                {editingTextId && (
                  <p className={`text-xs font-medium ${t.muted}`}>
                    You are editing an existing entry. Save changes or cancel to
                    go back to creating new entries.
                  </p>
                )}
                <form onSubmit={handleDirectInputSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Entry Title..."
                    value={newTextTitle}
                    onChange={(e) => setNewTextTitle(e.target.value)}
                    className={`w-full px-6 py-4 ${t.bg} ${t.border} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${t.text}`}
                    required
                  />
                  <textarea
                    placeholder="Paste content here..."
                    value={newTextContent}
                    onChange={(e) => setNewTextContent(e.target.value)}
                    rows={5}
                    className={`w-full px-6 py-4 ${t.bg} ${t.border} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${t.text}`}
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className={`w-full py-5 text-white font-black rounded-lg transition-all shadow-lg ${t.btn}`}
                  >
                    {editingTextId ? "Save Changes" : "Save to Library"}
                  </button>
                  {editingTextId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTextId(null);
                        setNewTextTitle("");
                        setNewTextContent("");
                      }}
                      className={`w-full py-3 font-bold rounded-lg transition-colors ${t.card} border ${t.border} ${t.muted}`}
                    >
                      Cancel Editing
                    </button>
                  )}
                </form>
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
                  className={`${t.card} border-2 border-dashed ${t.border} rounded-[2rem] p-24 text-center ${t.muted}`}
                >
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
                      <Loader2 className="animate-spin" /> Processing
                      document...
                    </div>
                  )}
                  {texts.map((text) => {
                    const wordsArr = getWords(text.content);
                    const progress =
                      wordsArr.length > 0
                        ? Math.round((text.lastIndex / wordsArr.length) * 100)
                        : 0;
                    return (
                      <div
                        key={text.id}
                        onClick={() => openReader(text.id, text.lastIndex)}
                        className={`${t.card} border ${t.border} rounded-[2rem] p-8 hover:border-indigo-400 transition-all cursor-pointer relative flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1`}
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
                          <div className="flex items-center gap-1">
                            {!text.isPdf && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditing(text);
                                }}
                                className={`px-2 py-1 text-xs rounded-full transition-colors ${t.card} border ${t.border} ${t.muted} hover:${t.text}`}
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDelete(text.id);
                              }}
                              className={`p-2 transition-colors ${t.muted} hover:text-red-500`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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
                            {progress}%
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
    </>
  );
}
