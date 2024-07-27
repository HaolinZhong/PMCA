import { store } from "../store";
import { COMPILE_ERROR_AND_TLE_CLASSNAME, COMPILE_ERROR_AND_TLE_CLASSNAME_CN, COMPILE_ERROR_AND_TLE_CLASSNAME_NEW, PAGE_SIZE, SUBMIT_BUTTON_ATTRIBUTE_NAME, SUBMIT_BUTTON_ATTRIBUTE_VALUE, SUCCESS_CLASSNAME, SUCCESS_CLASSNAME_CN, SUCCESS_CLASSNAME_NEW, WRONG_ANSWER_CLASSNAME, WRONG_ANSWER_CLASSNAME_CN, WRONG_ANSWER_CLASSNAME_NEW, forggettingCurve } from "./constants";

export const needReview = (problem) => {
    if (problem.proficiency >= forggettingCurve.length) {
        return false;
    }

    const currentTime = Date.now();
    const timeDiffInMinute = (currentTime - problem.submissionTime) / (1000 * 60);
    return timeDiffInMinute >= forggettingCurve[problem.proficiency];
};

export const scheduledReview = (problem) => {
    return !needReview(problem) && problem.proficiency < 5;
};

export const isCompleted = (problem) => {
    return problem.proficiency === 5;
};

export const calculatePageNum = (problems) => {
    return Math.max(Math.ceil(problems.length / PAGE_SIZE), 1);;
}

export const decorateProblemLevel = (level) => {
    let color;
    if (level === "Easy") {
        color = "rgb(67, 160, 71)";
    } else if (level === "Medium") {
        color = "rgb(239, 108, 0)";
    } else {
        color = "rgb(233, 30, 99)";
    }
    return `<small style="color: ${color}; vertical-align: middle">${level}</small>`
}

export const getNextReviewTime = (problem) => {
    return new Date(problem.submissionTime + forggettingCurve[problem.proficiency] * 60 * 1000);
}

export const getDelayedHours = (problem) => {
    const nextReviewDate = getNextReviewTime(problem);
    return Math.round((Date.now() - nextReviewDate) / (60 * 60 * 1000));
}

export const getDifficultyBasedSteps = (diffculty) => {
    if (diffculty === "Easy") {
        return store.easyIntv;
    } else if (diffculty === "Medium") {
        return store.mediumIntv;
    } else {
        return store.hardIntv;
    }
}

export const isSubmitButton = (element) => {
    return element.getAttribute(SUBMIT_BUTTON_ATTRIBUTE_NAME) === SUBMIT_BUTTON_ATTRIBUTE_VALUE;
}

export const getSubmissionResult = () => {
    return document.getElementsByClassName(SUCCESS_CLASSNAME_CN)[0] ||
    document.getElementsByClassName(WRONG_ANSWER_CLASSNAME_CN)[0] ||
    document.getElementsByClassName(COMPILE_ERROR_AND_TLE_CLASSNAME_CN)[0] ||
    document.getElementsByClassName(SUCCESS_CLASSNAME)[0] ||
    document.getElementsByClassName(WRONG_ANSWER_CLASSNAME)[0] ||
    document.getElementsByClassName(COMPILE_ERROR_AND_TLE_CLASSNAME)[0] ||
    document.getElementsByClassName(SUCCESS_CLASSNAME_NEW)[0] ||
    document.getElementsByClassName(WRONG_ANSWER_CLASSNAME_NEW)[0] ||
    document.getElementsByClassName(COMPILE_ERROR_AND_TLE_CLASSNAME_NEW)[0];
}

export const isSubmissionSuccess = (submissionResult) => {
    return submissionResult.className.includes(SUCCESS_CLASSNAME_CN) ||
    submissionResult.className.includes(SUCCESS_CLASSNAME_NEW) ||
    submissionResult.className.includes(SUCCESS_CLASSNAME);
}

export const updateProblemUponSuccessSubmission = (problem) => {
    const steps = getDifficultyBasedSteps(problem.problemLevel);
    let nextProficiencyIndex;
    for (const i of steps) {
        if (i > problem.proficiency) {
            nextProficiencyIndex = i;
            break;
        }
    }

    // further review needed
    if (nextProficiencyIndex !== undefined) {
        problem.proficiency = nextProficiencyIndex;
        // already completed all review
    } else {
        problem.proficiency = forggettingCurve.length;
    }
    problem.submissionTime = Date.now();
    problem.modificationTime = Date.now();
    return problem;
}

// for sync data over cloud & local
export const mergeProblem = (p1, p2) => {
    if (p2 === undefined || p2 === null) return p1;
    if (p1 === undefined || p1 === null) return p2;
    if (p2.modificationTime === undefined || p2.modificationTime === null) return p1;
    if (p1.modificationTime === undefined || p1.modificationTime === null) return p2;

    return p1.modificationTime > p2.modificationTime ? p1 : p2;
}

export const mergeProblems = (ps1, ps2) => {
    const problemIdSet = new Set([...Object.keys(ps1), ...Object.keys(ps2)]);
    const ps = {}
    problemIdSet.forEach(id => {
        const p1 = ps1[id], p2 = ps2[id];
        const p = mergeProblem(p1, p2);
        if (p !== undefined) {
            ps[id] = p
        }
    })

    return ps;
}