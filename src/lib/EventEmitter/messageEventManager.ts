const EventEmitter = require("events");

class MessageEventManager extends EventEmitter {}

const messageEventManager = new MessageEventManager();

module.exports = messageEventManager;
