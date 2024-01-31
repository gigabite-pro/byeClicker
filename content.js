window.onload = () => {
    chrome.storage.local.remove('status');
    chrome.storage.local.remove('random');
    chrome.storage.local.remove('autoJoin');
    chrome.storage.local.remove('email');
    chrome.storage.local.remove('notify');

    const targetNode = document.querySelector('#main-wrapper');
    const HOST = 'https://bye-clicker-api.vercel.app';

    let random = false;
    let autoJoin = false;
    let notify = false;
    let fetchCalled = false;

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
                                    // notify backend to send email
                                    if (notify && !fetchCalled) {
                                        fetchCalled = true;
                                        let img = "https://institutional-web-assets-share.s3.amazonaws.com/iClicker/student/images/image_hidden_2.png"
                                        const imgContainer = document.getElementsByClassName('question-image-container');
                                        setTimeout(() => {
                                            const source = imgContainer[0].querySelectorAll('img')[1].src
                                            if(source != undefined && source != "") {
                                                img = imgContainer[0].querySelectorAll('img')[1].src;
                                            }
                                            callFurther();
                                        }, 1000);
                                        function callFurther() {
                                            chrome.storage.local.get(['email'], (result) => {
                                                const email = result.email;
                                                fetch(`${HOST}/notify`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({email: email, type: 'ques', img: img}),
                                                })
                                                .then(res => res.json())
                                                .then(data => {
                                                    // console.log(data);
                                                    setTimeout(() => {
                                                        btns[optionIndex].children[0].click();
                                                    }, 9000);
                                                    fetchCalled = false;
                                                })
                                                .catch(err => console.log(err));
                                            });
                                        }
                                    }
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
                                if(notify && !fetchCalled) {
                                    fetchCalled = true;
                                    // notify backend to send email
                                    chrome.storage.local.get(['email'], (result) => {
                                        const email = result.email;
                                        fetch(`${HOST}/notify`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({email: email, type: 'classStart'}),
                                        })
                                        .then(res => res.json())
                                        .then(data => {
                                            // console.log(data);
                                            document.querySelector('#btnJoin').click();
                                            fetchCalled = false;
                                        })
                                        .catch(err => console.log(err));
                                    });
                                }
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
        } else if (message.from == 'popup' && message.msg == 'notify') {
            notify = !notify;
            chrome.storage.local.set({email: message.email});
            chrome.storage.local.set({notify: notify});
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
            if(notify && !fetchCalled) {
                fetchCalled = true;
                // notify backend to send email
                chrome.storage.local.get(['email'], (result) => {
                    const email = result.email;
                    fetch(`${HOST}/notify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({email: email, type: 'classEnd'}),
                    })
                    .then(res => res.json())
                    .then(data => {
                        // console.log(data);
                        fetchCalled = false;
                        window.location.reload();
                    })
                    .catch(err => console.log(err));
                });
            }
        } else if (status == 'manual') {
            console.log('stopped')
            chrome.storage.local.set({status: 'stopped'})
        }
    }
}