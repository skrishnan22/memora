import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export const DB_NAME = "LexmoraDB";
export const DB_VERSION = 1;
export const STORE_NAME = "words";
export const INDEX_IS_MASTERED = "isMastered";
export const INDEX_NEXT_REVIEW = "nextReviewAt";

const DEFAULT_EASE_FACTOR = 2.5;
const DEFAULT_INTERVAL_DAYS = 0;
const DEFAULT_REPETITIONS = 0;
const DEFAULT_LAPSES = 0;
const MIN_EASE_FACTOR = 1.3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MASTERED_REPETITIONS = 5;
const MASTERED_MIN_INTERVAL_DAYS = 21;
const MASTERED_MIN_QUALITY = 4;

export interface WordMeaning {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

interface LexmoraDB extends DBSchema {
  words: {
    key: string;
    value: {
      word: string;
      sourceUrl: string;
      meanings?: WordMeaning[];
      easeFactor: number;
      intervalDays: number;
      repetitions: number;
      nextReviewAt: string;
      lapses: number;
      isMastered: number;
      masteredAt?: string | null;
    };
    indexes: {
      isMastered: string;
      nextReviewAt: string;
    };
  };
}

export type WordEntry = LexmoraDB["words"]["value"];

let cachedDbConnection: IDBPDatabase<LexmoraDB>;

export async function getDb() {
  if (!cachedDbConnection) {
    cachedDbConnection = await openDB(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "word" });
          store.createIndex(INDEX_IS_MASTERED, "isMastered");
          store.createIndex(INDEX_NEXT_REVIEW, "nextReviewAt");
        }

        if (oldVersion < 2) {
          const store = transaction.objectStore(STORE_NAME);
          const entries = await store.getAll();
          await Promise.all(
            entries.map(async (entry) => {
              const { meanings, meaning, ...rest } = entry as typeof entry & {
                meaning?: string;
              };

              if (meanings || !meaning) {
                return;
              }

              const normalizedEntry = {
                ...rest,
                meanings: [{ partOfSpeech: "unknown", definition: meaning }],
              };

              await store.put(normalizedEntry);
            })
          );
        }
      },
    });
  }
  return cachedDbConnection;
}

export async function saveWord(
  word: string,
  sourceUrl: string,
  meanings?: WordMeaning[]
) {
  const db = await getDb();
  const normalized = word.toLowerCase().trim();
  const firstReviewDate = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString();
  const existing = await db.get(STORE_NAME, normalized);

  if (existing) {
    return;
  }

  const payload: WordEntry = {
    word: normalized,
    sourceUrl: sourceUrl || "",
    ...(meanings?.length ? { meanings } : {}),
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: DEFAULT_INTERVAL_DAYS,
    repetitions: DEFAULT_REPETITIONS,
    nextReviewAt: firstReviewDate,
    lapses: DEFAULT_LAPSES,
    isMastered: 0,
    masteredAt: null,
  };
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.put(payload);
  await tx.done;
}

export async function deleteWord(word: string) {
  const db = await getDb();
  const normalized = word.toLowerCase().trim();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.delete(normalized);
  await tx.done;
}

export async function clearAllWords() {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.clear();
  await tx.done;
}

export interface ReviewMetrics {
  totalWords: number;
  inReviewWords: number;
  masteredWords: number;
}

export async function getReviewMetrics(): Promise<ReviewMetrics> {
  const db = await getDb();
  const [totalWords, masteredWords] = await Promise.all([
    db.count(STORE_NAME),
    db.countFromIndex(STORE_NAME, INDEX_IS_MASTERED, IDBKeyRange.only(1)),
  ]);
  const inReviewWords = Math.max(0, totalWords - masteredWords);

  return {
    totalWords,
    masteredWords,
    inReviewWords,
  };
}

export async function getDueReviewWords(limit?: number): Promise<WordEntry[]> {
  const db = await getDb();
  const nowIso = new Date().toISOString();

  const words = await db.getAllFromIndex(
    STORE_NAME,
    INDEX_NEXT_REVIEW,
    IDBKeyRange.upperBound(nowIso)
  );

  return typeof limit === "number" ? words.slice(0, limit) : words;
}

const clampQuality = (quality: number) =>
  Math.min(Math.max(Math.round(quality), 0), 5);

const calculateEaseFactor = (currentEase: number, quality: number) => {
  const penalty = 5 - quality;
  const delta = 0.1 - penalty * (0.08 + penalty * 0.02);
  return Math.max(MIN_EASE_FACTOR, currentEase + delta);
};

const shouldMarkMastered = (
  repetitions: number,
  intervalDays: number,
  quality: number
) =>
  repetitions >= MASTERED_REPETITIONS &&
  intervalDays >= MASTERED_MIN_INTERVAL_DAYS &&
  quality >= MASTERED_MIN_QUALITY;

export async function applyReviewResponse(word: string, quality: number) {
  const db = await getDb();
  const normalized = word.toLowerCase().trim();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const entry = await tx.store.get(normalized);

  if (!entry) {
    await tx.done;
    throw new Error(`Unable to find word "${word}" for review update`);
  }

  const normalizedQuality = clampQuality(quality);
  const now = new Date();
  const previousIntervalDays = entry.intervalDays ?? DEFAULT_INTERVAL_DAYS;
  const updatedEaseFactor = calculateEaseFactor(
    entry.easeFactor ?? DEFAULT_EASE_FACTOR,
    normalizedQuality
  );

  let repetitions = entry.repetitions ?? DEFAULT_REPETITIONS;
  let intervalDays = entry.intervalDays ?? DEFAULT_INTERVAL_DAYS;
  let lapses = entry.lapses ?? DEFAULT_LAPSES;

  if (normalizedQuality < 3) {
    repetitions = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(
        1,
        Math.round(previousIntervalDays * updatedEaseFactor)
      );
    }
  }

  const nextReviewAt = new Date(
    now.getTime() + intervalDays * DAY_IN_MS
  ).toISOString();

  let isMastered = entry.isMastered ?? 0;
  let masteredAt = entry.masteredAt ?? null;

  if (
    !isMastered &&
    shouldMarkMastered(repetitions, intervalDays, normalizedQuality)
  ) {
    isMastered = 1;
    masteredAt = now.toISOString();
  }

  const updatedEntry: WordEntry = {
    ...entry,
    easeFactor: updatedEaseFactor,
    repetitions,
    intervalDays,
    nextReviewAt,
    lapses,
    isMastered,
    masteredAt,
  };

  await tx.store.put(updatedEntry);
  await tx.done;
  return updatedEntry;
}
