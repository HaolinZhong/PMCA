import { checkButtonDOMs, deleteButtonDOMs, resetButtonDOMs } from "../util/doms";
import { store } from "./globalVars";

const initTooltips = () => {
    store.tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    store.tooltipList = [...store.tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

const hide_all_tooltips = () => {
    store.tooltipList.forEach(tooltip => tooltip._hideModalHandler());
}

export const setRecordOperationHandlers = () => {

    initTooltips();

    if (checkButtonDOMs !== undefined) {
        Array.prototype.forEach.call(checkButtonDOMs, (btn) => btn.onclick = async () => {
            hide_all_tooltips();
            await mark_problem_as_mastered();
        });
    }

    if (deleteButtonDOMs !== undefined) {
        Array.prototype.forEach.call(deleteButtonDOMs, (btn) => btn.onclick = async () => {
            hide_all_tooltips();
            await delete_problem();
        });
    }

    if (resetButtonDOMs !== undefined) {
        Array.prototype.forEach.call(resetButtonDOMs, (btn) => btn.onclick = async () => {
            hide_all_tooltips();
            await reset_problem();
        });
    }
}

