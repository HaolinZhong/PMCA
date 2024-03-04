export const getLocalStorageData = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (result === undefined || result[key] === undefined) {
                reject(undefined);
            } else {
                resolve(result[key]);
            }
        })
    }).catch(() => undefined);
}

export const setLocalStorageData = async (key, val) => {
    return new Promise(() => {
        chrome.storage.local.set({ [key]: val });
    })
}