window.onload = () => {
    chrome.storage.local.remove('status');
    chrome.storage.local.remove('random');

    const targetNode = document.querySelector('#main-wrapper');

    // console.log(targetNode);
    let random = false;
    let autoJoin = false;

    const observerConfig = { 
        attributes: true,  // Watch for attribute changes (e.g., style changes)
        attributeFilter: ['style'], // Only observe changes to style attribute
        childList: true, 
        subtree: true, 
    };

    const observer = new MutationObserver(function(mutationsList) {
        const url = window.location.href;
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        if (url == "https://student.iclicker.com/#/polling") {
                            // Listening for next question
                            if (node.matches('.polling-page-wrapper')) {
                                try {
                                    const btns = document.querySelectorAll('.btn-container');
                                    if (random) {
                                        var optionIndex = getRandomInteger(btns.length);
                                    } else {
                                        var optionIndex = 0;
                                    }
                                    setTimeout(() => {
                                        console.log('got the btn')
                                        btns[optionIndex].children[0].click();
                                    }, 10000);
                                } catch (error) {
                                    console.log('buttons not found')
                                }
                            }
                        } else if (url.includes('https://student.iclicker.com/#/courses')) {
                            if (node.matches('.course-wrapper')) {
                                stopObserver('default');
                            }
                        }
                    }
                }
            } else if(mutation.type === 'attributes' && mutation.attributeName === 'style') {
                // console.log('CSS change detected:', mutation.target);
                if (url.includes('https://student.iclicker.com/#/courses') && url.includes('/tab/default')) {
                    if(autoJoin) {
                        try{
                            if(document.querySelector('#join-inner-container').style.display == 'block') {
                                document.querySelector('#btnJoin').click();
                            }
                        } catch (error) {
                            console.log('join button not found')
                        }
                    }
                }
            }
        }
    });

    function getRandomInteger(max) {
        return Math.floor(Math.random() * max);
    }

    chrome.runtime.onMessage.addListener((message) => {
        if (message.from == 'popup' && message.msg == 'start') {
            const url = window.location.href;
            if (url == "https://student.iclicker.com/#/polling") {
                try {
                    const btns = document.querySelectorAll('.btn-container');
                    if (random) {
                        var optionIndex = getRandomInteger(btns.length);
                    } else {
                        var optionIndex = 0;
                    }
                    setTimeout(() => {
                        console.log('got the btn')
                        btns[optionIndex].children[0].click();
                    }, 10000);
                } catch (error) {
                    console.log('buttons not found')
                }
            } else if (url.includes('https://student.iclicker.com/#/courses') && url.includes('/tab/default')) {
                chrome.storage.local.get(['status'], function(result) {
                    if (result.status != 'started') {
                        try{
                            if(document.querySelector('#join-inner-container').style.display == 'block') {
                                document.querySelector('#btnJoin').click();
                            }
                        } catch (error) {
                            console.log('join button not found')
                        }
                    }
                });
            }
            startObserver();
        } else if (message.from == 'popup' && message.msg == 'stop') {
            stopObserver('manual');
        } else if (message.from == 'popup' && message.msg == 'random') {
            random = !random;
            chrome.storage.local.set({random: random});
        } else if (message.from == 'popup' && message.msg == 'autoJoin') {
            autoJoin = !autoJoin;
            chrome.storage.local.set({autoJoin: autoJoin});
        }
    });

    function startObserver() {
        observer.observe(targetNode, observerConfig);
        console.log('started answering')
        chrome.storage.local.set({status: 'started'})
    }

    function stopObserver(status) {
        observer.disconnect();
        if (status == 'default') {
            console.log('default stop')
            chrome.storage.local.remove('status');
        } else if (status == 'manual') {
            console.log('stopped')
            chrome.storage.local.set({status: 'stopped'})
        }
    }
}