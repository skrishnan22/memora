import { BookOpen, CheckCircle2, Eye, Flame } from "lucide-react";
import { StatCard } from "./StatCard";
import { VocabCard } from "./VocabCard";
import { ActionButtons } from "./ActionButtons";
import imageLeft from "../../assets/image.png";
import imageRight from "../../assets/vector-image-1.png";
import lexmoraIcon from "../../assets/lexmora-icon.svg";
import { useReviewMetrics } from "../hooks/useReviewMetrics";

export const ReviewApp = () => {
  const { metrics, isLoading, error } = useReviewMetrics();
  const totalWords = metrics?.totalWords ?? 0;
  const reviewedToday = metrics?.reviewedToday ?? 0;
  const masteredWords = metrics?.masteredWords ?? 0;
  const streakDays = metrics?.streakDays ?? 0;

  const handleReviewAgain = () => {
    console.log("Review again clicked");
  };

  const handleGotIt = () => {
    console.log("Got it clicked");
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center px-4 py-10 overflow-y-auto">
      <div className="relative z-10 w-full max-w-7xl flex-1 flex flex-col gap-10 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img
                src={lexmoraIcon}
                alt="Lexmora logo"
                className="w-10 h-10 drop-shadow-sm"
              />
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: "#16615b" }}>
                Lexmora
              </span>
            </div>
          </div>
        </div>

        {/* Stats + Progress */}
        <div className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<BookOpen size={20} className="text-amber-500" />}
              value={totalWords}
              label="Total Words"
              accentClass="text-amber-500"
              iconWrapperClass="bg-amber-50 text-amber-500"
              isLoading={isLoading}
            />
            <StatCard
              icon={<Eye size={20} className="text-sky-500" />}
              value={reviewedToday}
              label="Reviewed Today"
              accentClass="text-sky-500"
              iconWrapperClass="bg-sky-50 text-sky-500"
              isLoading={isLoading}
            />
            <StatCard
              icon={<CheckCircle2 size={20} className="text-emerald-500" />}
              value={masteredWords}
              label="Mastered"
              accentClass="text-emerald-500"
              iconWrapperClass="bg-emerald-50 text-emerald-500"
              isLoading={isLoading}
            />
            <StatCard
              icon={<Flame size={20} className="text-rose-500" />}
              value={streakDays}
              label="Day Streak"
              accentClass="text-rose-500"
              iconWrapperClass="bg-rose-50 text-rose-500"
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Vocab Card with Side Images */}
        <div className="max-w-6xl mx-auto flex justify-center items-center w-full flex-1 relative">
          <div className="hidden lg:block absolute left-0 top-12 -translate-x-24 pointer-events-none">
            <img
              src={imageLeft}
              alt="Decorative illustration"
              className="w-48 h-auto object-contain opacity-80"
            />
          </div>

          <div className="w-full max-w-4xl z-10">
            <VocabCard
              word="Ephemeral"
              meaning="Lasting for a very short time; transitory"
              category="Adjective"
            />
          </div>

          <div className="hidden lg:block absolute right-0 top-2 translate-x-24 pointer-events-none">
            <img
              src={imageRight}
              alt="Decorative illustration"
              className="w-48 h-auto object-contain opacity-80"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <ActionButtons
            onReviewAgain={handleReviewAgain}
            onGotIt={handleGotIt}
          />
        </div>
      </div>
    </div>
  );
};
