import { setModeSwitchHandlers } from "./modeSwitchHandler";
import { setOptionButtonClickHandler } from "./optionButtonClickHandler";
import { setPageJumpHandlers } from "./pageJumpHandler"
import { setRecordOperationHandlers } from "./recordOperationHandler";

export const registerAllHandlers = () => {
    setPageJumpHandlers();
    setModeSwitchHandlers();
    setRecordOperationHandlers();
    setOptionButtonClickHandler();
}