import { toggleMode } from "../service/modeService";
import { switchButtonDOM } from "../util/doms";
import { renderAll } from "../view/view";

export const switchMode = async () => {
    console.log("start to switchMode");
    await toggleMode();
    console.log("mode toggled");
    await renderAll();
    console.log("content re-rendered");
}

export const setModeSwitchHandlers = () => {
    switchButtonDOM.onclick = switchMode;
}