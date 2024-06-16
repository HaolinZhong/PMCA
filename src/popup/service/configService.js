import { getLocalStorageData, setLocalStorageData } from "../delegate/localStorageDelegate"
import { store } from "../store";
import { PROBLEM_SORT_BY_KEY, REVIEW_INTV_KEY } from "../util/keys"
import { getSorterById, idOf, problemSorters } from "../util/sort";

// configurable review intervals (to be integrated)

export const getReviewIntervals = async () => {
    return await getLocalStorageData(REVIEW_INTV_KEY);
}

export const setReviewIntervals = async (customIntv) => {
    if (customIntv == null || customIntv == undefined) return;
    const {easyIntv, mediumIntv, hardIntv} = store;
    customIntv.easyIntv = customIntv.easyIntv || easyIntv;
    customIntv.mediumIntv = customIntv.mediumIntv || mediumIntv;
    customIntv.hardIntv = customIntv.hardIntv || hardIntv;
    await setLocalStorageData(REVIEW_INTV_KEY, customIntv);
}

export const loadReviewIntervals = async () => {
    const customIntv = await getReviewIntervals();
    if (customIntv !== undefined) {
        Object.assign(store, customIntv);
    }
}


// configurable problem sort by
export const getProblemSorter = async () => {
    return await getLocalStorageData(PROBLEM_SORT_BY_KEY);
}

export const setProblemSorter = async (sorterId) => {
    await setLocalStorageData(PROBLEM_SORT_BY_KEY, sorterId);
}

export const loadProblemSorter = async () => {
    const sorterId = await getProblemSorter() | idOf(problemSorters.sortByReviewTimeAsc);
    store.problemSortBy = getSorterById(sorterId);
}


export const loadConfigs = async () => {
    await loadReviewIntervals();
    await loadProblemSorter();
}