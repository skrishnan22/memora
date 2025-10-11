import { saveWord, deleteWord, type WordMeaning } from "./index-db";

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
    id: "lookupInLexmora",
    title: "Lookup in Lexmora",
    contexts: ["selection"],
  });
  console.log("Context menu created");
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Context menu clicked:", info.menuItemId, info.selectionText);

  if (info.menuItemId === "lookupInLexmora" && info.selectionText) {
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

chrome.runtime.onMessage.addListener(
  (
    message: {
      type: string;
      action: "save" | "delete";
      word: string;
      sourceUrl: string;
    },
    _sender,
    _sendResponse
  ) => {
    if (!message) return;
    if (message.type === "MEMORA_ACTION") {
      const { action, word, sourceUrl } = message;

      if (!word) return;

      (async () => {
        try {
          if (action === "delete") {
            await deleteWord(word);
          } else if (action === "save") {
            const meanings = await fetchWordMeanings(word);
            await saveWord(word, sourceUrl, meanings);
          }
        } catch (err) {
          console.error("MEMORA_ACTION failed:", action, word, err);
        }
      })();
    }
  }
);

export {};
