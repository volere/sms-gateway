import {
  saveMessage,
  categorizeMessage,
  analyzeMessage,
} from "./messageHandlers";

messageEventManager.on("messageReceived", saveMessage);
messageEventManager.on("messageReceived", categorizeMessage);
messageEventManager.on("messageReceived", analyzeMessage);

export function onMessageReceived(phone: string, msg: string) {
  messageEventManager.emit("messageReceived", { phone, msg });
}
