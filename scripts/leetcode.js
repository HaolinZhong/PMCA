
console.log(`Hello PMCA!`);

// webpage classnames
const SUCCESS_CLASSNAME = "success__3Ai7";
const WRONG_ANSWER_CLASSNAME = "error__2Ft1";
const COMPILE_ERROR_AND_TLE_CLASSNAME = "error__10k9";
const PROBLEM_NAME_CLASSNAME = "css-v3d350";
const SUBMIT_BUTTON_CLASSNAME = "submit__2ISl";
const LEVEL_EASY_CLASS_NAME = "css-14oi08n";
const LEVEL_MEDIUM_CLASS_NAME = "css-dcmtd5";
const LEVEL_HARD_CLASS_NAME = "css-t42afm";


// Problem object
class Problem {
    constructor(index, name, level, url, submissionTime, proficiency) {
        this.index = index;
        this.name = name;
        this.level = level;
        this.url = url;
        this.submissionTime = submissionTime;
        this.proficiency = proficiency;
    }
};


// Ebbinghaus utils
const forggetingCurve = [
    1 * 24 * 60,    // 1 day
    2 * 24 * 60,    // 2 day
    4 * 24 * 60,    // 4 day
    7 * 24 * 60,    // 7 day
    15 * 24 * 60    // 15 day
];



const needReview = (problem) => {
    if (problem.proficiency >= forggetingCurve.length) {
        return false;
    }

    const currentTime = Date.now();
    const timeDiffInMinute = (currentTime - problem.submissionTime) / (1000 * 60);
    console.log(`timeDiffInMinute: ${timeDiffInMinute}`);
    return timeDiffInMinute >= forggetingCurve[problem.proficiency];
};




/* Main Body */

/*  
    Read User Configguration
*/

let easy_proficiency_steps = [1, 3];
let medium_proficiency_steps = [1, 3, 4];
let hard_proficiency_steps = [0, 1, 2, 3, 4];

const readConfig = () => {
    chrome.storage.local.get('config', (config) => {
        if (config !== undefined) {
            ({ easy_proficiency_steps, medium_proficiency_steps, hard_proficiency_steps } = config);
        }
    })
}


const getDifficultyBasedSteps = (diffculty) => {
    if (diffculty === "Easy") {
        return easy_proficiency_steps;
    } else if (diffculty === "Medium") {
        return medium_proficiency_steps;
    } else {
        return hard_proficiency_steps;
    }
}

/*
    Extract basic problem information
*/
const extractProblemInfo = () => {
    let problemUrl = window.location.href;
    if (problemUrl.endsWith("/submissions/")) {
        problemUrl = problemUrl.substring(0, problemUrl.lastIndexOf("/submissions/") + 1);
    }

    const problemName = document.getElementsByClassName(PROBLEM_NAME_CLASSNAME)[0].innerHTML;
    const problemIndex = Number(problemName.substring(0, problemName.lastIndexOf(".")));
    const problemLevelDom = document.getElementsByClassName(LEVEL_EASY_CLASS_NAME)[0] ||
        document.getElementsByClassName(LEVEL_MEDIUM_CLASS_NAME)[0] ||
        document.getElementsByClassName(LEVEL_HARD_CLASS_NAME);
    const problemLevel = problemLevelDom.innerHTML;
    return {
        problemIndex,
        problemName,
        problemLevel,
        problemUrl
    };
}


/* 
    monitorSubmissionResult will repeateadly check for the submission result.
*/
const monitorSubmissionResult = () => {

    let submissionResult;
    let maxRetry = 10;
    const retryInterval = 1000;
    console.log(`monitor started!`);

    const functionId = setInterval(() => {

        if (maxRetry <= 0) {
            clearInterval(functionId);
            return;
        }

        submissionResult = document.getElementsByClassName(SUCCESS_CLASSNAME)[0] ||
            document.getElementsByClassName(WRONG_ANSWER_CLASSNAME)[0] ||
            document.getElementsByClassName(COMPILE_ERROR_AND_TLE_CLASSNAME)[0];

        if (submissionResult === undefined || submissionResult.length === 0) {
            console.log(`submission Result not found:`);
            console.log(submissionResult);
            maxRetry--;
            return;
        }

        console.log(`Found Submission Result:`);
        console.log(submissionResult.className);

        clearInterval(functionId);
        let isSuccess = submissionResult.className.includes(SUCCESS_CLASSNAME);

        const submissionTime = Date.now();
        const { problemIndex, problemName, problemLevel, problemUrl } = extractProblemInfo();

        const steps = getDifficultyBasedSteps(problemLevel);

        const promise = new Promise((resolve, reject) => {
            chrome.storage.local.get("records", (result) => {
                console.log(result);
                const problems = result.records;
                if (problems === undefined || problems[problemIndex] === undefined) {
                    reject(problems);
                } else {
                    resolve(problems);
                }
            })
        })

        promise.then(
            // problem submitted before
            problems => {
                console.log(`problem submitted before`)
                const problem = problems[problemIndex];
                const reviewNeeded = needReview(problem);
                if (reviewNeeded && isSuccess) {
                    let nextProficiencyIndex;
                    for (const i of steps) {
                        if (steps[i] > problem.proficiency) {
                            nextProficiencyIndex = steps[i];
                            break;
                        }
                    }

                    // further review needed
                    if (nextProficiencyIndex !== undefined) {
                        problem.proficiency = nextProficiencyIndex;
                    // already completed all review
                    } else {
                        problem.proficiency = forggetingCurve.length;
                    }

                    problem.submissionTime = submissionTime;

                    problems[problemIndex] = problem;
                    chrome.storage.local.set({ "records": problems });
                    chrome.storage.local.get("records", (result) => console.log(result.records));
                } else {
                    console.log("review not needed");
                    console.log(problems);
                }
            },
            // first time submission
            problems => {
                console.log(`first time submission`);
                if (isSuccess) {
                    if (problems === undefined) {
                        problems = {};
                        console.log(`reset problems`);
                    }

                    const problem = new Problem(problemIndex, problemName, problemLevel, problemUrl, submissionTime, steps[0]);

                    problems[problemIndex] = problem;

                    chrome.storage.local.set({"records": problems});
                    chrome.storage.local.get("records", (result) => console.log(result.records));
                } else {
                    console.log(`isSuccess: ${isSuccess}`);
                }
            }
        )


    }, retryInterval)
};


/*
    Invoke monitorSubmissionResult upon clicking the submit button.
*/

document.addEventListener('click', (event) => {
    const element = event.target;

    const filterConditions = [
        element.classList.contains("submit__2ISl") && element.classList.contains("css-ieo3pr"),
        element.parentElement.classList.contains("submit__2ISl") && element.parentElement.classList.contains("css-ieo3pr")
    ]

    const isSubmitButton = filterConditions.reduce((prev, curr) => prev || curr);

    if (isSubmitButton) {
        monitorSubmissionResult();
    }

});
