export const getLocalStorageData = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            console.log(`get data: key = ${key}, value = ${result[key]}`);
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

export const setLocalStorageData = async (key, val) => {
    return new Promise(() => {
        chrome.storage.local.set({ [key]: val });
    }).catch(e => console.log(e));
}