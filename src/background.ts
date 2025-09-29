import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface MemoraDB extends DBSchema {
  words: {
    key: number;
    value: {
      id?: number;
      word: string;
      context: string;
      timestamp: string;
      url: string;
    };
    indexes: {
      word: string;
      timestamp: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MemoraDB>> | null = null;

function getDb(): Promise<IDBPDatabase<MemoraDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MemoraDB>('MemoraDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('words')) {
          const store = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
          store.createIndex('word', 'word');
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
    console.log('IndexedDB opened successfully');
  }
  return dbPromise;
}

async function saveWord(word: string, pageUrl?: string): Promise<void> {
  const db = await getDb();
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tabs[0]?.url || '';
  const payload = {
    word: word.toLowerCase().trim(),
    context: pageUrl || '',
    timestamp: new Date().toISOString(),
    url: currentUrl,
  };
  const tx = db.transaction('words', 'readwrite');
  await tx.store.add(payload);
  await tx.done;
}


chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed, initializing...');
  
  chrome.contextMenus.create({
    id: 'addToMemora',
    title: 'Add to Memora',
    contexts: ['selection']
  });
  console.log('Context menu created');
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('Context menu clicked:', info.menuItemId, info.selectionText);
  
  if (info.menuItemId === 'addToMemora' && info.selectionText) {
    try {
      console.log('Attempting to save word:', info.selectionText);
      await saveWord(info.selectionText, info.pageUrl);
      console.log('Word saved successfully');
      // Send message to content script to show toast
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'showToast',
          message: `"${info.selectionText}" added to Memora!`
        });
      }
    } catch (error) {
      console.error('Error saving word:', error);
      
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'showToast',
          message: 'Error saving word to Memora',
          isError: true
        });
      }
    }
  }
});

export {};
