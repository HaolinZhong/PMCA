import { getStorageData, setStorageData } from "../delegate/storageDelegate"
import { CN_MODE } from "../util/keys"

export const isInCnMode = async () => {
    const cnMode = await getStorageData(CN_MODE);
    console.log(`current cnMode is ${cnMode}`);
    if (cnMode === undefined) {
        await setStorageData(CN_MODE, false);
        cnMode = false;
    }
    return cnMode;
}

export const toggleMode = async () => {
    const cnMode = await isInCnMode();
    console.log(`got current cnMode before toggle}`);
    await setStorageData(CN_MODE, !cnMode);
    console.log("cnMode toggled");
}