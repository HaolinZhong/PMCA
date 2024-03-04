import { input0DOM, input1DOM, input2DOM, nextButton0DOM, nextButton1DOM, nextButton2DOM, prevButton0DOM, prevButton1DOM, prevButton2DOM } from "../util/doms";
import { renderCompletedTableContent, renderReviewTableContent, renderScheduledTableContent } from "../view/view";
import { completedProblems, needReviewProblems, reviewScheduledProblems } from "./globalVars";
import { setRecordOperationHandlers } from "./recordOperationHandler";

const goToPrevReviewPage = () => {
    renderReviewTableContent(needReviewProblems, toReviewPage - 1);
    setRecordOperationHandlers();
}
const goToNextReviewPage = () => {
    renderReviewTableContent(needReviewProblems, toReviewPage + 1);
    setRecordOperationHandlers();
}
const goToPrevSchedulePage = () => {
    renderScheduledTableContent(reviewScheduledProblems, scheduledPage - 1);
    setRecordOperationHandlers();
}

const goToNextSchedulePage = () => {
    renderScheduledTableContent(reviewScheduledProblems, scheduledPage + 1);
    setRecordOperationHandlers();
}

const goToPrevCompletedPage = () => {
    renderCompletedTableContent(completedProblems, completedPage - 1);
    setRecordOperationHandlers();
}

const goToNextCompletedPage = () => {
    renderCompletedTableContent(completedProblems, completedPage + 1);
    setRecordOperationHandlers();
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
    renderReviewTableContent(needReviewProblems, page);
    setRecordOperationHandlers();
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
    setRecordOperationHandlers();
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
    renderCompletedTableContent(needReviewProblems, page);
    setRecordOperationHandlers();
}

export const setPageJumpHandlers = () => {
    prevButton0DOM.onclick = goToPrevReviewPage;
    nextButton0DOM.onclick = goToNextReviewPage;
    prevButton1DOM.onclick = goToPrevSchedulePage;
    nextButton1DOM.onclick = goToNextSchedulePage;
    prevButton2DOM.onclick = goToPrevCompletedPage;
    nextButton2DOM.onclick = goToNextCompletedPage;
    
    input0DOM.onkeydown = jumpToReviewPage;
    input1DOM.onkeydown = jumpToSchedulePage;
    input2DOM.onkeydown = jumpToCompletedPage;
}