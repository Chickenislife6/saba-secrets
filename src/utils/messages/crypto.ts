export interface ProcessedChatMessage {
    id: string
    address: string
    from: string
    timestamp: number
    body: string
}

import { SessionCipher, SignalProtocolAddress } from "@privacyresearch/libsignal-protocol-typescript"
import { v4 as uuid } from 'uuid'
import { loadSession, store, storeSession } from "../identity/state"
import { ChatMessage } from "./state"

export async function encryptMessage(to: string, message: string) {
    loadSession(to);
    const address = new SignalProtocolAddress(to, 1);
    const cipher = new SessionCipher(store, address);

    const cm: ProcessedChatMessage = {
        id: uuid(),
        address: to,
        from: window.localStorage.getItem("name")!,
        timestamp: Date.now(),
        body: message,
    };

    const signalMessage = await cipher.encrypt(new TextEncoder().encode(JSON.stringify(cm)).buffer);
    storeSession(to);
    return signalMessage;
}

export type MinMessage = {
    type: number
    message: string
    id: number
}

const seen: number[] = [];
export async function getMessagesAndDecrypt(encodedmessages: MinMessage[], address: string) {
    const unseenmessages = encodedmessages.filter((message) => { seen.find((v) => { v === message.id }) === undefined })
    unseenmessages.map((message) => { seen.push(message.id) })

    loadSession(address);

    const cipher = new SessionCipher(store, new SignalProtocolAddress(address, 1))
    if (unseenmessages.length === 0) { return [] }
    const decodedmessages: ProcessedChatMessage[] = [];
    for (let i in unseenmessages) {
        let plaintextBytes = undefined;
        if (unseenmessages[i]!.type === 3) {
            plaintextBytes = await cipher.decryptPreKeyWhisperMessage(JSON.parse(unseenmessages[i]!.message), 'binary')
        } else { // (unseenmessages[i].type === 1)
            plaintextBytes = await cipher.decryptWhisperMessage(JSON.parse(unseenmessages[i]!.message), 'binary')
        }
        const plaintext = new TextDecoder().decode(new Uint8Array(plaintextBytes))
        let cm = JSON.parse(plaintext) as ProcessedChatMessage
        decodedmessages.push(cm);
    }

    storeSession(address);

    // sorting is not needed as long as you sort later
    // decodedmessages.sort((a, b) => { return a.timestamp - b.timestamp });
    const orderedmessages: ChatMessage[] = decodedmessages.map((a) => { return { message: a.body, sender: a.from, timestamp: a.timestamp } });
    return orderedmessages;
}

export const sortMessages = (messages: ChatMessage[]) => {
    messages.sort((a, b) => { return a.timestamp - b.timestamp });
    return messages;
}