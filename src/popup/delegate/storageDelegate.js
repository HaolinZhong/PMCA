import cloudStorageDelegate from "./cloudStorageDelegate.js";
import localStorageDelegate from "./localStorageDelegate";

export class StorageDelegate {
    constructor(){
        this.get = async (key) => null;
        this.set = async (key, val) => {};
    }
}

export const syncStorage = async (sd1, sd2, key, merger) => {
    const data1 = await sd1.get(key);
    const data2 = await sd2.get(key);
    const merged = merger(data1, data2);
    await sd1.set(key, merged);
    await sd2.set(key, merged);
}

export const syncLocalAndCloudStorage = async (key, merger) => {
    await syncStorage(localStorageDelegate, cloudStorageDelegate, key, merger);
}