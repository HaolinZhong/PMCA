import { toggleMode } from "../service/modeService";
import { switchButtonDOM } from "../util/doms";
import { renderAll } from "../view/view";

export const switchMode = async () => {
    await toggleMode();
    await renderAll();
}

export const setModeSwitchHandlers = () => {
    switchButtonDOM.onclick = switchMode;
}