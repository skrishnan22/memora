import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export const DB_NAME = "LexmoraDB";
export const DB_VERSION = 1;
export const STORE_NAME = "words";
export const INDEX_TIMESTAMP = "timestamp";

const DEFAULT_EASE_FACTOR = 2.5;
const DEFAULT_INTERVAL_DAYS = 0;
const DEFAULT_REPETITIONS = 0;
const DEFAULT_LAPSES = 0;

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
      timestamp: string;
      sourceUrl: string;
      meanings?: WordMeaning[];
      easeFactor: number;
      intervalDays: number;
      repetitions: number;
      nextReviewAt: string;
      lapses: number;
    };
    indexes: {
      timestamp: string;
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
          store.createIndex(INDEX_TIMESTAMP, "timestamp");
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
  const nowIso = new Date().toISOString();
  const firstReviewDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const existing = await db.get(STORE_NAME, normalized);

  if (existing) {
    return;
  }

  const payload: WordEntry = {
    word: normalized,
    timestamp: nowIso,
    sourceUrl: sourceUrl || "",
    ...(meanings?.length ? { meanings } : {}),
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: DEFAULT_INTERVAL_DAYS,
    repetitions: DEFAULT_REPETITIONS,
    nextReviewAt: firstReviewDate,
    lapses: DEFAULT_LAPSES,
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
