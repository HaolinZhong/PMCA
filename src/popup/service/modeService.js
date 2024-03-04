import { getLocalStorageData, setLocalStorageData } from "../delegate/localStorageDelegate"
import { store } from "../handler/globalVars";
import { CN_MODE } from "../util/constants"

export const isInCnMode = async () => {
    store.cnMode = await getLocalStorageData(CN_MODE);
    if (store.cnMode === undefined) {
        await setLocalStorageData(CN_MODE, false);
        store.cnMode = false;
    }
    return store.cnMode;
}

export const toggleMode = async () => {
    store.cnMode = await isInCnMode();
    await setLocalStorageData(CN_MODE, !store.cnMode);
}