const SEGMENT_COUNT = 8;

interface SessionProgressProps {
  totalWords: number;
  completedWords: number;
  isLoading: boolean;
}

export const SessionProgress = ({
  totalWords,
  completedWords,
  isLoading,
}: SessionProgressProps) => {
  const safeTotal = Math.max(totalWords, 0);
  const safeCompleted = Math.min(Math.max(completedWords, 0), safeTotal);
  const progressFraction =
    safeTotal === 0 ? 0 : Math.min(1, safeCompleted / safeTotal);
  const progressUnits = progressFraction * SEGMENT_COUNT;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
        <span className="text-slate-400">Session Progress</span>
        <span className="text-slate-600">
          {isLoading ? "-- / -- done" : `${safeCompleted} / ${safeTotal} done`}
        </span>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: SEGMENT_COUNT }).map((_, index) => {
          const segmentProgress = isLoading
            ? 0
            : Math.min(Math.max(progressUnits - index, 0), 1);
          const trackClass = [
            "h-3 rounded-full overflow-hidden transition-colors duration-300 ease-out",
            isLoading ? "bg-slate-200 animate-pulse" : "bg-slate-200/80",
          ].join(" ");
          const fillClass =
            "h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300 ease-out";

          return (
            <div key={index} className={trackClass}>
              <div
                className={fillClass}
                style={{
                  width: `${segmentProgress * 100}%`,
                  opacity: segmentProgress > 0 ? 1 : 0,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
