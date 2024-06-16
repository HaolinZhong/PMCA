import { store } from "../store";
import { isInCnMode } from "../service/modeService";
import { getAllProblems } from "../service/problemService";
import { CN_LABLE, GL_LABLE, PAGE_SIZE, months } from "../util/constants";
import { completedTableDOM, input0DOM, input1DOM, input2DOM, inputLabel0DOM, inputLabel1DOM, inputLabel2DOM, needReviewTableDOM, nextButton0DOM, nextButton1DOM, nextButton2DOM, noReviewTableDOM, prevButton0DOM, prevButton1DOM, prevButton2DOM, siteLabelDOM, switchButtonDOM, undoButtonDOMs } from "../util/doms";
import { calculatePageNum, decorateProblemLevel, getDelayedHours, getNextReviewTime, isCompleted, needReview, scheduledReview } from "../util/utils";
import { registerAllHandlers } from "../handler/handlerRegister";
import { hasOperationHistory } from "../service/operationHistoryService";
import { problemSorters } from "../util/sort";
import { loadConfigs } from "../service/configService";

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
                                            data-bs-toggle="tooltip" data-bs-title="⛔ Delete this record" data-bs-placement="left"\
                                            style="color: red;" data-id=${problem.index}> </small>`;

const getResetButtonTag = (problem) => `<small class="fa-solid fa-arrows-rotate fa-2xs mt-2 mb-0 reset-btn-mark" \
                                            data-bs-toggle="tooltip" data-bs-title="🔄 Reset progress" data-bs-placement="left"\
                                            style="color: #d2691e;" data-id=${problem.index}> </small>`;

const createReviewProblemRecord = (problem) => {
    const htmlTag =
        `\
    <tr>\
        ${getProblemUrlCell(problem)}\
        ${getProblemProgressBarCell(problem)}\
        ${getProblemLevelCell(problem)}\
        <td><small>${getDelayedHours(problem)} hour(s)</small></td>\
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

const createScheduleProblemRecord = (problem) => {
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

const createCompletedProblemRecord = (problem) => {
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

export const renderReviewTableContent = (problems, page) => {
    /* validation */
    console.log(store.toReviewMaxPage);
    if (page > store.toReviewMaxPage || page < 1) {
        input0DOM.classList.add("is-invalid");
        return;
    }
    input0DOM.classList.remove("is-invalid");

    store.toReviewPage = page;

    /* update pagination elements */
    input0DOM.value = page;
    inputLabel0DOM.innerText = `/${store.toReviewMaxPage}`;

    if (page === 1) prevButton0DOM.setAttribute("disabled", "disabled");
    if (page !== 1) prevButton0DOM.removeAttribute("disabled");
    if (page === store.toReviewMaxPage) nextButton0DOM.setAttribute("disabled", "disabled");
    if (page !== store.toReviewMaxPage) nextButton0DOM.removeAttribute("disabled");

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
        content_html += createReviewProblemRecord(problems[i]) + '\n';
    }
    content_html += `</tbody>`

    needReviewTableDOM.innerHTML = content_html;
}

export const renderScheduledTableContent = (problems, page) => {
    /* validation */
    if (page > store.scheduledMaxPage || page < 1) {
        input1DOM.classList.add("is-invalid");
        return;
    }
    input1DOM.classList.remove("is-invalid");

    store.scheduledPage = page;

    /* update pagination elements */
    input1DOM.value = page;
    inputLabel1DOM.innerText = `/${store.scheduledMaxPage}`;

    if (page === 1) prevButton1DOM.setAttribute("disabled", "disabled");
    if (page !== 1) prevButton1DOM.removeAttribute("disabled");
    if (page === store.scheduledMaxPage) nextButton1DOM.setAttribute("disabled", "disabled");
    if (page !== store.scheduledMaxPage) nextButton1DOM.removeAttribute("disabled");


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
        content_html += createScheduleProblemRecord(problems[i]) + '\n';
    }

    content_html += `</tbody>`

    noReviewTableDOM.innerHTML = content_html;
}

export const renderCompletedTableContent = (problems, page) => {

    /* validation */
    if (page > store.completedMaxPage || page < 1) {
        input2DOM.classList.add("is-invalid");
        return;
    }
    input2DOM.classList.remove("is-invalid");

    store.completedPage = page;

    /* update pagination elements */
    input2DOM.value = page;
    inputLabel2DOM.innerText = `/${store.completedMaxPage}`;

    if (page === 1) prevButton2DOM.setAttribute("disabled", "disabled");
    if (page !== 1) prevButton2DOM.removeAttribute("disabled");
    if (page === store.completedMaxPage) nextButton2DOM.setAttribute("disabled", "disabled");
    if (page !== store.completedMaxPage) nextButton2DOM.removeAttribute("disabled");

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
        content_html += createCompletedProblemRecord(problems[i]) + '\n';
    }

    content_html += `</tbody>`
    completedTableDOM.innerHTML = content_html;
}

export const renderSiteMode = async () => {
    let cnMode = await isInCnMode();
    if (cnMode) {
        switchButtonDOM.setAttribute("checked", "checked");
        siteLabelDOM.innerHTML = CN_LABLE;
    } else {
        switchButtonDOM.removeAttribute("checked");
        siteLabelDOM.innerHTML = GL_LABLE;
    }
}

export const renderUndoButton = async () => {
    if (await hasOperationHistory()) {
        Array.prototype.forEach.call(undoButtonDOMs, btn => btn.removeAttribute("disabled"));
    } else {
        Array.prototype.forEach.call(undoButtonDOMs, btn => btn.setAttribute("disabled", "disabled"));
    }
} 

export const renderAll = async () => {
    await loadConfigs();
    await renderSiteMode();

    const problems = Object.values(await getAllProblems());
    store.needReviewProblems = problems.filter(needReview);
    store.reviewScheduledProblems = problems.filter(scheduledReview);
    store.completedProblems = problems.filter(isCompleted);

    store.toReviewMaxPage = calculatePageNum(store.needReviewProblems);
    store.scheduledMaxPage = calculatePageNum(store.reviewScheduledProblems);
    store.completedMaxPage = calculatePageNum(store.completedProblems);

    store.needReviewProblems.sort(store.problemSortBy);
    store.reviewScheduledProblems.sort(store.problemSortBy);
    store.completedProblems.sort(store.problemSortBy);

    renderReviewTableContent(store.needReviewProblems, 1);
    renderScheduledTableContent(store.reviewScheduledProblems, 1);
    renderCompletedTableContent(store.completedProblems, 1);
    await renderUndoButton();

    registerAllHandlers();
}
