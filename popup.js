const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const runStatus = document.getElementById('runStatus');
const container = document.getElementById('container');
const randomBtn = document.getElementById('random');
const autoJoinBtn = document.getElementById('autoJoin');

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['status'], function(result) {
        if (result.status == "started") {
            runStatus.style.display = 'block';
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
        } else if (result.status == "stopped" || result == undefined) {
            runStatus.style.display = 'none';
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
        }
    });

    chrome.storage.local.get(['random'], function(result) {
        if (result.random == true) {
            randomBtn.checked = true;
        } else if (result.random == false || result == undefined) {
            randomBtn.checked = false;
        }
    });

    chrome.storage.local.get(['autoJoin'], function(result) {
        if (result.autoJoin == true) {
            autoJoinBtn.checked = true;
        } else if (result.autoJoin == false || result == undefined) {
            autoJoinBtn.checked = false;
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
            runStatus.style.display = 'block';
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'start'});
            window.close();
        });
        
        stopBtn.addEventListener('click', () => {
            runStatus.style.display = 'none';
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'stop'});
            window.close();
        });

        randomBtn.addEventListener('click', () => {
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'random'});
        });

        autoJoinBtn.addEventListener('click', () => {
            chrome.tabs.sendMessage(tab.id, {from: 'popup', msg: 'autoJoin'});
        });
    }
});