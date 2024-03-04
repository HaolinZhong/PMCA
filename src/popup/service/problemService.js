import { getLocalStorageData, setLocalStorageData } from "../delegate/localStorageDelegate";
import { forggettingCurve } from "../util/constants";
import { isInCnMode } from "./modeService";

export const getAllProblems = async () => {
    let cnMode = await isInCnMode();
    const queryKey = cnMode ? 'cn_records' : 'records';
    let problems = await getLocalStorageData(queryKey);
    if (problems === undefined) problems = [];
    return problems;
}

export const mark_problem_as_mastered = async (problemId) => {
    let problems = await getAllProblems();
    let problem = problems[problemId];
    
    problem.proficiency = forggettingCurve.length;
    problems[problemId] = problem;

    setLocalStorageData(queryKey, problems);
    display_table();
};

export const delete_problem = async (problemId) => {
    let problems = await getAllProblems();
    delete problems[problemId];
    setLocalStorageData(queryKey, problems);
    display_table();
};

export const reset_problem = async (problemId) => {
    let problems = await getAllProblems();
    let problem = problems[problemId];
    problem.proficiency = 0;
    problem.submissionTime = Date.now() - 24 * 60 * 60 * 1000;
    problems[problemId] = problem;
    setLocalStorageData(queryKey, problems);
    display_table();
};

