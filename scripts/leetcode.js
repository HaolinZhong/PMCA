
console.log(`Hello PMCA!`);

// webpage classnames
// old UI
const SUCCESS_CLASSNAME = "success__3Ai7";
const WRONG_ANSWER_CLASSNAME = "error__2Ft1";
const COMPILE_ERROR_AND_TLE_CLASSNAME = "error__10k9";
const SUBMIT_BUTTON_CLASSNAME = "submit__2ISl";

// new UI
const SUCCESS_CLASSNAME_NEW = "text-green-s dark:text-dark-green-s flex flex-1 items-center gap-2 text-[16px] font-medium leading-6";
const WRONG_ANSWER_CLASSNAME_NEW = "whitespace-nowrap text-xl font-medium text-red-s dark:text-dark-red-s";
const COMPILE_ERROR_AND_TLE_CLASSNAME_NEW = "mr-1 flex-1 whitespace-nowrap text-xl font-medium text-red-s dark:text-dark-red-s";
const SUBMIT_BUTTON_CLASSNAME_NEW = "py-1.5 font-medium items-center whitespace-nowrap focus:outline-none cursor-not-allowed opacity-50 inline-flex text-label-r bg-green-s dark:bg-dark-green-s hover:bg-green-3 dark:hover:bg-dark-green-3 h-[28px] select-none rounded px-5 text-[13px] leading-[18px]";

// Dynamic Layout
const SUBMIT_BUTTON_CLASSNAME_DL = "font-medium items-center whitespace-nowrap focus:outline-none cursor-not-allowed opacity-50 inline-flex relative select-none rounded-none px-2.5 py-[7px] bg-transparent dark:bg-transparent text-green-60 dark:text-green-60";

const SUBMIT_BUTTON_ATTRIBUTE_NAME = "data-e2e-locator";
const SUBMIT_BUTTON_ATTRIBUTE_VALUE = "console-submit-button";

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


const user_agent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36";
const url = "https://leetcode.com/graphql";
const params = {
    operationName: "questionTitle",
    variables: { titleSlug: "" },
    query: `query questionTitle($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
        title
        difficulty
      }
    }`,
};
const headers = {
    'User-Agent': user_agent,
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Referer': "",
};

const queryProblemInfo = async (slug) => {

    params.variables.titleSlug = slug;
    headers.Referer = `https://leetcode.com/problems/${slug}`

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(params),
        timeout: 10000
    };

    const response = await fetch(url, requestOptions);
    const content = await response.json();

    return content.data.question;
}



/*
    Extract basic problem information
*/
const extractProblemInfo = async () => {
    let problemUrl = window.location.href;

    const possible_suffix = ["/submissions/", "/description/", "/discussion/", "/solutions/"];
    for (const suffix of possible_suffix) {
        if (problemUrl.includes(suffix)) {
            problemUrl = problemUrl.substring(0, problemUrl.lastIndexOf(suffix) + 1);
            break;
        }
    }


    const problemSlug = problemUrl.split("/").splice(-2)[0];

    const question = await queryProblemInfo(problemSlug);

    return {
        problemIndex: question.questionFrontendId,
        problemName: `${question.questionFrontendId}. ${question.title}`,
        problemLevel: question.difficulty,
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

    const functionId = setInterval(async () => {

        if (maxRetry <= 0) {
            clearInterval(functionId);
            return;
        }

        submissionResult = document.getElementsByClassName(SUCCESS_CLASSNAME)[0] ||
            document.getElementsByClassName(WRONG_ANSWER_CLASSNAME)[0] ||
            document.getElementsByClassName(COMPILE_ERROR_AND_TLE_CLASSNAME)[0] ||
            document.getElementsByClassName(SUCCESS_CLASSNAME_NEW)[0] ||
            document.getElementsByClassName(WRONG_ANSWER_CLASSNAME_NEW)[0] ||
            document.getElementsByClassName(COMPILE_ERROR_AND_TLE_CLASSNAME_NEW)[0];

        if (submissionResult === undefined || submissionResult.length === 0) {
            maxRetry--;
            return;
        }

        clearInterval(functionId);
        let isSuccess = submissionResult.className.includes(SUCCESS_CLASSNAME) ||
            submissionResult.className.includes(SUCCESS_CLASSNAME_NEW);

        const submissionTime = Date.now();
        const { problemIndex, problemName, problemLevel, problemUrl } = await extractProblemInfo();

        const steps = getDifficultyBasedSteps(problemLevel);

        const promise = new Promise((resolve, reject) => {
            chrome.storage.local.get("records", (result) => {
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
                const problem = problems[problemIndex];
                const reviewNeeded = needReview(problem);
                if (reviewNeeded && isSuccess) {
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
                        problem.proficiency = forggetingCurve.length;
                    }

                    problem.submissionTime = submissionTime;

                    problems[problemIndex] = problem;
                    chrome.storage.local.set({ "records": problems });
                }
            },
            // first time submission
            problems => {
                if (isSuccess) {
                    if (problems === undefined) {
                        problems = {};
                    }

                    const problem = new Problem(problemIndex, problemName, problemLevel, problemUrl, submissionTime, steps[0]);

                    problems[problemIndex] = problem;

                    chrome.storage.local.set({ "records": problems });
                }
            }
        ).finally(() => console.log("Submission successfully tracked!"));


    }, retryInterval)
};


/*
    Invoke monitorSubmissionResult upon clicking the submit button.
*/

const isSubmitButton = (element) => {
    return element.getAttribute(SUBMIT_BUTTON_ATTRIBUTE_NAME) === SUBMIT_BUTTON_ATTRIBUTE_VALUE;
}

document.addEventListener('click', (event) => {

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

});

