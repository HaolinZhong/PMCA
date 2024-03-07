import { getProblemInfo } from "../delegate/leetCodeDelegate";
import { getLocalStorageData, setLocalStorageData } from "../delegate/localStorageDelegate";
import { forggettingCurve } from "../util/constants";
import { CN_PROBLEM_KEY, PROBLEM_KEY } from "../util/keys";
import { isInCnMode } from "./modeService";

export const getAllProblems = async () => {
    let cnMode = await isInCnMode();
    const queryKey = cnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    console.log(queryKey);
    let problems = await getLocalStorageData(queryKey);
    if (problems === undefined) problems = {};
    return problems;
}

export const getCurrentProblemInfoFromLeetCode = async () => {
    return await getProblemInfo();
}

export const setProblems = async (problems) => {
    let cnMode = await isInCnMode();
    const key = cnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    await setLocalStorageData(key, problems);
}

export const createOrUpdateProblem = async (problem) => {
    const problems = await getAllProblems();
    problems[problem.index] = problem;
    await setProblems(problems);
}

export const markProblemAsMastered = async (problemId) => {
    let problems = await getAllProblems();
    console.log(problems);
    let problem = problems[problemId];
    console.log(problem);
    problem.proficiency = forggettingCurve.length;
    problems[problemId] = problem;

    let cnMode = await isInCnMode();
    const key = cnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    await setLocalStorageData(key, problems);
};

export const deleteProblem = async (problemId) => {
    let problems = await getAllProblems();
    delete problems[problemId];

    let cnMode = await isInCnMode();
    const key = cnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    await setLocalStorageData(key, problems);
};

export const resetProblem = async (problemId) => {
    let problems = await getAllProblems();
    let problem = problems[problemId];
    problem.proficiency = 0;
    problem.submissionTime = Date.now() - 24 * 60 * 60 * 1000;
    problems[problemId] = problem;
    let cnMode = await isInCnMode();
    const key = cnMode ? CN_PROBLEM_KEY : PROBLEM_KEY;
    await setLocalStorageData(key, problems);
};

