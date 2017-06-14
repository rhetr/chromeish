var port = null;
var message_log = '';

chrome.browserAction.onClicked.addListener(function(activeTab){
    var URL = "chrome-extension://" + chrome.runtime.id + "/view.html";
    chrome.tabs.create({ url: URL });
});

chrome.runtime.onMessage.addListener(function(message, sender, response) {
    if (message === "begin") {
	console.log("begun");
	chrome.runtime.sendMessage(chrome.runtime.id, message_log);
    }
    else {
	console.log("no");
    }
})


function sendMessage(message) {
    port.postMessage(message);
    logMessage("Sent message: " + JSON.stringify(message));
}

function receiveMessage(message) {
    logMessage("Received message: " + JSON.stringify(message));
    processQuery(message);
}

function logMessage(text) {
    message_log += "<p>" + text + "</p>";
    console.log(text);
    chrome.runtime.sendMessage(chrome.runtime.id, message_log);
}

function ping() {
    sendMessage({result: 'ping'});
}

function echo(message) {
    var answer  = {
	result: message.string.join(' ')
    };
    sendMessage(answer);
}

function echoCmd(message) {
    var answer  = {
	result: message.cmd
    };
    sendMessage(answer);
}

function processQuery(query) {
    switch(query.cmd) {
	case 'ping':
	    ping(); break;
	case 'echo':
	    echo(query); break;
	case 'ls':
	    ls(query); break;
	default:
	    echoCmd(query); break;
    }
}

function onDisconnected() {
    logMessage("Failed to connect: " + chrome.runtime.lastError.message);
    port = null;
}

function connect() {
    var hostName = "com.rhetr.chromeish.shrome";
    logMessage("Connecting to native messaging host " + hostName);
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(receiveMessage);
    port.onDisconnect.addListener(onDisconnected);
}

function ls() {
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
	sendMessage({
	    result: tabs.join('\n'),
	});
    });
}

document.addEventListener('DOMContentLoaded', function () {
    connect();
});
