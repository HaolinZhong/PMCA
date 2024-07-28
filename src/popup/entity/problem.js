export class Problem {
    constructor(index, name, level, url, submissionTime, proficiency, modificationTime) {
        this.index = index;
        this.name = name;
        this.level = level;
        this.url = url;
        this.submissionTime = submissionTime;
        this.proficiency = proficiency;
        this.modificationTime = modificationTime;
        this.isDeleted = false;
    }
};

export const getDeletedProblem = (problemId) => {
    const deletedProblem = new Problem(problemId, '', '', '', 0, 0, Date.now());
    deletedProblem.isDeleted = true;
    return deletedProblem;
}

export const copy = (p) => {
    return new Problem(p.index, p.name, p.level, p.url, p.submissionTime, p.proficiency, p.modificationTime, p.isDeleted);
}