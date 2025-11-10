import { Languages, Bookmark } from "lucide-react";
import { useState } from "react";

interface VocabCardProps {
  word: string;
  meaning: string;
  category: string;
}

export const VocabCard = ({ word, meaning, category }: VocabCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="relative bg-white rounded-3xl shadow-xl border-4 border-orange-400 p-8 max-w-2xl w-full">
      {/* Category Badge */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-medium">
          {category}
        </span>
        <button className="text-orange-500 hover:text-orange-600 transition-colors">
          <Bookmark size={20} fill="currentColor" />
        </button>
      </div>

      {/* Language Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
          <Languages size={28} className="text-orange-500" />
        </div>
      </div>

      {/* Word */}
      <div className="text-center mb-4">
        <h2 className="text-5xl font-bold text-orange-500 mb-3 tracking-tight">
          {word}
        </h2>
        <div className="h-1 w-32 bg-orange-400 mx-auto rounded-full" />
      </div>

      {/* Meaning Reveal */}
      <div className="text-center">
        {!isRevealed ? (
          <button
            onClick={() => setIsRevealed(true)}
            className="text-gray-500 text-sm flex items-center gap-2 mx-auto hover:text-gray-700 transition-colors"
          >
            <span className="text-lg">👆</span>
            Click to reveal meaning
          </button>
        ) : (
          <p className="text-gray-700 text-lg font-medium animate-fade-in">
            {meaning}
          </p>
        )}
      </div>
    </div>
  );
};
