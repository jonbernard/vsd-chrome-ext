var chrome = window.chrome,
    blockDeque = false,
    newUA;

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
    'use strict';
        // Replace the User-Agent header
        var headers = info.requestHeaders;
        headers.forEach(function(header, i) {
            if (header.name.toLowerCase() === 'user-agent' && newUA) {
              header.value = newUA;
            }
        });  
        return {requestHeaders: headers};
    },
    // Request filter
    {
        // Modify the headers for these pages
        urls: [
            "https://dev-005.lbidts.com/*",
            "https://test-005.lbidts.com/*",
            "https://vsdpint.lbidts.com/*"
        ],
        // In the main window and frames
        types: ["main_frame", "sub_frame"]
    },
    ["blocking", "requestHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    'use strict';
    if (blockDeque && details.url.indexOf("deque_vs_") !== -1 && details.url.indexOf(".min.js") !== -1) {
      return {cancel: true};
    } else {
      return {cancel: false};
    }
  },
  {
    urls: [
        "https://dm.victoriassecret.com/*"
    ]
  },
  ["blocking"]
);

chrome.runtime.onInstalled.addListener(function() {
  'use strict';
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        // When a page is a VSD dev page
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostContains: "dev-", hostSuffix: '.lbidts.com', schemes: ['https'] }
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostContains: "test-", hostSuffix: '.lbidts.com', schemes: ['https'] }
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostContains: "vsdpint.", hostSuffix: '.lbidts.com', schemes: ['https'] }
        })
      ],
      // ... show the page action.
      actions: [new chrome.declarativeContent.ShowPageAction() ]
    }]);
  });
  chrome.tabs.query({}, function(result) {
    for (var i = 0; i < result.length; i++) {
      if (result[i].url.indexOf("dev-005.lbidts.com") !== -1 ||
          result[i].url.indexOf("test-005.lbidts.com") !== -1 ||
          result[i].url.indexOf("vsdpint.lbidts.com") !== -1) {
            chrome.tabs.reload(result[i].id);
      }
    }
  });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  'use strict';
  for (var key in changes) {
    if (changes.hasOwnProperty(key)) {
      var storageChange = changes[key];
      if (key === "UAType") {
        chrome.storage.local.get('UATab', function (result) {
          if (storageChange.newValue === "mobile") {
            newUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/538.34.9 (KHTML, like Gecko) Version/7.0 Mobile/12A4265u Safari/9537.53";
          } else {
            newUA = null;
          }
          chrome.tabs.reload(result.UATab);
        });
      }
      if (key === "blockDeque") {
        chrome.storage.local.get('UATab', function (result) {
          if (blockDeque === false && storageChange.newValue === true) {
            blockDeque = storageChange.newValue;
            chrome.tabs.reload(result.UATab);
          } else {
            chrome.tabs.reload(result.UATab);
            chrome.runtime.reload();
          }
        });
      }
      //console.log('Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".', key, namespace, storageChange.oldValue, storageChange.newValue);
    }
  }
});