chrome.tabs.onActivated.addListener((tab) => {
    chrome.action.disable();
                chrome.action.setIcon({
                    path : {
                        "16" : "./assets/logo-disabled-16.png",
                        "24" : "./assets/logo-disabled-24.png",
                        "32" : "./assets/logo-disabled-32.png",
                        "48" : "./assets/logo-disabled-48.png",
                        "128" : "./assets/logo-disabled-128.png"
                    }
                });
    chrome.tabs.get(tab.tabId, (current_tab_info) => {
        try {
            const url = new URL(current_tab_info.url);
            if (!url.origin.includes("student.iclicker.com")) {
                chrome.action.disable();
                chrome.action.setIcon({
                    path : {
                        "16" : "./assets/logo-disabled-16.png",
                        "24" : "./assets/logo-disabled-24.png",
                        "32" : "./assets/logo-disabled-32.png",
                        "48" : "./assets/logo-disabled-48.png",
                        "128" : "./assets/logo-disabled-128.png"
                    }
                });
            } else {
                chrome.action.enable();
                chrome.action.setIcon({
                    path : {
                        "16" : "./assets/logo-16.png",
                        "24" : "./assets/logo-24.png",
                        "32" : "./assets/logo-32.png",
                        "48" : "./assets/logo-48.png",
                        "128" : "./assets/logo-128.png"
                    }
                });
            }
        } catch (error) {
            console.log(error)
        }
    })
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.active && changeInfo.status === 'complete' && tab.url) {
      if (tab.url.includes('student.iclicker.com')) {
        // Enable the extension
        chrome.action.enable();
        chrome.action.setIcon({
            path : {
                "16" : "./assets/logo-16.png",
                "24" : "./assets/logo-24.png",
                "32" : "./assets/logo-32.png",
                "48" : "./assets/logo-48.png",
                "128" : "./assets/logo-128.png"
            }
        });
      } else {
        // Disable the extension
        chrome.action.disable();
        chrome.action.setIcon({
            path : {
                "16" : "./assets/logo-disabled-16.png",
                "24" : "./assets/logo-disabled-24.png",
                "32" : "./assets/logo-disabled-32.png",
                "48" : "./assets/logo-disabled-48.png",
                "128" : "./assets/logo-disabled-128.png"
            }
        });
      }
    }
  });