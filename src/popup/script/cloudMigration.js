import { getCloudStorageData, setCloudStorageData, setCloudStorageDataInBatch } from "../delegate/cloudStorageDelegate"
import { getLocalStorageData, getLocalStorageDataInBatch, setLocalStorageData, setLocalStorageDataInBatch } from "../delegate/localStorageDelegate"
import { CLOUD_SYNCED_KEY, CN_MODE, CN_PROBLEM_KEY, LOCAL_SYNCED_KEY, OPS_HISTORY_KEY, PROBLEM_KEY, REVIEW_INTV_KEY } from "../util/keys"

const SHARED_DATA_KEYS = [CN_MODE, CN_PROBLEM_KEY, PROBLEM_KEY, REVIEW_INTV_KEY, OPS_HISTORY_KEY];

const packageLocalData = async () => {
   return await getLocalStorageDataInBatch(SHARED_DATA_KEYS);
}

const packageCloudData = async () => {
    return await getLocalStorageDataInBatch(SHARED_DATA_KEYS);
 }

export const syncToCloud = async () => {
    const hasSynced = await getCloudStorageData(CLOUD_SYNCED_KEY);
    if (hasSynced === undefined || !hasSynced) {
        const localData = await packageLocalData();
        await setCloudStorageDataInBatch(localData);
        setCloudStorageData(CLOUD_SYNCED_KEY, true);
    }
}

export const syncToLocal = async () => {
    const hasSynced = await getLocalStorageData(LOCAL_SYNCED_KEY);
    if (hasSynced === undefined || !hasSynced) {
        const cloudData = await packageCloudData();
        await setLocalStorageDataInBatch(localData);
        setLocalStorageData(LOCAL_SYNCED_KEY, true);
    }
}