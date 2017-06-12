var message_log = '';

function appendMessage(text) {
    message_log += "<p>" + text + "</p>";
    document.getElementById('response').innerHTML = message_log;
}

console.log("ello");
chrome.runtime.onMessage.addListener(function(message, sender, response) {
    appendMessage(message);
});
chrome.runtime.sendMessage(chrome.runtime.id, "test");
console.log("sent message");
