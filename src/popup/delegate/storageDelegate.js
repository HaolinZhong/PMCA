import { USE_CLOUD_STORAGE_KEY } from "../util/keys"
import { getCloudStorageData, setCloudStorageData } from "./cloudStorageDelegate"
import { getLocalStorageData } from "./localStorageDelegate";


const isUsingCloudStorage = async () => {
    const isUsingCloudStorage = await getCloudStorageData(USE_CLOUD_STORAGE_KEY);
    return isUsingCloudStorage || false;
}

export const getStorageData = async (key) => {
    if (await isUsingCloudStorage()) {
        return await getCloudStorageData(key);
    } else {
        return await getLocalStorageData(key);
    }
}

export const setStorageDate = async (key, value) => {
    if (await isUsingCloudStorage()) {
        return await setCloudStorageData(key, value);
    } else {
        return await setCloudStorageData(key, value);
    }
}