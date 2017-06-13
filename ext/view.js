var message_log = '';

function appendMessage(text) {
    message_log += "<p>" + text + "</p>";
    document.getElementById('response').innerHTML = message_log;
}

chrome.runtime.onMessage.addListener(function(message, sender, response) {
    document.getElementById('response').innerHTML = message;
    // appendMessage(message);
});
chrome.runtime.sendMessage(chrome.runtime.id, "begin");
