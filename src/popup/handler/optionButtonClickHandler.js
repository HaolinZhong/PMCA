import { optionsButtonDOMs } from "../util/doms";

export const goToOptions = () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

export const setOptionButtonClickHandler = () => {
    Array.prototype.forEach.call(optionsButtonDOMs, btn => {
        btn.onclick = async () => {
            goToOptions();
        }
    });
}