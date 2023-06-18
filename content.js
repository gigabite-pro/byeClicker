window.onload = () => {
    chrome.storage.local.remove('status');
    chrome.storage.local.remove('random');

    const targetNode = document.querySelector('#main-wrapper');

    console.log(targetNode);

    let random = false;

    const observerConfig = { 
        childList: true, 
        subtree: true, 
    };

    const observer = new MutationObserver(function(mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        const url = window.location.href;
                        if (url == "https://student.iclicker.com/#/polling") {
                            if (node.matches('.polling-page-wrapper')) {
                                try {
                                    const btns = document.querySelectorAll('.btn-container');
                                    if (random) {
                                        var optionIndex = getRandomInteger(btns.length);
                                    } else {
                                        var optionIndex = 0;
                                    }
                                    console.log('got the btn')
                                    btns[optionIndex].children[0].click();
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
                    console.log('got the btn')
                    btns[optionIndex].children[0].click();
                } catch (error) {
                    console.log('buttons not found')
                }
            } 
            startObserver();
        } else if (message.from == 'popup' && message.msg == 'stop') {
            stopObserver('manual');
        } else if (message.from == 'popup' && message.msg == 'random') {
            random = !random;
            chrome.storage.local.set({random: random});
        }
    });

    function startObserver() {
        observer.observe(targetNode, observerConfig);
        console.log('start answering')
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