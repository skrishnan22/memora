import { saveWord, type WordMeaning } from "./index-db";

const SUCCESS_NOTIFICATION_ID = "memora-save-success";
const ERROR_NOTIFICATION_ID = "memora-save-error";
const DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

interface DictionaryApiDefinition {
  definition: string;
  example?: string;
}

interface DictionaryApiMeaning {
  partOfSpeech: string;
  definitions: DictionaryApiDefinition[];
}

interface DictionaryApiEntry {
  meanings?: DictionaryApiMeaning[];
}

async function fetchWordMeanings(word: string): Promise<WordMeaning[]> {
  const normalized = word.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  try {
    const response = await fetch(
      `${DICTIONARY_API_URL}/${encodeURIComponent(normalized)}`
    );

    if (!response.ok) {
      throw new Error(
        `Dictionary API responded with status ${response.status}`
      );
    }

    const payload = (await response.json()) as DictionaryApiEntry[];

    if (!Array.isArray(payload)) {
      return [];
    }

    const collected: WordMeaning[] = [];

    for (const entry of payload) {
      if (!entry.meanings?.length) {
        continue;
      }

      for (const meaning of entry.meanings) {
        const { partOfSpeech, definitions } = meaning;

        if (!definitions?.length) {
          continue;
        }

        const definitionObj = meaning.definitions[0];
        const definitionText = definitionObj.definition.trim();

        const exampleText = definitionObj.example?.trim();

        collected.push({
          partOfSpeech,
          definition: definitionText,
          ...(exampleText ? { example: exampleText } : {}),
        });
      }
    }

    return collected;
  } catch (error) {
    console.error("Failed to fetch dictionary meanings", word, error);
    return [];
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Extension installed, initializing...");

  chrome.contextMenus.create({
    id: "lookupInMemora",
    title: "Lookup in Memora",
    contexts: ["selection"],
  });
  console.log("Context menu created");
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Context menu clicked:", info.menuItemId, info.selectionText);

  if (info.menuItemId === "lookupInMemora" && info.selectionText) {
    try {
      const activeTabId = tab?.id;
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, {
          type: "MEMORA_MODAL",
          action: "loading",
          word: info.selectionText,
        });
      }

      const sourceUrl = info.pageUrl ?? tab?.url ?? "";
      const meanings = await fetchWordMeanings(info.selectionText);
      await saveWord(info.selectionText, sourceUrl, meanings);
      console.log("Word saved successfully");
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, {
          type: "MEMORA_MODAL",
          action: "success",
          word: info.selectionText,
          meanings,
        });
      }
    } catch (error) {
      console.error("Error saving word:", error);

      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "MEMORA_MODAL",
          action: "error",
          word: info.selectionText,
          error: "Failed to fetch or save meaning.",
        });
      }
    }
  }
});

export {};
