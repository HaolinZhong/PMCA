export const getCloudStorageData = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (result) => {
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

export const getCloudStorageDataInBatch = async (keyArr) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keyArr, (result) => {
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

export const setCloudStorageData = async (key, val) => {
    return new Promise(() => {
        chrome.storage.sync.set({ [key]: val });
        resolve();
    }).catch(e => console.log(e));
}

export const setCloudStorageDataInBatch = async (object) => {
    return new Promise(() => {
        chrome.storage.sync.set(object);
    }).catch(e => console.log(e));
}