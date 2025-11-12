import { Bookmark, Sparkles } from "lucide-react";
import { useState } from "react";

interface VocabCardProps {
  word: string;
  meaning: string;
  category: string;
}

export const VocabCard = ({ word, meaning, category }: VocabCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="relative w-full rounded-[32px] border border-[#a6c8ff] bg-gradient-to-br from-[#f5fbff] via-white to-[#eef6ff] backdrop-blur-xl px-8 sm:px-12 py-12 sm:py-16 transition-transform duration-500 hover:-translate-y-0.5">

      {/* Category + bookmark */}
      <div className="relative z-10 flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-100/70 flex items-center justify-center text-sky-600">
            <Sparkles size={28} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Word Focus
            </p>
            <p className="text-lg font-semibold text-slate-900">{category}</p>
          </div>
        </div>
        <button className="p-3 rounded-2xl bg-white/80 border border-blue-100 text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
          <Bookmark size={18} />
        </button>
      </div>

      {/* Word */}
      <div className="relative z-10 text-center mb-8">
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-semibold text-slate-900 tracking-tight mb-6">
          {word}
        </h2>
        <div className="w-32 md:w-40 h-1.5 mx-auto rounded-full bg-gradient-to-r from-sky-400 to-blue-600" />
      </div>

      {/* Meaning Reveal */}
      <div className="relative z-10 text-center">
        {!isRevealed ? (
          <button
            onClick={() => setIsRevealed(true)}
            className="inline-flex items-center gap-3 text-slate-500 text-base font-medium hover:text-slate-700 transition-colors"
          >
            <span className="text-xl">👆</span>
            Click to reveal meaning
          </button>
        ) : (
          <p className="text-2xl font-semibold text-slate-700 leading-snug">
            {meaning}
          </p>
        )}
      </div>
    </div>
  );
};
