window.onload = () => {
    // Select the target node that you want to observe for changes
    const targetNode = document.querySelector('#main-wrapper');

    console.log(targetNode)

    chrome.runtime.onMessage.addListener((message, sender) => {
        // Configuration options for the observer
        const observerConfig = { 
            childList: true,  // Watch for changes in the child nodes of the target
            subtree: true,    // Watch for changes in the entire subtree of the target
        };
    
        const observer = new MutationObserver(function(mutationsList) {
            // Iterate over the list of mutations
            for (let mutation of mutationsList) {
            // Handle the specific type of mutation you are interested in
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Perform actions or execute code when a change is detected
                for (let node of mutation.addedNodes) {
                    if (node instanceof Element && node.matches('.polling-page-wrapper')) {
                        const url = window.location.href;
                        if (url == "https://student.iclicker.com/#/polling") {
                            try {
                                const btn = document.querySelectorAll('.btn-container');
                                // sleep for 1 second
                                setTimeout(() => {
                                    console.log('got the btn')
                                    btn[0].children[0].click();
                                }, 1000);
                            } catch (error) {
                                console.log('buttons not found')
                            }
                        } else if (url.includes('https://student.iclicker.com/#/courses')) {
                            stopObserver();
                        }
                    }
                }
            }
            }
        });

        if (message.from == 'popup' && message.msg == 'start') {
            observer.observe(targetNode, observerConfig);
            console.log('start answering')
            chrome.storage.local.set({status: 'started'})
        } else if (message.from == 'popup' && message.msg == 'stop') {
            observer.disconnect();
            console.log('stopped')
            chrome.storage.local.set({status: 'stopped'})
        }

        function stopObserver() {
            observer.disconnect();
            console.log('default stop')
            chrome.storage.local.remove('status');
        }
    });
}