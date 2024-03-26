export const getLocalStorageData = async (key) => {
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

export const getLocalStorageDataInBatch = async (keyArr) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keyArr, (result) => {
            if (result === undefined) {
                reject("No data found");
            } else {
                resolve(result);
            }
        })
    }).catch((e) => {
        console.log(e);
    });
}

export const setLocalStorageData = async (key, val) => {
    return new Promise(() => {
        chrome.storage.local.set({ [key]: val });
        resolve();
    }).catch(e => console.log(e));
}

export const setLocalStorageDataInBatch = async (object) => {
    return new Promise(() => {
        chrome.storage.local.set(object);
    }).catch(e => console.log(e));
}