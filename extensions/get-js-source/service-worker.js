// Debugger: https://developer.chrome.com/docs/extensions/reference/api/debugger
// type:   https://chromedevtools.github.io/devtools-protocol/tot/Debugger/#event-scriptParsed
// method: https://chromedevtools.github.io/devtools-protocol/tot/Debugger/#method-getScriptSource

chrome.action.onClicked.addListener(async (tab) => {

  // Attach the debugger to the current tab
  await chrome.debugger.attach({ tabId: tab.id }, "1.3"); // Use a compatible protocol version

  // Enable the Debugger domain
  await chrome.debugger.sendCommand({ tabId: tab.id }, "Debugger.enable");

  const targets = await chrome.debugger.getTargets();
  console.log('Targets: ', targets);

  // Listen for scriptParsed events
 if (tab.url && tab.url.startsWith("http") || tab.url.startsWith("file")) {
  chrome.debugger.onEvent.addListener((source, method, params) => {

    if (source.tabId === tab.id && method === "Debugger.scriptParsed") {
      console.log("Script ID:", params);
    }

    chrome.debugger.sendCommand({ tabId: tab.id}, "Debugger.getScriptSource", { scriptId: params.scriptId },
      function(response) { console.log("| ", params.url, ": ", response.scriptSource); });
    });
  }


});
