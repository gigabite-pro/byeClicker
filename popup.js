const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const runStatus = document.getElementById('runStatus');
const container = document.getElementById('container');
const randomBtn = document.getElementById('random');
const autoJoinBtn = document.getElementById('autoJoin');
const notifyBtn = document.getElementById('notify');
const email = document.getElementById('email');

// Update email on change
email.addEventListener('input', () => {
    chrome.storage.local.set({email: email.value});
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['status'], function(result) {
        if (result.status == "started") {
            startBtn.style.display = 'none';

            runStatus.style.display = 'block';
            stopBtn.style.display = 'block';
            runStatus.style.transform = 'scale(0)';
            runStatus.style.transform = 'scale(0)';

            setTimeout(() => {
                runStatus.style.transition = '0.5s';
                runStatus.style.transform = 'scale(1)';
                
                stopBtn.style.transition = '0.5s';
                stopBtn.style.transform = 'scale(1)';
            }, 100);
        } else if (result.status == "stopped" || result.status == undefined) {
            runStatus.style.display = 'none';

            document.getElementById('form').style.marginTop = '30px';
            startBtn.style.display = 'block';
            startBtn.style.transition = '0.5s';
            startBtn.style.transform = 'scale(1)';

            stopBtn.style.display = 'none';
        }
    });

    chrome.storage.local.get(['random'], function(result) {
        if (result.random == true) {
            randomBtn.checked = true;
        } else if (result.random == false || result.random == undefined) {
            randomBtn.checked = false;
        }
    });

    chrome.storage.local.get(['autoJoin'], function(result) {
        if (result.autoJoin == true) {
            autoJoinBtn.checked = true;
        } else if (result.autoJoin == false || result.random == undefined) {
            autoJoinBtn.checked = false;
        }
    });

    chrome.storage.local.get(['email'], function(result) {
        if (result.email == undefined) {
            email.value = '';
        } else {
            email.value = result.email;
        }
    });

    chrome.storage.local.get(['notify'], function(result) {
        if (result.notify == true) {
            notifyBtn.checked = true;
        } else if (result.notify == false || result.notify == undefined ) {
            notifyBtn.checked = false;
        }
    });
}) ;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];

    if (tab.url === undefined || tab.url.indexOf('chrome') == 0) {
        container.innerHTML = '<h1>ByeClicker can\'t access Chrome Pages</h1>';
    } else if (tab.url.indexOf('file') == 0) {
        container.innerHTML = '<h1>ByeClicker can\'t access local files</h1>';
    } else if (!tab.url.includes('student.iclicker.com')) {
        container.innerHTML = '<h1>ByeClicker works only on iCliker pages</h1>';
    } else {
        startBtn.addEventListener('click', () => {
            startBtn.style.transition = '0.5s';
            startBtn.style.transform = 'scale(0)';
            setTimeout(() => {
                startBtn.style.display = 'none';

                runStatus.style.display = 'block';
                stopBtn.style.display = 'block';
                runStatus.style.transform = 'scale(0)';
                runStatus.style.transform = 'scale(0)';

                setTimeout(() => {
                    runStatus.style.transition = '0.5s';
                    runStatus.style.transform = 'scale(1)';
                    
                    stopBtn.style.transition = '0.5s';
                    stopBtn.style.transform = 'scale(1)';
                }, 100);

                
            }, 500);
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'start'});
        });
        
        stopBtn.addEventListener('click', () => {
            runStatus.style.transition = '0.5s';
            runStatus.style.transform = 'scale(0)';

            stopBtn.style.transition = '0.5s';
            stopBtn.style.transform = 'scale(0)';

            setTimeout(() => {
                document.getElementById('form').style.marginTop = '30px';
                runStatus.style.display = 'none';
                stopBtn.style.display = 'none';

                startBtn.style.display = 'block';
                startBtn.style.transform = 'scale(0)';
                setTimeout(() => {
                    startBtn.style.transition = '0.5s';
                    startBtn.style.transform = 'scale(1)';
                }, 100);
                // startBtn.style.transition = '0.5s';
                // startBtn.style.transform = 'scale(1)';
            }, 500);
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'stop'});
        });

        randomBtn.addEventListener('click', () => {
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'random'});
        });

        autoJoinBtn.addEventListener('click', () => {
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'autoJoin'});
        });

        notifyBtn.addEventListener('click', () => {
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'notify', email: email.value});
        });
    }
});

// function handleLogin() {
//     window.open('https://bye-clicker-api.vercel.app/auth/login', '_blank')
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//         const tab = tabs[0];
//         chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'startFetchingToken'});
//     });
// }