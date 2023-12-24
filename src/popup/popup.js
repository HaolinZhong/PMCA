import './lib/bootstrap.min.css';
import './lib/bootstrap.bundle.min.js';
import './lib/fontawesome.js';
import './popup.css';
import './constant.js';

const forggetingCurve = [
    1 * 24 * 60,    // 1 day
    2 * 24 * 60,    // 2 day
    4 * 24 * 60,    // 4 day
    7 * 24 * 60,    // 7 day
    15 * 24 * 60    // 15 day
];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAGE_SIZE = 5;

let needReviewProblems;
let reviewScheduledProblems;
let completedProblems;

let toReviewPage = 1;
let scheduledPage = 1;
let completedPage = 1;

let toReviewMaxPage;
let scheduledMaxPage;
let completedMaxPage;


const needReview = (problem) => {
    if (problem.proficiency >= forggetingCurve.length) {
        return false;
    }

    const currentTime = Date.now();
    const timeDiffInMinute = (currentTime - problem.submissionTime) / (1000 * 60);
    return timeDiffInMinute >= forggetingCurve[problem.proficiency];
};


const decorateProblemLevel = (level) => {
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

const getNextReviewTime = (problem) => {
    return new Date(problem.submissionTime + forggetingCurve[problem.proficiency] * 60 * 1000);
}


/*
    Tag for problem records
*/
const getProblemUrlCell = (problem, width) => `<td style="width: ${width | 30}%;"><a target="_blank" href=${problem.url}><small>${problem.name}</small><a/></td>`;
const getProblemProgressBarCell = (problem, width) => {
    return `\
    <td style="width: ${width | 10};">\
        <div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">\
            <div class="progress-bar progress-bar-striped bg-success" style="width: ${Math.max(problem.proficiency, 0) / 5 * 100}%; font-size: smaller; color: black"><small><small><small>${problem.proficiency / 5 * 100}%</small></small></small></div>\
        </div>\
    </td>\
    `
}
const getProblemLevelCell = (problem, width) => `<td style="width: ${width | 12}%;"><small>${decorateProblemLevel(problem.level)}</small></td>`;

const getCheckButtonTag = (problem) => `<small class="fa-regular fa-square-check fa-2xs mt-2 mb-0 check-btn-mark"\ 
                                            data-bs-toggle="tooltip" data-bs-title="✅ Mark as mastered" data-bs-placement="left"\
                                            style="color: #d2691e;" data-id=${problem.index}> </small>`;

const getDeleteButtonTag = (problem) => `<small class="fa-regular fa-square-minus fa-2xs mt-2 mb-0 delete-btn-mark"\ 
                                            data-bs-toggle="tooltip" data-bs-title="⛔ Delete this record (NO RECOVERY!!!)" data-bs-placement="left"\
                                            style="color: red;" data-id=${problem.index}> </small>`;

const getResetButtonTag = (problem) => `<small class="fa-solid fa-arrows-rotate fa-2xs mt-2 mb-0 reset-btn-mark" \
                                            data-bs-toggle="tooltip" data-bs-title="🔄 Reset progress" data-bs-placement="left"\
                                            style="color: #d2691e;" data-id=${problem.index}> </small>`;



const create_review_problem_record = (problem) => {
    const nextReviewDate = getNextReviewTime(problem);
    const htmlTag =
        `\
    <tr>\
        ${getProblemUrlCell(problem)}\
        ${getProblemProgressBarCell(problem)}\
        ${getProblemLevelCell(problem)}\
        <td><small>${Math.round((Date.now() - nextReviewDate) / (60 * 60 * 1000))} hour(s)</small></td>\
        <td style="text-align: center; vertical-align:middle">\
            ${getCheckButtonTag(problem)}\
            ${getResetButtonTag(problem)}\
            ${getDeleteButtonTag(problem)}\
        </td>\
    </tr>\
    `;
    return htmlTag;
    ;
}

const create_schedule_problem_record = (problem) => {
    const nextReviewDate = getNextReviewTime(problem);
    const htmlTag =
        `\
    <tr style="vertical-align:middle">\
        ${getProblemUrlCell(problem)}\
        ${getProblemProgressBarCell(problem)}\
        ${getProblemLevelCell(problem)}\
        <td><small>${months[nextReviewDate.getMonth()]} ${nextReviewDate.getDate()} ${nextReviewDate.getHours()}:${nextReviewDate.getMinutes() < 10 ? `0${nextReviewDate.getMinutes()}` : nextReviewDate.getMinutes()}</small></td>\
        <td style="text-align: center; vertical-align:middle">\
            ${getCheckButtonTag(problem)}\
            ${getResetButtonTag(problem)}\
            ${getDeleteButtonTag(problem)}\
        </td>\
    </tr>\
    `;
    return htmlTag;
    ;
}

const create_completed_problem_record = (problem) => {
    const htmlTag =
        `\
    <tr>\
        ${getProblemUrlCell(problem, 35)}\
        ${getProblemProgressBarCell(problem, 20)}\
        ${getProblemLevelCell(problem)}\
        <td style="text-align: center; vertical-align:middle">\
            ${getResetButtonTag(problem)}\
            ${getDeleteButtonTag(problem)}\
        </td>\
    </tr>\
    `;
    return htmlTag;
    ;
}


const update_review_table_content = (problems, page) => {
    /* validation */
    if (page > toReviewMaxPage || page < 1) {
        input0DOM.classList.add("is-invalid");
        return;
    }
    input0DOM.classList.remove("is-invalid");

    toReviewPage = page;

    /* update pagination elements */
    input0DOM.value = page;
    inputLabel0DOM.innerText = `/${toReviewMaxPage}`;

    if (page === 1) prevButton0DOM.setAttribute("disabled", "disabled");
    if (page !== 1) prevButton0DOM.removeAttribute("disabled");
    if (page === toReviewMaxPage) nextButton0DOM.setAttribute("disabled", "disabled");
    if (page !== toReviewMaxPage) nextButton0DOM.removeAttribute("disabled");


    let content_html =
        '\
    <thead>\
        <tr style="font-size: smaller">\
            <th>Problem</th>\
            <th>Progress</th>\
            <th>Level</th>\
            <th>Delay</th>\
            <th>Operation</th>\
        </tr>\
    </thead>\
    <tbody>\
    ';

    problems = problems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    let keys = Object.keys(problems);
    for (const i of keys) {
        content_html += create_review_problem_record(problems[i]) + '\n';
    }
    content_html += `</tbody>`

    document.getElementById("need-review-table").innerHTML = content_html;
}

const update_schedule_table_content = (problems, page) => {
    /* validation */
    if (page > scheduledMaxPage || page < 1) {
        input1DOM.classList.add("is-invalid");
        return;
    }
    input1DOM.classList.remove("is-invalid");

    scheduledPage = page;

    /* update pagination elements */
    input1DOM.value = page;
    inputLabel1DOM.innerText = `/${scheduledMaxPage}`;

    if (page === 1) prevButton1DOM.setAttribute("disabled", "disabled");
    if (page !== 1) prevButton1DOM.removeAttribute("disabled");
    if (page === scheduledMaxPage) nextButton1DOM.setAttribute("disabled", "disabled");
    if (page !== scheduledMaxPage) nextButton1DOM.removeAttribute("disabled");


    let content_html =
        '\
    <thead>\
        <tr style="font-size: smaller">\
            <th>Problem</th>\
            <th>Progress</th>\
            <th>Level</th>\
            <th>Review Time</th>\
            <th>Operation</th>\
        </tr>\
    </thead>\
    <tbody>\
    ';

    problems = problems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    let keys = Object.keys(problems);

    for (const i of keys) {
        content_html += create_schedule_problem_record(problems[i]) + '\n';
    }

    content_html += `</tbody>`

    document.getElementById("no-review-table").innerHTML = content_html;
}

const update_completed_table_content = (problems, page) => {

    /* validation */
    if (page > completedMaxPage || page < 1) {
        input2DOM.classList.add("is-invalid");
        return;
    }
    input2DOM.classList.remove("is-invalid");

    completedPage = page;

    /* update pagination elements */
    input2DOM.value = page;
    inputLabel2DOM.innerText = `/${completedMaxPage}`;

    if (page === 1) prevButton2DOM.setAttribute("disabled", "disabled");
    if (page !== 1) prevButton2DOM.removeAttribute("disabled");
    if (page === completedMaxPage) nextButton2DOM.setAttribute("disabled", "disabled");
    if (page !== completedMaxPage) nextButton2DOM.removeAttribute("disabled");

    let content_html =
        '\
    <thead>\
        <tr style="font-size: smaller">\
            <th>Problem</th>\
            <th>Progress</th>\
            <th>Level</th>\
            <th>Operation</th>\
        </tr>\
    </thead>\
    <tbody>\
    ';

    problems = problems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    let keys = Object.keys(problems);
    for (const i of keys) {
        content_html += create_completed_problem_record(problems[i]) + '\n';
    }

    content_html += `</tbody>`
    document.getElementById("completed-table").innerHTML = content_html;
}

const getLocalStorageData = (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (result === undefined || result[key] === undefined) {
                reject();
            } else {
                resolve(result[key]);
            }
        })
    })
}


