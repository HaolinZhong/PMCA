import { toggleMode } from "../service/modeService";
import { switchButtonDOM } from "../util/doms";
import { renderAll } from "../view/view";

export const switchMode = () => {
    toggleMode();
    renderAll();
}

export const setModeSwitchHandlers = () => {
    switchButtonDOM.onclick = switchMode;
}