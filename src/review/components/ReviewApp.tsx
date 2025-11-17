import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { BookOpen, CheckCircle2, Eye, Flame } from "lucide-react";
import { motion } from "framer-motion";
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
import { useCherryBlossomConfetti } from "../hooks/useCherryBlossomConfetti";

const celebrationMessages = [
  "Word wizardry unlocked.\nYou just leveled up your lexicon.",
  "Brain: buffed.\nThose words never saw you coming.",
  "Linguistic muscles flexed.\nSee you at the next set.",
  "Nice work.\nAnother handful of words now feel at home with you.",
  "Well done.\nYour vocabulary just grew. Small step, real progress.",
  "That was a good session.\nThose words are going to sit a little softer in your mind now.",
];

const responseQualityMap: Record<ReviewResponse, number> = {
  slipped: 1,
  patchy: 2,
  onPoint: 4,
  sharp: 5,
};

const responseShortcuts: Record<ReviewResponse, string> = {
  slipped: "1",
  patchy: "2",
  onPoint: "3",
  sharp: "4",
} as const;
const revealShortcut = "space";

const shortcutToResponse = (
  Object.keys(responseShortcuts) as ReviewResponse[]
).reduce((acc, response) => {
  acc[responseShortcuts[response].toLowerCase()] = response;
  return acc;
}, {} as Record<string, ReviewResponse>);

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
  const [hasCelebratedCompletion, setHasCelebratedCompletion] = useState(false);
  const [isMascotCelebrating, setIsMascotCelebrating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * celebrationMessages.length)
  );
  const { fire: triggerConfetti } = useCherryBlossomConfetti();
  const disableActions = isSessionLoading || !activeWord || isSavingResponse;
  const totalWords = queue.length;
  const completedWords = Math.min(currentIndex, totalWords);
  const shouldShowProgress = totalWords > 0 || isSessionLoading;
  const isSessionComplete =
    !isSessionLoading && totalWords > 0 && completedWords >= totalWords;

  useEffect(() => {
    if (isSessionComplete && !hasCelebratedCompletion) {
      triggerConfetti();
      setIsMascotCelebrating(true);
      setMessageIndex(Math.floor(Math.random() * celebrationMessages.length));
      setHasCelebratedCompletion(true);
    }
  }, [
    isSessionComplete,
    hasCelebratedCompletion,
    triggerConfetti,
    celebrationMessages.length,
  ]);

  useEffect(() => {
    if (!isMascotCelebrating) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setIsMascotCelebrating(false);
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, [isMascotCelebrating]);

  const handleResponseSelect = useCallback(
    async (response: ReviewResponse) => {
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
    },
    [activeWord, goToNext]
  );

  useHotkeys(
    [...Object.values(responseShortcuts), revealShortcut].join(","),
    (event) => {
      if (disableActions || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT" ||
          tagName === "BUTTON" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const pressedKey = event.key.toLowerCase();

      if (
        !isMeaningRevealed &&
        (event.code === "Space" || pressedKey === " " || pressedKey === "space")
      ) {
        revealMeaning();
        return;
      }

      const response = shortcutToResponse[pressedKey];
      if (!response) {
        return;
      }
      handleResponseSelect(response);
    },
    { enabled: !disableActions, preventDefault: true },
    [disableActions, handleResponseSelect, isMeaningRevealed, revealMeaning]
  );

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
              <span
                className="text-3xl sm:text-4xl font-semibold tracking-tight"
                style={{ color: "#16615b" }}
              >
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
                  activeWord.meanings?.[0]?.definition ??
                  "No meaning saved yet."
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

          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            <motion.img
              src={imageRight}
              alt="Lexmora mascot"
              className="absolute w-56 h-auto object-contain opacity-95 drop-shadow-2xl"
              style={{ zIndex: isMascotCelebrating ? 50 : 5 }}
              initial={false}
              animate={
                isMascotCelebrating
                  ? {
                      left: "50%",
                      right: "auto",
                      top: "45%",
                      x: "-50%",
                      y: "-50%",
                      scale: 3.6,
                      rotate: -6,
                    }
                  : {
                      left: "auto",
                      right: "0",
                      top: "0.5rem",
                      x: "6rem",
                      y: "0%",
                      scale: 1,
                      rotate: 0,
                    }
              }
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 18,
                mass: 0.9,
              }}
            />
            <motion.div
              className="absolute rounded-[36px] bg-white px-8 py-5 shadow-xl text-lg font-semibold text-slate-900 whitespace-pre-line max-w-md leading-snug"
              style={{
                zIndex: isMascotCelebrating ? 50 : -10,
                filter: "drop-shadow(0 10px 30px rgba(15,23,42,0.15))",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                isMascotCelebrating
                  ? {
                      opacity: 1,
                      scale: 1,
                      left: "60%",
                      top: "28%",
                    }
                  : { opacity: 0, scale: 0.8, left: "70%", top: "18%" }
              }
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                mass: 0.6,
              }}
            >
              {celebrationMessages[messageIndex]}
              <span className="absolute -bottom-4 left-12 inline-block h-5 w-5 rotate-45 bg-white shadow-lg" />
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3 px-4">
          <ActionButtons
            onSelectResponse={handleResponseSelect}
            disabled={disableActions}
            shortcutHints={responseShortcuts}
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
