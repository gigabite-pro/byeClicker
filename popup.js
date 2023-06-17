const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const runStatus = document.getElementById('runStatus');
const container = document.getElementById('container');

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
}) ;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];

    if (tab.url === undefined || tab.url.indexOf('chrome') == 0) {
        container.innerHTML = '<h1>ByeClicker can\'t access Chrome Pages</h1>';
    } else if (tab.url.indexOf('file') == 0) {
        container.innerHTML = '<h1>ByeClicker can\'t access local files</h1>';
    } else{
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
    }
});