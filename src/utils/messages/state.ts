export type ChatMessage = {
    message: string;
    timestamp: number;
    sender: string;
};
import { BehaviorSubject } from "rxjs";

export const session: { [recipient: string]: ChatMessage[] } = {};
export const sessionSubject = new BehaviorSubject<ChatMessage[]>([]);
export let timestamp: number = 0;

export const addMessage = (recipient: string, message: ChatMessage) => {
    if (message === undefined) { return }
    const li = session[recipient];
    if (li === undefined) {
        session[recipient] = [message];
    } else {
        li.push(message);
        li.sort((a, b) => { return a.timestamp - b.timestamp });
    }

    window.localStorage.setItem("session", JSON.stringify(session));
    window.localStorage.setItem("timestamp", JSON.stringify(message.timestamp));
    // guaranteed to be non-null because single-threaded
    sessionSubject.next(session[recipient]!);
    return session[recipient];
}

export const addMessages = (recipient: string, messages: ChatMessage[]) => {
    for (const i in messages) {
        if (messages[i] === undefined) {
            continue;
        }
        addMessage(recipient, messages[i]!)
    }
}

export const getMessages = (recipient: string) => {
    if (session[recipient] === undefined) {
        return []
    }
    return session[recipient];
}

export const restoreMessages = (recipient: string) => {
    const ls = JSON.parse(window.localStorage.getItem("session") ?? "{}");
    Object.assign(session, ls);

    timestamp = JSON.parse(window.localStorage.getItem("timestamp") ?? "0");
    sessionSubject.next(session[recipient] ?? []);
}