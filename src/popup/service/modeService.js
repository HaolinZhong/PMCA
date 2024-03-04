import { getLocalStorageData, setLocalStorageData } from "../delegate/localStorageDelegate"
import { cnMode } from "../handler/globalVars";
import { CN_MODE } from "../util/constants"

export const isInCnMode = async () => {
    cnMode = await getLocalStorageData(CN_MODE);
    if (cnMode === undefined) {
        await setLocalStorageData(CN_MODE, false);
        cnMode = false;
    }
    return cnMode;
}

export const toggleMode = async () => {
    cnMode = await isInCnMode();
    await setLocalStorageData(CN_MODE, !cnMode);
}