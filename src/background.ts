import { saveWord } from './index-db';


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
      const sourceUrl = info.pageUrl ?? tab?.url ?? '';
      await saveWord(info.selectionText, sourceUrl);
      console.log('Word saved successfully');
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
