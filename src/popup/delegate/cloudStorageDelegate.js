class CloudStorageDelegate extends StorageDelegate {
    constructor(){
        this.get = getCloudStorageData;
        this.set = setCloudStorageData;
    }
}

const cloudStorageDelegate = new CloudStorageDelegate();
export default cloudStorageDelegate;

const getCloudStorageData = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (result) => {
            if (result === undefined || result[key] === undefined) {
                reject(key);
            } else {
                resolve(result[key]);
            }
        })
    }).catch((key) => {
        console.log(`get sync storage data failed for key = ${key}`);
    });
}

const setCloudStorageData = async (key, val) => {
    return new Promise(() => {
        chrome.storage.sync.set({ [key]: val });
        resolve();
    }).catch(e => console.log(e));
}