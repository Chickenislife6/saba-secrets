import { getKeyPair, getKeyPairs } from "../localstorage/keys";
import { SignalProtocolStore } from "./signalStore";


const store = new SignalProtocolStore();


// must be called after a user is created
function loadIdentity() {
    const identityKeyPair = getKeyPair('identityKey');
    store.put('identityKey', identityKeyPair);

    const preKeys = getKeyPairs("oneTimePreKeys")!;
    for (let key in preKeys) {
        store.storePreKey(`${key}`, preKeys[key]!)
    }

    const signedPreKeys = getKeyPairs("signedPreKey")!;
    for (let key in signedPreKeys) {
        store.storeSignedPreKey(key, signedPreKeys[key]!)
    }
}

// gets recipient.1 from store, then stores in localstorage
async function storeSession(recipient: string) {
    const session = await store.loadSession(recipient + ".1");
    if (typeof session === "string") {
        window.localStorage.setItem(recipient + "session", session);
    } else {
        throw Error("failed to store session!");
    }
}

// mutably adds the session of recipient to store, if exists
export const loadSession = (recipient: string, store: SignalProtocolStore) => {
    console.log("intialized " + recipient);
    const session = window.localStorage.getItem(recipient + "session");
    if (typeof session === "string") {
        store.storeSession(recipient + ".1", session);
    }
}