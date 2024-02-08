window.onload = () => {
    chrome.storage.local.remove('status');

    const targetNode = document.querySelector('#main-wrapper');
    const HOST = 'https://bye-clicker-api.vercel.app';

    // Set default values
    let random;
    let autoJoin;
    let notify;
    let access_token;
    let activity;
    let courseId;
    let activityId;
    let requestOptions;
    let intervalId;
    const optionsToIndex = {
        'A': 0,
        'B': 1,
        'C': 2,
        'D': 3,
        'E': 4,
    }

    // Get values from storage
    chrome.storage.local.get(['notify'], function(result) {
        if (result.notify == true) {
            notify = true;
        } else if (result.notify == false || result == undefined ) {
            notify = false;
        }
    });

    chrome.storage.local.get(['random'], function(result) {
        if (result.random == true) {
            random = true;
        } else if (result.random == false || result == undefined) {
            random = false;
        }
    });

    chrome.storage.local.get(['autoJoin'], function(result) {
        if (result.autoJoin == true) {
            autoJoin = true;
        } else if (result.autoJoin == false || result == undefined) {
            autoJoin = false;
        }
    });
    
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
                                setTimeout(() => {
                                    setVariables();
                                }, 3000);
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
                                                    fetchCalled = false;
                                                    clearInterval(intervalId);
                                                    checkAnswer(btns, optionIndex);
                                                })
                                                .catch(err => console.log(err));
                                            });
                                        }
                                    }
                                    clearInterval(intervalId);
                                    checkAnswer(btns, optionIndex);
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

    function checkAnswer(btns, optionIndex) {
        intervalId = setInterval(() => {
            fetch(`https://activity-service.iclicker.com/reporting/courses/${courseId}/activities/${activityId}/questions/view
            `, requestOptions)
            .then(response => response.json())
            .then(data => {
                const answerOverview = data.data.questions[data.data.questions.length - 1].answerOverview;
                if(answerOverview.length == 0) {
                    btns[optionIndex].children[0].click();
                    return;
                }
                const maxPercentageOption = answerOverview.reduce((maxOption, currentOption) => (
                    currentOption.percentageOfTotalResponses > maxOption.percentageOfTotalResponses ? currentOption : maxOption
                  ), answerOverview[0]);

                btns[optionsToIndex[maxPercentageOption.answer]].children[0].click();
            })
            .catch((error) => {
                console.error('Error:', error);
            }); 
        }, 5000);
    }

    function setVariables() {
        access_token = document.cookie.split('; ').find(row => row.startsWith('access_token')).split('=')[1];
        activity = JSON.parse(sessionStorage.activity);
        courseId = activity.courseId;
        activityId = activity.activityId;
        requestOptions = {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://student.iclicker.com',
            // Add any other headers as needed
            },
        };
    }

    function getRandomInteger(max) {
        return Math.floor(Math.random() * max);
    }

    chrome.runtime.onMessage.addListener((message) => {
        if (message.from == 'popup' && message.msg == 'start') {
            const url = window.location.href;
            if (url == "https://student.iclicker.com/#/polling") {
                setTimeout(() => {
                    setVariables();
                }, 3000);
                try {
                    const btns = document.querySelectorAll('.btn-container');
                    if (random) {
                        var optionIndex = getRandomInteger(btns.length);
                    } else {
                        var optionIndex = 0;
                    }
                    clearInterval(intervalId);
                    checkAnswer(btns, optionIndex);
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