import { getStorageData, setStorageData } from "../delegate/storageDelegate"
import { store } from "../store";
import { REVIEW_INTV_KEY } from "../util/keys"

export const getReviewIntervals = async () => {
    return await getStorageData(REVIEW_INTV_KEY);
}

export const setReviewIntervals = async (customIntv) => {
    if (customIntv == null || customIntv == undefined) return;
    const {easyIntv, mediumIntv, hardIntv} = store;
    customIntv.easyIntv = customIntv.easyIntv || easyIntv;
    customIntv.mediumIntv = customIntv.mediumIntv || mediumIntv;
    customIntv.hardIntv = customIntv.hardIntv || hardIntv;
    await setStorageData(REVIEW_INTV_KEY, customIntv);
}

export const loadReviewIntervals = async () => {
    const customIntv = await getReviewIntervals();
    if (customIntv !== undefined) {
        Object.assign(store, customIntv);
    }
}

export const loadConfigs = async () => {
    await loadReviewIntervals();
}