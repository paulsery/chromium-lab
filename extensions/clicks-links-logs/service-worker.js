//
// service-worker.js
//
// https://developer.chrome.com/docs/extensions/reference/api/tabs
//

// forward event to /var/log/syslog
function logEvent(event) {
  function handleResponse(response) {
    console.log(`Received response from native app: ${JSON.stringify(response)}`);
  }

  function handleError(error) {
    console.error('Error sending native message:', error);
  }

  chrome.runtime.sendNativeMessage(
    'fwd2syslog', { type: 'getData', payload: event }
  )
  .then(handleResponse) // Fulfilled when the native app sends a response
  .catch(handleError); // Rejected if an error occurs during connection or messaging
}


// listen for message from content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    metadata = getClickMetadata(request, sender);
    if (metadata.href === 'https://www.iana.org/about') {
      metadata.result = 'disableLink';
      logEvent(metadata);
      chrome.tabs.update({ url: metadata.origin }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error updating tab:", chrome.runtime.lastError.message);
          } else {
            console.log(`Tab ${metadata.tabId} updated to: ${metadata.origin}`);
          }
      });

      sendResponse({result: metadata});
    } else {
      metadata.result = 'messageReceived';
      logEvent(metadata);
      sendResponse({result: metadata});
    }
});

// onCreated
chrome.tabs.onCreated.addListener(function(tab) {
  metadata = getTabMetadata(tab, 'tabsOnCreated');
  console.log(metadata);
  logEvent(metadata);
});

// onDetached
chrome.tabs.onDetached.addListener(function(tab) {
  metadata = getTabMetadata(tab, 'tabsOnDetached');
  logEvent(metadata);
});

// onRemoved
chrome.tabs.onRemoved.addListener(function(tab) {
  metadata = getTabMetadata(tab, 'tabsOnRemoved');
  logEvent(metadata);
});

//// Navigation event order: onBeforeNavigate -> onCommitted -> [onDOMContentLoaded] -> onCompleted ////

// onBeforeNavigate
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  if (details.frameId === 0) {
    metadata = getTabMetadata(details, 'onBeforeNavigate');
    logEvent(metadata);
  }
});

// DOMContentLoaded
chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
  if (details.frameId === 0) { // Check if it's the main frame
    metadata = getTabMetadata(details, 'DOMContentLoaded');
    logEvent(metadata);
  }
});

// onCompleted
chrome.webNavigation.onCompleted.addListener(function(details) {
  metadata = getTabMetadata(details, 'webNavigateionCompleted');
  logEvent(metadata);
});

function getTabMetadata(tab, action) {
  metadata = tab;
  metadata.action = action;
  metadata.origin = '';
  metadata.href = '';
  metadata.documentId = '';
  metadata.documentLifecycle = '';
  metadata.frameId = '';
  metadata.tabId = tab.id;
  metadata.incognito = '';
  metadata.timestamp = Date.now();
  metadata.tabStatus = tab.status;
  metadata.tabTitle = tab.title;
  metadata.lastAccessed = tab.lastAccessed;

  return metadata;
}

function getClickMetadata(request, sender) {
  metadata = request;
  metadata.origin = sender.origin;
  metadata.documentId = sender.documentId;
  metadata.documentLifecycle = sender.documentLifecycle;
  metadata.frameId = sender.frameId;
  metadata.id = sender.id;
  metadata.tabId = sender.tab.id;
  metadata.incognito = sender.tab.incognito;
  metadata.tabStatus = sender.tab.status;
  metadata.tabTitle = sender.tab.title;
  metadata.lastAccessed = sender.tab.lastAccessed;

  return metadata;
}
