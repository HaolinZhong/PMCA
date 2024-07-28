import { getDifficultyBasedSteps, getSubmissionResult, isSubmissionSuccess, isSubmitButton, needReview, updateProblemUponSuccessSubmission } from "../util/utils";
import { getAllProblems, createOrUpdateProblem, getCurrentProblemInfoFromLeetCode, syncProblems } from "../service/problemService";
import { Problem } from "../entity/problem";

/* 
    monitorSubmissionResult will repeateadly check for the submission result.
*/
const monitorSubmissionResult = () => {

    let submissionResult;
    let maxRetry = 10;
    const retryInterval = 1000;

    const functionId = setInterval(async () => {

        if (maxRetry <= 0) {
            clearInterval(functionId);
            return;
        }

        submissionResult = getSubmissionResult();

        if (submissionResult === undefined || submissionResult.length === 0) {
            maxRetry--;
            return;
        }

        clearInterval(functionId);
        let isSuccess = isSubmissionSuccess(submissionResult);

        if (!isSuccess) return;

        const { problemIndex, problemName, problemLevel, problemUrl } = await getCurrentProblemInfoFromLeetCode();
        await syncProblems();   // prior to fetch local problem data, sync local problem data with cloud
        const problems = await getAllProblems();
        let problem = problems[problemIndex];
        
        if (problem && problem.isDeleted !== true) {
            const reviewNeeded = needReview(problem);
            if (reviewNeeded) {
                await createOrUpdateProblem(updateProblemUponSuccessSubmission(problem));
            }
        } else {
            problem = new Problem(problemIndex, problemName, problemLevel, problemUrl, Date.now(), getDifficultyBasedSteps(problemLevel)[0], Date.now());
            await createOrUpdateProblem(problem);
        }
        await syncProblems(); // after problem updated, sync to cloud

        console.log("Submission successfully tracked!");

    }, retryInterval)
};

export const submissionListener = (event) => {

    const element = event.target;
    
    const filterConditions = [
        isSubmitButton(element),
        element.parentElement && isSubmitButton(element.parentElement),
        element.parentElement && element.parentElement.parentElement && isSubmitButton(element.parentElement.parentElement),
    ]

    const isSubmission = filterConditions.reduce((prev, curr) => prev || curr);

    if (isSubmission) {
        monitorSubmissionResult();
    }

};