import { PAGE_SIZE, forggettingCurve } from "./constants";

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

export const problemReviewTimeComparator = (p1, p2) => {
    return getNextReviewTime(p1).valueOf() - getNextReviewTime(p2).valueOf();
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
