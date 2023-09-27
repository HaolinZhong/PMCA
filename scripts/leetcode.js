
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


const user_agent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36";
const url = "https://leetcode.com/graphql";
const params = {
    operationName: "questionTitle",
    variables: { titleSlug: "" },
    query: `query questionTitle($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
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
    console.log(problemSlug);
    console.log(problemUrl.split("/"));

    const question = await queryProblemInfo(problemSlug);

    console.log(question);

    return {
        problemIndex: question.questionId,
        problemName: `${question.questionId}. ${question.title}`,
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
    console.log(`monitor started!`);

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
            console.log(`submission Result not found:`);
            console.log(submissionResult);
            maxRetry--;
            return;
        }

        console.log(`Found Submission Result:`);
        console.log(submissionResult.className);

        clearInterval(functionId);
        let isSuccess = submissionResult.className.includes(SUCCESS_CLASSNAME) ||
            submissionResult.className.includes(SUCCESS_CLASSNAME_NEW);

        const submissionTime = Date.now();
        const { problemIndex, problemName, problemLevel, problemUrl } = await extractProblemInfo();

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

                    chrome.storage.local.set({ "records": problems });
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
    console.log("clicked");
    
    const element = event.target;

    const filterConditions = [
        element.classList.contains("submit__2ISl") && element.classList.contains("css-ieo3pr"),
        element.parentElement.classList.contains("submit__2ISl") && element.parentElement.classList.contains("css-ieo3pr"),
        element.classList.value === SUBMIT_BUTTON_CLASSNAME_NEW
    ]

    const isSubmitButton = filterConditions.reduce((prev, curr) => prev || curr);

    console.log(`isSubmit: ${isSubmitButton}`);
    console.log(element.classList.value);

    if (isSubmitButton) {
        monitorSubmissionResult();
    }

});