const mark_problem_as_mastered = async (event) => {

    hide_all_tooltips();

    const problemId = event.target.dataset.id;

    let cnMode;
    try {
        cnMode = await getLocalStorageData('cn_mode');
    } catch {
        cnMode = false;
    }

    const queryKey = cnMode ? 'cn_records' : 'records';

    let problems = await getLocalStorageData(queryKey);

    let problem = problems[problemId];
    problem.proficiency = forggetingCurve.length;
    problems[problemId] = problem;
    chrome.storage.local.set({ [queryKey]: problems });
    display_table();
};

const delete_problem = async (event) => {

    hide_all_tooltips();

    const problemId = event.target.dataset.id;

    let cnMode;
    try {
        cnMode = await getLocalStorageData('cn_mode');
    } catch {
        cnMode = false;
    }

    const queryKey = cnMode ? 'cn_records' : 'records';

    let problems = await getLocalStorageData(queryKey);
    delete problems[problemId];
    chrome.storage.local.set({ [queryKey]: problems });
    display_table();
};

const reset_problem = async (event) => {

    hide_all_tooltips();

    const problemId = event.target.dataset.id;

    let cnMode;
    try {
        cnMode = await getLocalStorageData('cn_mode');
    } catch {
        cnMode = false;
    }

    const queryKey = cnMode ? 'cn_records' : 'records';

    let problems = await getLocalStorageData(queryKey);
    let problem = problems[problemId];
    problem.proficiency = 0;
    problem.submissionTime = Date.now() - 24 * 60 * 60 * 1000;
    problems[problemId] = problem;
    chrome.storage.local.set({ [queryKey]: problems });
    console.log(await getLocalStorageData(queryKey));
    display_table();
};


