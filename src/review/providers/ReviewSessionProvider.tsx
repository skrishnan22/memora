import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getDueReviewWords, type WordEntry } from "../../index-db";

interface ReviewSessionContextValue {
  queue: WordEntry[];
  currentIndex: number;
  activeWord: WordEntry | null;
  isMeaningRevealed: boolean;
  isLoading: boolean;
  error: string | null;
  hasNext: boolean;
  hasWords: boolean;
  revealMeaning: () => void;
  goToNext: () => void;
}

const ReviewSessionContext = createContext<
  ReviewSessionContextValue | undefined
>(undefined);

export const ReviewSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [queue, setQueue] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMeaningRevealed, setIsMeaningRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const dueWords = await getDueReviewWords();
        setQueue(dueWords);
        setCurrentIndex(0);
        setIsMeaningRevealed(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load review session"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadQueue();
  }, []);

  const revealMeaning = useCallback(() => {
    setIsMeaningRevealed(true);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = Math.min(prev + 1, queue.length);
      if (nextIndex !== prev) {
        setIsMeaningRevealed(false);
        return nextIndex;
      }
      return prev;
    });
  }, [queue.length]);

  const activeWord = queue[currentIndex] ?? null;
  const hasWords = queue.length > 0;
  const hasNext = currentIndex + 1 < queue.length;

  const value = useMemo<ReviewSessionContextValue>(
    () => ({
      queue,
      currentIndex,
      activeWord,
      isMeaningRevealed,
      isLoading,
      error,
      hasNext,
      hasWords,
      revealMeaning,
      goToNext,
    }),
    [
      queue,
      currentIndex,
      activeWord,
      isMeaningRevealed,
      isLoading,
      error,
      hasNext,
      hasWords,
      revealMeaning,
      goToNext,
    ]
  );

  return (
    <ReviewSessionContext.Provider value={value}>
      {children}
    </ReviewSessionContext.Provider>
  );
};

export const useReviewSessionContext = () => {
  const context = useContext(ReviewSessionContext);
  if (!context) {
    throw new Error(
      "useReviewSession must be used within ReviewSessionProvider"
    );
  }
  return context;
};
