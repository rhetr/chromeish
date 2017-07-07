var port = null;

function sendMessage(message) {
    port.postMessage(message);
    console.log("Sent message: " + JSON.stringify(message));
}

function sendSuccess(query, result) {
    sendMessage({
	query: query,
	status: 'OK',
	result: result
    });
}

function sendError(query, error) {
    sendMessage({
	query: query,
	status: 'ERR',
	error: {
	    name: error.name,
	    message: error.message
	}
    });
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
		focusTab(query); break;
	    case 'cat':
	    case 'close':
	    case 'reload':
	    case 'disable':
	    case 'mv':
	    default:
		sendError(query); break;
	}
    }
    catch(err) {
	sendError(query, err);
    }
}

function focusTab(query) {
    let get_id = new Promise((resolve, reject) => {
	let tab_id;
	if (['url','title'].indexOf(query.key) != -1) {
	    let fields = {};
	    fields[query.key] = query.tabs[0];
	    chrome.tabs.query(fields, function(tabs) {
		if (tabs.length > 0) {
		    tab_id = tabs[0];
		    resolve(tab_id);
		}
		else
		    reject(new Error('invalid id'));
	    });
	}
	else if (query.key === 'id') {
	    tab_id = Number(query.tabs[0]);
	    if (isNaN(tab_id))
		reject(new Error('invalid id'));
	    else {
		chrome.tabs.get(tab_id, function(tab) {
		    if (chrome.runtime.lastError)
			reject(new Error('invalid id'));
		    else
			resolve(tab_id);
		});
	    }
	}
    });
    get_id.then((tab_id) => {
	chrome.tabs.update(tab_id, {active:true}, function(tab) {
	    sendSuccess(query, {id: tab_id});
	});
    })
    .catch((reason) => {
	console.log(reason);
	sendError(query, reason);
    });
}

function ping() {
    sendSuccess({query:query, result: 'ping'});
}

function echo(query) {
    var answer = {
	result: message.string.join(' ')
    };
    sendSuccess(query, answer);
}

function echoCmd(query) {
    var answer = {
	result: message.cmd
    };
    sendSuccess(query, answer);
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
	if (args.window_id == '')
	    chrome.windows.getLastFocused(function(window) {
		args.window_id = window.id;
	    });
	for (i in args.urls) {
	    chrome.tabs.create({
		windowId: args.window_id,
		index: args.index,
		url: args.urls[i]
	    });
	}
    }
    sendSuccess(query, args);
}

function fields_filter(tab, query) {
    var result = {};
    if (query.show.includes('t') || query.list)
        result.title = tab.title;
    if (query.show.includes('u') || query.list)
        result.url = tab.url;
    if (query.show.includes('i') || query.list)
        result.id = tab.id;
    if (query.show.includes('n') || query.list)
        result.index = tab.index;
    if (query.show.includes('w') || query.list)
        result.windowId = tab.windowId;
    if (query.show.includes('d') || query.list)
        result.disabled = tab.discarded;
    if (query.show.includes('p') || query.list)
        result.pinned = tab.pinned;
    if (query.show.includes('s') || query.list)
        result.status = tab.status;
    if (query.show.includes('a') || query.list) {
        if (tab.mutedInfo.muted) 
            result.audible = false;
        else
            result.audible = tab.audible;
    }
    return result;
}

function query_filter(tab_field, query_field) {
    if ((query_field === tab_field) || (!tab_field))
	return true;
    else 
	return false;
}

function ls(query) {
    let get_windows = new Promise((resolve, reject) => {
	chrome.windows.getAll({populate:true}, function(windows) {
	    var tabs = [];
	    for (var i in windows) {
	        var win_tabs = windows[i].tabs;
	        for (var j=0; j<win_tabs.length; j++) {
		    var tab = win_tabs[j]
		    if (query_filter(tab.incognito, query.incognito)) {
			tab_is_settings = tab.url.split('/')[0].includes('chrome');
			if (query_filter(tab_is_settings, query.settings))
			    tabs.push(fields_filter(tab, query));
		    }
	        }
	    }
	    resolve(tabs);
	});
    });
    get_windows.then((tabs) => {
	sendSuccess(query, tabs);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    connect();
});
