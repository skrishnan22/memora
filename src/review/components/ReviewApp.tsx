import { useState } from "react";
import { BookOpen, CheckCircle2, Eye, Flame } from "lucide-react";
import { StatCard } from "./StatCard";
import { VocabCard } from "./VocabCard";
import { ActionButtons, type ReviewResponse } from "./ActionButtons";
import imageLeft from "../../assets/image.png";
import imageRight from "../../assets/vector-image-1.png";
import lexmoraIcon from "../../assets/lexmora-icon.svg";
import { useReviewMetrics } from "../hooks/useReviewMetrics";
import { useReviewSession } from "../hooks/useReviewSession";
import { SessionProgress } from "./SessionProgress";
import { applyReviewResponse } from "../../index-db";

const responseQualityMap: Record<ReviewResponse, number> = {
  slipped: 1,
  patchy: 2,
  onPoint: 4,
  sharp: 5,
};

export const ReviewApp = () => {
  const { metrics, isLoading, error } = useReviewMetrics();
  const {
    queue,
    currentIndex,
    activeWord,
    isMeaningRevealed,
    isLoading: isSessionLoading,
    error: sessionError,
    revealMeaning,
    goToNext,
  } = useReviewSession();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSavingResponse, setIsSavingResponse] = useState(false);
  const disableActions =
    isSessionLoading || !activeWord || isSavingResponse;
  const totalWords = queue.length;
  const completedWords = Math.min(currentIndex, totalWords);
  const shouldShowProgress = totalWords > 0 || isSessionLoading;

  const handleResponseSelect = async (response: ReviewResponse) => {
    if (!activeWord) {
      return;
    }

    setActionError(null);
    setIsSavingResponse(true);

    try {
      const quality = responseQualityMap[response];
      await applyReviewResponse(activeWord.word, quality);
      goToNext();
    } catch (err) {
      console.error(err);
      setActionError(
        err instanceof Error ? err.message : "Unable to save response"
      );
    } finally {
      setIsSavingResponse(false);
    }
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
              value={metrics?.totalWords ?? 0}
              label="Total Words"
              accentClass="text-amber-500"
              iconWrapperClass="bg-amber-50 text-amber-500"
              isLoading={isLoading}
            />
            <StatCard
              icon={<Eye size={20} className="text-sky-500" />}
              value={metrics?.inReviewWords ?? 0}
              label="In Review"
              accentClass="text-sky-500"
              iconWrapperClass="bg-sky-50 text-sky-500"
              isLoading={isLoading}
            />
            <StatCard
              icon={<CheckCircle2 size={20} className="text-emerald-500" />}
              value={metrics?.masteredWords ?? 0}
              label="Mastered"
              accentClass="text-emerald-500"
              iconWrapperClass="bg-emerald-50 text-emerald-500"
              isLoading={isLoading}
            />
            <StatCard
              icon={<Flame size={20} className="text-rose-500" />}
              value={7}
              label="Day Streak"
              accentClass="text-rose-500"
              iconWrapperClass="bg-rose-50 text-rose-500"
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

          <div className="w-full max-w-4xl z-10 flex flex-col gap-6">
            {sessionError ? (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {sessionError}
              </div>
            ) : null}
            {shouldShowProgress ? (
              <SessionProgress
                totalWords={totalWords}
                completedWords={completedWords}
                isLoading={isSessionLoading}
              />
            ) : null}
            {isSessionLoading ? (
              <CardSkeleton />
            ) : activeWord ? (
              <VocabCard
                word={activeWord.word}
                meaning={
                  activeWord.meanings?.[0]?.definition ?? "No meaning saved yet."
                }
                category={
                  activeWord.meanings?.[0]?.partOfSpeech ?? "Vocabulary"
                }
                isRevealed={isMeaningRevealed}
                onReveal={revealMeaning}
              />
            ) : (
              <EmptyStateCard />
            )}
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
        <div className="flex flex-col items-center gap-3 px-4">
          <ActionButtons
            onSelectResponse={handleResponseSelect}
            disabled={disableActions}
          />
          {actionError ? (
            <div className="text-sm text-red-600">{actionError}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const CardSkeleton = () => (
  <div className="rounded-[32px] border border-slate-200 bg-white/70 px-8 py-20 animate-pulse">
    <div className="h-6 w-32 bg-slate-200 rounded-full mb-6" />
    <div className="h-10 w-3/4 bg-slate-200 rounded-full mb-4" />
    <div className="h-10 w-2/3 bg-slate-200 rounded-full mb-8" />
    <div className="h-5 w-1/2 bg-slate-200 rounded-full mx-auto" />
  </div>
);

const EmptyStateCard = () => (
  <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/80 px-10 py-16 text-center">
    <p className="text-2xl font-semibold text-slate-800 mb-3">No words due</p>
    <p className="text-slate-500">
      Add more vocabulary from the extension or come back later for your next
      review session.
    </p>
  </div>
);
