chrome.browserAction.onClicked.addListener(function(activeTab){
    var URL = "chrome-extension://" + chrome.runtime.id + "/view.html";
    chrome.tabs.create({ url: URL });
});

chrome.runtime.onMessage.addListener(function(message, sender, response) {
    chrome.runtime.sendMessage(chrome.runtime.id, "init view");
});

var port = null;
var message_log = '';

function nativeSend(message) {
    port.postMessage(message);
    appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
    appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
    processMessage(message);
}

function appendMessage(text) {
    chrome.runtime.sendMessage(chrome.runtime.id, JSON.stringify(text))
    message_log += "<p>" + text + "</p>";
}

function nativePing(addr) {
    nativeSend({text: 'ping', addr: addr});
}

function processMessage(message) {
    // TODO: message should be an object of the form
    // message {
    //     cmd: string or enum
    //     args: obj
    // 	   addr: string
    // }
    switch(message.text) {
	case 'ping':
	    nativePing(message.addr);
	    break;
	case 'cat':
	    nativeSend(message);
	    break;
	case 'ls':
	    sendWindows(message.addr);
	    break;
	default:
	    nativeSend(message);
	    break;
    }
}

function onDisconnected() {
    appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
    port = null;
    updateUiState();
}

function connect() {
    var hostName = "com.rhetr.chromeish.shrome";
    appendMessage("Connecting to native messaging host <b>" + hostName + "</b>");
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
    updateUiState();
}

function sendWindows(addr) {
    let winget = new Promise((resolve, reject) => {
	chrome.windows.getAll({populate:true}, function(winData) {
	    var tabs = [];
	    for (var i in winData) {
		var winTabs = winData[i].tabs;
		for (var j=0; j<winTabs.length; j++) {
		    var out = winTabs[j].title + "\t" + winTabs[j].url + "";
		    // console.log(out);
		    tabs.push(out);
		}
	    }
	    resolve(tabs);
	});
    });
    winget.then((tabs) => {
	nativeSend({
	    text: tabs.join('\n'),
	    addr: addr
	});
    });
}

document.addEventListener('DOMContentLoaded', function () {
    connect();
});
