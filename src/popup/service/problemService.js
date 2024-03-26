import { getProblemInfo } from "../delegate/leetCodeDelegate";
import { getStorageData, setStorageData } from "../delegate/storageDelegate";
import { addNewOperationHistory } from "./operationHistoryService";
import { OPS_TYPE } from "../entity/operationHistory";
import { forggettingCurve } from "../util/constants";
import { CN_PROBLEM_KEY, PROBLEM_KEY } from "../util/keys";
import { isInCnMode } from "./modeService";

export const getAllProblems = async () => {
    let cnMode = await isInCnMode();
    const queryKey = cnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    let problems = await getStorageData(queryKey);
    if (problems === undefined) problems = {};
    return problems;
}

export const getProblemsByMode = async (useCnMode) => {
    const queryKey = useCnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    let problems = await getStorageData(queryKey);
    if (problems === undefined) problems = {};
    return problems;
}

export const getCurrentProblemInfoFromLeetCode = async () => {
    return await getProblemInfo();
}

export const setProblems = async (problems) => {
    let cnMode = await isInCnMode();
    const key = cnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    await setStorageData(key, problems);
}

export const setProblemsByMode = async (problems, useCnMode) => {
    const key = useCnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    await setStorageData(key, problems);
}

export const createOrUpdateProblem = async (problem) => {
    const problems = await getAllProblems();
    problems[problem.index] = problem;
    await setProblems(problems);
}

export const markProblemAsMastered = async (problemId) => {
    let problems = await getAllProblems();
    let problem = problems[problemId];

    await addNewOperationHistory(problem, OPS_TYPE.MASTER, Date.now());

    problem.proficiency = forggettingCurve.length;
    problems[problemId] = problem;

    await setProblems(problems);
};

export const deleteProblem = async (problemId) => {
    let problems = await getAllProblems();

    await addNewOperationHistory(problems[problemId], OPS_TYPE.DELETE, Date.now());

    delete problems[problemId];

    await setProblems(problems);
};

export const resetProblem = async (problemId) => {
    let problems = await getAllProblems();
    let problem = problems[problemId];

    await addNewOperationHistory(problem, OPS_TYPE.RESET, Date.now());

    problem.proficiency = 0;
    problem.submissionTime = Date.now() - 24 * 60 * 60 * 1000;
    problems[problemId] = problem;

    await setProblems(problems);
};

