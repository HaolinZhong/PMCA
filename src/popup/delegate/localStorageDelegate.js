import { StorageDelegate } from "./storageDelegate";

class LocalStorageDelegate extends StorageDelegate {
    constructor(){
        this.get = getLocalStorageData;
        this.set = setLocalStorageData;
    }
}

const localStorageDelegate = new LocalStorageDelegate();
export default localStorageDelegate;

const getLocalStorageData = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (result === undefined || result[key] === undefined) {
                reject(key);
            } else {
                resolve(result[key]);
            }
        })
    }).catch((key) => {
        console.log(`get local storage data failed for key = ${key}`);
    });
}

const setLocalStorageData = async (key, val) => {
    return new Promise(() => {
        chrome.storage.local.set({ [key]: val });
        resolve();
    }).catch(e => console.log(e));
}