let tooltipTriggerList;
let tooltipList;

const update_record_operation_event_listener = () => {
    const checkButtons = document.getElementsByClassName("check-btn-mark");
    const deleteButtons = document.getElementsByClassName("delete-btn-mark");
    const resetButtons = document.getElementsByClassName("reset-btn-mark");

    if (checkButtons !== undefined) {
        Array.prototype.forEach.call(checkButtons, (btn) => btn.onclick = mark_problem_as_mastered);
    }

    if (deleteButtons !== undefined) {
        Array.prototype.forEach.call(deleteButtons, (btn) => btn.onclick = delete_problem);
    }

    if (resetButtons !== undefined) {
        Array.prototype.forEach.call(resetButtons, (btn) => btn.onclick = reset_problem);
    }
    tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

const hide_all_tooltips = () => {
    tooltipList.forEach(tooltip => tooltip._hideModalHandler());
}

const display_table = () => {

    chrome.storage.local.get('cn_mode', (result) => {
        let cnMode;
        if (result.cn_mode === undefined) {
            cnMode = false;
        } else {
            cnMode = result.cn_mode;
        }


        const switchButtonDom = document.getElementById("switchButton");
        const donateButtonDom = document.getElementById("donateButton");
        if (cnMode) {
            switchButtonDom.setAttribute("checked", "checked");
            donateButtonDom.innerHTML = `\
            <button type="button" class="btn btn-outline-warning custom-btn"\ 
                style="font-size: smaller; font-family: 'Noto Sans SC', sans-serif;"\
                data-bs-toggle="modal" data-bs-target="#tipModal">🧧 打&nbsp赏</button>\
            `
        } else {
            switchButtonDom.removeAttribute("checked");
            donateButtonDom.innerHTML = `\
            <a href="https://www.buymeacoffee.com/zhlien1998y" target="_blank">\
                <img style="width: 125%;"\
                    src="https://img.buymeacoffee.com/button-api/?text=Donate&emoji=💰&slug=zhlien1998y&button_colour=ebad81&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" />\
            </a>\
            `
        }

        const labelDom = document.getElementById("siteLabel");
        if (cnMode) {
            labelDom.innerHTML = "LeetCode - China ";
        } else {
            labelDom.innerHTML = "LeetCode - Global";
        }

        const queryKey = cnMode ? "cn_records" : "records";
        chrome.storage.local.get(queryKey, (result) => {
            const problems = Object.values(result[queryKey]);
            needReviewProblems = problems.filter(p => needReview(p));
            reviewScheduledProblems = problems.filter(p => !needReview(p) && p.proficiency < 5);
            completedProblems = problems.filter(p => p.proficiency === 5);

            toReviewMaxPage = Math.max(Math.ceil(needReviewProblems.length / PAGE_SIZE), 1);
            scheduledMaxPage = Math.max(Math.ceil(reviewScheduledProblems.length / PAGE_SIZE), 1);
            completedMaxPage = Math.max(Math.ceil(completedProblems.length / PAGE_SIZE), 1);


            needReviewProblems.sort((p1, p2) => {
                return getNextReviewTime(p1).valueOf() - getNextReviewTime(p2).valueOf();
            })

            reviewScheduledProblems.sort((p1, p2) => {
                return getNextReviewTime(p1).valueOf() - getNextReviewTime(p2).valueOf();
            })

            completedProblems.sort((p1, p2) => {
                return p2.submissionTime - p1.submissionTime;
            })

            update_review_table_content(needReviewProblems, 1);
            update_schedule_table_content(reviewScheduledProblems, 1);
            update_completed_table_content(completedProblems, 1);
            update_record_operation_event_listener();
        })
    })
}

document.getElementById("switchButton").addEventListener('click', (event) => {
    chrome.storage.local.get('cn_mode', (result) => {
        let cnMode;
        if (result.cn_mode === undefined) {
            cnMode = false;
        } else {
            cnMode = result.cn_mode;
        }

        chrome.storage.local.set({ 'cn_mode': !cnMode });
        display_table();
    });
});

display_table();

const goToPrevReviewPage = () => {
    update_review_table_content(needReviewProblems, toReviewPage - 1);
    update_record_operation_event_listener();
}
const goToNextReviewPage = () => {
    update_review_table_content(needReviewProblems, toReviewPage + 1);
    update_record_operation_event_listener();
}
const goToPrevSchedulePage = () => {
    update_schedule_table_content(reviewScheduledProblems, scheduledPage - 1);
    update_record_operation_event_listener();
}

const goToNextSchedulePage = () => {
    update_schedule_table_content(reviewScheduledProblems, scheduledPage + 1);
    update_record_operation_event_listener();
}

const goToPrevCompletedPage = () => {
    update_completed_table_content(completedProblems, completedPage - 1);
    update_record_operation_event_listener();
}

const goToNextCompletedPage = () => {
    update_completed_table_content(completedProblems, completedPage + 1);
    update_record_operation_event_listener();
}

const jumpToReviewPage = (event) => {
    if (event.keyCode !== 13) return;
    let page = parseInt(event.target.value);
    if (isNaN(page) || !Number.isInteger(page)) {
        input0DOM.classList.add("is-invalid");
        return;
    }
    input0DOM.classList.remove("is-invalid");
    if (page === toReviewPage) return;
    update_review_table_content(needReviewProblems, page);
    update_record_operation_event_listener();
}

const jumpToSchedulePage = (event) => {
    if (event.keyCode !== 13) return;
    let page = parseInt(event.target.value);
    if (isNaN(page) || !Number.isInteger(page)) {
        input1DOM.classList.add("is-invalid");
        return;
    }
    input1DOM.classList.remove("is-invalid");
    if (page === scheduledPage) return;
    update_schedule_table_content(reviewScheduledProblems, page);
    update_record_operation_event_listener();
}

const jumpToCompletedPage = (event) => {
    if (event.keyCode !== 13) return;
    let page = parseInt(event.target.value);
    if (isNaN(page) || !Number.isInteger(page)) {
        input2DOM.classList.add("is-invalid");
        return;
    }
    input2DOM.classList.remove("is-invalid");
    if (page === completedPage) return;
    update_completed_table_content(needReviewProblems, page);
    update_record_operation_event_listener();
}

prevButton0DOM.onclick = goToPrevReviewPage;
nextButton0DOM.onclick = goToNextReviewPage;
prevButton1DOM.onclick = goToPrevSchedulePage;
nextButton1DOM.onclick = goToNextSchedulePage;
prevButton2DOM.onclick = goToPrevCompletedPage;
nextButton2DOM.onclick = goToNextCompletedPage;

input0DOM.onkeydown = jumpToReviewPage;
input1DOM.onkeydown = jumpToSchedulePage;
input2DOM.onkeydown = jumpToCompletedPage;