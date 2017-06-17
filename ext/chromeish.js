var port = null;

var OK = 0;
var ERR = 1;

function sendMessage(message) {
    port.postMessage(message);
    console.log("Sent message: " + JSON.stringify(message));
}

function sendSuccess(message) {
    var result = message;
    result.status = OK;
    sendMessage(result);
}

function sendError(message) {
    var result = message;
    result.status = ERR;
    sendMessage(result);
}

function receiveMessage(message) {
    console.log("Received message: " + JSON.stringify(message));
    processQuery(message);
}

function onDisconnected() {
    console.log("Failed to connect: " + chrome.runtime.lastError.message);
    port = null;
}

function connect() {
    var hostName = "com.rhetr.chromeish.shrome";
    console.log("Connecting to native messaging host " + hostName);
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(receiveMessage);
    port.onDisconnect.addListener(onDisconnected);
}

function processQuery(query) {
    try {
	switch(query.cmd) {
	    case 'ping':
		ping(); break;
	    case 'echo':
		echo(query); break;
	    case 'ls':
		ls(query); break;
	    case 'open':
		createTab(query); break;
	    case 'info':
	    case 'focus':
	    case 'cat':
	    case 'close':
	    case 'reload':
	    case 'disable':
	    case 'mv':
	    default:
		sendError(query);
		break;
	}
    }
    catch(err) {
	query.errname = err.name;
	query.errmsg = err.message;
	sendError(query);
    }
}

function ping() {
    sendSuccess({result: 'ping'});
}

function echo(message) {
    var answer = {
	result: message.string.join(' ')
    };
    sendSuccess(answer);
}

function echoCmd(message) {
    var answer = {
	result: message.cmd
    };
    sendSuccess(answer);
}

function createTab(args) {
    console.log(args);
    // add scheme to URLs
    if (args.new) {
	chrome.windows.create({ 
	    url: args.urls,
	    incognito: args.incognito
	});
    }
    else {
	if (args.window_id == '') {
	    chrome.windows.getLastFocused(function(window) {
		args.window_id = window.id;
	    });
	}
	for (i in args.urls) {
	    chrome.tabs.create({
		windowId: args.window_id,
		index: args.index,
		url: args.urls[i]
	    });
	}
    }
    sendSuccess(args);
}


function ls() {
    let winget = new Promise((resolve, reject) => {
	chrome.windows.getAll({populate:true}, function(winData) {
	    var tabs = [];
	    for (var i in winData) {
		var winTabs = winData[i].tabs;
		for (var j=0; j<winTabs.length; j++) {
		    var out = winTabs[j].title + "\t" + winTabs[j].url + "";
		    tabs.push(out);
		}
	    }
	    resolve(tabs);
	});
    });
    winget.then((tabs) => {
	sendSuccess({
	    result: tabs.join('\n'),
	});
    });
}

document.addEventListener('DOMContentLoaded', function () {
    connect();
});
