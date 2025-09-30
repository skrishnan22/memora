import { saveWord } from './index-db';

const SUCCESS_NOTIFICATION_ID = 'memora-save-success';
const ERROR_NOTIFICATION_ID = 'memora-save-error';

async function showNotification(notificationId: string, title: string, message: string) {
  const iconUrl = chrome.runtime.getURL('icon-128.png');
  try {
    // chrome notifications will not be shown if the same notificationId is used multiple times
    await chrome.notifications.create(`${notificationId}-${Date.now()}`, {
      type: 'basic',
      iconUrl,
      title,
      message,
      priority: 0
    });
  } catch (error) {
    console.error('Failed to show notification', notificationId, error);
    return;
  }

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
      const sourceUrl = info.pageUrl ?? tab?.url ?? '';
      await saveWord(info.selectionText, sourceUrl);
      console.log('Word saved successfully');

      await showNotification(
        SUCCESS_NOTIFICATION_ID,
        'Memora',
        `"${info.selectionText}" added to Memora!`
      );
    } catch (error) {
      console.error('Error saving word:', error);
      
      await showNotification(
        ERROR_NOTIFICATION_ID,
        'Memora — Error',
        'Error saving word to Memora'
      );
    }
  }
});

export {};
