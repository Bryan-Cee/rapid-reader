import React from "react";
import { Gauge, Palette, Type, X } from "lucide-react";

export interface ThemeConfig {
  name: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  btn: string;
  readerBg: string;
}

interface SettingsOverlayProps {
  t: ThemeConfig;
  theme: string;
  showContext: boolean;
  showFocusLine: boolean;
  wpm: number;
  onClose: () => void;
  onToggleContext: () => void;
  onToggleFocusLine: () => void;
  onThemeChange: (themeKey: string) => void;
  onWpmChange: (value: number) => void;
  themes: Record<string, ThemeConfig>;
}

export function SettingsOverlay({
  t,
  theme,
  showContext,
  showFocusLine,
  wpm,
  onClose,
  onToggleContext,
  onToggleFocusLine,
  onThemeChange,
  onWpmChange,
  themes,
}: SettingsOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div
        className={`${t.card} w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border ${t.border} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-2xl font-black ${t.text}`}>App Settings</h2>
          <button
            onClick={onClose}
            className={`p-2 ${t.muted} hover:${t.text} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <div className={`flex items-center gap-2 mb-4 font-bold ${t.text}`}>
              <Gauge size={18} className={t.accent} />
              Reading Speed
            </div>
            <div className="space-y-3">
              <input
                type="range"
                min={50}
                max={1000}
                step={25}
                value={wpm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onWpmChange(Number(e.target.value))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${t.muted}`}>Slow</span>
                <span
                  className={`px-4 py-1.5 rounded-full font-black text-white ${t.btn}`}
                >
                  {wpm} WPM
                </span>
                <span className={`text-sm font-medium ${t.muted}`}>Fast</span>
              </div>
            </div>
          </section>

          <section>
            <div className={`flex items-center gap-2 mb-4 font-bold ${t.text}`}>
              <Type size={18} className={t.accent} />
              Reading Assistant
            </div>
            <div className="space-y-3">
              <button
                onClick={onToggleContext}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${t.bg} border ${t.border} ${showContext ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""}`}
              >
                <div className="text-left">
                  <p className={`text-sm font-bold ${t.text}`}>
                    Context Preview
                  </p>
                  <p className={`text-[10px] ${t.muted}`}>
                    Show a faint line of text above the word
                  </p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-all relative ${showContext ? "bg-indigo-600" : "bg-slate-300"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showContext ? "left-7" : "left-1"}`}
                  />
                </div>
              </button>

              <button
                onClick={onToggleFocusLine}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${t.bg} border ${t.border} ${showFocusLine ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""}`}
              >
                <div className="text-left">
                  <p className={`text-sm font-bold ${t.text}`}>Focus Line</p>
                  <p className={`text-[10px] ${t.muted}`}>
                    Show the vertical guide line at the word center
                  </p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-all relative ${showFocusLine ? "bg-indigo-600" : "bg-slate-300"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showFocusLine ? "left-7" : "left-1"}`}
                  />
                </div>
              </button>
            </div>
          </section>

          <section>
            <div className={`flex items-center gap-2 mb-4 font-bold ${t.text}`}>
              <Palette size={18} className={t.accent} />
              App Theme
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(themes).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => onThemeChange(key)}
                  className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === key
                      ? "border-indigo-500 bg-indigo-50/10"
                      : `${t.border} opacity-60 hover:opacity-100`
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border shadow-inner ${value.bg}`}
                  />
                  <span
                    className={`text-[10px] font-bold tracking-widest ${t.text}`}
                  >
                    {value.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={onClose}
            className={`w-full mt-10 py-4 rounded-2xl text-white font-bold transition-all shadow-lg ${t.btn}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
