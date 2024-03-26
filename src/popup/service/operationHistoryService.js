import { OperationHistory } from "../entity/operationHistory"
import { isInCnMode } from "./modeService";
import { OPS_HISTORY_KEY } from "../util/keys";
import { getStorageData, setStorageData } from "../delegate/storageDelegate";
import { getProblemsByMode, setProblemsByMode } from "./problemService";

const CACHE_SIZE = 10;

export const addNewOperationHistory = async (before, type, time) => {
    const newOperationHistory = new OperationHistory(before, await isInCnMode(), type, time);
    let opsHistory = await getStorageData(OPS_HISTORY_KEY);
    if (opsHistory === undefined) {
        opsHistory = [];
    }
    if (opsHistory.length === CACHE_SIZE) {
        opsHistory.shift();
    }
    opsHistory.push(newOperationHistory);
    await setStorageData(OPS_HISTORY_KEY, opsHistory);
}

export const popLatestOperationHistory = async () => {
    const opsHistory = await getStorageData(OPS_HISTORY_KEY);
    if (opsHistory === undefined || opsHistory.length === 0) {
        return undefined;
    }

    const latestOpsHistory = opsHistory.pop();
    await setStorageData(OPS_HISTORY_KEY, opsHistory);
    return latestOpsHistory;
}

export const undoLatestOperation = async () => {
    const operationHistory = await popLatestOperationHistory();
    if (operationHistory === undefined) {
        return;
    }
    const { before: problemBefore, isInCnMode } = operationHistory;
    const problems = await getProblemsByMode(isInCnMode);
    problems[problemBefore.index] = problemBefore;
    await setProblemsByMode(problems, isInCnMode);
}

export const hasOperationHistory = async () => {
    const opsHistory = await getStorageData(OPS_HISTORY_KEY);
    return opsHistory !== undefined && opsHistory.length > 0;
}